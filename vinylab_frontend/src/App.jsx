import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import StoreLayout from './components/StoreLayout';
import './store.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 300);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const renderHome = () => {
    if (!token) {
      return <Auth toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.rolName === 'Admin') {
        return <Navigate to="/admin" replace />;
      }
      return <StoreLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
    } catch (e) {
      localStorage.removeItem('token');
      return <Auth toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={renderHome()} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPanel toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
