const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateJWT, checkEmailVerified } = require('../middleware/auth');
const passport = require('passport');

// Validation des entrées
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
];

// Routes d'authentification locale
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateJWT, authController.logout);

// Vérification d'email
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authenticateJWT, authController.resendVerificationEmail);

// Réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Routes Google OAuth
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: false 
    }),
    authController.googleCallback
);

// Profil utilisateur
router.get('/profile', 
    authenticateJWT,
    checkEmailVerified,
    authController.getProfile
);

router.put('/profile',
    authenticateJWT,
    checkEmailVerified,
    authController.updateProfile
);

module.exports = router;