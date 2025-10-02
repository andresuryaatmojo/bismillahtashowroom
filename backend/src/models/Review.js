const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
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
  carId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Cars',
      key: 'id'
    }
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Transactions',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  moderationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Review;