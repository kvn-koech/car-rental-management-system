import React from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const BookingTable = ({ bookings, onAction }) => {
  if (bookings.length === 0) {
    return <div className="p-8 text-center text-gray-500">No bookings found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Car', 'Customer', 'Dates', 'Amount', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.car}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{b.user_name}</div>
                <div className="text-xs">{b.user_phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                KES {b.total_price?.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={
                  b.status === 'confirmed' ? 'success' : 
                  b.status === 'pending' ? 'warning' : 
                  b.status === 'completed' ? 'info' : 'danger'
                }>
                  {b.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {b.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => onAction(b.id, 'confirmed')}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => onAction(b.id, 'cancelled')}>Reject</Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => onAction(b.id, 'completed')}>Complete</Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
