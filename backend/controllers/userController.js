const { User } = require('../models');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    logger.info('👤 Tentative d\'inscription', { 
      email,
      firstName,
      lastName,
      role,
      timestamp: new Date().toISOString()
    });

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn('❌ Email déjà enregistré', { 
        email,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user'
    });

    // Générer le token
    const token = user.generateToken();

    logger.info('✅ Inscription réussie', { 
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'inscription', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const startTime = Date.now();
  try {
    const { email, password } = req.body;
    
    logger.info('🔐 Tentative de connexion', { 
      email,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn('❌ Échec de connexion - Utilisateur non trouvé', { 
        email,
        timestamp: new Date().toISOString(),
        ip: req.ip
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      logger.warn('❌ Échec de connexion - Mot de passe invalide', { 
        email,
        userId: user.id,
        timestamp: new Date().toISOString(),
        ip: req.ip
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Générer le token
    const token = user.generateToken();

    const duration = Date.now() - startTime;
    logger.info('✅ Connexion réussie', {
      userId: user.id,
      email: user.email,
      role: user.role,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Erreur lors de la connexion', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
    res.status(500).json({ message: 'Error during login' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = req.user;
    logger.info('👋 Déconnexion utilisateur', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('❌ Erreur lors de la déconnexion', {
      error: error.message,
      userId: req?.user?.id,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
    res.status(500).json({ message: 'Error during logout' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      logger.warn('❌ Profil non trouvé', { 
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('📱 Accès au profil', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'accès au profil', {
      error: error.message,
      userId: req?.user?.id,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      logger.warn('❌ Utilisateur non trouvé pour la mise à jour', { 
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, password } = req.body;
    const updates = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(password && { password })
    };

    await user.update(updates);
    
    logger.info('✅ Profil mis à jour', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du profil', {
      error: error.message,
      userId: req?.user?.id,
      timestamp: new Date().toISOString()
    });
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      logger.warn('❌ Accès non autorisé à la liste des utilisateurs', { 
        userId: req.user.id,
        role: req.user.role,
        timestamp: new Date().toISOString()
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role']
    });
    
    logger.info('✅ Liste des utilisateurs récupérée', {
      count: users.length,
      timestamp: new Date().toISOString()
    });
    res.json(users);
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des utilisateurs', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: 'Error retrieving users' });
  }
};