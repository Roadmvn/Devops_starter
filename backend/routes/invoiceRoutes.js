const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { auth, checkRole } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes accessibles à tous les utilisateurs authentifiés
router.post('/', invoiceController.createInvoice);
router.get('/my-invoices', invoiceController.getUserInvoices);

// Routes pour manager et admin
router.get('/', checkRole(['manager', 'admin']), invoiceController.getInvoices);
router.get('/:id', checkRole(['manager', 'admin']), invoiceController.getInvoice);
router.put('/:id', checkRole(['manager', 'admin']), invoiceController.updateInvoice);
router.delete('/:id', checkRole(['admin']), invoiceController.deleteInvoice);

module.exports = router;