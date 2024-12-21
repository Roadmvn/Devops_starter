<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Gestion des factures</h1>
        <button
          @click="showNewInvoiceModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nouvelle facture
        </button>
      </div>

      <!-- Filtres et recherche -->
      <div class="mt-4 flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher une facture..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div class="w-48">
          <select
            v-model="statusFilter"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="Payée">Payée</option>
            <option value="En attente">En attente</option>
            <option value="Annulée">Annulée</option>
          </select>
        </div>
        <div class="w-48">
          <select
            v-model="dateFilter"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total factures
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.total }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Montant total
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ formatPrice(stats.totalAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    En attente
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.pending }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table des factures -->
      <div class="mt-6">
        <InvoiceTable
          :invoices="filteredInvoices"
          @view-details="handleViewDetails"
          @download-pdf="handleDownloadPDF"
          @mark-paid="handleMarkPaid"
        />
      </div>
    </div>

    <!-- Modal détails facture -->
    <div v-if="showDetailsModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Détails de la facture
              </h3>
              <button
                @click="closeDetailsModal"
                class="text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Fermer</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <InvoiceDetails
              v-if="selectedInvoice"
              :invoice="selectedInvoice"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InvoiceTable from '../components/InvoiceTable.vue'
import InvoiceDetails from '../components/InvoiceDetails.vue'
import { invoicesAPI } from '../services/api'

const invoices = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const showDetailsModal = ref(false)
const showNewInvoiceModal = ref(false)
const selectedInvoice = ref(null)

// Statistiques
const stats = computed(() => {
  return {
    total: invoices.value.length,
    totalAmount: invoices.value.reduce((sum, invoice) => sum + invoice.total, 0),
    pending: invoices.value.filter(invoice => invoice.status === 'En attente').length
  }
})

// Filtrage des factures
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || invoice.status === statusFilter.value
    
    let matchesDate = true
    if (dateFilter.value) {
      const invoiceDate = new Date(invoice.date)
      const today = new Date()
      
      switch (dateFilter.value) {
        case 'today':
          matchesDate = isSameDay(invoiceDate, today)
          break
        case 'week':
          matchesDate = isThisWeek(invoiceDate)
          break
        case 'month':
          matchesDate = isSameMonth(invoiceDate, today)
          break
        case 'year':
          matchesDate = isSameYear(invoiceDate, today)
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })
})

// Chargement initial des factures
const loadInvoices = async () => {
  try {
    const response = await invoicesAPI.getAll()
    invoices.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des factures:', error)
  }
}

// Gestion des actions
const handleViewDetails = (invoice) => {
  selectedInvoice.value = invoice
  showDetailsModal.value = true
}

const handleDownloadPDF = async (invoice) => {
  try {
    await invoicesAPI.downloadPDF(invoice.id)
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error)
  }
}

const handleMarkPaid = async (invoice) => {
  try {
    await invoicesAPI.update(invoice.id, { status: 'Payée' })
    const index = invoices.value.findIndex(inv => inv.id === invoice.id)
    invoices.value[index] = { ...invoices.value[index], status: 'Payée' }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedInvoice.value = null
}

// Fonctions utilitaires pour les dates
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const isThisWeek = (date) => {
  const today = new Date()
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const lastDayOfWeek = new Date(firstDayOfWeek)
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6)
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek
}

const isSameMonth = (date1, date2) => {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const isSameYear = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear()
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Chargement initial
loadInvoices()
</script>
