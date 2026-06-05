import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import PanelControl from './components/PanelControl';
import RutaProtegida from './components/RutaProtegida';
import Tienda from './components/Tienda';
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

  const alternarTema = () => setIsDarkMode(!isDarkMode);

  const renderizarInicio = () => {
    if (!token) {
      return <Auth toggleTheme={alternarTema} isDarkMode={isDarkMode} setToken={setToken} />;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.rolName === 'Admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/catalogo" replace />;
    } catch (e) {
      localStorage.removeItem('token');
      return <Auth toggleTheme={alternarTema} isDarkMode={isDarkMode} setToken={setToken} />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={renderizarInicio()} />
      <Route path="/admin" element={
        <RutaProtegida requiereAdmin={true}>
          <PanelControl toggleTheme={alternarTema} isDarkMode={isDarkMode} setToken={setToken} />
        </RutaProtegida>
      } />
      <Route path="/catalogo" element={
        <RutaProtegida requiereAdmin={false}>
          <Tienda toggleTheme={alternarTema} isDarkMode={isDarkMode} setToken={setToken} />
        </RutaProtegida>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
