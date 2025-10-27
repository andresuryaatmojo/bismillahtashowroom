// Hero component
import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowUpRight, CirclePlay } from 'lucide-react';
import ChatbotWidget from '../chat/ChatbotWidget';

const Hero: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-gray-200">
      <div className="max-w-screen-xl w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
        <div className="max-w-xl">
          <Badge className="rounded-full py-1 border-none bg-gray-100 text-gray-800">
            Showroom Terpercaya Sejak 2020
          </Badge>
          <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold !leading-[1.2] tracking-tight">
            Mobilindo - Showroom Mobil Terpercaya
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg text-gray-600">
            Temukan mobil impian Anda di Mobilindo. Kami menyediakan berbagai pilihan mobil berkualitas dengan harga terbaik dan pelayanan yang memuaskan. Dapatkan pengalaman berbelanja mobil yang tak terlupakan.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full text-base bg-black hover:bg-gray-800 text-white"
            >
              Lihat Koleksi Mobil <ArrowUpRight className="!h-5 !w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full text-base shadow-none border-black text-black hover:bg-gray-50"
            >
              <CirclePlay className="!h-5 !w-5" /> Tonton Video
            </Button>
          </div>
        </div>
        <div className="relative lg:max-w-lg xl:max-w-xl w-full bg-gray-100 rounded-xl aspect-square">
          <img
            src="/api/placeholder/600/600"
            alt="Mobilindo Showroom"
            className="object-cover rounded-xl w-full h-full"
          />
        </div>
      </div>
      {/* Widget chatbot floating dengan tombol eskalasi ke admin */}
      <ChatbotWidget />
    </div>
  );
};

export default Hero;