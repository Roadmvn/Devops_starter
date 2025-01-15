import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useInvoiceStore = defineStore('invoices', () => {
  // État
  const invoices = ref([])
  const loading = ref(false)
  const error = ref(null)
  const statuses = ref(['En attente', 'Payée', 'Annulée'])

  // Getters
  const totalInvoices = computed(() => invoices.value.length)
  const totalAmount = computed(() => 
    invoices.value.reduce((sum, invoice) => sum + invoice.amount, 0)
  )
  const invoicesByStatus = computed(() => {
    return statuses.value.reduce((acc, status) => {
      acc[status] = invoices.value.filter(invoice => invoice.status === status).length
      return acc
    }, {})
  })
  const unpaidAmount = computed(() => 
    invoices.value
      .filter(invoice => invoice.status === 'En attente')
      .reduce((sum, invoice) => sum + invoice.amount, 0)
  )

  // Actions
  async function fetchInvoices() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/invoices')
      invoices.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors du chargement des factures:', err)
    } finally {
      loading.value = false
    }
  }

  async function addInvoice(invoice) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/invoices', invoice)
      invoices.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInvoice(id, updates) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`/api/invoices/${id}`, updates)
      const index = invoices.value.findIndex(i => i.id === id)
      if (index !== -1) {
        invoices.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteInvoice(id) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/invoices/${id}`)
      invoices.value = invoices.value.filter(i => i.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function markAsPaid(id) {
    return updateInvoice(id, { status: 'Payée' })
  }

  async function markAsCancelled(id) {
    return updateInvoice(id, { status: 'Annulée' })
  }

  async function generateInvoicePDF(id) {
    try {
      const response = await axios.get(`/api/invoices/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // État
    invoices,
    loading,
    error,
    statuses,
    
    // Getters
    totalInvoices,
    totalAmount,
    invoicesByStatus,
    unpaidAmount,
    
    // Actions
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
    markAsCancelled,
    generateInvoicePDF,
    clearError
  }
})
