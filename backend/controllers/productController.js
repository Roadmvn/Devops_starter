const { Product } = require('../models');
const openFoodFactsService = require('../services/openFoodFactsService');
const logger = require('../utils/logger');

// Rechercher un produit par code-barres dans OpenFoodFacts
exports.getProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;

        // Vérifier si le code-barres est fourni
        if (!barcode) {
            return res.status(400).json({
                message: 'Le code-barres est requis'
            });
        }

        // Rechercher dans OpenFoodFacts
        const product = await openFoodFactsService.getProductByBarcode(barcode);
        
        if (!product) {
            return res.status(404).json({
                message: `Produit avec code-barres ${barcode} non trouvé`
            });
        }

        res.json({
            product
        });
    } catch (error) {
        logger.error(`Erreur lors de la recherche du produit: ${error.message}`);
        res.status(500).json({
            message: 'Erreur lors de la recherche du produit',
            error: error.message
        });
    }
};

// Créer un nouveau produit
exports.createProduct = async (req, res) => {
    try {
        console.log('Données reçues:', req.body);
        const { name, brand, category, price, stock, barcode, imageUrl } = req.body;

        // Vérifications des champs requis
        if (!name || !brand || !category) {
            console.log('Champs manquants:', { name, brand, category });
            return res.status(400).json({
                message: 'Le nom, la marque et la catégorie sont requis'
            });
        }

        // Vérifier si le produit existe déjà avec le même code-barres
        if (barcode) {
            console.log('Vérification du code-barres:', barcode);
            const existingProduct = await Product.findOne({
                where: { barcode }
            });
            
            if (existingProduct) {
                console.log('Produit existant trouvé:', existingProduct.toJSON());
                return res.status(409).json({
                    message: 'Un produit avec ce code-barres existe déjà',
                    product: existingProduct
                });
            }
        }

        // Créer le nouveau produit avec Sequelize
        console.log('Tentative de création du produit avec:', {
            name,
            brand,
            category,
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            barcode: barcode || null,
            imageUrl: imageUrl || null
        });

        const product = await Product.create({
            name,
            brand,
            category,
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            barcode: barcode || null,
            imageUrl: imageUrl || null
        });

        console.log('Produit créé:', product.toJSON());

        // Récupérer le produit créé avec toutes ses associations
        const createdProduct = await Product.findByPk(product.id);

        res.status(201).json({
            message: 'Produit créé avec succès',
            product: createdProduct
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        logger.error(`Erreur lors de la création du produit: ${error.message}`);
        res.status(500).json({
            message: 'Erreur lors de la création du produit',
            error: error.message
        });
    }
};

// Importer un produit depuis OpenFoodFacts
exports.importProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.body;

        // Vérifier si le code-barres est fourni
        if (!barcode) {
            return res.status(400).json({
                message: 'Le code-barres est requis'
            });
        }

        // Vérifier si le produit existe déjà
        const existingProduct = await Product.findOne({
            where: { barcode }
        });

        if (existingProduct) {
            return res.status(400).json({
                message: 'Ce produit existe déjà dans la base de données'
            });
        }

        // Récupérer les données depuis OpenFoodFacts
        const openFoodFactsProduct = await openFoodFactsService.getProductByBarcode(barcode);

        if (!openFoodFactsProduct) {
            return res.status(404).json({
                message: 'Produit non trouvé dans OpenFoodFacts'
            });
        }

        // Créer le produit dans la base de données
        const product = await Product.create({
            name: openFoodFactsProduct.product_name,
            brand: openFoodFactsProduct.brands,
            barcode: barcode,
            imageUrl: openFoodFactsProduct.image_url,
            imageSmallUrl: openFoodFactsProduct.image_small_url,
            category: openFoodFactsProduct.categories_tags?.[0] || 'Non catégorisé',
            stock: 0,
            price: 0
        });

        res.status(201).json({
            message: 'Produit importé avec succès',
            product
        });
    } catch (error) {
        logger.error(`Erreur lors de l'importation du produit: ${error.message}`);
        res.status(500).json({
            message: "Erreur lors de l'importation du produit",
            error: error.message
        });
    }
};

// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']] // Les plus récents en premier
        });

        // Renvoyer directement le tableau de produits
        res.json(products);
    } catch (error) {
        logger.error(`Erreur lors de la récupération des produits: ${error.message}`);
        res.status(500).json({
            message: 'Erreur lors de la récupération des produits',
            error: error.message
        });
    }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            brand,
            category,
            barcode,
            imageUrl,
            price,
            stock
        } = req.body;

        // Vérifier si le produit existe
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                message: 'Produit non trouvé'
            });
        }

        console.log('Données reçues pour mise à jour:', req.body);

        // Préparer les données de mise à jour
        const updateData = {
            name,
            brand,
            category,
            barcode,
            imageUrl,
            price: Number(price) || product.price, // Garder l'ancienne valeur si la nouvelle est invalide
            stock: Number(stock) || product.stock  // Garder l'ancienne valeur si la nouvelle est invalide
        };

        console.log('Données formatées pour mise à jour:', updateData);

        // Mettre à jour le produit
        await product.update(updateData);

        // Récupérer le produit mis à jour
        const updatedProduct = await Product.findByPk(id);

        console.log('Produit mis à jour:', updatedProduct.toJSON());

        res.json({
            message: 'Produit mis à jour avec succès',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        logger.error(`Erreur lors de la mise à jour du produit: ${error.message}`);
        res.status(500).json({
            message: 'Erreur lors de la mise à jour du produit',
            error: error.message
        });
    }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si le produit existe
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                message: 'Produit non trouvé'
            });
        }

        // Supprimer le produit
        await product.destroy();

        res.json({
            message: 'Produit supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        logger.error(`Erreur lors de la suppression du produit: ${error.message}`);
        res.status(500).json({
            message: 'Erreur lors de la suppression du produit',
            error: error.message
        });
    }
};