<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Produits</h1>
        <div class="space-x-4">
          <button 
            v-if="isManagerOrAdmin"
            @click="openNewProductModal"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ajouter un Produit
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification de produit -->
    <ProductForm
      v-if="showProductModal"
      :product="selectedProduct"
      @submit="handleSubmit"
      @cancel="closeProductModal"
    />

    <!-- Recherche OpenFoodFacts (intégrée dans le modal) -->
    <OpenFoodFactsSearch 
      v-if="showOpenFoodFacts"
      @product-imported="handleProductImported"
      @success="showSuccess"
      @error="showError"
      @close="showOpenFoodFacts = false"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="py-4 space-y-4">
        <!-- Filtres avancés -->
        <AdvancedFilters
          :categories="categories"
          @filter="handleFilter"
          @export="handleExport"
        />

        <!-- Liste des produits -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in filteredProducts" :key="product.id" 
               class="bg-white rounded-lg shadow overflow-hidden product-card">
            <img 
              :src="product.imageUrl || '/placeholder-product.png'" 
              :alt="product.name"
              class="w-full h-48 object-cover"
            />
            <div class="p-4 product-info">
              <h3 class="text-xl font-semibold">{{ product.name }}</h3>
              <p class="text-gray-600 brand">{{ product.brand }}</p>
              <p class="text-gray-600 category">{{ product.category }}</p>
              <div class="details">
                <span class="price">Prix: {{ formatPrice(product.price) }} €</span>
                <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
                  Stock: {{ product.stock }} unités
                </span>
              </div>
            </div>
            <div class="product-actions">
              <button 
                v-if="isManagerOrAdmin"
                @click="handleEdit(product)"
                class="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 btn btn-edit"
              >
                Modifier
              </button>
              <button 
                v-if="isManagerOrAdmin"
                @click="updateStock(product)"
                class="bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 btn btn-stock"
              >
                Stock
              </button>
              <button 
                v-if="isAdmin"
                @click="handleDelete(product)"
                class="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 btn btn-delete"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon } from '@heroicons/vue/outline'
import AdvancedFilters from '../components/AdvancedFilters.vue'
import ProductTable from '../components/ProductTable.vue'
import ProductForm from '../components/ProductForm.vue'
import TablePagination from '../components/TablePagination.vue'
import OpenFoodFactsSearch from '../components/OpenFoodFactsSearch.vue'
import { useNotificationStore } from '../stores/notifications'
import exportService from '../services/exportService'
import axios from 'axios'

const notificationStore = useNotificationStore()

// État
const products = ref([])
const loading = ref(true)
const showProductModal = ref(false)
const selectedProduct = ref(null)
const currentPage = ref(1)
const perPage = ref(10)
const filters = ref({})
const showOpenFoodFacts = ref(false)

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

const isManagerOrAdmin = computed(() => {
  const role = 'manager' // TODO: get role from store
  return role === 'manager' || role === 'admin'
})

const isAdmin = computed(() => 'admin' === 'admin') // TODO: get role from store

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
  selectedProduct.value = null;
  showProductModal.value = true;
  showOpenFoodFacts.value = false;
};

const handleOpenFoodFactsSearch = () => {
  showOpenFoodFacts.value = true;
  showProductModal.value = false;
};

const handleProductImported = (product) => {
  products.value.unshift(product);
  showOpenFoodFacts.value = false;
  notificationStore.success('Produit importé avec succès');
};

const closeProductModal = () => {
  showProductModal.value = false;
  showOpenFoodFacts.value = false;
  selectedProduct.value = null;
};

const handleEdit = (product) => {
  // Créer une copie profonde du produit avec les valeurs numériques correctement formatées
  selectedProduct.value = {
    ...product,
    price: Number(product.price),
    stock: Number(product.stock)
  };
  showProductModal.value = true;
};

