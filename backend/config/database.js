const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'supermarket_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'root';
const dbHost = process.env.DB_HOST || 'database';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Fonction pour initialiser la base de données
const initializeDatabase = async () => {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Synchroniser les modèles avec la base de données (alter: true pour mettre à jour les tables sans les recréer)
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  initializeDatabase
};