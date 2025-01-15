const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

class TokenService {
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            jwtConfig.accessToken.secret,
            { expiresIn: jwtConfig.accessToken.expiresIn }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            { id: user.id },
            jwtConfig.refreshToken.secret,
            { expiresIn: jwtConfig.refreshToken.expiresIn }
        );
    }

    generateEmailVerificationToken(user) {
        return jwt.sign(
            { id: user.id },
            jwtConfig.emailVerification.secret,
            { expiresIn: jwtConfig.emailVerification.expiresIn }
        );
    }

    generatePasswordResetToken(user) {
        return jwt.sign(
            { id: user.id },
            jwtConfig.passwordReset.secret,
            { expiresIn: jwtConfig.passwordReset.expiresIn }
        );
    }

    verifyToken(token, type = 'access') {
        const secret = jwtConfig[type + 'Token'].secret;
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }
}

module.exports = new TokenService();