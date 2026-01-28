import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary">
          Karibu Car Rental
        </h1>
        <p className="text-xl text-gray-600">
          Premium Car Hire Services in Kenya
        </p>
        <button className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-black transition">
          Browse Cars
        </button>
      </div>
    </div>
  )
}

export default App
