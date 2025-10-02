const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  carId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Cars',
      key: 'id'
    }
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit', 'transfer', 'other'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  paymentProof: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Transaction;