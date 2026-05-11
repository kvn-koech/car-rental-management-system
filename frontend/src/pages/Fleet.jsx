import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../api';

const FUEL_ICONS = { petrol: '⛽', diesel: '🛢️', electric: '⚡', hybrid: '🔋' };
const TRANS_ICONS = { automatic: '🤖', manual: '⚙️' };

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingCar, setBookingCar] = useState(null);
  const [bookingDates, setBookingDates] = useState({ startDate: '', endDate: '' });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Carousel state
  const [carouselIndices, setCarouselIndices] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await apiGet('/api/cars/');
        if (res.ok) {
          const data = await res.json();
          setCars(data);
          const indices = {};
          data.forEach(c => (indices[c.id] = 0));
          setCarouselIndices(indices);
        }
      } catch {
        toast.error('Failed to load fleet. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Apply filters + sorting whenever cars/filter/sort state changes
  useEffect(() => {
    let result = [...cars];
    if (locationFilter) {
      result = result.filter(c =>
        c.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    if (sortOrder === 'asc') result.sort((a, b) => a.price_per_day - b.price_per_day);
    if (sortOrder === 'desc') result.sort((a, b) => b.price_per_day - a.price_per_day);
    setFiltered(result);
  }, [cars, locationFilter, sortOrder]);

  // Unique locations for filter dropdown
  const locations = [...new Set(cars.map(c => c.location))].sort();

  const handleBookClick = (car) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to book a car.');
      navigate('/login');
    } else {
      setBookingCar(car);
      setBookingDates({ startDate: '', endDate: '' });
      setMpesaPhone('');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!mpesaPhone.trim()) {
      toast.error('Please enter your M-Pesa phone number.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost('/api/bookings/', {
        car_id: bookingCar.id,
        start_date: bookingDates.startDate,
        end_date: bookingDates.endDate,
        mpesa_phone: mpesaPhone.trim(),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Booking confirmed! M-Pesa code: ${data.mpesa_code}`);
        setBookingCar(null);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Booking failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = (carId, count) =>
    setCarouselIndices(prev => ({ ...prev, [carId]: (prev[carId] + 1) % count }));

  const prevImage = (carId, count) =>
    setCarouselIndices(prev => ({ ...prev, [carId]: (prev[carId] - 1 + count) % count }));

  const calcDays = () => {
    if (!bookingDates.startDate || !bookingDates.endDate) return 0;
    const d = Math.ceil(
      (new Date(bookingDates.endDate) - new Date(bookingDates.startDate)) / 86400000
    );
    return d > 0 ? d : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-slate-700" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-secondary dark:text-white mb-4">Our Premium Fleet</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Choose the perfect ride for your journey.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-8 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter:</span>

          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort: Default</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>

          {(locationFilter || sortOrder) && (
            <button
              onClick={() => { setLocationFilter(''); setSortOrder(''); }}
              className="px-3 py-2 text-sm rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition font-medium"
            >
              Clear
            </button>
          )}

          <span className="ml-auto text-sm text-gray-400 dark:text-gray-500">
            {filtered.length} car{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Cars Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-medium">No cars match your filters.</p>
            <button onClick={() => { setLocationFilter(''); setSortOrder(''); }} className="mt-4 text-blue-500 hover:underline text-sm">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((car) => {
              let displayImages = [];
              if (car.image_url) displayImages.push(car.image_url);
              if (car.images?.length) {
                displayImages = [...displayImages, ...car.images.filter(img => img !== car.image_url)];
              }
              const currentIndex = carouselIndices[car.id] || 0;

              return (
                <div key={car.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col">
                  {/* Image Carousel */}
                  <div className="h-48 overflow-hidden bg-gray-200 dark:bg-slate-700 relative group">
                    {displayImages.length > 0 ? (
                      <>
                        <img
                          src={displayImages[currentIndex]}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover transition duration-500"
                        />
                        {displayImages.length > 1 && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); prevImage(car.id, displayImages.length); }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); nextImage(car.id, displayImages.length); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {displayImages.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-0.5 rounded-full text-sm font-semibold shadow-sm">
                      {car.year}
                    </div>
                    {car.status !== 'available' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-800 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wide">
                          {car.status === 'rented' ? 'Currently Rented' : 'Unavailable'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-secondary dark:text-white">{car.make} {car.model}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {car.location}
                        </p>
                      </div>
                    </div>

                    {/* Spec Badges */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {car.seats && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                          👤 {car.seats} seats
                        </span>
                      )}
                      {car.transmission && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                          {TRANS_ICONS[car.transmission] || '⚙️'} {car.transmission}
                        </span>
                      )}
                      {car.fuel_type && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          {FUEL_ICONS[car.fuel_type] || '⛽'} {car.fuel_type}
                        </span>
                      )}
                    </div>

                    {car.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{car.description}</p>
                    )}

                    <div className="mt-auto">
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-primary dark:text-blue-400">{car.price_per_day.toLocaleString()}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">KES / day</span>
                      </div>

                      {car.status === 'available' ? (
                        <button
                          onClick={() => handleBookClick(car)}
                          className="w-full py-3 bg-primary dark:bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition shadow-md hover:shadow-lg transform active:scale-95"
                        >
                          Book Now
                        </button>
                      ) : (
                        <button disabled className="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 font-semibold rounded-xl cursor-not-allowed">
                          {car.status === 'rented' ? 'Currently Rented' : 'Unavailable'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingCar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book {bookingCar.make} {bookingCar.model}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{bookingCar.price_per_day.toLocaleString()} KES/day</p>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={bookingDates.startDate}
                    onChange={e => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="date"
                    min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={bookingDates.endDate}
                    onChange={e => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">M-Pesa Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🇰🇪</span>
                  <input
                    type="tel"
                    placeholder="e.g. 0712345678"
                    className="w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {calcDays() > 0 && (
                <div className="bg-blue-50 dark:bg-slate-700/50 p-4 rounded-xl border border-blue-100 dark:border-slate-600">
                  <div className="flex justify-between text-sm mb-1.5 text-gray-600 dark:text-gray-400">
                    <span>Duration</span>
                    <span className="font-medium">{calcDays()} day{calcDays() !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1.5 text-gray-600 dark:text-gray-400">
                    <span>Rate</span>
                    <span className="font-medium">{bookingCar.price_per_day.toLocaleString()} KES/day</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary dark:text-blue-400 pt-2 border-t border-blue-100 dark:border-slate-600">
                    <span>Total</span>
                    <span>{(calcDays() * bookingCar.price_per_day).toLocaleString()} KES</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setBookingCar(null)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                  {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {submitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fleet;
