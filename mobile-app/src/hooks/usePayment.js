import { useState, useEffect } from 'react';
import { paymentService } from '../services/payment.service';

export const usePayment = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializePayment = async () => {
    try {
      await paymentService.initialize();
      setIsInitialized(true);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      initializePayment();
    }
  }, []);

  return {
    isInitialized,
    initializePayment
  };
};
