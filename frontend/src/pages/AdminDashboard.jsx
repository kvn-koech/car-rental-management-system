import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, pendingBookings: 0, activeFleet: 0 });
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({
    make: '', model: '', year: new Date().getFullYear(),
    price_per_day: '', image_url: '', location: '', status: 'available'
  });
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
        const bookingsRes = await fetch('http://localhost:5000/api/bookings/all-bookings', { headers });
        if (bookingsRes.ok) setBookings(await bookingsRes.json());

        // Fetch Cars (No auth needed for read, but consistent)
        const carsRes = await fetch('http://localhost:5000/api/cars/', { headers });
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);

          // Calculate stats (Mock logic for revenue)
          const activeFleet = carsData.filter(c => c.status === 'available').length;
          // If bookings are loaded
          // setStats({ ...stats, activeFleet }); 
        }

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
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
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

  const handleAddCar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/cars/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCar)
      });

      if (res.ok) {
        alert('Vehicle added successfully!');
        setShowAddCar(false);
        setNewCar({
          make: '', model: '', year: new Date().getFullYear(),
          price_per_day: '', image_url: '', location: '', status: 'available'
        });
        // Refresh cars
        const carsRes = await fetch('http://localhost:5000/api/cars/');
        if (carsRes.ok) setCars(await carsRes.json());
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add vehicle');
      }
    } catch (err) {
      alert('Error adding vehicle');
    }
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`http://localhost:5000/api/cars/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCars(prev => prev.filter(c => c.id !== id));
        alert("Car deleted");
      }
    } catch (err) {
      alert("Delete failed");
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
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold mt-2">KES 124,000</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Bookings</h3>
            <p className="text-2xl font-bold mt-2">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Fleet Size</h3>
            <p className="text-2xl font-bold mt-2">{cars.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-primary dark:bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            Overview
          </button>
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

        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl text-center text-gray-500">
            <h3 className="text-xl font-medium mb-4">Welcome to the Admin Dashboard</h3>
            <p>Select a tab above to manage bookings or your fleet.</p>
          </div>
        )}

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
          <div>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAddCar(!showAddCar)}
                className="px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 transition shadow-sm"
              >
                {showAddCar ? 'Cancel' : 'Add New Vehicle'}
              </button>
            </div>

            {showAddCar && (
              <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4">Add New Vehicle</h3>
                <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Make (e.g. Toyota)" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={newCar.make} onChange={e => setNewCar({ ...newCar, make: e.target.value })} required />
                  <input type="text" placeholder="Model (e.g. Land Cruiser)" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={newCar.model} onChange={e => setNewCar({ ...newCar, model: e.target.value })} required />
                  <input type="number" placeholder="Year" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={newCar.year} onChange={e => setNewCar({ ...newCar, year: e.target.value })} required />
                  <input type="number" placeholder="Price per Day (KES)" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={newCar.price_per_day} onChange={e => setNewCar({ ...newCar, price_per_day: e.target.value })} required />
                  <input type="text" placeholder="Location" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={newCar.location} onChange={e => setNewCar({ ...newCar, location: e.target.value })} required />
                  <input type="url" placeholder="Image URL" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={newCar.image_url} onChange={e => setNewCar({ ...newCar, image_url: e.target.value })} />
                  <div className="md:col-span-2">
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Save Vehicle</button>
                  </div>
                </form>
              </div>
            )}

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
                  {/* Admin Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteCar(car.id)} className="flex-1 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
