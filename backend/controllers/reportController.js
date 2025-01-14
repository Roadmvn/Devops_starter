const { Invoice, Product, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/reports/sales
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Vérifier les dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Les dates de début et de fin sont requises'
      });
    }

    // Construire la requête de base
    const where = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },
      status: ['paid', 'completed']
    };

    // Grouper par période
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    // Récupérer les ventes groupées
    const sales = await Invoice.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('AVG', sequelize.col('total')), 'average']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)]
    });

    // Récupérer les produits les plus vendus
    const topProducts = await Product.findAll({
      include: [{
        model: Invoice,
        where,
        attributes: [],
        through: {
          attributes: ['quantity']
        }
      }],
      attributes: [
        'id',
        'name',
        [sequelize.fn('SUM', sequelize.col('Invoices.InvoiceProducts.quantity')), 'totalQuantity'],
        [sequelize.fn('COUNT', sequelize.col('Invoices.id')), 'totalOrders']
      ],
      group: ['Product.id'],
      having: sequelize.literal('totalQuantity > 0'),
      order: [[sequelize.literal('totalQuantity'), 'DESC']],
      limit: 10
    });

    // Récupérer les meilleurs clients
    const topCustomers = await User.findAll({
      include: [{
        model: Invoice,
        where,
        attributes: []
      }],
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        [sequelize.fn('COUNT', sequelize.col('Invoices.id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('Invoices.total')), 'totalSpent']
      ],
      group: ['User.id'],
      having: sequelize.literal('totalOrders > 0'),
      order: [[sequelize.literal('totalSpent'), 'DESC']],
      limit: 10
    });

    res.json({
      period: {
        start: startDate,
        end: endDate,
        groupBy
      },
      sales: {
        byPeriod: sales,
        total: sales.reduce((sum, s) => sum + parseFloat(s.get('total') || 0), 0),
        count: sales.reduce((sum, s) => sum + parseInt(s.get('count') || 0), 0),
        average: sales.reduce((sum, s) => sum + parseFloat(s.get('average') || 0), 0) / sales.length
      },
      topProducts,
      topCustomers
    });
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport des ventes' });
  }
};

// GET /api/reports/inventory
exports.getInventoryReport = async (req, res) => {
  try {
    // Récupérer tous les produits avec leur statut de stock
    const products = await Product.findAll({
      attributes: [
        'id',
        'name',
        'sku',
        'category',
        'stock',
        'minStockLevel',
        'maxStockLevel',
        'price',
        'inStock'
      ],
      order: [['stock', 'ASC']]
    });

    // Calculer les statistiques
    const stats = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      outOfStock: products.filter(p => !p.inStock).length,
      lowStock: products.filter(p => p.stock <= p.minStockLevel).length,
      overStock: products.filter(p => p.stock >= p.maxStockLevel).length,
      categories: {}
    };

    // Grouper par catégorie
    products.forEach(product => {
      if (!stats.categories[product.category]) {
        stats.categories[product.category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0,
          outOfStock: 0,
          lowStock: 0,
          overStock: 0
        };
      }

      const cat = stats.categories[product.category];
      cat.count++;
      cat.totalStock += product.stock;
      cat.totalValue += product.price * product.stock;
      if (!product.inStock) cat.outOfStock++;
      if (product.stock <= product.minStockLevel) cat.lowStock++;
      if (product.stock >= product.maxStockLevel) cat.overStock++;
    });

    res.json({
      stats,
      products: products.map(p => ({
        ...p.toJSON(),
        stockStatus: !p.inStock ? 'out_of_stock' :
          p.stock <= p.minStockLevel ? 'low_stock' :
          p.stock >= p.maxStockLevel ? 'over_stock' : 'normal',
        value: p.price * p.stock
      }))
    });
  } catch (error) {
    console.error('Error in getInventoryReport:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport d\'inventaire' });
  }
};

// GET /api/reports/financial
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Vérifier les dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Les dates de début et de fin sont requises'
      });
    }

    // Construire la requête de base
    const where = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    // Grouper par période
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }

    // Récupérer les données financières
    const revenue = await Invoice.findAll({
      where: {
        ...where,
        status: ['paid', 'completed']
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('SUM', sequelize.col('tax')), 'tax'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'discount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)]
    });

    // Calculer les totaux
    const totals = {
      revenue: revenue.reduce((sum, r) => sum + parseFloat(r.get('total') || 0), 0),
      tax: revenue.reduce((sum, r) => sum + parseFloat(r.get('tax') || 0), 0),
      discount: revenue.reduce((sum, r) => sum + parseFloat(r.get('discount') || 0), 0),
      orders: revenue.reduce((sum, r) => sum + parseInt(r.get('count') || 0), 0)
    };

    // Récupérer les statistiques de paiement
    const paymentStats = await Invoice.findAll({
      where,
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['paymentStatus']
    });

    res.json({
      period: {
        start: startDate,
        end: endDate,
        groupBy
      },
      revenue: {
        byPeriod: revenue,
        totals
      },
      paymentStats: paymentStats.reduce((acc, stat) => {
        acc[stat.paymentStatus] = {
          count: parseInt(stat.get('count') || 0),
          total: parseFloat(stat.get('total') || 0)
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error in getFinancialReport:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport financier' });
  }
};