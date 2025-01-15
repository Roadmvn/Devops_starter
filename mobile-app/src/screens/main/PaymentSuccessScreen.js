import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { orderId } = route.params;
  const checkmarkScale = new Animated.Value(0);
  const fadeIn = new Animated.Value(0);

  useEffect(() => {
    // Animation du symbole de validation
    Animated.sequence([
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleViewOrder = () => {
    navigation.replace('PurchaseDetails', { purchaseId: orderId });
  };

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: checkmarkScale }]
            }
          ]}
        >
          <MaterialIcons
            name="check-circle"
            size={100}
            color="#10B981"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeIn
            }
          ]}
        >
          <Text style={styles.title}>Paiement réussi !</Text>
          <Text style={styles.subtitle}>
            Votre commande #{orderId} a été confirmée
          </Text>
          <Text style={styles.message}>
            Merci pour votre achat. Vous recevrez bientôt un email de confirmation.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: fadeIn
            }
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewOrder}
          >
            <Text style={styles.primaryButtonText}>
              Voir ma commande
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.secondaryButtonText}>
              Continuer mes achats
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeIn
          }
        ]}
      >
        <Text style={styles.footerText}>
          Des questions ? Contactez notre service client
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.supportLink}>
            Contacter le support
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  checkmarkContainer: {
    marginBottom: 30
  },
  textContainer: {
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 15
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 20
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500'
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5
  },
  supportLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500'
  }
});
