require('dotenv').config();

module.exports = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
        expiresIn: '15m' // 15 minutes
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: '7d' // 7 days
    },
    emailVerification: {
        secret: process.env.JWT_EMAIL_VERIFICATION_SECRET || 'your-email-verification-secret',
        expiresIn: '24h' // 24 hours
    },
    passwordReset: {
        secret: process.env.JWT_PASSWORD_RESET_SECRET || 'your-password-reset-secret',
        expiresIn: '1h' // 1 hour
    }
};