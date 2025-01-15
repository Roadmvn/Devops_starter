const { body, param, query } = require('express-validator');

// Règles de validation pour les produits
const productRules = {
    create: [
        body('name').trim().notEmpty().withMessage('Le nom du produit est requis'),
        body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
        body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un nombre entier positif'),
        body('barcode').optional().isString().withMessage('Le code-barres doit être une chaîne de caractères'),
        body('category').optional().isString().withMessage('La catégorie doit être une chaîne de caractères'),
        body('storeId').optional().isInt().withMessage('L\'ID du magasin doit être un nombre entier')
    ],
    update: [
        param('id').isInt().withMessage('L\'ID du produit doit être un nombre entier'),
        body('name').optional().trim().notEmpty().withMessage('Le nom du produit ne peut pas être vide'),
        body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
        body('quantity').optional().isInt({ min: 0 }).withMessage('La quantité doit être un nombre entier positif')
    ],
    updateStock: [
        param('id').isInt().withMessage('L\'ID du produit doit être un nombre entier'),
        body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un nombre entier positif')
    ]
};

// Règles de validation pour les factures
const invoiceRules = {
    create: [
        body('items').isArray().withMessage('Les articles sont requis'),
        body('items.*.productId').isInt().withMessage('L\'ID du produit doit être un nombre entier'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('La quantité doit être supérieure à 0'),
        body('storeId').optional().isInt().withMessage('L\'ID du magasin doit être un nombre entier')
    ],
    update: [
        param('id').isInt().withMessage('L\'ID de la facture doit être un nombre entier'),
        body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Statut invalide')
    ]
};

// Règles de validation pour les utilisateurs
const userRules = {
    create: [
        body('email').isEmail().withMessage('Email invalide'),
        body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
        body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
        body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
        body('role').optional().isIn(['user', 'manager', 'admin']).withMessage('Rôle invalide')
    ],
    update: [
        body('email').optional().isEmail().withMessage('Email invalide'),
        body('password').optional().isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
        body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
        body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide')
    ]
};

// Règles de validation pour les rapports
const reportRules = {
    generate: [
        query('startDate').optional().isDate().withMessage('Date de début invalide'),
        query('endDate').optional().isDate().withMessage('Date de fin invalide'),
        query('type').optional().isIn(['sales', 'inventory', 'financial']).withMessage('Type de rapport invalide')
    ]
};

// Règles de validation pour les commandes
const orderRules = {
    create: [
        body('items').isArray().notEmpty().withMessage('Les items sont requis'),
        body('items.*.id').isUUID().withMessage('ID de produit invalide'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantité invalide'),
        body('total').isFloat({ min: 0 }).withMessage('Total invalide'),
        body('shippingAddress').optional().isObject().withMessage('Adresse de livraison invalide'),
        body('shippingAddress.street').optional().isString().withMessage('Rue invalide'),
        body('shippingAddress.city').optional().isString().withMessage('Ville invalide'),
        body('shippingAddress.postalCode').optional().isString().withMessage('Code postal invalide'),
        body('shippingAddress.country').optional().isString().withMessage('Pays invalide')
    ]
};

module.exports = {
    productRules,
    invoiceRules,
    userRules,
    reportRules,
    orderRules
};
