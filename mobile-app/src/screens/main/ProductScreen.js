import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

export default function ProductScreen({ route, navigation }) {
  const { productId, product: initialProduct, isNewProduct } = route.params;
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId && !initialProduct) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du produit');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      Alert.alert(
        'Succès',
        'Produit ajouté au panier',
        [
          {
            text: 'Continuer les achats',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          },
          {
            text: 'Voir le panier',
            onPress: () => navigation.navigate('Cart')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit au panier');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produit non trouvé</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price}€</Text>

          {product.promotion && (
            <View style={styles.promotionContainer}>
              <Text style={styles.oldPrice}>{product.originalPrice}€</Text>
              <Text style={styles.promotionText}>
                -{product.promotionPercentage}%
              </Text>
            </View>
          )}

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Informations nutritionnelles</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>
                  {product.nutritionalInfo?.calories || '-'} kcal
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protéines</Text>
                <Text style={styles.nutritionValue}>
                  {product.nutritionalInfo?.proteins || '-'} g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Glucides</Text>
                <Text style={styles.nutritionValue}>
                  {product.nutritionalInfo?.carbs || '-'} g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Lipides</Text>
                <Text style={styles.nutritionValue}>
                  {product.nutritionalInfo?.fats || '-'} g
                </Text>
              </View>
            </View>
          </View>

          {product.allergens && product.allergens.length > 0 && (
            <View style={styles.allergensContainer}>
              <Text style={styles.sectionTitle}>Allergènes</Text>
              <Text style={styles.allergensText}>
                {product.allergens.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(-1)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{quantity}</Text>

          <TouchableOpacity
            onPress={() => handleQuantityChange(1)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (!product.stock || product.stock < 1) && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={!product.stock || product.stock < 1}
        >
          <Text style={styles.addToCartButtonText}>
            {!product.stock || product.stock < 1
              ? 'Rupture de stock'
              : 'Ajouter au panier'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20
  },
  image: {
    width: '100%',
    height: 300
  },
  contentContainer: {
    padding: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981'
  },
  promotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  oldPrice: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 10
  },
  promotionText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold'
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginTop: 20,
    lineHeight: 24
  },
  nutritionContainer: {
    marginTop: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666'
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5
  },
  allergensContainer: {
    marginTop: 30
  },
  allergensText: {
    fontSize: 16,
    color: '#374151'
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981'
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20
  },
  addToCartButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#9CA3AF'
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
