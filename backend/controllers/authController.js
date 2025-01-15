const { validationResult } = require('express-validator');
const User = require('../models/User');
const tokenService = require('../services/tokenService');
const mailService = require('../services/mailService');
const loginLogService = require('../services/loginLogService');

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Créer l'utilisateur
        const user = await User.create({
            email,
            password,
            firstName,
            lastName
        });

        // Générer le token de vérification
        const verificationToken = tokenService.generateEmailVerificationToken(user);
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        // Envoyer l'email de vérification
        await mailService.sendVerificationEmail(email, verificationLink);
        
        // Générer les tokens d'authentification
        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);

        // Sauvegarder le refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: 'Inscription réussie. Veuillez vérifier votre email.',
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get('user-agent');

        const user = await User.findOne({ where: { email } });
        if (!user) {
            await loginLogService.logLogin(null, ipAddress, userAgent, 'failed', 'User not found');
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            await loginLogService.logLogin(user.id, ipAddress, userAgent, 'failed', 'Invalid password');
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier si le compte est vérifié
        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                message: 'Veuillez vérifier votre email avant de vous connecter',
                isEmailVerified: false
            });
        }

        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // Log successful login
        await loginLogService.logLogin(user.id, ipAddress, userAgent, 'success');

        res.json({ 
            accessToken, 
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token manquant' });
        }

        const decoded = tokenService.verifyToken(refreshToken, 'refresh');
        if (!decoded) {
            return res.status(401).json({ message: 'Refresh token invalide' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Refresh token invalide' });
        }

        const newAccessToken = tokenService.generateAccessToken(user);
        const newRefreshToken = tokenService.generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du rafraîchissement du token' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = tokenService.verifyToken(token, 'emailVerification');
        
        if (!decoded) {
            return res.status(400).json({ message: 'Token de vérification invalide ou expiré' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email déjà vérifié' });
        }

        user.isEmailVerified = true;
        await user.save();

        // Envoyer l'email de bienvenue
        await mailService.sendWelcomeEmail(user.email, user.firstName);

        res.json({ message: 'Email vérifié avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la vérification de l\'email' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const resetToken = tokenService.generatePasswordResetToken(user);
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await mailService.sendPasswordResetEmail(email, resetLink);

        res.json({ message: 'Instructions de réinitialisation envoyées par email' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const decoded = tokenService.verifyToken(token, 'passwordReset');
        if (!decoded) {
            return res.status(400).json({ message: 'Token de réinitialisation invalide ou expiré' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.password = password;
        user.refreshToken = null; // Déconnecter l'utilisateur de tous les appareils
        await user.save();

        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
};

exports.googleCallback = async (req, res) => {
    try {
        const accessToken = tokenService.generateAccessToken(req.user);
        const refreshToken = tokenService.generateRefreshToken(req.user);

        req.user.refreshToken = refreshToken;
        await req.user.save();

        // Rediriger vers le frontend avec les tokens
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'authentification Google' });
    }
};

exports.logout = async (req, res) => {
    try {
        const user = req.user;
        user.refreshToken = null;
        await user.save();

        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = req.user;

        user.firstName = firstName;
        user.lastName = lastName;
        await user.save();

        res.json({ 
            message: 'Profil mis à jour avec succès',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    }
};