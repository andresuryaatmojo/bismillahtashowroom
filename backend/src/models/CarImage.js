const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const CarImage = sequelize.define('CarImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  carId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Cars',
      key: 'id'
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  caption: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = CarImage;