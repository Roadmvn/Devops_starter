import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PaymentSuccessScreen from '../PaymentSuccessScreen';

describe('PaymentSuccessScreen', () => {
  const mockRoute = {
    params: {
      orderId: 'order-123'
    }
  };

  const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders success message with order ID', () => {
    const { getByText } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('Paiement réussi !')).toBeTruthy();
    expect(getByText('Votre commande #order-123 a été confirmée')).toBeTruthy();
  });

  it('displays confirmation message and support information', () => {
    const { getByText } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(
      getByText('Merci pour votre achat. Vous recevrez bientôt un email de confirmation.')
    ).toBeTruthy();
    expect(
      getByText('Des questions ? Contactez notre service client')
    ).toBeTruthy();
  });

  it('navigates to order details when viewing order', () => {
    const { getByText } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    const viewOrderButton = getByText('Voir ma commande');
    fireEvent.press(viewOrderButton);

    expect(mockNavigation.replace).toHaveBeenCalledWith(
      'PurchaseDetails',
      { purchaseId: 'order-123' }
    );
  });

  it('navigates to home screen when continuing shopping', () => {
    const { getByText } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    const continueShoppingButton = getByText('Continuer mes achats');
    fireEvent.press(continueShoppingButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
  });

  it('navigates to support screen when clicking support link', () => {
    const { getByText } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    const supportLink = getByText('Contacter le support');
    fireEvent.press(supportLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Support');
  });

  it('animates checkmark and content on mount', () => {
    const { getByTestId } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    const checkmark = getByTestId('success-checkmark');
    const content = getByTestId('success-content');

    // Vérification des valeurs initiales d'animation
    expect(checkmark.props.style[1].transform[0].scale).toBe(0);
    expect(content.props.style[1].opacity).toBe(0);

    // Avance l'animation
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Vérification des valeurs finales d'animation
    expect(checkmark.props.style[1].transform[0].scale).toBe(1);
    expect(content.props.style[1].opacity).toBe(1);
  });

  it('handles missing order ID gracefully', () => {
    const mockRouteNoId = {
      params: {}
    };

    const { getByText } = render(
      <PaymentSuccessScreen route={mockRouteNoId} navigation={mockNavigation} />
    );

    expect(getByText('Paiement réussi !')).toBeTruthy();
    expect(getByText('Votre commande a été confirmée')).toBeTruthy();
  });

  it('renders all buttons with correct styling', () => {
    const { getByText } = render(
      <PaymentSuccessScreen route={mockRoute} navigation={mockNavigation} />
    );

    const viewOrderButton = getByText('Voir ma commande');
    const continueShoppingButton = getByText('Continuer mes achats');

    expect(viewOrderButton).toHaveStyle({
      backgroundColor: '#10B981'
    });

    expect(continueShoppingButton).toHaveStyle({
      backgroundColor: '#f3f4f6'
    });
  });

  it('maintains layout structure with long order IDs', () => {
    const mockRouteLongId = {
      params: {
        orderId: 'very-long-order-id-123456789'
      }
    };

    const { getByText, getByTestId } = render(
      <PaymentSuccessScreen route={mockRouteLongId} navigation={mockNavigation} />
    );

    const container = getByTestId('success-container');
    expect(container).toHaveStyle({
      flex: 1
    });
  });
});
