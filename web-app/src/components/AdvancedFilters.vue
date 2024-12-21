<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Recherche par texte -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700">Recherche</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              v-model="filters.search"
              class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher..."
              @input="emitFilters"
            />
          </div>
        </div>

        <!-- Sélection de catégorie -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            id="category"
            name="category"
            v-model="filters.category"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            @change="emitFilters"
          >
            <option value="">Toutes les catégories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Période -->
        <div>
          <label for="period" class="block text-sm font-medium text-gray-700">Période</label>
          <div class="mt-1">
            <Datepicker
              v-model="filters.dateRange"
              range
              :format="format"
              :preview-format="format"
              :locale="fr"
              placeholder="Sélectionner une période"
              :enableTimePicker="false"
              textInput
              autoApply
              @update:modelValue="emitFilters"
              class="w-full"
            >
              <template #trigger>
                <div
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span v-if="filters.dateRange?.length === 2">
                    {{ formatDateRange(filters.dateRange) }}
                  </span>
                  <span v-else class="text-gray-400">Sélectionner une période</span>
                </div>
              </template>
            </Datepicker>
          </div>
        </div>

        <!-- Statut -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Statut</label>
          <div class="mt-1 space-y-2">
            <div v-for="status in statuses" :key="status.value" class="flex items-center">
              <input
                :id="status.value"
                v-model="filters.status"
                name="status"
                type="checkbox"
                :value="status.value"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                @change="emitFilters"
              />
              <label :for="status.value" class="ml-2 block text-sm text-gray-700">
                {{ status.label }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-between items-center">
        <div class="flex space-x-3">
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="resetFilters"
          >
            <RefreshIcon class="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="applyFilters"
          >
            <FilterIcon class="h-4 w-4 mr-2" />
            Appliquer
          </button>
        </div>

        <!-- Export -->
        <div class="flex items-center space-x-2">
          <button
            type="button"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="exportData('pdf')"
          >
            <DocumentDownloadIcon class="h-4 w-4 mr-1" />
            PDF
          </button>
          <button
            type="button"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="exportData('excel')"
          >
            <TableIcon class="h-4 w-4 mr-1" />
            Excel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { fr } from 'date-fns/locale'
import {
  SearchIcon,
  FilterIcon,
  RefreshIcon,
  DocumentDownloadIcon,
  TableIcon
} from '@heroicons/vue/outline'
import { format as formatDate } from 'date-fns'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const props = defineProps({
  categories: {
    type: Array,
    default: () => ['Boissons', 'Boulangerie', 'Produits laitiers', 'Fruits', 'Confiserie']
  }
})

const emit = defineEmits(['filter', 'export'])

const format = (date) => {
  return formatDate(date, 'dd/MM/yyyy')
}

const statuses = [
  { value: 'active', label: 'Actif' },
  { value: 'outOfStock', label: 'Rupture de stock' },
  { value: 'discontinued', label: 'Arrêté' }
]

const filters = reactive({
  search: '',
  category: '',
  dateRange: [],
  status: []
})

const formatDateRange = (range) => {
  if (range.length !== 2) return ''
  return `${format(range[0])} - ${format(range[1])}`
}

const emitFilters = () => {
  emit('filter', { ...filters })
}

const resetFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.dateRange = []
  filters.status = []
  emitFilters()
  notificationStore.success('Filtres réinitialisés')
}

const applyFilters = () => {
  emitFilters()
  notificationStore.success('Filtres appliqués')
}

const exportData = async (type) => {
  try {
    emit('export', { type, filters: { ...filters } })
    notificationStore.success(`Export en ${type.toUpperCase()} lancé`)
  } catch (error) {
    notificationStore.error(`Erreur lors de l'export : ${error.message}`)
  }
}
</script>
