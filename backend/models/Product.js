const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Product = db.sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    barcode: {
        type: DataTypes.STRING,
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true
    },
    imageSmallUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        get() {
            const value = this.getDataValue('price');
            return value === null ? 0 : Number(value);
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        get() {
            const value = this.getDataValue('stock');
            return value === null ? 0 : Number(value);
        }
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeSave: (product) => {
            // S'assurer que price et stock sont des nombres
            if (product.price) product.price = Number(product.price);
            if (product.stock) product.stock = Number(product.stock);
        }
    }
});

module.exports = Product;