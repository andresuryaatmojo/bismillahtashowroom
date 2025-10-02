import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import {
  Car,
  Shield,
  CreditCard,
  Wrench,
  Users,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Car,
    title: "Koleksi Mobil Lengkap",
    description:
      "Berbagai pilihan mobil dari berbagai merek ternama dengan kondisi terbaik dan harga kompetitif.",
  },
  {
    icon: Shield,
    title: "Garansi Terpercaya",
    description:
      "Setiap mobil dilengkapi dengan garansi resmi dan jaminan kualitas untuk ketenangan pikiran Anda.",
  },
  {
    icon: CreditCard,
    title: "Pembiayaan Mudah",
    description:
      "Proses kredit yang cepat dan mudah dengan berbagai pilihan bank dan tenor yang fleksibel.",
  },
  {
    icon: Users,
    title: "Pelayanan Prima",
    description:
      "Tim profesional yang siap membantu Anda menemukan mobil yang sesuai dengan kebutuhan dan budget.",
  },
  {
    icon: Wrench,
    title: "Service Center",
    description:
      "Layanan purna jual terlengkap dengan teknisi berpengalaman dan suku cadang original.",
  },
  {
    icon: Award,
    title: "Penghargaan Terbaik",
    description:
      "Showroom terpercaya dengan berbagai penghargaan dan testimoni positif dari ribuan pelanggan.",
  },
];

const Features: React.FC = () => {
  return (
    <div
      id="features"
      className="max-w-screen-xl mx-auto w-full py-12 xs:py-20 px-6"
    >
      <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-bold tracking-tight sm:max-w-xl sm:text-center sm:mx-auto">
        Mengapa Memilih Mobilindo?
      </h2>
      <div className="mt-8 xs:mt-14 w-full mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col border rounded-xl overflow-hidden shadow-none"
          >
            <CardHeader>
              <feature.icon />
              <h4 className="!mt-3 text-xl font-bold tracking-tight">
                {feature.title}
              </h4>
              <p className="mt-1 text-gray-600 text-sm xs:text-[17px]">
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className="mt-auto px-0 pb-0">
              <div className="bg-gray-100 h-52 ml-6 rounded-tl-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;