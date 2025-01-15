<template>
  <div class="product-search">
    <div class="search-container">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          @input="debounceSearch"
          placeholder="Rechercher un produit..."
          class="search-input"
        />
        <input 
          v-model="barcode"
          placeholder="Scanner un code-barres..."
          @change="searchByBarcode"
          class="barcode-input"
        />
      </div>
      <div class="loading" v-if="loading">
        Chargement...
      </div>
    </div>

    <div class="results" v-if="products.length">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.image_url" :alt="product.product_name" @error="handleImageError"/>
        </div>
        <div class="product-info">
          <h3>{{ product.product_name }}</h3>
          <p class="brand">{{ product.brands }}</p>
          <div class="nutrition-info" v-if="product.nutriments">
            <h4>Informations nutritionnelles (pour 100g)</h4>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span>Calories</span>
                <span>{{ formatNutriment(product.nutriments.energy_100g) }} kcal</span>
              </div>
              <div class="nutrition-item">
                <span>Protéines</span>
                <span>{{ formatNutriment(product.nutriments.proteins_100g) }}g</span>
              </div>
              <div class="nutrition-item">
                <span>Glucides</span>
                <span>{{ formatNutriment(product.nutriments.carbohydrates_100g) }}g</span>
              </div>
              <div class="nutrition-item">
                <span>Lipides</span>
                <span>{{ formatNutriment(product.nutriments.fat_100g) }}g</span>
              </div>
            </div>
          </div>
          <button @click="addToInventory(product)" class="add-button">
            Ajouter à l'inventaire
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && searchQuery" class="no-results">
      Aucun produit trouvé
    </div>
  </div>
</template>

<script>
import OpenFoodFactsService from '@/services/openfoodfacts.service';
import { ref, onMounted } from 'vue';
import debounce from 'lodash/debounce';

export default {
  name: 'ProductSearch',
  setup() {
    const searchQuery = ref('');
    const barcode = ref('');
    const products = ref([]);
    const loading = ref(false);

    const searchProducts = async () => {
      if (searchQuery.value.length < 3) {
        products.value = [];
        return;
      }

      loading.value = true;
      try {
        const response = await OpenFoodFactsService.searchProducts(searchQuery.value);
        products.value = response.products || [];
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        // Ajouter une notification d'erreur ici
      } finally {
        loading.value = false;
      }
    };

    const debounceSearch = debounce(() => {
      searchProducts();
    }, 300);

    const searchByBarcode = async () => {
      if (!barcode.value) return;

      loading.value = true;
      try {
        const response = await OpenFoodFactsService.getProductByBarcode(barcode.value);
        products.value = response.product ? [response.product] : [];
        barcode.value = ''; // Réinitialiser le champ
      } catch (error) {
        console.error('Erreur lors de la recherche par code-barres:', error);
        // Ajouter une notification d'erreur ici
      } finally {
        loading.value = false;
      }
    };

    const handleImageError = (event) => {
      event.target.src = '/placeholder-image.png'; // Image par défaut
    };

    const formatNutriment = (value) => {
      return value ? Number(value).toFixed(2) : '0.00';
    };

    const addToInventory = (product) => {
      // Implémenter la logique d'ajout à l'inventaire
      console.log('Produit à ajouter:', product);
    };

    return {
      searchQuery,
      barcode,
      products,
      loading,
      debounceSearch,
      searchByBarcode,
      handleImageError,
      formatNutriment,
      addToInventory
    };
  }
};
</script>

<style scoped>
.product-search {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-container {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.search-input, .barcode-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  flex: 1;
}

.loading {
  text-align: center;
  color: #666;
}

.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.brand {
  color: #666;
  margin-bottom: 15px;
}

.nutrition-info {
  margin-top: 15px;
}

.nutrition-info h4 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #444;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  background: #f5f5f5;
  border-radius: 4px;
}

.add-button {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #45a049;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
