// comparisonService.ts
// Service untuk mengelola data perbandingan mobil langsung dari Supabase
import { carService, CarWithRelations } from './carService';
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================
export interface CarForComparison {
  id: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  image: string;
  specifications: {
    engine: string;
    transmission: string;
    fuelType: string;
    fuelConsumption: string;
    power: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    seatingCapacity: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      wheelbase: number;
    };
    weight: number;
    groundClearance: number;
    fuelTankCapacity: number;
  };
  features: {
    safety: string[];
    comfort: string[];
    technology: string[];
    exterior: string[];
    interior: string[];
  };
  rating: {
    overall: number;
    safety: number;
    comfort: number;
    performance: number;
    fuelEconomy: number;
    valueForMoney: number;
  };
  pros: string[];
  cons: string[];
  availability: {
    inStock: boolean;
    estimatedDelivery: string;
    dealerCount: number;
  };
}

export interface ComparisonResult {
  cars: CarForComparison[];
  winner: {
    overall: string;
    categories: {
      price: string;
      performance: string;
      fuelEconomy: string;
      safety: string;
      comfort: string;
      features: string;
    };
  };
  comparison: {
    [key: string]: {
      car1: any;
      car2: any;
      advantage: 'car1' | 'car2' | 'equal';
    };
  };
  recommendation: string;
  score: {
    car1: number;
    car2: number;
  };
}

export interface ComparisonFilters {
  brand_ids?: number[];
  model_ids?: number[];
  category_ids?: number[];
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  transmission?: string[];
  fuel_type?: string[];
}

