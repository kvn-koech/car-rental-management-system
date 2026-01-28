import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background Gradients - Adjusted for Dark Mode */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent dark:to-transparent opacity-70"></div>
        <div className="absolute inset-y-0 left-0 -z-10 w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-blue-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-secondary dark:text-white mb-8">
            Karibu <br className="hidden md:block" />
            <span className="text-primary dark:text-blue-400 transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-blue-600">KPremium Rides</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            From city cruisers to safari-ready 4x4s. Enjoy affordable rates, instant booking, and 24/7 support for your journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/fleet" className="px-8 py-4 bg-primary dark:bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-600 dark:hover:bg-blue-500 shadow-lg hover:shadow-primary/30 dark:hover:shadow-blue-500/30 transition transform hover:-translate-y-1 block text-center">
              Browse Fleet
            </Link>
            <button className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur text-secondary dark:text-white text-lg font-semibold rounded-full border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition">
              How it Works
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border-t border-b border-white/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/60 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition duration-300 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-primary dark:text-blue-400 group-hover:scale-110 transition">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary dark:text-white">Instant Booking</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Book your ride in minutes. No paperwork, just a seamless digital experience crafted for your convenience.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/60 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition duration-300 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-primary dark:text-blue-400 group-hover:scale-110 transition">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary dark:text-white">Best Rates Guaranteed</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Competitive daily rental prices with no hidden fees or surprise charges. What you see is what you pay.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/60 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition duration-300 group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-primary dark:text-blue-400 group-hover:scale-110 transition">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary dark:text-white">Premium Insurance</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Drive with peace of mind knowing every trip is fully verified and insured. Safety is our priority.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
