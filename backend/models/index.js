const db = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Invoice = require('./Invoice');
const Order = require('./Order');

// Définir les relations entre les modèles
Invoice.belongsTo(User, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
User.hasMany(Invoice, { 
    foreignKey: 'userId'
});

Order.belongsTo(User, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
User.hasMany(Order, { 
    foreignKey: 'userId'
});

// Créer la table de jointure pour Invoice-Product
const InvoiceProduct = db.sequelize.define('InvoiceProduct', {
    quantity: {
        type: db.Sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price: {
        type: db.Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'invoice_products',
    timestamps: true,
    underscored: true
});

Invoice.belongsToMany(Product, { 
    through: InvoiceProduct,
    foreignKey: 'invoiceId'
});
Product.belongsToMany(Invoice, { 
    through: InvoiceProduct,
    foreignKey: 'productId'
});

module.exports = {
    sequelize: db.sequelize,
    User,
    Product,
    Invoice,
    Order,
    InvoiceProduct
};
