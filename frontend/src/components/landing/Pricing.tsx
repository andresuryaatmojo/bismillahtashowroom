import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { CircleCheck } from 'lucide-react';

const plans = [
  {
    name: "Hatchback",
    price: "150-300",
    description:
      "Mobil kompak yang cocok untuk penggunaan sehari-hari di kota.",
    features: [
      "Konsumsi BBM irit",
      "Mudah diparkir",
      "Perawatan murah",
      "Cocok untuk pemula",
      "Harga terjangkau",
    ],
    buttonText: "Lihat Koleksi Hatchback",
  },
  {
    name: "Sedan",
    price: "200-500",
    isRecommended: true,
    description:
      "Mobil elegan dengan kenyamanan dan performa yang seimbang.",
    features: [
      "Kabin luas dan nyaman",
      "Performa mesin optimal",
      "Fitur keselamatan lengkap",
      "Desain premium",
      "Cocok untuk keluarga",
    ],
    buttonText: "Lihat Koleksi Sedan",
    isPopular: true,
  },
  {
    name: "SUV",
    price: "300-800",
    description:
      "Mobil tangguh dengan kapasitas besar untuk petualangan keluarga.",
    features: [
      "Ground clearance tinggi",
      "Kapasitas 7 penumpang",
      "Bagasi luas",
      "Cocok segala medan",
      "Fitur off-road",
    ],
    buttonText: "Lihat Koleksi SUV",
  },
];

const Pricing: React.FC = () => {
  return (
    <div id="pricing" className="max-w-screen-lg mx-auto py-12 xs:py-20 px-6">
      <h1 className="text-4xl xs:text-5xl font-bold text-center tracking-tight">
        Kategori Mobil
      </h1>
      <div className="mt-8 xs:mt-14 grid grid-cols-1 lg:grid-cols-3 items-center gap-8 lg:gap-0">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative bg-gray-50 border p-7 rounded-xl lg:rounded-none lg:first:rounded-l-xl lg:last:rounded-r-xl",
              {
                "bg-white border-[2px] border-black py-12 !rounded-xl":
                  plan.isPopular,
              }
            )}
          >
            {plan.isPopular && (
              <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                Most Popular
              </Badge>
            )}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <p className="mt-2 text-4xl font-bold">Rp {plan.price} Jt</p>
            <p className="mt-4 font-medium text-gray-600">
              {plan.description}
            </p>
            <Separator className="my-6" />
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CircleCheck className="h-4 w-4 mt-1 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.isPopular ? "default" : "outline"}
              size="lg"
              className="w-full mt-6 rounded-full"
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;