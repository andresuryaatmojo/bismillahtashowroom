const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  condition: {
    type: DataTypes.ENUM('new', 'used'),
    allowNull: false
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transmission: {
    type: DataTypes.ENUM('manual', 'automatic', 'cvt'),
    allowNull: false
  },
  fuelType: {
    type: DataTypes.ENUM('gasoline', 'diesel', 'electric', 'hybrid'),
    allowNull: false
  },
  engineCapacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'sold', 'pending', 'rejected'),
    defaultValue: 'pending'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Car;