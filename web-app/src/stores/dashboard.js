import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useProductStore } from './products'
import { useUserStore } from './users'
import { useInvoiceStore } from './invoices'

export const useDashboardStore = defineStore('dashboard', () => {
  // État
  const loading = ref(false)
  const error = ref(null)
  const salesData = ref([])
  const recentActivities = ref([])

  // Stores
  const productStore = useProductStore()
  const userStore = useUserStore()
  const invoiceStore = useInvoiceStore()

  // Getters
  const totalRevenue = computed(() => 
    salesData.value.reduce((sum, sale) => sum + sale.amount, 0)
  )

  const monthlyRevenue = computed(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    return salesData.value
      .filter(sale => {
        const saleDate = new Date(sale.date)
        return saleDate.getMonth() === thisMonth && 
               saleDate.getFullYear() === thisYear
      })
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  const dailyRevenue = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return salesData.value
      .filter(sale => sale.date.startsWith(today))
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  // Actions
  async function fetchDashboardData() {
    loading.value = true
    error.value = null
    try {
      // Charger les données en parallèle
      await Promise.all([
        productStore.fetchProducts(),
        userStore.fetchUsers(),
        invoiceStore.fetchInvoices(),
        fetchSalesData(),
        fetchRecentActivities()
      ])
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors du chargement des données du tableau de bord:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchSalesData() {
    try {
      const response = await axios.get('/api/dashboard/sales')
      salesData.value = response.data
    } catch (err) {
      console.error('Erreur lors du chargement des données de vente:', err)
      throw err
    }
  }

  async function fetchRecentActivities() {
    try {
      const response = await axios.get('/api/dashboard/activities')
      recentActivities.value = response.data
    } catch (err) {
      console.error('Erreur lors du chargement des activités récentes:', err)
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // État
    loading,
    error,
    salesData,
    recentActivities,
    
    // Getters
    totalRevenue,
    monthlyRevenue,
    dailyRevenue,
    
    // Actions
    fetchDashboardData,
    fetchSalesData,
    fetchRecentActivities,
    clearError,
    
    // Données des autres stores
    products: computed(() => productStore.products),
    totalProducts: computed(() => productStore.totalProducts),
    outOfStockProducts: computed(() => productStore.outOfStockProducts),
    
    users: computed(() => userStore.users),
    totalUsers: computed(() => userStore.totalUsers),
    activeUsers: computed(() => userStore.activeUsers),
    
    invoices: computed(() => invoiceStore.invoices),
    totalInvoices: computed(() => invoiceStore.totalInvoices),
    unpaidAmount: computed(() => invoiceStore.unpaidAmount)
  }
})
