import PayPal from 'react-native-paypal-wrapper';
import api from './api';

class PaymentService {
  constructor() {
    this.paypal = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Récupération de la configuration PayPal depuis le backend
      const { data } = await api.get('/payment/config');
      
      await PayPal.initialize(
        data.paypalClientId,
        data.environment // 'sandbox' ou 'production'
      );

      this.paypal = PayPal;
      this.initialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de PayPal:', error);
      throw new Error('Impossible d\'initialiser le service de paiement');
    }
  }

  async createOrder(cartItems, total) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Création de la commande côté backend
      const { data: order } = await api.post('/orders', {
        items: cartItems,
        total
      });

      // Création de la commande PayPal
      const paypalOrder = await this.paypal.requestOneTimePayment('sandbox', {
        amount: total.toString(),
        currency: 'USD',
        orderId: order.id
      });

      // Mise à jour de l'ID de commande PayPal dans notre backend
      await api.patch(`/orders/${order.id}`, {
        paypalOrderId: paypalOrder.orderId
      });

      return {
        orderId: order.id,
        paypalOrderId: paypalOrder.orderId
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw new Error('Impossible de créer la commande');
    }
  }

  async processPayment(orderId, paypalOrderId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const payment = await this.paypal.requestOneTimePayment('sandbox', {
        amount: total.toString(),
        currency: 'USD',
        orderId
      });

      if (payment.response.state === 'approved') {
        // Mise à jour du statut de la commande dans notre backend
        const { data: confirmedOrder } = await api.post(`/orders/${orderId}/confirm`, {
          paypalTransaction: payment
        });

        return {
          success: true,
          order: confirmedOrder
        };
      }
      
      throw new Error('Le paiement n\'a pas été complété');
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      
      // Annulation de la commande en cas d'échec
      await api.post(`/orders/${orderId}/cancel`, {
        reason: 'payment_failed',
        error: error.message
      });

      throw new Error('Impossible de traiter le paiement');
    }
  }

  async getPaymentMethods() {
    try {
      const { data } = await api.get('/payment/methods');
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des méthodes de paiement:', error);
      return [];
    }
  }

  async validatePaymentMethod(methodId) {
    try {
      const { data } = await api.post('/payment/validate-method', {
        methodId
      });
      return data.valid;
    } catch (error) {
      console.error('Erreur lors de la validation du mode de paiement:', error);
      throw new Error('Impossible de valider le mode de paiement');
    }
  }
}

export const paymentService = new PaymentService();
