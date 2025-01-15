import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Share
} from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';

export default function HistoryScreen({ navigation }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }

      if (!hasMore && !refresh) return;

      const response = await api.get('/purchases', {
        params: {
          page: refresh ? 1 : page,
          limit: 10
        }
      });

      const { data, meta } = response.data;
      
      setPurchases(prev => 
        refresh ? data : [...prev, ...data]
      );
      setHasMore(meta.hasNextPage);
      if (!refresh) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPurchases(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPurchases();
    }
  };

  const sharePurchase = async (purchase) => {
    try {
      const message = `
Facture #${purchase.id}
Date: ${format(new Date(purchase.date), 'PPP', { locale: fr })}
Total: ${purchase.total}€

Articles:
${purchase.items.map(item => `- ${item.quantity}x ${item.name} (${item.price}€)`).join('\n')}
      `;

      await Share.share({
        message,
        title: `Facture #${purchase.id}`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const renderPurchaseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.purchaseCard}
      onPress={() => navigation.navigate('PurchaseDetails', { purchaseId: item.id })}
    >
      <View style={styles.purchaseHeader}>
        <View>
          <Text style={styles.purchaseId}>Facture #{item.id}</Text>
          <Text style={styles.purchaseDate}>
            {format(new Date(item.date), 'PPP', { locale: fr })}
          </Text>
        </View>
        <Text style={styles.purchaseTotal}>{item.total}€</Text>
      </View>

      <View style={styles.itemsList}>
        {item.items.slice(0, 3).map((product, index) => (
          <Text key={index} style={styles.itemText}>
            {product.quantity}x {product.name}
          </Text>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 3} autres articles
          </Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => sharePurchase(item)}
        >
          <Text style={styles.shareButtonText}>Partager</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('PurchaseDetails', { purchaseId: item.id })}
        >
          <Text style={styles.detailsButtonText}>Voir les détails</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun achat trouvé
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color="#10B981"
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  purchaseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  purchaseId: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  purchaseDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  purchaseTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981'
  },
  itemsList: {
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb'
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  moreItems: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  shareButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 10
  },
  shareButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500'
  },
  detailsButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#10B981'
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  footerLoader: {
    marginVertical: 15
  }
});
