import { PayPalWrapper } from 'react-native-paypal-wrapper';
import { paymentService } from '../payment.service';
import api from '../api';

jest.mock('../api');

describe('PaymentService', () => {
  const mockCartItems = [
    { id: 1, name: 'Test Product', price: 10, quantity: 2 }
  ];
  const mockTotal = 20;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService.initialized = false;
  });

  describe('initialize', () => {
    it('should initialize PayPal with correct configuration', async () => {
      const mockConfig = {
        paypalClientId: 'test-client-id',
        environment: 'sandbox'
      };

      api.get.mockResolvedValueOnce({ data: mockConfig });

      await paymentService.initialize();

      expect(api.get).toHaveBeenCalledWith('/payment/config');
      expect(PayPalWrapper.initialize).toHaveBeenCalledWith(mockConfig.paypalClientId, mockConfig.environment);
      expect(paymentService.initialized).toBe(true);
    });

    it('should throw error if initialization fails', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(paymentService.initialize()).rejects.toThrow(
        'Impossible d\'initialiser le service de paiement'
      );
      expect(paymentService.initialized).toBe(false);
    });
  });

  describe('createOrder', () => {
    beforeEach(() => {
      paymentService.initialized = true;
      paymentService.paypal = PayPalWrapper;
    });

    it('should create order successfully', async () => {
      const mockOrderResponse = { data: { id: 'order-123' } };

      api.post.mockResolvedValueOnce(mockOrderResponse);

      const result = await paymentService.createOrder(mockCartItems, mockTotal);

      expect(api.post).toHaveBeenCalledWith('/orders', {
        items: mockCartItems,
        total: mockTotal
      });
      expect(result).toEqual({
        orderId: 'order-123'
      });
    });

    it('should throw error if order creation fails', async () => {
      api.post.mockRejectedValueOnce(new Error('Failed to create order'));

      await expect(
        paymentService.createOrder(mockCartItems, mockTotal)
      ).rejects.toThrow('Impossible de créer la commande');
    });
  });

  describe('processPayment', () => {
    const mockOrderId = 'test-order-id';

    beforeEach(() => {
      paymentService.initialized = true;
      paymentService.paypal = PayPalWrapper;
    });

    it('should process payment successfully', async () => {
      const mockPaymentResponse = {
        response: {
          state: 'approved',
          id: mockOrderId
        }
      };

      PayPalWrapper.requestOneTimePayment.mockResolvedValueOnce(mockPaymentResponse);
      api.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await paymentService.processPayment(mockOrderId);

      expect(PayPalWrapper.requestOneTimePayment).toHaveBeenCalledWith('sandbox', {
        amount: mockTotal.toString(),
        currency: 'USD',
        orderId: mockOrderId
      });
      expect(result).toBe(true);
    });

    it('should handle payment failure', async () => {
      const mockPaymentResponse = {
        response: {
          state: 'failed'
        }
      };

      PayPalWrapper.requestOneTimePayment.mockResolvedValueOnce(mockPaymentResponse);

      await expect(
        paymentService.processPayment(mockOrderId)
      ).rejects.toThrow('Le paiement n\'a pas été complété');

      expect(api.post).toHaveBeenCalledWith(
        `/orders/${mockOrderId}/cancel`,
        expect.any(Object)
      );
    });
  });

  describe('getPaymentMethods', () => {
    it('should return available payment methods', async () => {
      const mockMethods = [
        { id: 1, type: 'paypal', name: 'PayPal' }
      ];

      api.get.mockResolvedValueOnce({ data: mockMethods });

      const result = await paymentService.getPaymentMethods();

      expect(api.get).toHaveBeenCalledWith('/payment/methods');
      expect(result).toEqual(mockMethods);
    });

    it('should return empty array on error', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await paymentService.getPaymentMethods();

      expect(result).toEqual([]);
    });
  });

  describe('validatePaymentMethod', () => {
    it('should validate payment method successfully', async () => {
      api.post.mockResolvedValueOnce({ data: { valid: true } });

      const result = await paymentService.validatePaymentMethod('method-123');

      expect(api.post).toHaveBeenCalledWith('/payment/validate', {
        methodId: 'method-123'
      });
      expect(result).toBe(true);
    });

    it('should return false on validation error', async () => {
      api.post.mockRejectedValueOnce(new Error('Validation failed'));

      const result = await paymentService.validatePaymentMethod('method-123');

      expect(result).toBe(false);
    });
  });
});
