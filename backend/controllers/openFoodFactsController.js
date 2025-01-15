const { Product } = require('../models');
const openFoodFactsService = require('../services/openFoodFacts');

// Rechercher des produits dans OpenFoodFacts
exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const products = await openFoodFactsService.searchProducts(query);
        res.json(products);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching products' });
    }
};

// Importer un produit depuis OpenFoodFacts
exports.importProduct = async (req, res) => {
    try {
        const { barcode } = req.params;
        const { price = 0, stock = 0 } = req.body;

        // Vérifier si le produit existe déjà
        let product = await Product.findOne({ where: { barcode } });

        if (product) {
            // Si le produit existe, mettre à jour le stock
            await product.update({ stock: product.stock + stock });
            return res.json(product);
        }

        // Récupérer les informations du produit depuis OpenFoodFacts
        const productInfo = await openFoodFactsService.getProductByBarcode(barcode);

        // Créer le produit dans notre base
        product = await Product.create({
            name: productInfo.name,
            barcode: productInfo.barcode,
            brand: productInfo.brand,
            imageUrl: productInfo.imageUrl,
            price: price,
            stock: stock,
            sku: `SKU-${barcode}`,
            inStock: stock > 0
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: 'Error importing product' });
    }
};

// Mettre à jour le stock d'un produit
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.update({ 
            stock,
            inStock: stock > 0
        });

        res.json(product);
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ message: 'Error updating stock' });
    }
};
