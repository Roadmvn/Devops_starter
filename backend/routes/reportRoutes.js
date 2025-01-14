const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, checkRole } = require('../middleware/auth');

// Routes protégées pour les managers et admins
router.use(auth);
router.use(checkRole(['manager', 'admin']));

router.get('/sales', reportController.getSalesReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/financial', reportController.getFinancialReport);

module.exports = router;