const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoginLog = sequelize.define('LoginLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

const logLogin = async (userId, ipAddress, userAgent, status, reason = null) => {
    try {
        await LoginLog.create({
            userId,
            ipAddress,
            userAgent,
            status,
            reason
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du log de connexion:', error);
    }
};

const getRecentFailedAttempts = async (ipAddress, minutes = 60) => {
    const failedAttempts = await LoginLog.count({
        where: {
            ipAddress,
            status: 'failed',
            createdAt: {
                [Op.gte]: new Date(Date.now() - minutes * 60000)
            }
        }
    });
    return failedAttempts;
};

module.exports = {
    LoginLog,
    logLogin,
    getRecentFailedAttempts
};
