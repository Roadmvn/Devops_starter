const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route pour récupérer tous les produits
router.get('/', productController.getAllProducts);

// Route pour rechercher un produit par code-barres
router.get('/barcode/:barcode', productController.getProductByBarcode);

// Route pour importer un produit par code-barres
router.post('/import/barcode', productController.importProductByBarcode);

// Route pour créer un produit
router.post('/', productController.createProduct);

// Route pour mettre à jour un produit
router.put('/:id', productController.updateProduct);

// Route pour supprimer un produit
router.delete('/:id', productController.deleteProduct);

module.exports = router;