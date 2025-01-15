const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Invoice = db.sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'paid', 'cancelled', 'refunded'),
    defaultValue: 'draft'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  paranoid: true,
  hooks: {
    beforeValidate: (invoice) => {
      // Générer le numéro de facture si non défini
      if (!invoice.invoiceNumber) {
        const prefix = 'INV';
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        invoice.invoiceNumber = `${prefix}-${timestamp}-${random}`;
      }
      
      // Calculer le total
      invoice.total = parseFloat(invoice.subtotal) + 
                     parseFloat(invoice.tax) - 
                     parseFloat(invoice.discount);
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['invoiceNumber']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentStatus']
    }
  ]
});

module.exports = Invoice;