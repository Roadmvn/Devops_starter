import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useProductStore = defineStore('products', () => {
  // État
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const categories = ref(['Électronique', 'Alimentation', 'Vêtements', 'Maison', 'Autres'])

  // Getters
  const totalProducts = computed(() => products.value.length)
  const outOfStockProducts = computed(() => 
    products.value.filter(product => product.stock === 0).length
  )
  const lowStockProducts = computed(() => 
    products.value.filter(product => product.stock > 0 && product.stock <= 10).length
  )

  // Actions
  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/products')
      products.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors du chargement des produits:', err)
    } finally {
      loading.value = false
    }
  }

  async function addProduct(product) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/products', product)
      products.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id, updates) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`/api/products/${id}`, updates)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // État
    products,
    loading,
    error,
    categories,
    
    // Getters
    totalProducts,
    outOfStockProducts,
    lowStockProducts,
    
    // Actions
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    clearError
  }
})
