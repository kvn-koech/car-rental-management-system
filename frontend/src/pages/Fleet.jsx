import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent, CardFooter } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Search, Filter, Users, Fuel, Settings, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const Fleet = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    location: '',
    min_price: '',
    max_price: '',
    status: 'available'
  });

  const [bookingCar, setBookingCar] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    mpesaPhone: ''
  });

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['cars', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '9',
        ...filters
      });
      const res = await apiGet(`/api/cars/?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch fleet');
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const bookingMutation = useMutation({
    mutationFn: (data) => apiPost('/api/bookings/', data),
    onSuccess: async (res) => {
      const result = await res.json();
      if (res.ok) {
        toast.success(`Booking request sent! M-Pesa Code: ${result.mpesa_code}`);
        setBookingCar(null);
        queryClient.invalidateQueries(['bookings']);
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Booking failed');
      }
    },
    onError: () => toast.error('An error occurred during booking'),
  });

  const handleBookSubmit = (e) => {
    e.preventDefault();
    bookingMutation.mutate({
      car_id: bookingCar.id,
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      mpesa_phone: bookingData.mpesaPhone
    });
  };

  const cars = data?.cars || [];
  const totalPages = data?.pages || 1;

  if (isLoading && !isPlaceholderData) {
    return <div className="pt-32 text-center">Loading fleet...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Our Fleet</h1>
            <p className="mt-2 text-gray-500">Premium vehicles for your every need</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Input 
              placeholder="Filter by location..." 
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-64"
            />
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <Card key={car.id} hoverEffect className="flex flex-col">
              <div className="relative h-56">
                <img
                  src={car.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={car.status === 'available' ? 'success' : 'danger'}>
                    {car.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {car.make} {car.model}
                  </h3>
                  <span className="text-sm font-medium text-gray-500">{car.year}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-500" /> {car.seats} Seats</div>
                  <div className="flex items-center"><Fuel className="w-4 h-4 mr-2 text-indigo-500" /> {car.fuel_type}</div>
                  <div className="flex items-center"><Settings className="w-4 h-4 mr-2 text-indigo-500" /> {car.transmission}</div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-indigo-500" /> {car.year}</div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{car.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-gray-50/50">
                <div className="text-xl font-bold text-indigo-600">
                  KES {car.price_per_day.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/day</span>
                </div>
                <Button 
                  disabled={car.status !== 'available'}
                  onClick={() => setBookingCar(car)}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-4">
            <Button 
              variant="secondary" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Previous
            </Button>
            <span className="text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="secondary" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Book {bookingCar.make} {bookingCar.model}</h2>
              <p className="text-gray-500 mb-6">Complete your booking information</p>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Start Date" 
                    type="date" 
                    required 
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                  <Input 
                    label="End Date" 
                    type="date" 
                    required 
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <Input 
                  label="M-Pesa Phone Number" 
                  placeholder="254..." 
                  required 
                  value={bookingData.mpesaPhone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, mpesaPhone: e.target.value }))}
                />
                
                <div className="pt-4 flex space-x-3">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setBookingCar(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? 'Processing...' : 'Confirm'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Fleet;
