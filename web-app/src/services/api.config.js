import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token

    // Ajouter le token d'authentification si disponible
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()

    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      // Si le token est expiré, essayer de le rafraîchir
      if (authStore.refreshToken) {
        try {
          await authStore.refreshAccessToken()
          // Réessayer la requête originale
          return api.request(error.config)
        } catch (refreshError) {
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          await authStore.logout()
          window.location.href = '/login'
        }
      } else {
        // Pas de refresh token, déconnecter l'utilisateur
        await authStore.logout()
        window.location.href = '/login'
      }
    }

    // Gérer les erreurs de validation
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors
      throw { 
        message: 'Erreur de validation',
        validationErrors 
      }
    }

    // Gérer les erreurs serveur
    if (error.response?.status >= 500) {
      throw {
        message: 'Erreur serveur. Veuillez réessayer plus tard.',
        error: error.response.data
      }
    }

    return Promise.reject(error)
  }
)

export default api
