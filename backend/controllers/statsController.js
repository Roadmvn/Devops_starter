const { Invoice, Product, User } = require('../models');
const { Op } = require('sequelize');

// Statistiques personnelles pour les utilisateurs
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Récupérer les statistiques des factures de l'utilisateur
    const userInvoices = await Invoice.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: firstDayOfMonth
        }
      }
    });

    // Calculer les statistiques
    const totalSpent = userInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const averageSpent = userInvoices.length > 0 ? totalSpent / userInvoices.length : 0;

    res.json({
      totalInvoices: userInvoices.length,
      totalSpentThisMonth: totalSpent,
      averageInvoiceAmount: averageSpent,
      lastInvoiceDate: userInvoices[0]?.createdAt
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques utilisateur:', error);
    res.status(500).json({ message: 'Error retrieving user statistics' });
  }
};

// Statistiques du magasin pour les managers
exports.getStoreStats = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Récupérer les statistiques du magasin
    const storeInvoices = await Invoice.findAll({
      where: {
        storeId,
        createdAt: {
          [Op.gte]: firstDayOfMonth
        }
      }
    });

    const storeProducts = await Product.findAll({
      where: { storeId }
    });

    // Calculer les KPIs du magasin
    const totalRevenue = storeInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const lowStockProducts = storeProducts.filter(product => product.quantity <= product.minQuantity);

    res.json({
      monthlyRevenue: totalRevenue,
      totalInvoices: storeInvoices.length,
      averageTicket: storeInvoices.length > 0 ? totalRevenue / storeInvoices.length : 0,
      productsInStock: storeProducts.length,
      lowStockProducts: lowStockProducts.length,
      topSellingProducts: await getTopSellingProducts(storeId)
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques du magasin:', error);
    res.status(500).json({ message: 'Error retrieving store statistics' });
  }
};

// Statistiques globales pour les admins
exports.getGlobalStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Récupérer toutes les statistiques
    const allInvoices = await Invoice.findAll({
      where: {
        createdAt: {
          [Op.gte]: firstDayOfMonth
        }
      }
    });

    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalRevenue = allInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    res.json({
      globalRevenue: totalRevenue,
      totalUsers,
      totalProducts,
      totalInvoices: allInvoices.length,
      averageTicket: allInvoices.length > 0 ? totalRevenue / allInvoices.length : 0,
      revenueByStore: await getRevenueByStore(),
      topPerformingStores: await getTopPerformingStores()
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques globales:', error);
    res.status(500).json({ message: 'Error retrieving global statistics' });
  }
};

// Fonctions utilitaires
async function getTopSellingProducts(storeId) {
  // Implémentation à venir
  return [];
}

async function getRevenueByStore() {
  // Implémentation à venir
  return [];
}

async function getTopPerformingStores() {
  // Implémentation à venir
  return [];
}
