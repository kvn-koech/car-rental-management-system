import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-gray-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="text-2xl font-bold text-primary dark:text-blue-400">Karibu</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition">Home</Link>
            <Link to="/fleet" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition">Fleet</Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition">About</Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition">Contact</Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-3 ml-2">
              <Link to="/admin/login" className="px-5 py-2 text-primary dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition">
                Log In
              </Link>
              <Link to="/signup" className="px-5 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 shadow-md hover:shadow-lg transition">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu and toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 focus:outline-none"
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
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 border-t border-gray-100 dark:border-slate-800 backdrop-blur-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md">Home</Link>
            <Link to="/fleet" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md">Fleet</Link>
            <Link to="/about" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md">About</Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md">Contact</Link>
            <div className="pt-4 flex flex-col gap-2">
              <Link to="/admin/login" className="w-full text-center px-4 py-2 text-primary dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg">
                Log In
              </Link>
              <Link to="/signup" className="w-full text-center px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 shadow-md">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
