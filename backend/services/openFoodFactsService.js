const axios = require('axios');
const logger = require('../utils/logger');

class OpenFoodFactsService {
    constructor() {
        this.baseURL = 'https://world.openfoodfacts.org/api/v0';
    }

    // Récupère un produit par son code-barres depuis OpenFoodFacts
    async getProductByBarcode(barcode) {
        try {
            logger.info(`Recherche du produit avec le code-barres: ${barcode}`);
            
            if (!barcode) {
                logger.warn('Code-barres manquant');
                throw new Error('Le code-barres est requis');
            }

            const response = await axios.get(`${this.baseURL}/product/${barcode}.json`);
            logger.info(`Réponse reçue pour le code-barres ${barcode}`);
            
            const { status, product } = response.data;
            
            if (!product || status === 0) {
                logger.warn(`Produit avec code-barres ${barcode} non trouvé dans OpenFoodFacts`);
                return null;
            }

            // Retourne uniquement les informations essentielles du produit
            const formattedProduct = {
                barcode: product.code || barcode,
                name: product.product_name || product.product_name_fr || 'Produit inconnu',
                brand: product.brands || 'Marque inconnue',
                imageUrl: product.image_url || product.image_front_url || null,
                description: product.ingredients_text || product.ingredients_text_fr || '',
                categories: product.categories || '',
                quantity: product.quantity || '',
                labels: product.labels || ''
            };

            logger.info(`Produit trouvé: ${formattedProduct.name}`);
            return formattedProduct;

        } catch (error) {
            logger.error(`Erreur lors de la recherche du produit ${barcode}: ${error.message}`);
            throw new Error(`Erreur lors de la recherche du produit: ${error.message}`);
        }
    }
}

module.exports = new OpenFoodFactsService();
