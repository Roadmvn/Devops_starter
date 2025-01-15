import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { usePayment } from '../../hooks/usePayment';

export default function CartScreen({ navigation }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    total 
  } = useCart();
  const { isInitialized, initializePayment } = usePayment();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId, change) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      } else {
        Alert.alert(
          'Supprimer l\'article',
          'Voulez-vous retirer cet article du panier ?',
          [
            {
              text: 'Annuler',
              style: 'cancel'
            },
            {
              text: 'Supprimer',
              onPress: () => removeFromCart(productId),
              style: 'destructive'
            }
          ]
        );
      }
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles pour passer commande');
      return;
    }

    try {
      setLoading(true);
      const paymentResult = await initializePayment({
        amount: total,
        currency: 'EUR',
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (paymentResult.success) {
        clearCart();
        navigation.navigate('PaymentSuccess', {
          orderId: paymentResult.orderId
        });
      } else {
        Alert.alert(
          'Erreur de paiement',
          'Le paiement n\'a pas pu être effectué'
        );
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du paiement'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}€</Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => handleQuantityChange(item.id, -1)}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantity}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => handleQuantityChange(item.id, 1)}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>
              Votre panier est vide
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.continueButtonText}>
                Continuer les achats
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{total}€</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={loading}
          >
            <Text style={styles.checkoutButtonText}>
              {loading ? 'Traitement...' : 'Payer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8
  },
  productInfo: {
    flex: 1,
    marginLeft: 15
  },
  productName: {
    fontSize: 16,
    fontWeight: '600'
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981'
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600'
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981'
  },
  checkoutButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20
  },
  continueButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
});
