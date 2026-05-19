import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

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

  return (
    <Routes>
      <Route path="/" element={<Auth toggleTheme={toggleTheme} isDarkMode={isDarkMode} />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPanel toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
