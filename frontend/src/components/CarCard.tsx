import React from 'react';
import { computeCatalogDisplay } from '../services/carService';

export function CarCard({ car, activeTransaction }: { car: any; activeTransaction?: any }) {
  const display = computeCatalogDisplay(car.status, activeTransaction);

  return (
    <div className="border rounded p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{car.name}</h3>
        <span
          className={`px-2 py-1 rounded text-white ${
            display.badgeColor === 'green'
              ? 'bg-green-600'
              : display.badgeColor === 'yellow'
              ? 'bg-yellow-600'
              : display.badgeColor === 'orange'
              ? 'bg-orange-600'
              : 'bg-gray-600'
          }`}
        >
          {display.label}
        </span>
      </div>

      {display.expiresAt && (
        <p className="text-sm text-yellow-700 mt-1">
          Booking berakhir: {new Date(display.expiresAt).toLocaleString()}
        </p>
      )}

      <button
        disabled={!display.canBook}
        className={`mt-3 px-4 py-2 rounded ${
          display.canBook
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        Pesan
      </button>
    </div>
  );
}