const handleSubmit = async (productData) => {
  try {
    if (selectedProduct.value) {
      // Mise à jour d'un produit existant
      const updatedData = {
        id: selectedProduct.value.id,
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        barcode: productData.barcode,
        imageUrl: productData.imageUrl,
        price: Number(productData.price),
        stock: Number(productData.stock)
      };

      console.log('Données envoyées pour mise à jour:', updatedData);
      
      const response = await axios.put(`/api/products/${selectedProduct.value.id}`, updatedData);
      
      if (response.data && response.data.product) {
        const index = products.value.findIndex(p => p.id === selectedProduct.value.id);
        if (index !== -1) {
          products.value[index] = response.data.product;
          notificationStore.success('Produit mis à jour avec succès');
        }
      }
      showProductModal.value = false;
    } else {
      // Création d'un nouveau produit
      const newProduct = {
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        barcode: productData.barcode,
        imageUrl: productData.imageUrl,
        price: Number(productData.price),
        stock: Number(productData.stock)
      };

      console.log('Données envoyées pour création:', newProduct);

      try {
        const response = await axios.post('/api/products', newProduct);
        
        if (response.data && response.data.product) {
          // Vérifier si le produit n'existe pas déjà dans la liste
          const existingIndex = products.value.findIndex(p => p.id === response.data.product.id);
          if (existingIndex === -1) {
            products.value.unshift(response.data.product);
          }
          notificationStore.success('Produit créé avec succès');
          showProductModal.value = false;
        }
      } catch (error) {
        if (error.response && error.response.status === 409 && error.response.data.product) {
          // Le produit existe déjà
          const existingProduct = error.response.data.product;
          const existingIndex = products.value.findIndex(p => p.id === existingProduct.id);
          
          if (existingIndex === -1) {
            // Si le produit n'est pas dans la liste, l'ajouter
            products.value.unshift(existingProduct);
          } else {
            // Si le produit est déjà dans la liste, le mettre à jour
            products.value[existingIndex] = existingProduct;
          }
          
          notificationStore.info('Ce produit existe déjà dans la base de données');
          showProductModal.value = false;
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
    notificationStore.error(`Erreur lors de l'enregistrement : ${error.response?.data?.message || error.message}`);
  }
};

const handleDelete = async (product) => {
  try {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteProduct(product.id);
      products.value = products.value.filter(p => p.id !== product.id);
      notificationStore.success('Produit supprimé avec succès');
    }
  } catch (error) {
    notificationStore.error(`Erreur lors de la suppression : ${error.response?.data?.message || error.message}`);
  }
};

const deleteProduct = async (id) => {
  try {
    await axios.delete(`/api/products/${id}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    throw error;
  }
};

const formatPrice = (price) => {
  return Number(price).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const showSuccess = (message) => {
  // Implémenter la notification de succès
}

const showError = (message) => {
  // Implémenter la notification d'erreur
}

const updateProduct = async (product) => {
  try {
    const response = await axios.put(`/api/products/${product.id}`, product);
    if (response.data && response.data.product) {
      const index = products.value.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products.value[index] = response.data.product;
      }
      notificationStore.success('Produit mis à jour avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    notificationStore.error(`Erreur lors de la mise à jour : ${error.message}`);
  }
};

// Chargement initial des données
onMounted(async () => {
  try {
    loading.value = true
    const response = await fetchProducts()
    products.value = response || []
  } catch (error) {
    console.error('Erreur:', error)
    notificationStore.error(`Erreur lors du chargement des produits : ${error.message}`)
    products.value = [] // Initialiser avec un tableau vide en cas d'erreur
  } finally {
    loading.value = false
  }
})

// Fonctions API simulées
const fetchProducts = async () => {
  try {
    const response = await axios.get('/api/products')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    throw error
  }
}

const createProduct = async (product) => {
  try {
    const response = await axios.post('/api/products', product);
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Erreur lors de la création du produit');
    }
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
};
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-info {
  margin-bottom: 1rem;
}

.details {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.price {
  font-weight: bold;
  color: #2c3e50;
}

.stock {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #e8f5e9;
  color: #2e7d32;
}

.low-stock {
  background: #ffebee;
  color: #c62828;
}

.brand {
  color: #666;
  font-style: italic;
}

.category {
  color: #666;
  font-size: 0.9em;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-edit {
  background: #1976d2;
  color: white;
}

.btn-stock {
  background: #388e3c;
  color: white;
}

.btn-delete {
  background: #d32f2f;
  color: white;
}
</style>
