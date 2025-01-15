import axios from 'axios';

const OFF_API_URL = 'https://world.openfoodfacts.org/api/v2';

class OpenFoodFactsService {
  // Recherche par code-barres
  async getProductByBarcode(barcode) {
    try {
      console.log('🔍 Recherche du produit par code-barres:', barcode);
      const response = await axios.get(`${OFF_API_URL}/product/${barcode}`);
      console.log('✅ Produit trouvé:', response.data.product.product_name);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche par code-barres:', error);
      throw error;
    }
  }

  // Recherche par nom
  async searchProducts(query) {
    try {
      console.log('🔍 Recherche de produits:', query);
      const response = await axios.get(`${OFF_API_URL}/search`, {
        params: {
          search_terms: query,
          page_size: 10,
          json: true
        }
      });
      console.log('✅ Produits trouvés:', response.data.products.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  }

  // Récupérer les informations nutritionnelles
  async getNutritionInfo(barcode) {
    try {
      console.log('🔍 Récupération des informations nutritionnelles:', barcode);
      const response = await this.getProductByBarcode(barcode);
      console.log('✅ Informations nutritionnelles récupérées');
      return response.product.nutriments;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des informations nutritionnelles:', error);
      throw error;
    }
  }

  // Récupérer les catégories de produits
  async getCategories() {
    try {
      console.log('🔍 Récupération des catégories');
      const response = await axios.get(`${OFF_API_URL}/categories`);
      console.log('✅ Catégories récupérées:', response.data.count);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }
}

export default new OpenFoodFactsService();
