<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Produits</h1>
        <button
          type="button"
          @click="openNewProductModal"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouveau produit
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="py-4 space-y-4">
        <!-- Filtres avancés -->
        <AdvancedFilters
          :categories="categories"
          @filter="handleFilter"
          @export="handleExport"
        />

        <!-- Table des produits -->
        <div class="bg-white shadow rounded-lg">
          <ProductTable
            :products="filteredProducts"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
          />
          
          <!-- Pagination -->
          <TablePagination
            v-if="totalItems > 0"
            v-model:currentPage="currentPage"
            :total-items="totalItems"
            :per-page="perPage"
          />
        </div>
      </div>
    </div>

    <!-- Modal nouveau/édition produit -->
    <ProductForm
      v-if="showProductModal"
      :product="selectedProduct"
      @close="closeProductModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon } from '@heroicons/vue/outline'
import AdvancedFilters from '../components/AdvancedFilters.vue'
import ProductTable from '../components/ProductTable.vue'
import ProductForm from '../components/ProductForm.vue'
import TablePagination from '../components/TablePagination.vue'
import { useNotificationStore } from '../stores/notifications'
import exportService from '../services/exportService'

const notificationStore = useNotificationStore()

// État
const products = ref([])
const loading = ref(true)
const showProductModal = ref(false)
const selectedProduct = ref(null)
const currentPage = ref(1)
const perPage = ref(10)
const filters = ref({})

// Catégories disponibles
const categories = [
  'Boissons',
  'Boulangerie',
  'Produits laitiers',
  'Fruits',
  'Confiserie'
]

// Produits filtrés et paginés
const filteredProducts = computed(() => {
  let result = [...products.value]

  // Application des filtres
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.id.toLowerCase().includes(search)
    )
  }

  if (filters.value.category) {
    result = result.filter(product => product.category === filters.value.category)
  }

  if (filters.value.status?.length > 0) {
    result = result.filter(product => filters.value.status.includes(product.status))
  }

  if (filters.value.dateRange?.length === 2) {
    const [start, end] = filters.value.dateRange
    result = result.filter(product => {
      const createdAt = new Date(product.createdAt)
      return createdAt >= start && createdAt <= end
    })
  }

  // Pagination
  const start = (currentPage.value - 1) * perPage.value
  return result.slice(start, start + perPage.value)
})

const totalItems = computed(() => filteredProducts.value.length)

// Gestionnaires d'événements
const handleFilter = (newFilters) => {
  filters.value = newFilters
  currentPage.value = 1
}

const handleExport = async ({ type, filters }) => {
  try {
    const dataToExport = products.value.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock
    }))

    if (type === 'pdf') {
      await exportService.exportToPDF(dataToExport, filters)
    } else if (type === 'excel') {
      await exportService.exportToExcel(dataToExport, filters)
    }
  } catch (error) {
    notificationStore.error(`Erreur lors de l'export : ${error.message}`)
  }
}

const openNewProductModal = () => {
  selectedProduct.value = null
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  selectedProduct.value = null
}

const handleEdit = (product) => {
  selectedProduct.value = { ...product }
  showProductModal.value = true
}

const handleDelete = async (product) => {
  try {
    // Appel API pour supprimer le produit
    await deleteProduct(product.id)
    products.value = products.value.filter(p => p.id !== product.id)
    notificationStore.success('Produit supprimé avec succès')
  } catch (error) {
    notificationStore.error(`Erreur lors de la suppression : ${error.message}`)
  }
}

const handleSubmit = async (productData) => {
  try {
    if (selectedProduct.value) {
      // Mise à jour d'un produit existant
      await updateProduct(productData)
      const index = products.value.findIndex(p => p.id === productData.id)
      if (index !== -1) {
        products.value[index] = productData
      }
      notificationStore.success('Produit mis à jour avec succès')
    } else {
      // Création d'un nouveau produit
      const newProduct = await createProduct(productData)
      products.value.push(newProduct)
      notificationStore.success('Produit créé avec succès')
    }
    closeProductModal()
  } catch (error) {
    notificationStore.error(`Erreur lors de l'enregistrement : ${error.message}`)
  }
}

// Chargement initial des données
onMounted(async () => {
  try {
    loading.value = true
    // Appel API pour charger les produits
    const response = await fetchProducts()
    products.value = response.data
  } catch (error) {
    notificationStore.error(`Erreur lors du chargement des produits : ${error.message}`)
  } finally {
    loading.value = false
  }
})

// Fonctions API simulées
const fetchProducts = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: [
          {
            id: 'PRD001',
            name: 'Café Bio Arabica',
            category: 'Boissons',
            price: 8.99,
            stock: 150,
            status: 'active',
            createdAt: '2023-12-01'
          },
          // Ajoutez d'autres produits ici
        ]
      })
    }, 1000)
  })
}

const createProduct = (product) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ...product,
        id: `PRD${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString()
      })
    }, 500)
  })
}

const updateProduct = (product) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(product)
    }, 500)
  })
}

const deleteProduct = (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}
</script>
