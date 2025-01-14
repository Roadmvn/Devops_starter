const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const { User } = require('./models');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Sécurité
app.use(helmet());

// Configuration CORS plus permissive en développement
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// Logging
app.use((req, res, next) => {
  if (!req.path.includes('/api/users/login') && !req.path.includes('/api/users/logout')) {
    morgan('combined', { stream: logger.stream })(req, res, next);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error'
      : err.message
  });
});

// Initialisation de la base de données et démarrage du serveur
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('✅ Base de données synchronisée avec succès.');

    // Créer l'utilisateur admin par défaut s'il n'existe pas
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      await User.create({
        firstName: 'Admin',
        lastName: 'System',
        email: adminEmail,
        password: 'admin123', // À changer en production !
        role: 'admin'
      });
      logger.info('✅ Utilisateur admin créé avec succès.');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;