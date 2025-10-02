const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const TestDrive = sequelize.define('TestDrive', {
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
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
});

module.exports = TestDrive;