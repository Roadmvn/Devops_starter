const express = require('express');
const router = express.Router();

// Importer les routes
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const reportRoutes = require('./reportRoutes');
const statsRoutes = require('./statsRoutes');
const orderRoutes = require('./orderRoutes');

// Monter les routes
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);
router.use('/stats', statsRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
