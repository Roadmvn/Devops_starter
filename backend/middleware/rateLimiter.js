const rateLimit = require('express-rate-limit');

// Limiteur global pour toutes les requêtes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par fenêtre
});

// Limiteur spécifique pour les tentatives de connexion
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 5, // limite chaque IP à 5 tentatives de connexion par heure
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans une heure.'
});

module.exports = {
    globalLimiter,
    authLimiter
};
