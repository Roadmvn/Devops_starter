const { Order, Product } = require('../models');
const logger = require('../utils/logger');

// Créer une nouvelle commande
exports.createOrder = async (req, res) => {
    try {
        const { items, total, shippingAddress } = req.body;
        const userId = req.user.id;

        // Vérifier le stock de chaque produit
        for (const item of items) {
            const product = await Product.findOne({ where: { barcode: item.barcode } });
            if (!product) {
                return res.status(404).json({ error: `Produit ${item.barcode} non trouvé` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
            }
        }

        // Créer la commande
        const order = await Order.create({
            userId,
            items,
            total,
            shippingAddress,
            status: 'pending'
        });

        // Mettre à jour le stock
        for (const item of items) {
            const product = await Product.findOne({ where: { barcode: item.barcode } });
            await product.update({
                stock: product.stock - item.quantity
            });
        }

        logger.info(`Nouvelle commande créée: ${order.id}`);
        res.status(201).json(order);
    } catch (error) {
        logger.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
};

// Obtenir les commandes d'un utilisateur
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        logger.error('Erreur lors de la récupération des commandes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
    }
};

// Obtenir une commande spécifique
exports.getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({
            where: { 
                id: orderId,
                userId
            }
        });
        
        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        res.json(order);
    } catch (error) {
        logger.error('Erreur lors de la récupération de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
    }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        // Vérifier que le nouveau statut est valide
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        await order.update({ status });
        logger.info(`Statut de la commande ${orderId} mis à jour: ${status}`);
        res.json(order);
    } catch (error) {
        logger.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
};

// Annuler une commande
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({
            where: { 
                id: orderId,
                userId
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Seules les commandes en attente peuvent être annulées' });
        }

        // Remettre les produits en stock
        for (const item of order.items) {
            const product = await Product.findOne({ where: { barcode: item.barcode } });
            if (product) {
                await product.update({
                    stock: product.stock + item.quantity
                });
            }
        }

        await order.update({ status: 'cancelled' });
        logger.info(`Commande ${orderId} annulée`);
        res.json(order);
    } catch (error) {
        logger.error('Erreur lors de l\'annulation de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de l\'annulation de la commande' });
    }
};
