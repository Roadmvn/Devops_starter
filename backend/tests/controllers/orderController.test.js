const request = require('supertest');
const app = require('../../server');
const { Order } = require('../../models');
const { generateToken } = require('../../utils/auth');

describe('Order Controller', () => {
  let token;
  const userId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    token = generateToken({ id: userId });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        items: [
          { id: '123e4567-e89b-12d3-a456-426614174001', quantity: 2 }
        ],
        total: 29.99,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
    });

    it('should return 400 for invalid order data', async () => {
      const invalidOrderData = {
        items: [], // Empty items array
        total: -10 // Invalid total
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidOrderData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders/user', () => {
    it('should return user orders', async () => {
      const response = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should return specific order', async () => {
      // Créer une commande de test
      const order = await Order.create({
        userId,
        items: [{ id: '123', quantity: 1 }],
        total: 19.99,
        status: 'pending'
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(order.id);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/orders/:orderId/status', () => {
    it('should update order status', async () => {
      const order = await Order.create({
        userId,
        items: [{ id: '123', quantity: 1 }],
        total: 19.99,
        status: 'pending'
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'paid' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('paid');
    });
  });

  describe('POST /api/orders/:orderId/cancel', () => {
    it('should cancel pending order', async () => {
      const order = await Order.create({
        userId,
        items: [{ id: '123', quantity: 1 }],
        total: 19.99,
        status: 'pending'
      });

      const response = await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('cancelled');
    });

    it('should not cancel non-pending order', async () => {
      const order = await Order.create({
        userId,
        items: [{ id: '123', quantity: 1 }],
        total: 19.99,
        status: 'paid'
      });

      const response = await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
});
