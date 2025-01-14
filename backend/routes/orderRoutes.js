const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, checkRole } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

// Routes protégées par authentification
router.use(auth);

// Créer une nouvelle commande
router.post('/', validateOrder, orderController.createOrder);

// Obtenir toutes les commandes de l'utilisateur
router.get('/user', orderController.getUserOrders);

// Obtenir une commande spécifique
router.get('/:orderId', orderController.getOrder);

// Mettre à jour le statut d'une commande (admin/manager uniquement)
router.patch('/:orderId/status', 
    checkRole(['admin', 'manager']),
    orderController.updateOrderStatus
);

// Annuler une commande
router.post('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