// ==================== COMPARISON SERVICE ====================
class ComparisonService {
  /**
   * Convert CarWithRelations to CarForComparison format
   */
  private convertToComparisonFormat(car: CarWithRelations): CarForComparison {
    // Get primary image or first image
    const primaryImage = Array.isArray(car.car_images) && car.car_images.length > 0
      ? car.car_images.find(img => img.is_primary) || car.car_images[0]
      : null;

    // Extract specifications from car_specifications or use defaults
    // Note: car_specifications might not exist in the current query, so we'll use basic car data
    const specs = null;

    return {
      id: car.id,
      name: `${car.car_brands?.name || ''} ${car.car_models?.name || ''} ${car.year}`,
      brand: car.car_brands?.name || '',
      model: car.car_models?.name || '',
      variant: '', // Could be extracted from title if needed
      year: car.year,
      price: car.price,
      image: primaryImage?.image_url || car.car_images?.[0]?.image_url || '/placeholder-car.jpg',
      specifications: {
        engine: car.engine_capacity ? `${car.engine_capacity}cc` : 'N/A',
        transmission: car.transmission || 'N/A',
        fuelType: car.fuel_type || 'N/A',
        fuelConsumption: 'N/A',
        power: 'N/A',
        torque: 'N/A',
        acceleration: 'N/A',
        topSpeed: 'N/A',
        seatingCapacity: 5, // Default value since seat_capacity is not in the Car interface
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          wheelbase: 0
        },
        weight: 0,
        groundClearance: 0,
        fuelTankCapacity: 0
      },
      features: {
        safety: [],
        comfort: [],
        technology: [],
        exterior: [],
        interior: []
      },
      rating: {
        overall: car.average_rating || 0,
        safety: this.generateRating('safety', car),
        comfort: this.generateRating('comfort', car),
        performance: this.generateRating('performance', car),
        fuelEconomy: this.generateRating('fuelEconomy', car),
        valueForMoney: this.generateRating('valueForMoney', car)
      },
      pros: this.generatePros(car),
      cons: this.generateCons(car),
      availability: {
        inStock: car.status === 'available',
        estimatedDelivery: '1-2 weeks',
        dealerCount: 1 // Could be calculated based on location
      }
    };
  }

  /**
   * Extract features from comma-separated string or array
   */
  private extractFeatures(features: string | any): string[] {
    if (typeof features === 'string') {
      return features.split(',').map(f => f.trim()).filter(f => f.length > 0);
    }
    if (Array.isArray(features)) {
      return features;
    }
    return [];
  }

  /**
   * Generate rating for different aspects
   */
  private generateRating(aspect: string, car: CarWithRelations): number {
    // Generate ratings based on car specifications and real data
    const baseRating = car.average_rating || 3.0;

    switch (aspect) {
      case 'safety':
        // Safety rating based on year, brand reputation, and features
        const safetyScore = Math.min(5.0, baseRating + (car.year >= 2020 ? 0.5 : 0) + (car.car_brands?.name === 'Toyota' ? 0.3 : 0));
        return Math.round(safetyScore * 10) / 10;

      case 'comfort':
        // Comfort based on category and features
        const comfortScore = Math.min(5.0, baseRating + (car.car_categories?.name === 'SUV' ? 0.2 : 0));
        return Math.round(comfortScore * 10) / 10;

      case 'performance':
        // Performance based on engine capacity and fuel type
        const performanceScore = Math.min(5.0, baseRating + (car.engine_capacity > 2000 ? 0.3 : 0) + (car.fuel_type === 'hybrid' ? 0.2 : 0));
        return Math.round(performanceScore * 10) / 10;

      case 'fuelEconomy':
        // Fuel economy rating based on fuel type and consumption
        const fuelScore = car.fuel_type === 'hybrid' ? 4.5 :
                        car.fuel_type === 'electric' ? 5.0 :
                        car.fuel_type === 'diesel' ? 3.5 : 3.0;
        return Math.round(fuelScore * 10) / 10;

      case 'valueForMoney':
        // Value based on price and features
        const valueScore = Math.max(2.0, Math.min(5.0, baseRating + (car.price < 500000000 ? 0.5 : -0.2)));
        return Math.round(valueScore * 10) / 10;

      default:
        return baseRating;
    }
  }

  /**
   * Generate pros based on car features
   */
  private generatePros(car: CarWithRelations): string[] {
    const pros: string[] = [];

    if (car.year >= 2020) pros.push('Model terbaru');
    if (car.fuel_type === 'hybrid' || car.fuel_type === 'electric') pros.push('Ramah lingkungan');
    if (car.transmission === 'automatic' || car.transmission === 'cvt') pros.push('Transmisi otomatis nyaman');
    if (car.car_brands?.name === 'Toyota') pros.push('Merek terpercaya');
    if (car.car_categories?.name === 'SUV') pros.push('Kapasitas besar dan tangguh');
    if (car.average_rating >= 4.0) pros.push('Rating tinggi dari pengguna');
    if (car.price < 300000000) pros.push('Harga terjangkau');

    return pros;
  }

  /**
   * Generate cons based on car limitations
   */
  private generateCons(car: CarWithRelations): string[] {
    const cons: string[] = [];

    if (car.year < 2018) cons.push('Model sudah cukup lama');
    if (car.fuel_type === 'gasoline' && car.engine_capacity > 2000) cons.push('Konsumsi BBM lebih boros');
    if (car.transmission === 'manual') cons.push('Transmisi manual kurang nyaman di perkotaan');
    if (car.mileage > 50000) cons.push('Kilometer sudah tinggi');
    if (car.price > 800000000) cons.push('Harga mahal');
    if (car.average_rating < 3.5) cons.push('Rating pengguna rendah');

    return cons;
  }

  /**
   * Get estimated delivery time
   */
  private getEstimatedDelivery(car: CarWithRelations): string {
    if (car.computed_availability === 'available') {
      return '1-2 weeks';
    } else if (car.computed_availability === 'processing') {
      return '2-3 weeks';
    }
    return '3-4 weeks';
  }

  /**
   * Get available cars for comparison
   */
  async getAvailableCars(filters?: ComparisonFilters, limit: number = 50): Promise<CarForComparison[]> {
    try {
      const carFilters = {
        search: filters?.brand_ids?.length ? undefined : undefined,
        brand_ids: filters?.brand_ids,
        model_ids: filters?.model_ids,
        category_ids: filters?.category_ids,
        min_price: filters?.min_price,
        max_price: filters?.max_price,
        min_year: filters?.min_year,
        max_year: filters?.max_year,
        transmission: filters?.transmission,
        fuel_type: filters?.fuel_type,
        seller_type: undefined // Show all seller types
      };

      const carsResponse = await carService.getCars(carFilters, { limit, sort_by: 'popular' });

      return carsResponse.data.map(car => this.convertToComparisonFormat(car));
    } catch (error) {
      console.error('Error fetching available cars:', error);
      return [];
    }
  }

  /**
   * Get car by ID for comparison
   */
  async getCarById(carId: string): Promise<CarForComparison | null> {
    try {
      const car = await carService.getCarById(carId);
      if (!car) return null;

      return this.convertToComparisonFormat(car);
    } catch (error) {
      console.error('Error fetching car by ID:', error);
      return null;
    }
  }

  /**
   * Perform detailed comparison between two cars
   */
  async compareCars(car1Id: string, car2Id: string): Promise<ComparisonResult | null> {
    try {
      // Get both cars
      const [car1, car2] = await Promise.all([
        this.getCarById(car1Id),
        this.getCarById(car2Id)
      ]);

      if (!car1 || !car2) {
        throw new Error('One or both cars not found');
      }

      // Calculate comparison scores
      const scores = this.calculateComparisonScores(car1, car2);

      // Determine winners for each category
      const winners = this.determineWinners(car1, car2, scores);

      // Generate detailed comparison
      const detailedComparison = this.generateDetailedComparison(car1, car2);

      // Generate recommendation
      const recommendation = this.generateRecommendation(car1, car2, scores);

      return {
        cars: [car1, car2],
        winner: {
          overall: scores.car1 > scores.car2 ? car1.id : car2.id,
          categories: winners
        },
        comparison: detailedComparison,
        recommendation,
        score: scores
      };
    } catch (error) {
      console.error('Error comparing cars:', error);
      return null;
    }
  }

  /**
   * Calculate comparison scores for both cars
   */
  private calculateComparisonScores(car1: CarForComparison, car2: CarForComparison): { car1: number; car2: number } {
    // Weight factors for different aspects
    const weights = {
      price: 0.25,        // 25% weight
      performance: 0.20,  // 20% weight
      fuelEconomy: 0.15,  // 15% weight
      safety: 0.15,       // 15% weight
      comfort: 0.15,      // 15% weight
      features: 0.10      // 10% weight
    };

    // Calculate normalized scores for each aspect (0-100)
    const priceScore1 = this.calculatePriceScore(car1, car2);
    const priceScore2 = 100 - priceScore1;

    const performanceScore1 = this.calculatePerformanceScore(car1, car2);
    const performanceScore2 = 100 - performanceScore1;

    const fuelEconomyScore1 = this.calculateFuelEconomyScore(car1, car2);
    const fuelEconomyScore2 = 100 - fuelEconomyScore1;

    const safetyScore1 = (car1.rating.safety / 5) * 100;
    const safetyScore2 = (car2.rating.safety / 5) * 100;

    const comfortScore1 = (car1.rating.comfort / 5) * 100;
    const comfortScore2 = (car2.rating.comfort / 5) * 100;

    const featuresScore1 = this.calculateFeaturesScore(car1, car2);
    const featuresScore2 = 100 - featuresScore1;

    // Calculate weighted total scores
    const totalScore1 =
      priceScore1 * weights.price +
      performanceScore1 * weights.performance +
      fuelEconomyScore1 * weights.fuelEconomy +
      safetyScore1 * weights.safety +
      comfortScore1 * weights.comfort +
      featuresScore1 * weights.features;

    const totalScore2 =
      priceScore2 * weights.price +
      performanceScore2 * weights.performance +
      fuelEconomyScore2 * weights.fuelEconomy +
      safetyScore2 * weights.safety +
      comfortScore2 * weights.comfort +
      featuresScore2 * weights.features;

    return {
      car1: Math.round(totalScore1),
      car2: Math.round(totalScore2)
    };
  }

  /**
   * Calculate price score (lower price = higher score)
   */
  private calculatePriceScore(car1: CarForComparison, car2: CarForComparison): number {
    const minPrice = Math.min(car1.price, car2.price);
    const maxPrice = Math.max(car1.price, car2.price);

    if (maxPrice === minPrice) return 50; // Equal prices

    // Lower price gets higher score
    if (car1.price < car2.price) {
      return Math.round(((maxPrice - car1.price) / (maxPrice - minPrice)) * 100);
    } else {
      return Math.round(((maxPrice - car1.price) / (maxPrice - minPrice)) * 100);
    }
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(car1: CarForComparison, car2: CarForComparison): number {
    // Factors: engine capacity, power, acceleration
    const score1 =
      (car1.specifications.engine.length > 0 ? 30 : 0) +
      (car1.specifications.power !== 'N/A' ? 35 : 0) +
      (car1.specifications.acceleration !== 'N/A' ? 35 : 0);

    const score2 =
      (car2.specifications.engine.length > 0 ? 30 : 0) +
      (car2.specifications.power !== 'N/A' ? 35 : 0) +
      (car2.specifications.acceleration !== 'N/A' ? 35 : 0);

    if (score1 === score2) return 50;

    return Math.round((score1 / (score1 + score2)) * 100);
  }

  /**
   * Calculate fuel economy score
   */
  private calculateFuelEconomyScore(car1: CarForComparison, car2: CarForComparison): number {
    // Electric > Hybrid > Diesel > Gasoline
    const fuelTypeScore: { [key: string]: number } = {
      'electric': 100,
      'hybrid': 80,
      'diesel': 60,
      'gasoline': 40,
      'phev': 90
    };

    const score1 = fuelTypeScore[car1.specifications.fuelType] || 40;
    const score2 = fuelTypeScore[car2.specifications.fuelType] || 40;

    if (score1 === score2) return 50;

    return Math.round((score1 / (score1 + score2)) * 100);
  }

  /**
   * Calculate features score based on number of features
   */
  private calculateFeaturesScore(car1: CarForComparison, car2: CarForComparison): number {
    const features1Count =
      car1.features.safety.length +
      car1.features.comfort.length +
      car1.features.technology.length +
      car1.features.exterior.length +
      car1.features.interior.length;

    const features2Count =
      car2.features.safety.length +
      car2.features.comfort.length +
      car2.features.technology.length +
      car2.features.exterior.length +
      car2.features.interior.length;

    if (features1Count === features2Count) return 50;

    return Math.round((features1Count / (features1Count + features2Count)) * 100);
  }

  /**
   * Determine winners for each category
   */
  private determineWinners(car1: CarForComparison, car2: CarForComparison, scores: { car1: number; car2: number }): {
    price: string;
    performance: string;
    fuelEconomy: string;
    safety: string;
    comfort: string;
    features: string;
  } {
    return {
      price: car1.price < car2.price ? car1.id : car2.id,
      performance: this.calculatePerformanceScore(car1, car2) > 50 ? car1.id : car2.id,
      fuelEconomy: this.calculateFuelEconomyScore(car1, car2) > 50 ? car1.id : car2.id,
      safety: car1.rating.safety > car2.rating.safety ? car1.id : car2.id,
      comfort: car1.rating.comfort > car2.rating.comfort ? car1.id : car2.id,
      features: this.calculateFeaturesScore(car1, car2) > 50 ? car1.id : car2.id
    };
  }

  /**
   * Generate detailed comparison data
   */
  private generateDetailedComparison(car1: CarForComparison, car2: CarForComparison): {
    [key: string]: {
      car1: any;
      car2: any;
      advantage: 'car1' | 'car2' | 'equal';
    };
  } {
    const comparison: any = {};

    // Price comparison
    comparison.price = {
      car1: car1.price,
      car2: car2.price,
      advantage: car1.price < car2.price ? 'car1' : car1.price > car2.price ? 'car2' : 'equal'
    };

    // Year comparison
    comparison.year = {
      car1: car1.year,
      car2: car2.year,
      advantage: car1.year > car2.year ? 'car1' : car1.year < car2.year ? 'car2' : 'equal'
    };

    // Engine comparison
    comparison.engine = {
      car1: car1.specifications.engine,
      car2: car2.specifications.engine,
      advantage: 'equal' // Subjective comparison
    };

    // Transmission comparison
    comparison.transmission = {
      car1: car1.specifications.transmission,
      car2: car2.specifications.transmission,
      advantage: 'equal' // Subjective preference
    };

    // Fuel type comparison
    comparison.fuelType = {
      car1: car1.specifications.fuelType,
      car2: car2.specifications.fuelType,
      advantage: this.calculateFuelEconomyScore(car1, car2) > 50 ? 'car1' : 'car2'
    };

    // Seating capacity comparison
    comparison.seatingCapacity = {
      car1: car1.specifications.seatingCapacity,
      car2: car2.specifications.seatingCapacity,
      advantage: car1.specifications.seatingCapacity > car2.specifications.seatingCapacity ? 'car1' :
                  car1.specifications.seatingCapacity < car2.specifications.seatingCapacity ? 'car2' : 'equal'
    };

    // Ratings comparison
    comparison.overallRating = {
      car1: car1.rating.overall,
      car2: car2.rating.overall,
      advantage: car1.rating.overall > car2.rating.overall ? 'car1' :
                  car1.rating.overall < car2.rating.overall ? 'car2' : 'equal'
    };

    return comparison;
  }

  /**
   * Generate recommendation based on comparison
   */
  private generateRecommendation(car1: CarForComparison, car2: CarForComparison, scores: { car1: number; car2: number }): string {
    const winner = scores.car1 > scores.car2 ? car1 : car2;
    const loser = scores.car1 > scores.car2 ? car2 : car1;

    const scoreDiff = Math.abs(scores.car1 - scores.car2);

    if (scoreDiff < 5) {
      return `Kedua mobil memiliki performa yang sangat seimbang. ${winner.name} sedikit lebih unggul dengan skor ${Math.max(scores.car1, scores.car2)}%. Pertimbangkan preferensi personal dan kebutuhan spesifik Anda dalam membuat keputusan akhir.`;
    } else if (scoreDiff < 15) {
      return `${winner.name} adalah pilihan yang lebih baik dengan skor ${Math.max(scores.car1, scores.car2)}%. Meskipun ${loser.name} juga memiliki keunggulan tertentu, ${winner.name} secara keseluruhan lebih memenuhi kebutuhan pengguna modern.`;
    } else {
      return `${winner.name} jelas menjadi pilihan superior dengan skor ${Math.max(scores.car1, scores.car2)}%. Mobil ini menawarkan nilai yang jauh lebih baik dibandingkan ${loser.name} dalam hampir semua aspek penting. Kami sangat merekomendasikan ${winner.name} untuk kebutuhan Anda.`;
    }
  }

  /**
   * Generate shareable comparison link
   */
  async generateShareLink(car1Id: string, car2Id: string): Promise<string> {
    try {
      const baseUrl = window.location.origin;
      return `${baseUrl}/perbandingan?car1=${car1Id}&car2=${car2Id}`;
    } catch (error) {
      console.error('Error generating share link:', error);
      return '';
    }
  }

  /**
   * Get popular cars for comparison suggestions
   */
  async getPopularCars(limit: number = 10): Promise<CarForComparison[]> {
    try {
      const featuredCars = await carService.getFeaturedCars(limit);
      return featuredCars.map(car => this.convertToComparisonFormat(car));
    } catch (error) {
      console.error('Error fetching popular cars:', error);
      return [];
    }
  }

  /**
   * Get cars in same category as given car (for comparison suggestions)
   */
  async getSimilarCars(carId: string, limit: number = 5): Promise<CarForComparison[]> {
    try {
      const car = await carService.getCarById(carId);
      if (!car || !car.category_id) return [];

      const similarCars = await carService.getCars(
        { category_ids: [car.category_id] },
        { limit: limit + 1, sort_by: 'popular' }
      );

      // Filter out the original car
      const filtered = similarCars.data.filter(c => c.id !== carId);
      return filtered.slice(0, limit).map(c => this.convertToComparisonFormat(c));
    } catch (error) {
      console.error('Error fetching similar cars:', error);
      return [];
    }
  }
}

// Export singleton instance
export const comparisonService = new ComparisonService();
export default comparisonService;