import React from 'react';
import Card from '../ui/Card';
import { DollarSign, ClipboardList, Car } from 'lucide-react';

const OverviewStats = ({ revenue, activeBookings, fleetSize }) => {
  const stats = [
    { label: 'Total Revenue', value: `KES ${revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-50' },
    { label: 'Active Bookings', value: activeBookings, icon: <ClipboardList className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Fleet Size', value: fleetSize, icon: <Car className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, i) => (
        <Card key={i} className="flex items-center p-6">
          <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mr-4`}>
            {s.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OverviewStats;
