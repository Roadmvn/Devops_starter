import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService from '../services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)

  // Initialiser l'état depuis le localStorage
  const initializeStore = () => {
    const storedUser = AuthService.getCurrentUser()
    const storedToken = AuthService.getToken()
    user.value = storedUser
    token.value = storedToken
  }

  // Initialiser au démarrage
  initializeStore()

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    try {
      const response = await AuthService.login(email, password)
      user.value = response.user
      token.value = response.token
      return response
    } catch (error) {
      user.value = null
      token.value = null
      throw error
    }
  }

  function logout() {
    AuthService.logout()
    user.value = null
    token.value = null
  }

  function updateUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    initializeStore
  }
})
