import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch Bookings
        const bookingsRes = await fetch('http://localhost:5000/bookings/all-bookings', { headers });
        if (bookingsRes.ok) setBookings(await bookingsRes.json());

        // Fetch Cars (No auth needed for read, but consistent)
        const carsRes = await fetch('http://localhost:5000/cars/', { headers });
        if (carsRes.ok) setCars(await carsRes.json());

      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleBookingAction = async (id, status) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`http://localhost:5000/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Refresh local state
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_role');
    navigate('/admin/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors">
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold text-primary dark:text-blue-400">Admin Dashboard</span>
            <button onClick={logout} className="text-red-500 hover:text-red-600 font-medium">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'bookings' ? 'bg-primary dark:bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'fleet' ? 'bg-primary dark:bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            Fleet Management
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Car</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.car}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {booking.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleBookingAction(booking.id, 'confirmed')} className="text-green-600 hover:text-green-900 dark:hover:text-green-400">Approve</button>
                          <button onClick={() => handleBookingAction(booking.id, 'cancelled')} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => (
              <div key={car.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{car.make} {car.model}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{car.year} • {car.location}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-lg ${car.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300'}`}>
                    {car.status}
                  </span>
                </div>
                <div className="text-lg font-semibold text-primary dark:text-blue-400 mb-4">
                  {car.price_per_day.toLocaleString()} KES <span className="text-xs text-gray-500 font-normal">/ day</span>
                </div>
                {/* Admin Actions could go here (Edit/Delete) */}
                <button className="w-full py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  Edit Vehicle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
