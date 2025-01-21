<template>
  <div class="products-page p-6">
    <div class="mb-6">
      <!-- En-tête avec fil d'Ariane -->
      <div class="text-sm text-gray-600 mb-2">
        <a href="#" class="hover:text-primary">Accueil</a>
        <span class="mx-2">/</span>
        <span>Gestion des produits</span>
      </div>

      <!-- Titre et actions -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Produits</h1>
          
          <div class="flex items-center gap-4">
            <!-- Actions principales -->
            <div class="flex items-center gap-2">
              <button @click="openEditModal()" class="btn btn-primary flex items-center gap-2">
                <i class="fas fa-plus"></i>
                Ajouter un produit
              </button>
            </div>

            <!-- Export -->
            <div class="flex items-center gap-2">
              <button @click="exportToPDF" class="btn btn-outline flex items-center gap-2">
                <i class="fas fa-file-pdf text-red-500"></i>
                <span class="hidden md:inline">Exporter en PDF</span>
                <span class="md:hidden">PDF</span>
              </button>
              <button @click="exportToExcel" class="btn btn-outline flex items-center gap-2">
                <i class="fas fa-file-excel text-green-500"></i>
                <span class="hidden md:inline">Exporter en Excel</span>
                <span class="md:hidden">Excel</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-green-600 text-sm font-medium">Produits en stock</div>
            <div class="text-2xl font-bold">{{ productsInStock }}</div>
          </div>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <div class="text-yellow-600 text-sm font-medium">Stock faible</div>
            <div class="text-2xl font-bold">{{ lowStockProducts }}</div>
          </div>
          
          <div class="bg-red-50 p-4 rounded-lg">
            <div class="text-red-600 text-sm font-medium">Rupture de stock</div>
            <div class="text-2xl font-bold">{{ outOfStockProducts }}</div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-blue-600 text-sm font-medium">Valeur totale</div>
            <div class="text-2xl font-bold">{{ formatPrice(totalValue) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-section bg-white rounded-lg p-4 mb-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Recherche -->
        <div class="search-bar">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="form-input pl-10 pr-4 py-2 w-full rounded-lg"
              placeholder="Rechercher un produit..."
            >
          </div>
        </div>

        <!-- Catégories -->
        <div class="filter-group">
          <label class="block text-sm font-medium mb-2">Catégories</label>
          <select v-model="selectedCategories" class="form-select w-full" multiple>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Marques -->
        <div class="filter-group">
          <label class="block text-sm font-medium mb-2">Marques</label>
          <select v-model="selectedBrands" class="form-select w-full" multiple>
            <option v-for="brand in availableBrands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
        </div>

        <!-- Stock -->
        <div class="filter-group">
          <label class="block text-sm font-medium mb-2">Disponibilité</label>
          <select v-model="stockFilter" class="form-select w-full">
            <option value="all">Tous les produits</option>
            <option value="in-stock">En stock</option>
            <option value="low-stock">Stock faible</option>
            <option value="out-of-stock">Rupture de stock</option>
          </select>
        </div>
      </div>

      <!-- Prix -->
      <div class="mt-4">
        <label class="block text-sm font-medium mb-2">Prix</label>
        <div class="flex items-center gap-4">
          <span class="text-sm">{{ formatPrice(priceRange[0]) }}</span>
          <input 
            type="range" 
            v-model="priceRange[0]" 
            :min="minPrice" 
            :max="maxPrice"
            class="flex-grow"
          >
          <input 
            type="range" 
            v-model="priceRange[1]" 
            :min="minPrice" 
            :max="maxPrice"
            class="flex-grow"
          >
          <span class="text-sm">{{ formatPrice(priceRange[1]) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 mt-4">
        <button @click="resetFilters" class="btn btn-outline">
          <i class="fas fa-undo mr-2"></i>
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Liste des produits -->
    <div class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="product in paginatedProducts" :key="product.id" 
           class="product-card bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <div class="relative">
          <img :src="product.imageUrl" :alt="product.name" class="w-full h-48 object-cover rounded-t-lg">
          <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-medium"
               :class="{
                 'bg-green-500 text-white': product.stock > 10,
                 'bg-yellow-500 text-white': product.stock <= 10 && product.stock > 0,
                 'bg-red-500 text-white': product.stock === 0
               }">
            {{ product.stock }} en stock
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">{{ product.name }}</h3>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm bg-gray-100 px-2 py-1 rounded">{{ product.category }}</span>
            <span class="text-sm bg-gray-100 px-2 py-1 rounded">{{ product.brand }}</span>
          </div>
          <div class="flex items-center gap-2 mb-4">
            <div class="text-yellow-400">
              <i v-for="n in Math.floor(product.rating)" :key="n" class="fas fa-star"></i>
              <i v-if="product.rating % 1 > 0" class="fas fa-star-half-alt"></i>
            </div>
            <span class="text-sm text-gray-600">{{ product.rating }}/5</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-primary">{{ formatPrice(product.price) }}</span>
            <div class="flex gap-2">
              <button @click="openEditModal(product)" class="btn-icon text-blue-600 hover:bg-blue-50">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="openDeleteModal(product)" class="btn-icon text-red-600 hover:bg-red-50">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex justify-between items-center bg-white rounded-lg p-4">
      <div class="text-sm text-gray-600">
        Affichage {{ paginationStart + 1 }} à {{ paginationEnd }} sur {{ totalItems }} résultats
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="btn btn-icon"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="flex gap-1">
          <button 
            v-for="page in displayedPages" 
            :key="page"
            @click="goToPage(page)"
            class="btn btn-icon min-w-[2.5rem]"
            :class="{ 'bg-primary text-white': currentPage === page }"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="btn btn-icon"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Produits par page:</span>
        <select v-model="itemsPerPage" class="form-select w-20">
          <option :value="12">12</option>
          <option :value="24">24</option>
          <option :value="48">48</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

export default {
  name: 'ProductsView',
  
  setup() {
    // État
    const products = ref([
      {
        id: 1,
        name: 'Produit 1',
        price: 99.99,
        category: 'Électronique',
        brand: 'MarqueA',
        stock: 15,
        rating: 4.5,
        imageUrl: 'https://via.placeholder.com/200'
      },
      // Ajoutez d'autres produits...
    ])

    const searchQuery = ref('')
    const selectedCategories = ref([])
    const selectedBrands = ref([])
    const stockFilter = ref('all')
    const priceRange = ref([0, 1000])
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)
    const editingProduct = ref(null)
    const productToDelete = ref(null)
    const isEditing = ref(false)

    // Computed properties
    const availableCategories = computed(() => {
      return [...new Set(products.value.map(p => p.category))]
    })

    const availableBrands = computed(() => {
      return [...new Set(products.value.map(p => p.brand))]
    })

    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategories = selectedCategories.value.length === 0 || selectedCategories.value.includes(product.category)
        const matchesBrands = selectedBrands.value.length === 0 || selectedBrands.value.includes(product.brand)
        const matchesPrice = product.price >= priceRange.value[0] && product.price <= priceRange.value[1]
        
        let matchesStock = true
        if (stockFilter.value === 'in-stock') matchesStock = product.stock > 10
        if (stockFilter.value === 'low-stock') matchesStock = product.stock <= 10 && product.stock > 0
        if (stockFilter.value === 'out-of-stock') matchesStock = product.stock === 0

        return matchesSearch && matchesCategories && matchesBrands && matchesPrice && matchesStock
      })
    })

    // Pagination
    const totalItems = computed(() => filteredProducts.value.length)
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
    const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage.value)
    const paginationEnd = computed(() => Math.min(paginationStart.value + itemsPerPage.value, totalItems.value))
    const paginatedProducts = computed(() => {
      return filteredProducts.value.slice(paginationStart.value, paginationEnd.value)
    })

    // Stats
    const productsInStock = computed(() => products.value.filter(p => p.stock > 10).length)
    const lowStockProducts = computed(() => products.value.filter(p => p.stock <= 10 && p.stock > 0).length)
    const outOfStockProducts = computed(() => products.value.filter(p => p.stock === 0).length)
    const totalValue = computed(() => products.value.reduce((sum, p) => sum + (p.price * p.stock), 0))

    // Méthodes CRUD
    const openEditModal = (product = null) => {
      isEditing.value = !!product
      editingProduct.value = product ? { ...product } : {
        name: '',
        price: 0,
        category: '',
        brand: '',
        stock: 0,
        rating: 0,
        imageUrl: 'https://via.placeholder.com/200'
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingProduct.value = null
    }

    const handleSubmit = () => {
      if (isEditing.value) {
        const index = products.value.findIndex(p => p.id === editingProduct.value.id)
        if (index !== -1) {
          products.value[index] = { ...editingProduct.value }
        }
      } else {
        const newId = Math.max(...products.value.map(p => p.id)) + 1
        products.value.push({ ...editingProduct.value, id: newId })
      }
      closeEditModal()
    }

    const openDeleteModal = (product) => {
      productToDelete.value = product
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      productToDelete.value = null
    }

    const confirmDeleteProduct = () => {
      const index = products.value.findIndex(p => p.id === productToDelete.value.id)
      if (index !== -1) {
        products.value.splice(index, 1)
      }
      closeDeleteModal()
    }

    // Méthodes d'export
    const exportToPDF = () => {
      const doc = new jsPDF()
      
      // En-tête
      doc.setFontSize(20)
      doc.text('Liste des produits', 20, 20)
      
      // Colonnes
      const columns = ['Nom', 'Prix', 'Stock', 'Catégorie', 'Marque']
      let y = 40
      
      // Style du tableau
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      
      // En-tête du tableau
      columns.forEach((col, i) => {
        doc.text(col, 20 + (i * 35), y)
      })
      y += 10
      
      // Données
      filteredProducts.value.forEach(product => {
        doc.text(product.name.substring(0, 15), 20, y)
        doc.text(formatPrice(product.price), 55, y)
        doc.text(product.stock.toString(), 90, y)
        doc.text(product.category.substring(0, 15), 125, y)
        doc.text(product.brand.substring(0, 15), 160, y)
        y += 10
        
        if (y >= 280) {
          doc.addPage()
          y = 20
        }
      })
      
      doc.save('produits.pdf')
    }

    const exportToExcel = () => {
      const data = filteredProducts.value.map(product => ({
        'Nom': product.name,
        'Prix': product.price,
        'Stock': product.stock,
        'Catégorie': product.category,
        'Marque': product.brand,
        'Note': product.rating
      }))
      
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Produits')
      XLSX.writeFile(wb, 'produits.xlsx')
    }

    // Utilitaires
    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const adjustStock = (amount) => {
      if (editingProduct.value) {
        editingProduct.value.stock = Math.max(0, editingProduct.value.stock + amount)
      }
    }

    // Pagination
    const previousPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const goToPage = (page) => {
      currentPage.value = page
    }

    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages.value; i++) {
        if (i === 1 || i === totalPages.value || (i >= currentPage.value - delta && i <= currentPage.value + delta)) {
          range.push(i)
        }
      }

      range.forEach(i => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    })

    return {
      // État
      products,
      searchQuery,
      selectedCategories,
      selectedBrands,
      stockFilter,
      priceRange,
      currentPage,
      itemsPerPage,
      showEditModal,
      showDeleteModal,
      editingProduct,
      productToDelete,
      isEditing,

      // Computed
      availableCategories,
      availableBrands,
      filteredProducts,
      paginatedProducts,
      totalItems,
      totalPages,
      paginationStart,
      paginationEnd,
      displayedPages,
      productsInStock,
      lowStockProducts,
      outOfStockProducts,
      totalValue,

      // Méthodes
      openEditModal,
      closeEditModal,
      handleSubmit,
      openDeleteModal,
      closeDeleteModal,
      confirmDeleteProduct,
      exportToPDF,
      exportToExcel,
      formatPrice,
      adjustStock,
      previousPage,
      nextPage,
      goToPage
    }
  }
}
</script>

