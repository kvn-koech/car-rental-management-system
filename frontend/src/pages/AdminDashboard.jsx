import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPatch, apiDelete, apiFormPost, apiFormPatch } from '../api';
import { useConfirm } from '../components/ConfirmModal';

const TRANSMISSION_OPTIONS = ['automatic', 'manual'];
const FUEL_OPTIONS = ['petrol', 'diesel', 'electric', 'hybrid'];

const emptyCarForm = () => ({
  make: '', model: '', year: new Date().getFullYear(),
  price_per_day: '', location: '', status: 'available',
  seats: 5, transmission: 'automatic', fuel_type: 'petrol', description: '',
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState(emptyCarForm());
  const [imageFiles, setImageFiles] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { confirmModal, requestConfirm } = useConfirm();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, carsRes] = await Promise.all([
          apiGet('/api/bookings/all-bookings'),
          apiGet('/api/cars/'),
        ]);
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (carsRes.ok) setCars(await carsRes.json());
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ── Computed stats ────────────────────────────────────────────────────────
  const revenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;

  // ── Booking actions ───────────────────────────────────────────────────────
  const handleBookingAction = async (id, status) => {
    try {
      const res = await apiPatch(`/api/bookings/${id}/status`, { status });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        toast.success(`Booking ${status}.`);
      } else {
        const d = await res.json();
        toast.error(d.message || 'Action failed.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  // ── Car CRUD ──────────────────────────────────────────────────────────────
  const handleAddCar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(newCar).forEach(([k, v]) => formData.append(k, v));
      for (const f of imageFiles) formData.append('images', f);

      const res = await apiFormPost('/api/cars/', formData);
      const data = await res.json();
      if (res.ok) {
        toast.success('Vehicle added successfully!');
        setShowAddCar(false);
        setNewCar(emptyCarForm());
        setImageFiles([]);
        const carsRes = await apiGet('/api/cars/');
        if (carsRes.ok) setCars(await carsRes.json());
      } else {
        toast.error(data.message || 'Failed to add vehicle.');
      }
    } catch {
      toast.error('Error adding vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCar = async (id) => {
    const ok = await requestConfirm('Delete this car? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await apiDelete(`/api/cars/${id}`);
      if (res.ok) {
        setCars(prev => prev.filter(c => c.id !== id));
        toast.success('Car deleted.');
      } else {
        toast.error('Delete failed.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(editingCar).forEach(([k, v]) => {
        if (k !== 'images') formData.append(k, v ?? '');
      });
      for (const f of editImageFiles) formData.append('images', f);

      const res = await apiFormPatch(`/api/cars/${editingCar.id}`, formData);
      if (res.ok) {
        toast.success('Car updated!');
        setEditingCar(null);
        setEditImageFiles([]);
        const carsRes = await apiGet('/api/cars/');
        if (carsRes.ok) setCars(await carsRes.json());
      } else {
        const d = await res.json();
        toast.error(d.message || 'Failed to update car.');
      }
    } catch {
      toast.error('Error updating car.');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_role');
    navigate('/admin/login');
  };

  // ── Shared car form fields ─────────────────────────────────────────────────
  const CarFormFields = ({ values, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { key: 'make', placeholder: 'Make (e.g. Toyota)', type: 'text' },
        { key: 'model', placeholder: 'Model (e.g. Land Cruiser)', type: 'text' },
        { key: 'year', placeholder: 'Year', type: 'number' },
        { key: 'price_per_day', placeholder: 'Price per Day (KES)', type: 'number' },
        { key: 'location', placeholder: 'Location (e.g. Nairobi)', type: 'text' },
        { key: 'seats', placeholder: 'Seats', type: 'number' },
      ].map(({ key, placeholder, type }) => (
        <input key={key} type={type} placeholder={placeholder} required
          className="p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          value={values[key]} onChange={e => onChange({ ...values, [key]: e.target.value })} />
      ))}

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Transmission</label>
        <select className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
          value={values.transmission} onChange={e => onChange({ ...values, transmission: e.target.value })}>
          {TRANSMISSION_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fuel Type</label>
        <select className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
          value={values.fuel_type} onChange={e => onChange({ ...values, fuel_type: e.target.value })}>
          {FUEL_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
        <textarea rows={2} placeholder="Short description of the car..."
          className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          value={values.description} onChange={e => onChange({ ...values, description: e.target.value })} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors">
      {confirmModal}

      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-9 w-auto rounded-md" />
            <span className="text-lg font-bold text-primary dark:text-blue-400">Admin Dashboard</span>
          </div>
          <button onClick={logout} className="text-red-500 hover:text-red-600 font-medium text-sm">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: `KES ${revenue.toLocaleString()}`, icon: '💰' },
            { label: 'Active Bookings', value: activeBookings, icon: '📋' },
            { label: 'Fleet Size', value: cars.length, icon: '🚗' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{s.label}</p>
                <p className="text-2xl font-bold mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          {['overview', 'bookings', 'fleet'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize text-sm ${activeTab === tab
                ? 'bg-primary dark:bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'}`}>
              {tab === 'overview' ? 'Overview' : tab === 'bookings' ? 'Bookings' : 'Fleet'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-4">Booking Status Breakdown</h3>
              {['pending', 'confirmed', 'completed', 'cancelled'].map(s => {
                const count = bookings.filter(b => b.status === s).length;
                const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                const colors = { pending: 'bg-yellow-400', confirmed: 'bg-green-500', completed: 'bg-blue-500', cancelled: 'bg-red-400' };
                return (
                  <div key={s} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-600 dark:text-gray-400">{s}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[s]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-4">Fleet Status</h3>
              {['available', 'rented', 'maintenance'].map(s => {
                const count = cars.filter(c => c.status === s).length;
                const pct = cars.length ? Math.round((count / cars.length) * 100) : 0;
                const colors = { available: 'bg-green-500', rented: 'bg-blue-500', maintenance: 'bg-orange-400' };
                return (
                  <div key={s} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-600 dark:text-gray-400">{s}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[s]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  {['Car', 'Customer', 'Dates', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No bookings yet.</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-sm">{b.car}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium">{b.user_name || 'N/A'}</div>
                      <div className="text-gray-400 text-xs">{b.user_phone || ''}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-primary dark:text-blue-400">
                      KES {(b.total_price || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        b.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => handleBookingAction(b.id, 'confirmed')}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 transition">
                              Approve
                            </button>
                            <button onClick={() => handleBookingAction(b.id, 'cancelled')}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition">
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleBookingAction(b.id, 'completed')}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition">
                            Mark Complete
                          </button>
                        )}
                      </div>
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
            <div className="mb-5 flex justify-end">
              <button onClick={() => setShowAddCar(!showAddCar)}
                className="px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                {showAddCar ? '✕ Cancel' : '+ Add Vehicle'}
              </button>
            </div>

            {showAddCar && (
              <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-5">Add New Vehicle</h3>
                <form onSubmit={handleAddCar} className="space-y-4">
                  <CarFormFields values={newCar} onChange={setNewCar} />
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Upload Images</label>
                    <input type="file" multiple accept="image/*"
                      className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                      onChange={e => setImageFiles(e.target.files)} />
                    <p className="text-xs text-gray-400 mt-1">First image becomes the main thumbnail. Max 16 MB per file.</p>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-60 flex items-center gap-2">
                      {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {submitting ? 'Saving…' : 'Save Vehicle'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cars.map(car => (
                <div key={car.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                  {car.image_url && (
                    <div className="h-36 overflow-hidden bg-gray-100 dark:bg-slate-700">
                      <img src={car.image_url} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{car.make} {car.model}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{car.year} • {car.location}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${
                        car.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        car.status === 'rented' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        {car.status}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-primary dark:text-blue-400 mb-3">
                      KES {car.price_per_day.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ day</span>
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCar(car); setEditImageFiles([]); }}
                        className="flex-1 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteCar(car.id)}
                        className="flex-1 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-5">Edit Vehicle</h3>
            <form onSubmit={handleUpdateCar} className="space-y-4">
              <CarFormFields values={editingCar} onChange={setEditingCar} />

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                <select className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                  value={editingCar.status} onChange={e => setEditingCar({ ...editingCar, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Add New Images</label>
                <input type="file" multiple accept="image/*"
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                  onChange={e => setEditImageFiles(e.target.files)} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingCar(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                  {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {submitting ? 'Saving…' : 'Update Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
