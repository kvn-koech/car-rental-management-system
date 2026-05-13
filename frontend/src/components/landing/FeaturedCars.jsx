import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api';
import Card, { CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { Users, Fuel, Settings } from 'lucide-react';

const FeaturedCars = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cars', 'featured'],
    queryFn: async () => {
      if (!res.ok) throw new Error('Failed to fetch cars');
      return res.json();
    },
  });

  if (isLoading) return <div className="py-20 text-center">Loading featured cars...</div>;
  if (error) return null;

  const cars = data?.cars || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Featured Fleet</h2>
          <p className="mt-4 text-xl text-gray-500">Choose from our most popular premium vehicles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cars.map((car) => (
            <Card key={car.id} hoverEffect className="flex flex-col">
              <div className="relative h-48">
                <img
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                <Badge variant="success" className="absolute top-4 right-4">
                  Available
                </Badge>
              </div>
              <CardContent className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {car.make} {car.model}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {car.seats}</span>
                  <span className="flex items-center"><Fuel className="w-4 h-4 mr-1" /> {car.fuel_type}</span>
                  <span className="flex items-center"><Settings className="w-4 h-4 mr-1" /> {car.transmission}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-lg font-bold text-indigo-600">
                  KES {car.price_per_day.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/day</span>
                </div>
                <Link to={`/fleet`}>
                  <Button variant="primary" size="sm">Book Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/fleet">
            <Button variant="outline" size="lg">View All Cars</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
