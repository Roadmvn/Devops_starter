import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promotionsRes, recentProductsRes] = await Promise.all([
        api.get('/products/promotions'),
        api.get('/products/recent')
      ]);
      setPromotions(promotionsRes.data);
      setRecentProducts(recentProductsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderPromotionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.promotionCard}
      onPress={() => navigation.navigate('Product', { productId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.promotionImage}
        resizeMode="cover"
      />
      <View style={styles.promotionInfo}>
        <Text style={styles.promotionTitle}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.oldPrice}>{item.originalPrice}€</Text>
          <Text style={styles.newPrice}>{item.promotionalPrice}€</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { productId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}€</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>
                Bonjour {user?.firstName || 'Client'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Promotions</Text>
              <FlatList
                horizontal
                data={promotions}
                renderItem={renderPromotionItem}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                style={styles.promotionsList}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Produits Récents</Text>
            </View>
          </>
        }
        data={recentProducts}
        renderItem={renderRecentProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
      />

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.scanButtonText}>Scanner un produit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 20,
    backgroundColor: '#10B981'
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  section: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  promotionsList: {
    marginLeft: -20
  },
  promotionCard: {
    width: 300,
    marginLeft: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  promotionImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  promotionInfo: {
    padding: 10
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  oldPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 10
  },
  newPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981'
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 4
  },
  scanButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
