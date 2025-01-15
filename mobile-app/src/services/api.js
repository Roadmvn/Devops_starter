import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import getEnvVars from '../config/env';

const { apiUrl } = getEnvVars();

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Vérification de la connexion
const checkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error('Pas de connexion internet');
  }
};

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    try {
      await checkConnection();
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const { token } = JSON.parse(user);
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  response => response,
  async error => {
    if (!error.response) {
      // Erreur réseau
      return Promise.reject({
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        isNetworkError: true
      });
    }

    // Gestion du token expiré
    if (error.response.status === 401) {
      await AsyncStorage.removeItem('user');
      // Rediriger vers la page de connexion
    }

    return Promise.reject(error);
  }
);

export default api;
