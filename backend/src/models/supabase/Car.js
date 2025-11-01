const { supabaseHelpers } = require('../../config/supabase');
const { v4: uuidv4 } = require('uuid');

class Car {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.sellerId = data.sellerId || data.seller_id;
    this.brand = data.brand;
    this.model = data.model;
    this.year = data.year;
    this.price = data.price;
    this.condition = data.condition;
    this.mileage = data.mileage;
    this.color = data.color;
    this.transmission = data.transmission;
    this.fuelType = data.fuelType || data.fuel_type;
    this.engineCapacity = data.engineCapacity || data.engine_capacity;
    this.description = data.description;
    this.features = data.features;
    this.location = data.location;
    this.status = data.status || 'pending';
    this.isVerified = data.isVerified || data.is_verified || false;
    this.viewCount = data.viewCount || data.view_count || 0;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Static methods untuk database operations
  static async create(carData) {
    try {
      // Set default values
      carData.id = carData.id || uuidv4();
      carData.status = carData.status || 'pending';
      carData.isVerified = carData.isVerified || false;
      carData.viewCount = carData.viewCount || 0;

      // Validate required fields
      if (!carData.sellerId) {
        throw new Error('sellerId is required');
      }
      if (!carData.brand || !carData.model) {
        throw new Error('brand and model are required');
      }
      if (!carData.year || !carData.price) {
        throw new Error('year and price are required');
      }

      // Convert camelCase to snake_case for database
      const dbData = {
        id: carData.id,
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        condition: carData.condition,
        mileage: carData.mileage,
        color: carData.color,
        transmission: carData.transmission,
        description: carData.description,
        features: carData.features,
        location: carData.location,
        status: carData.status,
        seller_id: carData.sellerId,
        fuel_type: carData.fuelType,
        engine_capacity: carData.engineCapacity,
        is_verified: carData.isVerified,
        view_count: carData.viewCount
      };

      const result = await supabaseHelpers.insert('cars', dbData);
      return result[0] ? new Car(result[0]) : null;
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const data = await supabaseHelpers.findById('cars', id);
      return data ? new Car(data) : null;
    } catch (error) {
      console.error('Error finding car by ID:', error);
      throw error;
    }
  }

  static async findBySellerId(sellerId, options = {}) {
    try {
      const data = await supabaseHelpers.select('cars', {
        where: { seller_id: sellerId },
        ...options
      });
      return data.map(car => new Car(car));
    } catch (error) {
      console.error('Error finding cars by seller ID:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const data = await supabaseHelpers.select('cars', options);
      return data.map(car => new Car(car));
    } catch (error) {
      console.error('Error finding all cars:', error);
      throw error;
    }
  }

  static async findAvailable(options = {}) {
    try {
      const data = await supabaseHelpers.select('cars', {
        where: { status: 'available', is_verified: true },
        ...options
      });
      return data.map(car => new Car(car));
    } catch (error) {
      console.error('Error finding available cars:', error);
      throw error;
    }
  }

  static async searchCars(searchParams = {}) {
    try {
      const { brand, model, minPrice, maxPrice, condition, fuelType, transmission, location } = searchParams;
      
      let whereClause = { status: 'available', is_verified: true };
      
      if (brand) whereClause.brand = brand;
      if (model) whereClause.model = model;
      if (condition) whereClause.condition = condition;
      if (fuelType) whereClause.fuel_type = fuelType;
      if (transmission) whereClause.transmission = transmission;
      if (location) whereClause.location = location;

      // Note: For price range filtering, we might need to use raw SQL or implement custom logic
      // For now, we'll get all matching records and filter in memory
      const data = await supabaseHelpers.select('cars', {
        where: whereClause,
        order: { column: 'created_at', ascending: false }
      });

      let results = data.map(car => new Car(car));

      // Filter by price range if specified
      if (minPrice !== undefined) {
        results = results.filter(car => parseFloat(car.price) >= parseFloat(minPrice));
      }
      if (maxPrice !== undefined) {
        results = results.filter(car => parseFloat(car.price) <= parseFloat(maxPrice));
      }

      return results;
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  }

  static async count(where = {}) {
    try {
      return await supabaseHelpers.count('cars', where);
    } catch (error) {
      console.error('Error counting cars:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const carData = {
        seller_id: this.sellerId,
        brand: this.brand,
        model: this.model,
        year: this.year,
        price: this.price,
        condition: this.condition,
        mileage: this.mileage,
        color: this.color,
        transmission: this.transmission,
        fuel_type: this.fuelType,
        engine_capacity: this.engineCapacity,
        description: this.description,
        features: this.features,
        location: this.location,
        status: this.status,
        is_verified: this.isVerified,
        view_count: this.viewCount
      };

      const result = await supabaseHelpers.update('cars', this.id, carData);
      if (result && result[0]) {
        Object.assign(this, new Car(result[0]));
      }
      return this;
    } catch (error) {
      console.error('Error saving car:', error);
      throw error;
    }
  }

  async delete() {
    try {
      return await supabaseHelpers.delete('cars', this.id);
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  }

  async incrementViewCount() {
    try {
      this.viewCount = (this.viewCount || 0) + 1;
      return await this.save();
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  }

  async approve() {
    try {
      this.status = 'available';
      this.isVerified = true;
      return await this.save();
    } catch (error) {
      console.error('Error approving car:', error);
      throw error;
    }
  }

  async reject() {
    try {
      this.status = 'rejected';
      this.isVerified = false;
      return await this.save();
    } catch (error) {
      console.error('Error rejecting car:', error);
      throw error;
    }
  }

  async markAsSold() {
    try {
      this.status = 'sold';
      return await this.save();
    } catch (error) {
      console.error('Error marking car as sold:', error);
      throw error;
    }
  }

  // Utility methods
  toJSON() {
    return {
      id: this.id,
      sellerId: this.sellerId,
      brand: this.brand,
      model: this.model,
      year: this.year,
      price: this.price,
      condition: this.condition,
      mileage: this.mileage,
      color: this.color,
      transmission: this.transmission,
      fuelType: this.fuelType,
      engineCapacity: this.engineCapacity,
      description: this.description,
      features: this.features,
      location: this.location,
      status: this.status,
      isVerified: this.isVerified,
      viewCount: this.viewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static validateCondition(condition) {
    const validConditions = ['new', 'used'];
    return validConditions.includes(condition);
  }

  static validateTransmission(transmission) {
    const validTransmissions = ['manual', 'automatic', 'cvt'];
    return validTransmissions.includes(transmission);
  }

  static validateFuelType(fuelType) {
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
    return validFuelTypes.includes(fuelType);
  }

  static validateStatus(status) {
    const validStatuses = ['available', 'sold', 'pending', 'rejected', 'reserved'];
    return validStatuses.includes(status);
  }
}

module.exports = Car;