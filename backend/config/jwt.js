require('dotenv').config();

module.exports = {
    accessToken: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: '7d'
    },
    emailVerification: {
        secret: process.env.JWT_EMAIL_SECRET || 'your-email-secret-key',
        expiresIn: '24h'
    }
};