import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PaymentScreen from '../PaymentScreen';
import { useCart } from '../../../contexts/CartContext';
import { paymentService } from '../../../services/payment.service';

jest.mock('../../../contexts/CartContext');
jest.mock('../../../services/payment.service');

describe('PaymentScreen', () => {
  const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn()
  };

  const mockCartItems = [
    { id: 1, name: 'Test Product', price: 10, quantity: 2 }
  ];

  const mockPaymentMethods = [
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      description: 'Pay with PayPal'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    useCart.mockReturnValue({
      cartItems: mockCartItems,
      total: 20,
      clearCart: jest.fn()
    });

    paymentService.getPaymentMethods.mockResolvedValue(mockPaymentMethods);
  });

  it('renders correctly with cart items', async () => {
    const { getByText, queryByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Test Product')).toBeTruthy();
      expect(getByText('Quantité: 2')).toBeTruthy();
      expect(getByText('20€')).toBeTruthy();
      expect(getByText('PayPal')).toBeTruthy();
    });

    expect(queryByText('Chargement...')).toBeNull();
  });

  it('shows loading state while fetching payment methods', () => {
    const { getByTestId } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('handles payment method selection', async () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      const paypalMethod = getByText('PayPal');
      fireEvent.press(paypalMethod);
    });

    expect(getByText('PayPal')).toHaveStyle({
      backgroundColor: '#ecfdf5'
    });
  });

  it('processes payment successfully', async () => {
    const mockOrderResult = {
      orderId: 'order-123',
      paypalOrderId: 'paypal-123'
    };

    const mockPaymentResult = {
      success: true,
      order: { id: 'order-123' }
    };

    paymentService.createOrder.mockResolvedValue(mockOrderResult);
    paymentService.processPayment.mockResolvedValue(mockPaymentResult);

    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      const payButton = getByText('Payer avec PayPal');
      fireEvent.press(payButton);
    });

    await waitFor(() => {
      expect(paymentService.createOrder).toHaveBeenCalledWith(
        mockCartItems,
        20
      );
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        'order-123',
        'paypal-123'
      );
      expect(mockNavigation.replace).toHaveBeenCalledWith(
        'PaymentSuccess',
        { orderId: 'order-123' }
      );
    });
  });

  it('handles payment failure', async () => {
    paymentService.createOrder.mockRejectedValue(
      new Error('Payment failed')
    );

    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      const payButton = getByText('Payer avec PayPal');
      fireEvent.press(payButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de paiement',
        'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.'
      );
    });
  });

  it('requires payment method selection', async () => {
    useCart.mockReturnValue({
      cartItems: mockCartItems,
      total: 20,
      clearCart: jest.fn()
    });

    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      const payButton = getByText('Payer avec PayPal');
      fireEvent.press(payButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erreur',
      'Veuillez sélectionner une méthode de paiement'
    );
  });

  it('displays security information', async () => {
    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('🔒 Paiement sécurisé via PayPal')).toBeTruthy();
      expect(
        getByText('Vos informations de paiement sont protégées')
      ).toBeTruthy();
    });
  });

  it('shows empty cart message when cart is empty', async () => {
    useCart.mockReturnValue({
      cartItems: [],
      total: 0,
      clearCart: jest.fn()
    });

    const { getByText } = render(
      <PaymentScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Votre panier est vide')).toBeTruthy();
    });
  });
});
