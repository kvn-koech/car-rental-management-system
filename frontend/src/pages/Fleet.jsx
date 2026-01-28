import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cars/');
        if (res.ok) {
          const data = await res.json();
          // Filter only available cars or show all? usually fleet shows all but maybe marks rented ones.
          // For now showing all, but visual indicator for status.
          setCars(data);
        }
      } catch (err) {
        console.error("Failed to fetch fleet", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleBookNow = (carId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      // Future: Open booking modal or navigate to booking page
      // For now, redirect to dashboard or show alert
      alert("Booking feature coming soon! Please contact us to book.");
    }
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
            {cars.map((car) => (
              <div key={car.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col">
                <div className="h-48 overflow-hidden bg-gray-200 dark:bg-slate-700 relative group">
                  {car.image_url ? (
                    <img src={car.image_url} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
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
                        onClick={() => handleBookNow(car.id)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fleet;
