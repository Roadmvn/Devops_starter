import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('users', () => {
  // État
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const roles = ref(['admin', 'manager', 'user'])

  // Getters
  const totalUsers = computed(() => users.value.length)
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === true).length
  )
  const usersByRole = computed(() => {
    return roles.value.reduce((acc, role) => {
      acc[role] = users.value.filter(user => user.role === role).length
      return acc
    }, {})
  })

  // Actions
  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/users')
      users.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors du chargement des utilisateurs:', err)
    } finally {
      loading.value = false
    }
  }

  async function addUser(user) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/users', user)
      users.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, updates) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`/api/users/${id}`, updates)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/users/${id}`)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUserStatus(id, status) {
    return updateUser(id, { status })
  }

  async function updateUserRole(id, role) {
    return updateUser(id, { role })
  }

  function clearError() {
    error.value = null
  }

  return {
    // État
    users,
    loading,
    error,
    roles,
    
    // Getters
    totalUsers,
    activeUsers,
    usersByRole,
    
    // Actions
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    clearError
  }
})
