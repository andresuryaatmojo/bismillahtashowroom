import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import FAQ from '../components/landing/FAQ';
import Testimonial from '../components/landing/Testimonial';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

const HalamanBeranda: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <FAQ />
      <Testimonial />
      <Pricing />
      <Footer />
    </div>
  );
};

export default HalamanBeranda;