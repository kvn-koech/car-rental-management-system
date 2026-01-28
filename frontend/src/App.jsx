import { useState } from 'react'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-secondary">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Karibu</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-gray-600 hover:text-primary transition">Home</a>
              <a href="#" className="text-gray-600 hover:text-primary transition">Fleet</a>
              <a href="#" className="text-gray-600 hover:text-primary transition">About</a>
              <a href="#" className="text-gray-600 hover:text-primary transition">Contact</a>
              <button className="px-5 py-2 text-primary font-medium hover:bg-blue-50 rounded-lg transition">
                Log In
              </button>
              <button className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md hover:shadow-lg transition">
                Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-primary focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-md">Home</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-md">Fleet</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-md">About</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-md">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-secondary mb-6">
            Experience Kenya with <br className="hidden md:block" />
            <span className="text-primary transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Premium Comfort</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            From city cruisers to safari-ready 4x4s. Enjoy affordable rates, instant booking, and 24/7 support for your journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-primary text-white text-lg font-semibold rounded-full hover:bg-blue-600 shadow-lg hover:shadow-primary/30 transition transform hover:-translate-y-1">
              Browse Fleet
            </button>
            <button className="px-8 py-4 bg-white text-secondary text-lg font-semibold rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition">
              How it Works
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-gray-600">Book your ride in minutes. No paperwork, just a seamless digital experience.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Best Rates Guaranteed</h3>
              <p className="text-gray-600">Competitive daily rental prices with no hidden fees or surprise charges.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Insurance</h3>
              <p className="text-gray-600">Drive with peace of mind knowing every trip is fully verified and insured.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
