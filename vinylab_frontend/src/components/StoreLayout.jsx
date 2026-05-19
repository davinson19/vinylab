import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import logo from '../assets/logo.png';

const StoreLayout = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // States
  const [activeView, setActiveView] = useState('store'); // 'store' | 'profile'
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    direccion: '',
    contrasena: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Store Mock State for visual completeness
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Decode user ID from token
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch (e) {
      console.error("Error al decodificar el token:", e);
    }
  }

  // Fetch current user details on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        setLoadingUser(false);
        return;
      }
      try {
        const data = await fetchApi(`/usuario/${userId}`);
        setUser(data);
        setProfileData({
          nombre: data.nombre || '',
          email: data.email || '',
          direccion: data.direccion || '',
          contrasena: '' // leave password blank
        });
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      // Build update payload
      const payload = {
        nombre: profileData.nombre,
        direccion: profileData.direccion
      };

      // Only add password if the user typed something
      if (profileData.contrasena.trim() !== '') {
        payload.contrasena = profileData.contrasena;
      }

      const updatedUser = await fetchApi(`/usuario/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      setUser(updatedUser);
      setProfileData(prev => ({
        ...prev,
        contrasena: '' // Clear password field
      }));
      setProfileSuccess('¡Perfil actualizado con éxito!');
    } catch (err) {
      setProfileError(err.message || 'Error al guardar los cambios');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRefreshStore = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const categories = ['Todos', 'Rock', 'Pop', 'Jazz', 'Electrónica', 'Hip-Hop', 'Clásica'];

  return (
    <div className="store-layout fade-in">
      {/* Header/Navbar */}
      <header className="store-navbar">
        <button className="store-brand" onClick={() => setActiveView('store')} title="Ir a la tienda">
          <img src={logo} alt="VinyLab Logo" className="store-logo" />
          <span className="store-title">VinyLab</span>
        </button>

        <div className="store-nav-actions">
          {/* Theme Toggler */}
          <button
            type="button"
            className="nav-btn"
            onClick={toggleTheme}
            title={isDarkMode ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* User Icon & Dropdown */}
          <div className="user-dropdown-container" ref={dropdownRef}>
            <button 
              className={`user-avatar-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Mi Cuenta"
            >
              <svg className="user-avatar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">
                    {loadingUser ? 'Cargando...' : user ? user.nombre : 'Cliente VinyLab'}
                  </div>
                  <div className="dropdown-user-role">Cliente</div>
                </div>
                
                <button 
                  className={`dropdown-item ${activeView === 'store' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('store');
                    setIsDropdownOpen(false);
                  }}
                >
                  💿 Ir al Catálogo
                </button>

                <button 
                  className={`dropdown-item ${activeView === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('profile');
                    setIsDropdownOpen(false);
                  }}
                >
                  ⚙️ Configurar Cuenta
                </button>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item logout" onClick={handleLogout}>
                  🚪 Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="store-content">
        {activeView === 'store' ? (
          <div className="fade-in">
            {/* Welcome Banner */}
            <div className="store-welcome-banner">
              <h1>¡Hola{user ? `, ${user.nombre}` : ''}! Bienvenido a VinyLab</h1>
              <p>Tu laboratorio de vinilos de confianza. Explora y descubre la música que mueve tu mundo.</p>
            </div>

            {/* Filter and search bar */}
            <div className="store-filter-bar">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar vinilo, artista o año..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-tags">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-tag ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid (Empty State) */}
            <div className="empty-store-container fade-in">
              <div className="spinning-vinyl-wrapper">
                <div className="spinning-vinyl-outer" style={{ animationPlayState: isRefreshing ? 'running' : 'paused' }}>
                  <div className="spinning-vinyl-grooves"></div>
                  <div className="spinning-vinyl-grooves-2"></div>
                  <div className="spinning-vinyl-center">
                    <div className="spinning-vinyl-hole"></div>
                  </div>
                </div>
                {/* Vinyl Tone Arm / Needle */}
                <svg className="spinning-vinyl-needle" style={{ transform: isRefreshing ? 'rotate(35deg)' : 'rotate(15deg)' }} viewBox="0 0 100 100">
                  <path d="M70 20 L40 65 L45 70" stroke="var(--text-muted)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <rect x="36" y="65" width="10" height="15" rx="2" fill="var(--primary)" transform="rotate(-30 41 72)" />
                </svg>
              </div>

              <h2 className="empty-store-title">El catálogo está en preparación</h2>
              <p className="empty-store-text">
                Actualmente no hay vinilos disponibles en nuestra base de datos.
                Nuestros curadores musicales y administradores están trabajando para agregar los mejores éxitos muy pronto.
              </p>
              
              <button 
                type="button" 
                className="btn-accent" 
                onClick={handleRefreshStore}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Actualizando catálogo...' : '🔄 Comprobar Novedades'}
              </button>
            </div>
          </div>
        ) : (
          /* Profile Configuration View */
          <div className="profile-view-container fade-in">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Configuración de Usuario</h2>
                <p className="profile-card-subtitle">Administra y actualiza la información de tu perfil de VinyLab</p>
              </div>

              {profileError && <div className="error-message fade-in" style={{ marginBottom: '1.5rem' }}>{profileError}</div>}
              {profileSuccess && <div className="success-message fade-in" style={{ marginBottom: '1.5rem' }}>{profileSuccess}</div>}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-nombre">Nombre Completo</label>
                  <input
                    type="text"
                    id="profile-nombre"
                    name="nombre"
                    className="form-input"
                    placeholder="Tu nombre completo"
                    value={profileData.nombre}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">Correo Electrónico</label>
                  <div className="input-with-badge">
                    <input
                      type="email"
                      id="profile-email"
                      className="form-input"
                      style={{ paddingRight: '6.5rem', opacity: 0.7 }}
                      value={profileData.email}
                      disabled
                    />
                    <span className="input-badge">🔒 Bloqueado</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-direccion">Dirección de Envío</label>
                  <input
                    type="text"
                    id="profile-direccion"
                    name="direccion"
                    className="form-input"
                    placeholder="Tu dirección de envío física"
                    value={profileData.direccion}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-contrasena">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="profile-contrasena"
                    name="contrasena"
                    className="form-input"
                    placeholder="•••••••• (dejar en blanco para no cambiar)"
                    value={profileData.contrasena}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="profile-form-footer">
                  <div className="profile-actions-row">
                    <button 
                      type="button" 
                      className="btn-secondary-outline"
                      onClick={() => setActiveView('store')}
                    >
                      Volver a la Tienda
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ flex: 1, marginTop: 0 }}
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>

                  <button 
                    type="button" 
                    className="profile-logout-btn"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoreLayout;
