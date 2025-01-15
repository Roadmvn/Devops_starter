import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert
} from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';

export default function PurchaseDetailsScreen({ route, navigation }) {
  const { purchaseId } = route.params;
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    loadPurchaseDetails();
  }, [purchaseId]);

  const loadPurchaseDetails = async () => {
    try {
      const response = await api.get(`/purchases/${purchaseId}`);
      setPurchase(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'achat');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      
      // Téléchargement de la facture PDF
      const response = await api.get(`/purchases/${purchaseId}/invoice`, {
        responseType: 'blob'
      });

      // Création du fichier temporaire
      const fileName = `facture_${purchaseId}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(
        fileUri,
        response.data,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Partage du fichier
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          'Erreur',
          'Le partage de fichiers n\'est pas disponible sur cet appareil'
        );
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      Alert.alert(
        'Erreur',
        'Impossible de télécharger la facture'
      );
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const sharePurchaseDetails = async () => {
    try {
      const message = `
Facture #${purchase.id}
Date: ${format(new Date(purchase.date), 'PPP', { locale: fr })}
Total: ${purchase.total}€

Articles:
${purchase.items.map(item => 
  `- ${item.quantity}x ${item.name} (${item.price}€)`
).join('\n')}

Sous-total: ${purchase.subtotal}€
TVA (20%): ${purchase.tax}€
Total: ${purchase.total}€

Mode de paiement: ${purchase.paymentMethod}
      `;

      await Share.share({
        message,
        title: `Facture #${purchase.id}`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
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
      <View style={styles.header}>
        <Text style={styles.title}>Facture #{purchase.id}</Text>
        <Text style={styles.date}>
          {format(new Date(purchase.date), 'PPP', { locale: fr })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Articles</Text>
        {purchase.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price}€</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>{purchase.subtotal}€</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>TVA (20%)</Text>
          <Text style={styles.summaryValue}>{purchase.tax}€</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{purchase.total}€</Text>
        </View>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentLabel}>Mode de paiement</Text>
        <Text style={styles.paymentMethod}>{purchase.paymentMethod}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={sharePurchaseDetails}
        >
          <Text style={styles.shareButtonText}>Partager</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={downloadInvoice}
          disabled={downloadingInvoice}
        >
          <Text style={styles.downloadButtonText}>
            {downloadingInvoice ? 'Téléchargement...' : 'Télécharger PDF'}
          </Text>
        </TouchableOpacity>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5
  },
  section: {
    padding: 20
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
  itemDetails: {
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
  summary: {
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981'
  },
  paymentInfo: {
    padding: 20
  },
  paymentLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginRight: 10
  },
  shareButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  }
});
