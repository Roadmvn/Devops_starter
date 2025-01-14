const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// Routes publiques
router.post('/register', validateUser, userController.register);
router.post('/login', userController.login);

// Routes protégées
router.use(auth);
router.get('/profile', userController.getProfile);
router.put('/profile', validateUser, userController.updateProfile);

// Routes admin
router.get('/all', checkRole(['admin']), userController.getAllUsers);

module.exports = router;