import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPatch, apiDelete, apiFormPost, apiFormPatch } from '../api';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import OverviewStats from '../components/admin/OverviewStats';
import BookingTable from '../components/admin/BookingTable';
import VehicleForm from '../components/admin/VehicleForm';
import Badge from '../components/ui/Badge';
import { LayoutDashboard, ClipboardList, Car, LogOut, Plus, X } from 'lucide-react';

const emptyCarForm = () => ({
  make: '', model: '', year: new Date().getFullYear(),
  price_per_day: '', location: '', status: 'available',
  seats: 5, transmission: 'automatic', fuel_type: 'petrol', description: '',
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState(emptyCarForm());
  const [editingCar, setEditingCar] = useState(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const res = await apiGet('/api/bookings/all-bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      return data.bookings || [];
    },
  });

  const { data: cars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['admin', 'cars'],
    queryFn: async () => {
      const res = await apiGet('/api/cars/?per_page=100');
      if (!res.ok) throw new Error('Failed to fetch cars');
      const data = await res.json();
      return data.cars || [];
    },
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/api/bookings/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['admin', 'bookings']);
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/cars/${id}`),
    onSuccess: () => {
      toast.success('Car deleted');
      queryClient.invalidateQueries(['admin', 'cars']);
    },
  });

  const addCarMutation = useMutation({
    mutationFn: (formData) => apiFormPost('/api/cars/', formData),
    onSuccess: () => {
      toast.success('Vehicle added');
      setShowAddCar(false);
      setNewCar(emptyCarForm());
      queryClient.invalidateQueries(['admin', 'cars']);
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: ({ id, formData }) => apiFormPatch(`/api/cars/${id}`, formData),
    onSuccess: () => {
      toast.success('Vehicle updated');
      setEditingCar(null);
      queryClient.invalidateQueries(['admin', 'cars']);
    },
  });

  const revenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  if (loadingBookings || loadingCars) return <div className="pt-32 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'bookings', label: 'Bookings', icon: <ClipboardList className="w-4 h-4" /> },
            { id: 'fleet', label: 'Fleet', icon: <Car className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <OverviewStats 
                revenue={revenue} 
                activeBookings={activeBookingsCount} 
                fleetSize={cars.length} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader><h3 className="font-bold">Recent Bookings</h3></CardHeader>
                  <CardContent>
                    <BookingTable bookings={bookings.slice(0, 5)} onAction={(id, s) => statusMutation.mutate({ id, status: s })} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><h3 className="font-bold">Fleet Status</h3></CardHeader>
                  <CardContent>
                    {['available', 'rented', 'maintenance'].map(status => (
                      <div key={status} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="capitalize text-gray-600 font-medium">{status}</span>
                        <Badge variant={status === 'available' ? 'success' : status === 'rented' ? 'info' : 'warning'}>
                          {cars.filter(c => c.status === status).length}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <Card>
              <CardHeader className="flex justify-between items-center">
                <h3 className="font-bold text-xl">All Bookings</h3>
              </CardHeader>
              <CardContent>
                <BookingTable bookings={bookings} onAction={(id, s) => statusMutation.mutate({ id, status: s })} />
              </CardContent>
            </Card>
          )}

          {activeTab === 'fleet' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Fleet Management</h3>
                <Button onClick={() => setShowAddCar(true)}><Plus className="w-4 h-4 mr-2" /> Add Vehicle</Button>
              </div>

              {showAddCar && (
                <Card className="mb-8">
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="font-bold">Add New Vehicle</h3>
                    <button onClick={() => setShowAddCar(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </CardHeader>
                  <CardContent>
                    <VehicleForm 
                      values={newCar} 
                      onChange={setNewCar} 
                      submitting={addCarMutation.isPending}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData();
                        Object.entries(newCar).forEach(([k, v]) => fd.append(k, v));
                        addCarMutation.mutate(fd);
                      }} 
                    />
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cars.map(car => (
                  <Card key={car.id} className="overflow-hidden">
                    <div className="h-40 relative">
                      <img src={car.image_url} alt={car.model} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <Badge variant={car.status === 'available' ? 'success' : 'warning'}>{car.status}</Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <h4 className="font-bold text-lg">{car.make} {car.model}</h4>
                      <p className="text-sm text-gray-500 mb-4">{car.location} • KES {car.price_per_day.toLocaleString()}/day</p>
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditingCar(car)}>Edit</Button>
                        <Button variant="danger" size="sm" className="flex-1" onClick={() => deleteCarMutation.mutate(car.id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex justify-between items-center">
              <h3 className="font-bold text-xl">Edit {editingCar.make} {editingCar.model}</h3>
              <button onClick={() => setEditingCar(null)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </CardHeader>
            <CardContent>
              <VehicleForm 
                values={editingCar} 
                onChange={setEditingCar} 
                isEdit
                submitting={updateCarMutation.isPending}
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  Object.entries(editingCar).forEach(([k, v]) => fd.append(k, v));
                  updateCarMutation.mutate({ id: editingCar.id, formData: fd });
                }} 
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
