import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { ReviewWithRelations } from '../../services/reviewService';

interface ReviewCardProps {
  review: ReviewWithRelations;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // Generate stars array for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 stroke-yellow-400'
            : 'fill-gray-200 stroke-gray-200'
        }`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get reviewer initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        {/* Header: Avatar and User Info */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {review.users?.full_name
                ? getInitials(review.users.full_name)
                : getInitials(review.users?.username || 'U')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">
                {review.users?.full_name || review.users?.username || 'Pengguna'}
              </h4>
              {review.is_verified_purchase && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1.5 py-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 mb-1">
              {renderStars(review.rating_stars)}
            </div>

            <p className="text-xs text-gray-500">
              {formatDate(review.review_date)}
            </p>
          </div>
        </div>

        {/* Car Info */}
        {review.cars && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{review.cars.title}</span>
              {review.cars.car_brands && review.cars.car_models && (
                <span className="text-gray-500 ml-1">
                  ({review.cars.car_brands.name} {review.cars.car_models.name})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Review Text */}
        {review.review_text && (
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed line-clamp-4">
              &quot;{review.review_text}&quot;
            </p>
          </div>
        )}

        {/* Pros and Cons */}
        {(review.pros || review.cons) && (
          <div className="space-y-2 mb-4">
            {review.pros && (
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1">👍 Plus:</p>
                <p className="text-sm text-gray-600 line-clamp-2">{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">👎 Minus:</p>
                <p className="text-sm text-gray-600 line-clamp-2">{review.cons}</p>
              </div>
            )}
          </div>
        )}

        {/* Detailed Ratings */}
        {(review.rating_car_condition || review.rating_seller_service || review.rating_transaction_process) && (
          <div className="border-t pt-3 mb-4 space-y-2">
            {review.rating_car_condition && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Kondisi Mobil:</span>
                <div className="flex gap-0.5">
                  {renderStars(review.rating_car_condition).slice(0, 5)}
                </div>
              </div>
            )}
            {review.rating_seller_service && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Pelayanan:</span>
                <div className="flex gap-0.5">
                  {renderStars(review.rating_seller_service).slice(0, 5)}
                </div>
              </div>
            )}
            {review.rating_transaction_process && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Proses Transaksi:</span>
                <div className="flex gap-0.5">
                  {renderStars(review.rating_transaction_process).slice(0, 5)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer: Helpful Count */}
        {review.helpful_count > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <ThumbsUp className="w-4 h-4" />
              <span>{review.helpful_count} orang merasa review ini membantu</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
