const Car = require('../models/supabase/Car');
const User = require('../models/supabase/User');

class CarController {
  // Get all cars with pagination and filters
  static async getAllCars(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        brand,
        model,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        transmission,
        fuelType,
        status = 'available',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      };

      const filters = {};
      if (brand) filters.brand = brand;
      if (model) filters.model = model;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      if (minYear) filters.minYear = parseInt(minYear);
      if (maxYear) filters.maxYear = parseInt(maxYear);
      if (transmission) filters.transmission = transmission;
      if (fuelType) filters.fuelType = fuelType;
      if (status) filters.status = status;

      const cars = await Car.findAll(options, filters);
      const totalCars = await Car.count(filters);

      res.json({
        success: true,
        data: {
          cars,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCars / parseInt(limit)),
            totalItems: totalCars,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all cars error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get car by ID
  static async getCarById(req, res) {
    try {
      const { id } = req.params;
      const car = await Car.findById(id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Mobil tidak ditemukan'
        });
      }

      // Increment view count
      await car.incrementViewCount();

      res.json({
        success: true,
        data: car
      });

    } catch (error) {
      console.error('Get car error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new car
  static async createCar(req, res) {
    try {
      const {
        brand,
        model,
        year,
        price,
        mileage,
        transmission,
        fuelType,
        description,
        images,
        location
      } = req.body;

      // Validate required fields
      if (!brand || !model || !year || !price) {
        return res.status(400).json({
          success: false,
          message: 'Brand, model, tahun, dan harga wajib diisi'
        });
      }

      const carData = {
        brand,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        mileage: mileage ? parseInt(mileage) : null,
        transmission: transmission || null,
        fuelType: fuelType || null,
        description: description || null,
        images: images || [],
        location: location || null,
        sellerId: req.user.userId,
        status: 'available',
        isApproved: false,
        viewCount: 0
      };

      const newCar = await Car.create(carData);

      res.status(201).json({
        success: true,
        message: 'Mobil berhasil ditambahkan',
        data: newCar
      });

    } catch (error) {
      console.error('Create car error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update car
  static async updateCar(req, res) {
    try {
      const { id } = req.params;
      const car = await Car.findById(id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Mobil tidak ditemukan'
        });
      }

      // Check if user owns the car
      if (car.sellerId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk mengubah mobil ini'
        });
      }

      const {
        brand,
        model,
        year,
        price,
        mileage,
        transmission,
        fuelType,
        description,
        images,
        location,
        status
      } = req.body;

      // Update car properties
      if (brand) car.brand = brand;
      if (model) car.model = model;
      if (year) car.year = parseInt(year);
      if (price) car.price = parseFloat(price);
      if (mileage !== undefined) car.mileage = mileage ? parseInt(mileage) : null;
      if (transmission !== undefined) car.transmission = transmission;
      if (fuelType !== undefined) car.fuelType = fuelType;
      if (description !== undefined) car.description = description;
      if (images !== undefined) car.images = images;
      if (location !== undefined) car.location = location;
      if (status) car.status = status;

      await car.save();

      res.json({
        success: true,
        message: 'Mobil berhasil diperbarui',
        data: car
      });

    } catch (error) {
      console.error('Update car error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memperbarui mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete car
  static async deleteCar(req, res) {
    try {
      const { id } = req.params;
      const car = await Car.findById(id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Mobil tidak ditemukan'
        });
      }

      // Check if user owns the car
      if (car.sellerId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk menghapus mobil ini'
        });
      }

      await car.delete();

      res.json({
        success: true,
        message: 'Mobil berhasil dihapus'
      });

    } catch (error) {
      console.error('Delete car error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get cars by seller
  static async getCarsBySeller(req, res) {
    try {
      const { sellerId } = req.params;
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      };

      const filters = { seller_id: sellerId };
      if (status) filters.status = status;

      const cars = await Car.findBySellerId(sellerId, options, filters);
      const totalCars = await Car.count(filters);

      res.json({
        success: true,
        data: {
          cars,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCars / parseInt(limit)),
            totalItems: totalCars,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get cars by seller error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mobil penjual',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search cars
  static async searchCars(req, res) {
    try {
      const { q: query } = req.query;
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query pencarian diperlukan'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      };

      const cars = await Car.search(query, options);
      const totalCars = cars.length; // Simple count for search results

      res.json({
        success: true,
        data: {
          cars,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCars / parseInt(limit)),
            totalItems: totalCars,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Search cars error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mencari mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Approve car (admin only)
  static async approveCar(req, res) {
    try {
      const { id } = req.params;
      const car = await Car.findById(id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Mobil tidak ditemukan'
        });
      }

      await car.approve();

      res.json({
        success: true,
        message: 'Mobil berhasil disetujui',
        data: car
      });

    } catch (error) {
      console.error('Approve car error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyetujui mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get car statistics
  static async getCarStats(req, res) {
    try {
      const totalCars = await Car.count();
      const availableCars = await Car.count({ status: 'available' });
      const soldCars = await Car.count({ status: 'sold' });
      const pendingCars = await Car.count({ status: 'pending' });
      const approvedCars = await Car.count({ is_approved: true });

      const stats = {
        totalCars,
        availableCars,
        soldCars,
        pendingCars,
        approvedCars
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get car stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik mobil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = CarController;