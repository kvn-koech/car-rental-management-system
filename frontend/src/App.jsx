import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans text-secondary dark:text-white bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Routes>
        <Route path="/" element={
          <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <LandingPage />
          </>
        } />

        <Route path="/admin/login" element={
          <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <AdminLogin />
          </>
        } />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
