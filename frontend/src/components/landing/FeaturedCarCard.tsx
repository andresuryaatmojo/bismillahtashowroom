import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, MapPin, Calendar, Gauge, Fuel } from 'lucide-react';
import { CarWithRelations } from '../../services/carService';

interface FeaturedCarCardProps {
  car: CarWithRelations;
}

const FeaturedCarCard: React.FC<FeaturedCarCardProps> = ({ car }) => {
  // Get primary image or use placeholder
  const primaryImage = car.car_images?.find((img) => img.is_primary)?.image_url ||
                       car.car_images?.[0]?.image_url ||
                       '/api/placeholder/400/300';

  // Format price to Indonesian Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format condition label
  const getConditionLabel = (condition: string) => {
    const labels: { [key: string]: string } = {
      new: 'Baru',
      excellent: 'Sangat Baik',
      good: 'Baik',
      fair: 'Cukup Baik',
      used: 'Bekas'
    };
    return labels[condition] || condition;
  };

  // Format transmission label
  const getTransmissionLabel = (transmission: string) => {
    const labels: { [key: string]: string } = {
      manual: 'Manual',
      automatic: 'Automatic',
      cvt: 'CVT',
      dct: 'DCT',
      amt: 'AMT'
    };
    return labels[transmission] || transmission;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {car.active_package?.listing_packages?.badge_text && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-none text-white font-semibold">
            {car.active_package.listing_packages.badge_text}
          </Badge>
        )}
        {car.is_verified && (
          <Badge className="absolute top-3 right-3 bg-blue-600 border-none text-white">
            Verified
          </Badge>
        )}
        {car.condition === 'new' && (
          <Badge className="absolute top-12 right-3 bg-green-600 border-none text-white">
            Baru
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title and Brand */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
            {car.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{car.car_brands?.name}</span>
            <span>•</span>
            <span>{car.car_models?.name}</span>
          </div>
        </div>

        {/* Rating and Reviews */}
        {car.total_reviews > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">
              {car.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({car.total_reviews} ulasan)
            </span>
          </div>
        )}

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Gauge className="w-4 h-4" />
            <span>{(car.mileage / 1000).toFixed(0)}k km</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Fuel className="w-4 h-4" />
            <span className="capitalize">{getTransmissionLabel(car.transmission)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{car.location_city}</span>
          </div>
        </div>

        {/* Condition Badge */}
        <div className="mb-4">
          <Badge variant="outline" className="text-xs">
            {getConditionLabel(car.condition)}
          </Badge>
        </div>

        {/* Price and CTA */}
        <div className="border-t pt-3">
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(car.price)}
            </p>
            {car.is_negotiable && (
              <p className="text-xs text-gray-500">Harga bisa nego</p>
            )}
          </div>
          <Button
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg"
            onClick={() => window.location.href = `/katalog/${car.id}`}
          >
            Lihat Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedCarCard;
