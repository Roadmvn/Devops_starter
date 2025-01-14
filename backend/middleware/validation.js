const { body, validationResult } = require('express-validator');

// Middleware de validation générique
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    };
};

// Validation des commandes
exports.validateOrder = validate([
    body('items')
        .isArray()
        .withMessage('Items doit être un tableau')
        .notEmpty()
        .withMessage('Le panier ne peut pas être vide'),
    
    body('items.*.barcode')
        .notEmpty()
        .withMessage('Chaque produit doit avoir un code-barres'),
    
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('La quantité doit être un nombre entier positif'),
    
    body('total')
        .isFloat({ min: 0 })
        .withMessage('Le total doit être un nombre positif'),
    
    body('shippingAddress')
        .notEmpty()
        .withMessage('L\'adresse de livraison est requise')
]);

// Validation des produits
exports.validateProduct = validate([
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ max: 100 })
        .withMessage('Le nom ne doit pas dépasser 100 caractères'),
    
    body('barcode')
        .trim()
        .notEmpty()
        .withMessage('Le code-barres est requis')
        .isLength({ max: 50 })
        .withMessage('Le code-barres ne doit pas dépasser 50 caractères'),
    
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Le stock doit être un nombre entier positif')
]);

// Validation des utilisateurs
exports.validateUser = validate([
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name must not exceed 50 characters'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name must not exceed 50 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
]);

// Validation des factures
exports.validateInvoice = validate([
    body('userId')
        .notEmpty()
        .withMessage('User ID is required'),

    body('items')
        .isArray()
        .withMessage('Items must be an array')
        .notEmpty()
        .withMessage('At least one item is required'),

    body('items.*.productId')
        .notEmpty()
        .withMessage('Product ID is required for each item'),

    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer')
]);