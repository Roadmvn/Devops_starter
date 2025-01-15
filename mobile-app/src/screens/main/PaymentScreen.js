import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { paymentService } from '../../services/payment.service';
import { PayPalButton } from '@paypal/react-native-paypal';

export default function PaymentScreen({ navigation }) {
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      
      // Sélection par défaut de PayPal
      const paypalMethod = methods.find(m => m.type === 'paypal');
      if (paypalMethod) {
        setSelectedMethod(paypalMethod);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des méthodes de paiement:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les méthodes de paiement'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement');
      return;
    }

    try {
      setProcessingPayment(true);

      // Création de la commande
      const { orderId, paypalOrderId } = await paymentService.createOrder(
        cartItems,
        total
      );

      // Traitement du paiement PayPal
      const result = await paymentService.processPayment(orderId, paypalOrderId);

      if (result.success) {
        // Nettoyage du panier
        clearCart();

        // Navigation vers l'écran de confirmation
        navigation.replace('PaymentSuccess', {
          orderId: result.order.id
        });
      } else {
        throw new Error('Le paiement a échoué');
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      Alert.alert(
        'Erreur de paiement',
        'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif de la commande</Text>
        
        {cartItems.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price * item.quantity}€</Text>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{total}€</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        
        {paymentMethods.map((method, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.methodCard,
              selectedMethod?.id === method.id && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod(method)}
          >
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.paypalContainer}>
        <PayPalButton
          amount={total.toString()}
          onPress={handlePayment}
          disabled={processingPayment || !selectedMethod}
        />
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityText}>
          🔒 Paiement sécurisé via PayPal
        </Text>
        <Text style={styles.securitySubtext}>
          Vos informations de paiement sont protégées
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    color: '#374151'
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981'
  },
  methodCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 10
  },
  selectedMethod: {
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#10B981'
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280'
  },
  paypalContainer: {
    padding: 20
  },
  securityInfo: {
    padding: 20,
    alignItems: 'center'
  },
  securityText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600'
  },
  securitySubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5
  }
});
