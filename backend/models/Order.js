const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Order = db.sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    tableName: 'orders',
    timestamps: true
});

module.exports = Order;