<style>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-primary-dark;
}

.btn-outline {
  @apply border border-gray-300 hover:bg-gray-50;
}

.btn-icon {
  @apply p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200;
}

.form-input,
.form-select {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary;
}

.product-card {
  @apply overflow-hidden;
}

.product-card img {
  @apply transition-transform duration-200;
}

.product-card:hover img {
  @apply transform scale-105;
}

.text-primary {
  @apply text-emerald-600;
}

.bg-primary {
  @apply bg-emerald-600;
}

.hover\:bg-primary-dark:hover {
  @apply bg-emerald-700;
}

.focus\:ring-primary:focus {
  @apply ring-emerald-600;
}

.focus\:border-primary:focus {
  @apply border-emerald-600;
}
</style>

<style scoped>
.price-slider {
  @apply space-y-4;
}

.price-slider input[type="range"] {
  @apply w-full appearance-none bg-gray-200 h-2 rounded-lg;
}

.price-slider input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 rounded-full bg-primary border-2 border-white cursor-pointer;
}

.active-filter-tag {
  @apply transition-all duration-200;
}

.active-filter-tag:hover {
  @apply bg-blue-200;
}

.saved-filter-tag {
  @apply transition-all duration-200;
}

.saved-filter-tag:hover {
  @apply bg-gray-200;
}

.loading-overlay {
  @apply transition-opacity duration-200;
}
</style>
