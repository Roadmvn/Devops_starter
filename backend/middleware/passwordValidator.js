const { body } = require('express-validator');

const passwordValidationRules = () => {
    return [
        body('password')
            .isLength({ min: 8 })
            .withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/[a-z]/)
            .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
            .matches(/[A-Z]/)
            .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
            .matches(/[0-9]/)
            .withMessage('Le mot de passe doit contenir au moins un chiffre')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }
                return true;
            })
    ];
};

module.exports = {
    passwordValidationRules
};
