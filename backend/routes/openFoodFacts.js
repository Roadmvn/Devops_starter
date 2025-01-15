const express = require('express');
const router = express.Router();
const openFoodFactsController = require('../controllers/openFoodFactsController');
const { auth, checkRole } = require('../middleware/auth');

// Routes publiques
router.get('/search', openFoodFactsController.searchProducts);

// Routes protégées (nécessitent une authentification)
router.use(auth);

// Routes pour managers et admins
router.post('/import/:barcode', 
    checkRole(['manager', 'admin']), 
    openFoodFactsController.importProduct
);

module.exports = router;
