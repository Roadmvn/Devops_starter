const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { auth, checkRole } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/personal', statsController.getUserStats);

// Routes pour les managers
router.get('/store', checkRole(['manager', 'admin']), statsController.getStoreStats);

// Routes pour les admins uniquement
router.get('/global', checkRole(['admin']), statsController.getGlobalStats);

module.exports = router;
