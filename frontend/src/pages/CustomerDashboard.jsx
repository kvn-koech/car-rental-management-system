import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiGet } from '../api';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchBookings = async () => {
      try {
        const res = await apiGet('/api/bookings/my-bookings');
        if (res.ok) {
          setBookings(await res.json());
        } else if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          handleLogout();
        }
      } catch {
        toast.error('Failed to load your bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary dark:text-white">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, <span className="font-semibold text-primary dark:text-blue-400">{user.username}</span>!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition font-medium text-sm"
          >
            Log Out
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-gray-800 dark:text-white' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-600 dark:text-green-400' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'text-blue-600 dark:text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-secondary dark:text-white">My Bookings</h2>
            <button
              onClick={() => navigate('/fleet')}
              className="px-4 py-2 bg-primary dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition"
            >
              + New Booking
            </button>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-slate-600 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <svg className="w-14 h-14 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No bookings yet.</p>
              <p className="text-sm mt-1">Browse our fleet and book your first ride!</p>
              <button
                className="mt-4 px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition"
                onClick={() => navigate('/fleet')}
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {bookings.map(booking => (
                <div key={booking.id} className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                  {/* Car Thumbnail */}
                  <div className="w-full sm:w-20 h-32 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                    {booking.car_image ? (
                      <img src={booking.car_image} alt={booking.car} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-secondary dark:text-white text-base">{booking.car}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      📅 {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <p className="text-sm font-semibold text-primary dark:text-blue-400">
                        KES {booking.total_price.toLocaleString()}
                      </p>
                      {booking.mpesa_code && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          M-Pesa: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{booking.mpesa_code}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
