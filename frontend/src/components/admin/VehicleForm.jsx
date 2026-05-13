import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const VehicleForm = ({ values, onChange, onSubmit, submitting, isEdit = false }) => {
  const TRANSMISSION_OPTIONS = ['automatic', 'manual'];
  const FUEL_OPTIONS = ['petrol', 'diesel', 'electric', 'hybrid'];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Make" 
          placeholder="e.g. Toyota" 
          required 
          value={values.make} 
          onChange={e => onChange({ ...values, make: e.target.value })} 
        />
        <Input 
          label="Model" 
          placeholder="e.g. Land Cruiser" 
          required 
          value={values.model} 
          onChange={e => onChange({ ...values, model: e.target.value })} 
        />
        <Input 
          label="Year" 
          type="number" 
          required 
          value={values.year} 
          onChange={e => onChange({ ...values, year: e.target.value })} 
        />
        <Input 
          label="Price per Day (KES)" 
          type="number" 
          required 
          value={values.price_per_day} 
          onChange={e => onChange({ ...values, price_per_day: e.target.value })} 
        />
        <Input 
          label="Location" 
          placeholder="e.g. Nairobi" 
          required 
          value={values.location} 
          onChange={e => onChange({ ...values, location: e.target.value })} 
        />
        <Input 
          label="Seats" 
          type="number" 
          required 
          value={values.seats} 
          onChange={e => onChange({ ...values, seats: e.target.value })} 
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Transmission</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.transmission} 
            onChange={e => onChange({ ...values, transmission: e.target.value })}
          >
            {TRANSMISSION_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel Type</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.fuel_type} 
            onChange={e => onChange({ ...values, fuel_type: e.target.value })}
          >
            {FUEL_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea 
            rows={3} 
            placeholder="Short description of the car..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            value={values.description} 
            onChange={e => onChange({ ...values, description: e.target.value })} 
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Save Vehicle'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
