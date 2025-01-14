const tokenService = require('../services/tokenService');
const User = require('../models/User');

exports.authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = tokenService.verifyToken(token, 'access');
        
        if (!decoded) {
            return res.status(401).json({ message: 'Token invalide' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Non autorisé' });
    }
};

exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        next();
    };
};

exports.checkEmailVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({ 
            message: 'Email non vérifié. Veuillez vérifier votre email avant de continuer.' 
        });
    }
    next();
};