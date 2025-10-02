const { sequelize } = require('../config/database');
const User = require('./User');
const Car = require('./Car');
const CarImage = require('./CarImage');
const Transaction = require('./Transaction');
const Wishlist = require('./Wishlist');
const TestDrive = require('./TestDrive');
const Review = require('./Review');
const Chat = require('./Chat');

// Define associations
// User associations
User.hasMany(Car, { foreignKey: 'sellerId', as: 'cars' });
User.hasMany(Transaction, { foreignKey: 'buyerId', as: 'purchases' });
User.hasMany(Transaction, { foreignKey: 'sellerId', as: 'sales' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' });
User.hasMany(TestDrive, { foreignKey: 'userId', as: 'testDrives' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Chat, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Chat, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Car associations
Car.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Car.hasMany(CarImage, { foreignKey: 'carId', as: 'images' });
Car.hasMany(Transaction, { foreignKey: 'carId', as: 'transactions' });
Car.hasMany(Wishlist, { foreignKey: 'carId', as: 'wishlists' });
Car.hasMany(TestDrive, { foreignKey: 'carId', as: 'testDrives' });
Car.hasMany(Review, { foreignKey: 'carId', as: 'reviews' });
Car.hasMany(Chat, { foreignKey: 'carId', as: 'chats' });

// CarImage associations
CarImage.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Transaction.belongsTo(Car, { foreignKey: 'carId', as: 'car' });
Transaction.hasMany(Review, { foreignKey: 'transactionId', as: 'reviews' });

// Wishlist associations
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

// TestDrive associations
TestDrive.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TestDrive.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Car, { foreignKey: 'carId', as: 'car' });
Review.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Chat associations
Chat.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Chat.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Chat.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

module.exports = {
  sequelize,
  User,
  Car,
  CarImage,
  Transaction,
  Wishlist,
  TestDrive,
  Review,
  Chat
};