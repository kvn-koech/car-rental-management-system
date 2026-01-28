import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingCar, setBookingCar] = useState(null);
  const [bookingDates, setBookingDates] = useState({ startDate: '', endDate: '' });
  const navigate = useNavigate();

  // Carousel state: map carId -> currentImageIndex
  const [carouselIndices, setCarouselIndices] = useState({});

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cars/');
        if (res.ok) {
          const data = await res.json();
          setCars(data);
          // Initialize indices
          const indices = {};
          data.forEach(c => indices[c.id] = 0);
          setCarouselIndices(indices);
        }
      } catch (err) {
        console.error("Failed to fetch fleet", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleBookClick = (car) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setBookingCar(car);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Calculate total price for display confirmation or validation could happen here
    try {
      const res = await fetch('http://localhost:5000/api/bookings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          car_id: bookingCar.id,
          start_date: bookingDates.startDate,
          end_date: bookingDates.endDate
        })
      });

      if (res.ok) {
        alert('Booking created successfully!');
        setBookingCar(null);
        setBookingDates({ startDate: '', endDate: '' });
        navigate('/dashboard');
      } else {
        const data = await res.json();
        alert(data.message || 'Booking failed');
      }
    } catch (err) {
      alert('Error creating booking');
    }
  };

  const nextImage = (carId, imageCount) => {
    setCarouselIndices(prev => ({
      ...prev,
      [carId]: (prev[carId] + 1) % imageCount
    }));
  };

  const prevImage = (carId, imageCount) => {
    setCarouselIndices(prev => ({
      ...prev,
      [carId]: (prev[carId] - 1 + imageCount) % imageCount
    }));
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center dark:bg-slate-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary dark:text-white mb-4">Our Premium Fleet</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Choose the perfect ride for your journey.</p>
        </div>

        {cars.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">No cars available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => {
              const allImages = car.images && car.images.length > 0 ? [car.image_url, ...car.images] : [car.image_url].filter(Boolean);
              // Actually backend sends image_url as main, and images as list. 
              // If the updated backend sends `images` including all, use that.
              // Based on car.py: "images": [img.image_url for img in car.images]
              // And image_url is the main one. So let's combine if needed or if `images` is strictly additional.
              // Let's treat `car.image_url` as the first one if not in list, but duplication might occur if main is also in list.
              // Simplest: Use `allImages` array.

              // Construct robust list:
              let displayImages = [];
              if (car.image_url) displayImages.push(car.image_url);
              if (car.images && car.images.length > 0) {
                // Filter out duplicates if main image is in the list
                const additional = car.images.filter(img => img !== car.image_url);
                displayImages = [...displayImages, ...additional];
              }
              if (displayImages.length === 0) displayImages = []; // Fallback handled in render

              const currentIndex = carouselIndices[car.id] || 0;

              return (
                <div key={car.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col">
                  <div className="h-48 overflow-hidden bg-gray-200 dark:bg-slate-700 relative group">
                    {displayImages.length > 0 ? (
                      <>
                        <img src={displayImages[currentIndex]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover transition duration-500" />

                        {displayImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); prevImage(car.id, displayImages.length); }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); nextImage(car.id, displayImages.length); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                      {car.year}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* ... details ... */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-secondary dark:text-white">{car.make} {car.model}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {car.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-bold text-primary dark:text-blue-400">{car.price_per_day.toLocaleString()}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">KES / day</span>
                    </div>

                    <div className="mt-auto">
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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Book {bookingCar.make} {bookingCar.model}</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  value={bookingDates.startDate}
                  onChange={e => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  value={bookingDates.endDate}
                  onChange={e => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                  required
                />
              </div>

              {bookingDates.startDate && bookingDates.endDate && (
                <div className="bg-blue-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rate</span>
                    <span>{bookingCar.price_per_day.toLocaleString()} KES/day</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary dark:text-blue-400">
                    <span>Total Estimate</span>
                    <span>
                      {(() => {
                        const start = new Date(bookingDates.startDate);
                        const end = new Date(bookingDates.endDate);
                        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        return days > 0 ? (days * bookingCar.price_per_day).toLocaleString() + ' KES' : '---';
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setBookingCar(null)} className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fleet;
