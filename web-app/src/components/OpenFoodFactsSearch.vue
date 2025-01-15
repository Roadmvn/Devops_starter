<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Recherche OpenFoodFacts</h2>
    
    <!-- Barre de recherche -->
    <div class="flex gap-2 mb-4">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Entrez un code-barres..."
        class="flex-1 p-2 border rounded"
        @keyup.enter="searchProducts"
      />
      <button 
        @click="searchProducts"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Recherche...</span>
        <span v-else>Rechercher</span>
      </button>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="text-red-500 mb-4">
      {{ error }}
    </div>

    <!-- Résultat de la recherche -->
    <div v-if="product" class="border p-4 rounded flex items-center gap-4">
      <div class="relative w-24 h-24">
        <img 
          :src="product.imageUrl" 
          :alt="product.name"
          class="w-full h-full object-contain rounded"
          @error="handleImageError"
        />
        <div v-if="!product.imageUrl" class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span class="text-gray-400">Pas d'image</span>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="font-semibold">{{ product.name }}</h3>
        <p class="text-gray-600">{{ product.brand }}</p>
        <p class="text-sm text-gray-500">Code-barres: {{ product.barcode }}</p>
        <p v-if="product.categories" class="text-sm text-gray-500">Catégories: {{ product.categories }}</p>
        <p v-if="product.quantity" class="text-sm text-gray-500">Quantité: {{ product.quantity }}</p>
      </div>
      <button 
        @click="importProduct"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        :disabled="importing"
      >
        <span v-if="importing">Import...</span>
        <span v-else>Importer</span>
      </button>
    </div>

    <!-- Message si aucun résultat -->
    <div v-else-if="hasSearched" class="text-center py-4 text-gray-600">
      Aucun produit trouvé
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OpenFoodFactsSearch',
  
  data() {
    return {
      searchQuery: '',
      product: null,
      isLoading: false,
      importing: false,
      hasSearched: false,
      error: null,
      defaultImage: '/placeholder-product.png'
    };
  },

  methods: {
    async searchProducts() {
      if (!this.searchQuery.trim()) {
        this.error = 'Veuillez entrer un code-barres';
        return;
      }

      this.isLoading = true;
      this.hasSearched = true;
      this.error = null;
      this.product = null;

      try {
        const barcode = this.searchQuery.trim();
        const response = await axios.get(`/api/products/barcode/${barcode}`);
        
        if (response.data && response.data.product) {
          this.product = response.data.product;
          
          // Précharger l'image
          if (this.product.imageUrl) {
            const img = new Image();
            img.src = this.product.imageUrl;
            img.onerror = () => this.handleImageError();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la recherche du produit';
      } finally {
        this.isLoading = false;
      }
    },

    async importProduct() {
      this.importing = true;
      this.error = null;

      try {
        const response = await axios.post('/api/products/import/barcode', {
          barcode: this.product.barcode,
          stock: 0
        });

        this.$emit('product-imported', response.data.product);
        this.$emit('success', 'Produit importé avec succès');
        this.product = null;
        this.searchQuery = '';
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        this.error = error.response?.data?.message || 'Erreur lors de l\'import du produit';
      } finally {
        this.importing = false;
      }
    },

    handleImageError(e) {
      if (e && e.target) {
        e.target.src = this.defaultImage;
      }
    }
  }
};
</script>
