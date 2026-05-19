import { Link } from 'react-router-dom';
import React from 'react';
import Hero from '../components/landing/Hero';
import FeaturedCars from '../components/landing/FeaturedCars';
import { Shield, Clock, Zap, Star } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: 'Instant Booking',
      description: 'Book your ride in minutes. No paperwork, just a seamless digital experience.',
      icon: <Zap className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: 'Best Rates',
      description: 'Competitive daily rental prices with no hidden fees or surprise charges.',
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: 'Fully Insured',
      description: 'Drive with peace of mind knowing every trip is fully verified and insured.',
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: 'Premium Quality',
      description: 'All our vehicles undergo rigorous inspections for your safety and comfort.',
      icon: <Star className="w-6 h-6 text-indigo-600" />,
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white pt-16">
      <Hero />
      <Features />
      <FeaturedCars />
      
      {/* CTA Section */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to start your journey?
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            Sign up today and get 10% off your first rental.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link to="/signup">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">
                Get Started
              </button>
            </Link>
            <a href="#features">
              <button className="bg-indigo-500 text-white border border-indigo-400 px-8 py-3 rounded-lg font-bold hover:bg-indigo-400 transition">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
