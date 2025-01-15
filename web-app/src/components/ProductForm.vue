<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Colonne gauche -->
      <div class="space-y-6">
        <div>
          <label for="barcode" class="block text-sm font-medium text-gray-700">Code-barres</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="barcode"
              v-model="formData.barcode"
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Entrez un code-barres..."
            />
            <button
              type="button"
              @click="fetchOpenFoodFacts"
              :disabled="!formData.barcode || loading"
              class="relative inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
              <span v-else>
                Récupérer les infos
              </span>
            </button>
          </div>
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nom du produit</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="brand" class="block text-sm font-medium text-gray-700">Marque</label>
          <input
            type="text"
            id="brand"
            v-model="formData.brand"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            id="category"
            v-model="formData.category"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Sélectionner une catégorie</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="space-y-6">
        <!-- Image du produit -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <label class="block text-sm font-medium text-gray-700 mb-2">Image du produit</label>
          <div class="relative w-full h-48 bg-white rounded-md border-2 border-dashed border-gray-300 flex justify-center items-center">
            <div v-if="formData.imageUrl" class="relative w-full h-full">
              <img 
                :src="formData.imageUrl" 
                :alt="formData.name"
                class="w-full h-full object-contain rounded-md"
                @error="handleImageError"
              />
              <button 
                type="button" 
                @click="formData.imageUrl = null"
                class="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200 focus:outline-none"
              >
                <svg class="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-else class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-1 text-sm text-gray-500">
                Utilisez le code-barres pour récupérer l'image
              </p>
            </div>
          </div>
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Prix</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              type="number"
              id="price"
              v-model="formData.price"
              required
              min="0"
              step="0.01"
              class="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="stock" class="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            id="stock"
            v-model="formData.stock"
            required
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ formData.id ? 'Mettre à jour' : 'Créer' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: () => ({
      name: '',
      brand: '',
      category: '',
      price: 0,
      stock: 0,
      barcode: '',
      imageUrl: null
    })
  }
})

const emit = defineEmits(['submit', 'cancel'])

const categories = [
  'Alimentaire',
  'Boissons',
  'Hygiène',
  'Entretien',
  'Surgelés'
]

const loading = ref(false)
const formData = ref({
  name: '',
  brand: '',
  category: '',
  price: 0,
  stock: 0,
  barcode: '',
  imageUrl: null
})

// Initialiser le formulaire avec les données du produit
const initForm = () => {
  if (props.product) {
    formData.value = { 
      ...props.product,
      price: Number(props.product.price),
      stock: Number(props.product.stock)
    }
  }
}

// Initialiser au montage
onMounted(() => {
  initForm()
})

// Réagir aux changements de props.product
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    initForm()
  }
}, { deep: true })

const fetchOpenFoodFacts = async () => {
  if (!formData.value.barcode) return

  loading.value = true
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${formData.value.barcode}.json`)
    const data = await response.json()
    
    if (data.status === 1) {
      const product = data.product
      formData.value = {
        ...formData.value,
        name: product.product_name || formData.value.name,
        brand: product.brands || formData.value.brand,
        category: mapCategory(product.categories_tags?.[0]) || formData.value.category,
        imageUrl: product.image_url || product.image_front_url || null
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)
  } finally {
    loading.value = false
  }
}

const mapCategory = (category) => {
  if (!category) return ''
  
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('boisson')) return 'Boissons'
  if (categoryLower.includes('hygiene')) return 'Hygiène'
  if (categoryLower.includes('entretien')) return 'Entretien'
  if (categoryLower.includes('surgel')) return 'Surgelés'
  return 'Alimentaire'
}

const handleSubmit = async () => {
  try {
    console.log('Données envoyées:', formData.value);
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    });

    console.log('Status de la réponse:', response.status);
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erreur détaillée:', result);
      // Si le produit existe déjà, on l'émet quand même pour l'afficher
      if (response.status === 409 && result.product) {
        emit('submit', result.product);
      }
      throw new Error(result.message || 'Erreur lors de la création du produit');
    }

    console.log('Résultat:', result);
    emit('submit', result.product);
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    alert(error.message || 'Erreur lors de la création du produit');
  }
}

const handleImageError = () => {
  formData.value.imageUrl = null
}
</script>
