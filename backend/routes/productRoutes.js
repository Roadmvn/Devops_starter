const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route pour lister tous les produits
router.get('/', productController.getAllProducts);

// Route pour rechercher un produit par code-barres
router.get('/barcode/:barcode', productController.getProductByBarcode);

// Route pour importer un produit par code-barres
router.post('/import/:barcode', productController.importProductByBarcode);

module.exports = router;