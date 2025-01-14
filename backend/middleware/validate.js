const { validationResult } = require('express-validator');

// Middleware de validation générique
const validate = (validations) => {
    return async (req, res, next) => {
        // Exécuter toutes les validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Vérifier s'il y a des erreurs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation error',
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            });
        }

        next();
    };
};

// Middleware de validation spécifique aux factures selon le rôle
const validateInvoiceByRole = (req, res, next) => {
    const { role } = req.user;
    const { items } = req.body;

    // Validation pour utilisateur standard
    if (role === 'user') {
        // Limite le nombre d'articles différents
        if (items.length > 10) {
            return res.status(400).json({
                message: 'Users can only create invoices with up to 10 different items'
            });
        }
    }

    next();
};

// Middleware de validation des permissions de magasin
const validateStorePermission = (req, res, next) => {
    const { role, storeId } = req.user;
    const requestedStoreId = req.body.storeId || req.query.storeId;

    // Les admins peuvent accéder à tous les magasins
    if (role === 'admin') {
        return next();
    }

    // Les managers ne peuvent accéder qu'à leur magasin
    if (role === 'manager' && requestedStoreId && requestedStoreId !== storeId) {
        return res.status(403).json({
            message: 'You can only access data from your own store'
        });
    }

    next();
};

module.exports = {
    validate,
    validateInvoiceByRole,
    validateStorePermission
};
