const { Invoice, Product, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC',
      status,
      startDate,
      endDate,
      userId
    } = req.query;

    // Construire les conditions de recherche
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Récupérer les factures
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      invoices,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    console.error('Error in getInvoices:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
};

// GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Product,
          through: {
            attributes: ['quantity', 'price']
          }
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error in getInvoice:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture' });
  }
};

// POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const { items, ...invoiceData } = req.body;

    // Vérifier la disponibilité des produits et calculer le total
    let subtotal = 0;
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds }
    });

    // Vérifier que tous les produits existent et sont en stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          message: `Produit non trouvé: ${item.productId}`
        });
      }
      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour le produit: ${product.name}`
        });
      }
      subtotal += product.price * item.quantity;
    }

    // Créer la facture
    const invoice = await Invoice.create({
      ...invoiceData,
      subtotal,
      total: subtotal + (invoiceData.tax || 0) - (invoiceData.discount || 0)
    });

    // Ajouter les produits à la facture et mettre à jour les stocks
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      await invoice.addProduct(product, {
        through: {
          quantity: item.quantity,
          price: product.price
        }
      });
      
      // Mettre à jour le stock
      await product.update({
        stock: product.stock - item.quantity,
        inStock: (product.stock - item.quantity) > 0
      });
    }

    // Récupérer la facture complète avec les relations
    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Product,
          through: {
            attributes: ['quantity', 'price']
          }
        }
      ]
    });

    res.status(201).json(completeInvoice);
  } catch (error) {
    console.error('Error in createInvoice:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la création de la facture' });
  }
};

// PUT /api/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Ne permettre que la mise à jour de certains champs
    const allowedUpdates = ['status', 'paymentStatus', 'paymentDate', 'notes'];
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await invoice.update(updates);
    
    // Récupérer la facture mise à jour avec les relations
    const updatedInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Product,
          through: {
            attributes: ['quantity', 'price']
          }
        }
      ]
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error in updateInvoice:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture' });
  }
};

// DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Vérifier si la facture peut être supprimée
    if (['paid', 'completed'].includes(invoice.status)) {
      return res.status(400).json({
        message: 'Impossible de supprimer une facture payée ou complétée'
      });
    }

    await invoice.destroy();
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la facture' });
  }
};

// GET /api/invoices/my-invoices
exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const invoices = await Invoice.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// GET /api/invoices/stats
exports.getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const totalInvoices = await Invoice.count({ where });
    const totalAmount = await Invoice.sum('total', { where });
    const statusCounts = await Invoice.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    const paymentStatusCounts = await Invoice.findAll({
      where,
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('paymentStatus')), 'count']
      ],
      group: ['paymentStatus']
    });

    res.json({
      totalInvoices,
      totalAmount,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr.get('count');
        return acc;
      }, {}),
      paymentStatusCounts: paymentStatusCounts.reduce((acc, curr) => {
        acc[curr.paymentStatus] = curr.get('count');
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error in getInvoiceStats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};