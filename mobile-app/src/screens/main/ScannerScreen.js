import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import api from '../../services/api';

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès à la caméra est nécessaire pour scanner les produits'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra');
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      setScanned(true);
      setLoading(true);

      // Recherche du produit dans l'API
      const response = await api.get(`/products/barcode/${data}`);
      const product = response.data;

      if (product) {
        navigation.navigate('Product', { product });
      } else {
        // Si le produit n'existe pas, chercher dans OpenFoodFacts
        const openFoodFactsResponse = await api.get(`/products/openfoodfacts/${data}`);
        const openFoodFactsProduct = openFoodFactsResponse.data;

        if (openFoodFactsProduct) {
          navigation.navigate('Product', {
            product: openFoodFactsProduct,
            isNewProduct: true
          });
        } else {
          Alert.alert(
            'Produit non trouvé',
            'Ce produit n\'existe pas dans notre base de données'
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les informations du produit'
      );
    } finally {
      setLoading(false);
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Accès à la caméra refusé</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Demander l'accès</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean13],
        }}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>
              Recherche du produit...
            </Text>
          </View>
        )}

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Placez le code-barres dans le cadre
          </Text>
        </View>
      </Camera>

      {scanned && !loading && (
        <TouchableOpacity
          style={styles.rescanButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scanner à nouveau</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'transparent'
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10
  },
  helpContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  helpText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    margin: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  rescanButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10
  }
});
