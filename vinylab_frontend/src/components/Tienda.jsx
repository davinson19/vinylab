import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import logo from '../assets/logo.png';
import welcomeGif from '../assets/banner.gif';

const Tienda = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // States
  const [activeView, setActiveView] = useState('store'); // 'store' | 'profile' | 'orders'
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Real Database Data States
  const [vinyls, setVinyls] = useState([]);
  const [loadingVinyls, setLoadingVinyls] = useState(true);
  const [dbCategories, setDbCategories] = useState(['Todos']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cart States (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('vinylab_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Orders States
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Payment Gateway States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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

  // Synchronize cart with localStorage
  useEffect(() => {
    localStorage.setItem('vinylab_cart', JSON.stringify(cart));
  }, [cart]);

  // Load vinyls and categories from database
  const cargarVinilos = async () => {
    setLoadingVinyls(true);
    try {
      const data = await fetchApi('/vinilo');
      setVinyls(data);
    } catch (err) {
      console.error("Error al cargar vinilos:", err);
    } finally {
      setLoadingVinyls(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await fetchApi('/categoria');
      const names = ['Todos', ...data.map(c => c.nombre)];
      setDbCategories(names);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const cargarPedidos = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchApi('/pedido');
      const sorted = data.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      setOrders(sorted);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    cargarVinilos();
    cargarCategorias();
  }, []);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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

  // Load orders when active view is 'orders'
  useEffect(() => {
    if (activeView === 'orders') {
      cargarPedidos();
    }
  }, [activeView]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const clicFuera = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clicFuera);
    return () => {
      document.removeEventListener('mousedown', clicFuera);
    };
  }, []);

  const cierreSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const cambioPerfil = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const enviarPerfil = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      // Build update payload
      const payload = {
        nombre: profileData.nombre,
        email: profileData.email,
        direccion: profileData.direccion
      };

      // Only add password if the user typed something
      if (profileData.contrasena.trim() !== '') {
        payload.contrasena = profileData.contrasena;
      }

      const response = await fetchApi(`/usuario/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }

      setUser(response.user || response);
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

  // Cart Operations
  const agregarAlCarrito = (vinyl) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === vinyl.id);
      if (existing) {
        if (existing.quantity >= vinyl.stock) {
          showToast('No quedan más unidades', 'error');
          return prevCart;
        }
        showToast('Añadido al carrito');
        return prevCart.map(item =>
          item.id === vinyl.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (vinyl.stock < 1) {
          showToast('No quedan más unidades', 'error');
          return prevCart;
        }
        showToast('Añadido al carrito');
        return [...prevCart, { ...vinyl, quantity: 1 }];
      }
    });
  };

  const actualizarCantidad = (vinylId, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      alert(`Lo sentimos, solo hay ${stock} unidades disponibles.`);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === vinylId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const eliminarDelCarrito = (vinylId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== vinylId));
  };

  const vaciarCarrito = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.precio) * item.quantity), 0);

  const abrirPasarelaPago = () => {
    if (cart.length === 0) return;
    setPaymentError('');
    setPaymentData({
      numero: '',
      nombre: '',
      expiracion: '',
      cvv: ''
    });
    setIsPaymentOpen(true);
    setIsCartOpen(false); // Close cart drawer
  };

  const cambioInputPago = (e) => {
    let { name, value } = e.target;
    
    if (name === 'numero') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiracion') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    } else if (name === 'nombre') {
      value = value.toUpperCase();
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const enviarPago = async (e) => {
    e.preventDefault();
    setPaymentError('');
    
    const { numero, nombre, expiracion, cvv } = paymentData;
    if (numero.replace(/\s/g, '').length !== 16) {
      setPaymentError('El número de tarjeta debe tener 16 dígitos.');
      return;
    }
    if (!nombre.trim()) {
      setPaymentError('Por favor, ingresa el nombre del titular.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
      setPaymentError('La fecha de expiración debe tener formato MM/YY.');
      return;
    }
    if (cvv.length !== 3) {
      setPaymentError('El código CVV debe tener 3 dígitos.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate validation / bank delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        importeTotal: parseFloat(cartTotal.toFixed(2)),
        estado: 'PAGADO',
        vinilos: cart.map(item => ({
          viniloId: item.id,
          cantidad: item.quantity
        }))
      };

      const response = await fetchApi('/pedido', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setIsProcessingPayment(false);
      setIsPaymentSuccess(true);

      // Auto redirect after 2.5 seconds
      setTimeout(() => {
        setCart([]);
        setIsPaymentOpen(false);
        setIsPaymentSuccess(false);
        cargarVinilos(); // Reload vinyls to refresh stocks
        setActiveView('orders'); // Open orders view
      }, 2500);

    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Error al procesar el pago. Inténtelo de nuevo.');
    }
  };

  const actualizarTienda = async () => {
    setIsRefreshing(true);
    await Promise.all([cargarVinilos(), cargarCategorias()]);
    setIsRefreshing(false);
  };

  // Filter vinyls dynamically
  const filteredVinyls = vinyls.filter(vinyl => {
    const matchesCategory = activeCategory === 'Todos' || (vinyl.categoria && vinyl.categoria.nombre === activeCategory);
    
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    
    const matchesTitle = vinyl.titulo && vinyl.titulo.toLowerCase().includes(q);
    const matchesArtist = vinyl.artista && vinyl.artista.nombre && vinyl.artista.nombre.toLowerCase().includes(q);
    const matchesYear = vinyl.anioLanzamiento && vinyl.anioLanzamiento.toString().includes(q);
    
    return matchesCategory && (matchesTitle || matchesArtist || matchesYear);
  });

  return (
    <div className="store-layout fade-in">
      {/* Header/Navbar */}
      <header className="store-navbar">
        <button className="store-brand" onClick={() => { setActiveView('store'); setIsMobileMenuOpen(false); }} title="Ir a la tienda">
          <img src={logo} alt="VinyLab Logo" className="store-logo" />
          <span className="store-title">VinyLab</span>
        </button>

        <div className="store-nav-actions">
          {/* Cart Button */}
          <button
            type="button"
            className="nav-btn nav-btn-relative"
            onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
            title="Ver Carrito de Compras"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge-indicator">{cartItemCount}</span>
            )}
          </button>

          {/* Desktop Only Actions */}
          <div className="desktop-nav-actions">
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
                  </div>
                  
                  <button 
                    className={`dropdown-item ${activeView === 'orders' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveView('orders');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Historial de pedidos
                  </button>

                  <button 
                    className={`dropdown-item ${activeView === 'profile' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveView('profile');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Configuración
                  </button>


                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item logout" onClick={cierreSesion}>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            type="button"
            className={`nav-btn hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menú de Navegación"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()} aria-label="Navegación móvil">
            <div className="mobile-menu-header">
              <h2 className="mobile-menu-title">Menú</h2>
              <button 
                type="button" 
                className="btn-close-menu" 
                onClick={() => setIsMobileMenuOpen(false)}
                title="Cerrar Menú"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-body">
              <div className="mobile-user-name">
                {loadingUser ? 'Cargando...' : user ? user.nombre : 'Cliente VinyLab'}
              </div>

              <div className="mobile-menu-items">
                <button 
                  className={`mobile-menu-item ${activeView === 'store' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('store');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Catálogo de Vinilos
                </button>

                <button 
                  className={`mobile-menu-item ${activeView === 'orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('orders');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Historial de pedidos
                </button>

                <button 
                  className={`mobile-menu-item ${activeView === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('profile');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Configuración
                </button>

                <div className="mobile-menu-divider"></div>

                {/* Theme Toggle row inside mobile menu */}
                <div className="mobile-theme-row">
                  <span>Modo {isDarkMode ? 'Día' : 'Noche'}</span>
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
                </div>

                <div className="mobile-menu-divider"></div>

                <button className="mobile-menu-item logout" onClick={() => { cierreSesion(); setIsMobileMenuOpen(false); }}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}

      {activeView === 'store' && (
        <section 
          className="store-welcome-banner-full" 
          style={{ '--welcome-banner-url': `url(${welcomeGif})` }}
        >
          <h1 className="welcome-title">¡Hola{user ? `, ${user.nombre}` : ''}! Bienvenido a VinyLab</h1>
        </section>
      )}

      {/* Main Content Area */}
      <main className="store-content">
        {activeView === 'store' ? (
          <div className="fade-in">

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
                {dbCategories.map(cat => (
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

            {/* Catalog Grid */}
            {loadingVinyls ? (
              <div className="spinning-vinyl-container">
                <div className="spinning-vinyl-wrapper">
                  <div className="spinning-vinyl-outer running">
                    <div className="spinning-vinyl-grooves"></div>
                    <div className="spinning-vinyl-grooves-2"></div>
                    <div className="spinning-vinyl-center">
                      <div className="spinning-vinyl-hole"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : vinyls.length === 0 ? (
              <div className="empty-store-container fade-in">
                <div className="spinning-vinyl-wrapper">
                  <div className={`spinning-vinyl-outer ${isRefreshing ? 'running' : 'paused'}`}>
                    <div className="spinning-vinyl-grooves"></div>
                    <div className="spinning-vinyl-grooves-2"></div>
                    <div className="spinning-vinyl-center">
                      <div className="spinning-vinyl-hole"></div>
                    </div>
                  </div>
                  <svg className={`spinning-vinyl-needle ${isRefreshing ? 'refreshing' : ''}`} viewBox="0 0 100 100">
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
                  onClick={actualizarTienda}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Actualizando catálogo...' : '🔄 Comprobar Novedades'}
                </button>
              </div>
            ) : filteredVinyls.length === 0 ? (
              <div className="empty-store-container fade-in compact">
                <h2 className="empty-store-title">Sin resultados</h2>
                <p className="empty-store-text">
                  No hemos encontrado ningún vinilo que coincida con tus filtros actuales o tu criterio de búsqueda.
                </p>
                <button 
                  type="button" 
                  className="btn-accent" 
                  onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <section className="vinyl-grid fade-in" aria-label="Catálogo de Vinilos">
                {filteredVinyls.map(vinyl => (
                  <article key={vinyl.id} className="vinyl-card">
                    <div className="vinyl-cover-container">
                      <span className="vinyl-category-badge">{vinyl.categoria ? vinyl.categoria.nombre : 'General'}</span>
                      {vinyl.portada ? (
                        <img src={vinyl.portada} alt={vinyl.titulo} className="vinyl-cover-img" />
                      ) : (
                        <div className="fallback-cover-large">💿</div>
                      )}
                    </div>
                    
                    <div className="vinyl-info">
                      <h3 className="vinyl-card-title" title={vinyl.titulo}>{vinyl.titulo}</h3>
                      <p className="vinyl-card-artist">{vinyl.artista ? vinyl.artista.nombre : 'Artista Desconocido'}</p>
                      
                      <div className="vinyl-card-meta">
                        <span className="vinyl-card-year">{vinyl.anioLanzamiento}</span>
                        {vinyl.stock <= 0 ? (
                          <span className="vinyl-stock-badge out-of-stock">Agotado</span>
                        ) : vinyl.stock <= 3 ? (
                          <span className="vinyl-stock-badge low-stock">¡Últimas unidades!</span>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="vinyl-card-footer">
                      <span className="vinyl-card-price">{parseFloat(vinyl.precio).toFixed(2)} €</span>
                      <button 
                        type="button" 
                        className="btn-add-cart" 
                        onClick={() => agregarAlCarrito(vinyl)}
                        disabled={vinyl.stock <= 0}
                        title={vinyl.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        ) : activeView === 'orders' ? (
          /* My Orders View */
          <section className="orders-view-container fade-in" aria-label="Historial de Pedidos">
            <header className="orders-view-header">
              <h2 className="orders-view-title">Historial de pedidos</h2>
              <p className="orders-view-subtitle">Consulta el historial y los detalles de tus compras en VinyLab</p>
            </header>
            
            {loadingOrders ? (
              <div className="flex-center-padded">
                <div className="spinning-vinyl-wrapper small">
                  <div className="spinning-vinyl-outer running">
                    <div className="spinning-vinyl-grooves"></div>
                    <div className="spinning-vinyl-grooves-2"></div>
                    <div className="spinning-vinyl-center">
                      <div className="spinning-vinyl-hole"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-orders-container fade-in">
                <div className="empty-orders-icon">📋</div>
                <h3 className="empty-orders-title">No tienes pedidos</h3>
                <p className="empty-orders-text">
                  Aún no has realizado ninguna compra en VinyLab. Explora nuestro catálogo y agrega tus vinilos favoritos para realizar tu primer pedido.
                </p>
                <button 
                  type="button" 
                  className="btn-secondary-outline btn-width-limit" 
                  onClick={() => setActiveView('store')}
                >
                  Ir a la Tienda
                </button>
              </div>
            ) : (
              <div className="orders-list fade-in">
                {orders.map(order => {
                  const orderDate = new Date(order.fechaCreacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <article key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-header-meta">
                          <span className="order-meta-label">Pedido</span>
                          <span className="order-meta-value order-id">#{order.id}</span>
                        </div>
                        <div className="order-header-meta">
                          <span className="order-meta-label">Fecha</span>
                          <span className="order-meta-value">{orderDate}</span>
                        </div>
                        <div className="order-header-meta">
                          <span className="order-meta-label">Total</span>
                          <span className="order-meta-value">{parseFloat(order.importeTotal).toFixed(2)} €</span>
                        </div>
                        <div className="order-header-meta order-header-meta-wide">
                          <span className="order-meta-label">Estado</span>
                          <span className={`order-status-badge ${order.estado.toLowerCase()}`}>
                            {order.estado === 'PAGADO' || order.estado === 'pagado' || order.estado === 'PENDIENTE_ENVIO' || order.estado === 'pendiente_envio' ? 'Pendiente de envío' : order.estado}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-card-body">
                        <div className="order-items-list">
                          {order.vinilos && order.vinilos.map(detail => {
                            const unitPrice = detail.vinilo ? parseFloat(detail.vinilo.precio) : 0;
                            const subtotal = unitPrice * detail.cantidad;
                            
                            return (
                              <div key={detail.id} className="order-item-row">
                                <div className="order-item-cover">
                                  {detail.vinilo && detail.vinilo.portada ? (
                                    <img src={detail.vinilo.portada} alt={detail.vinilo.titulo} />
                                  ) : (
                                    <div className="fallback-cover-small">💿</div>
                                  )}
                                </div>
                                <div className="order-item-details">
                                  <div className="order-item-title-artist">
                                    <h4 className="order-item-title">{detail.vinilo ? detail.vinilo.titulo : 'Vinilo Eliminado'}</h4>
                                    <p className="order-item-artist">{detail.vinilo && detail.vinilo.artista ? detail.vinilo.artista.nombre : 'Artista Desconocido'}</p>
                                  </div>
                                  <div className="order-item-price-unit">
                                    {unitPrice.toFixed(2)} € / ud.
                                  </div>
                                  <div className="order-item-quantity">
                                    Cantidad: {detail.cantidad}
                                  </div>
                                  <div className="order-item-subtotal">
                                    {subtotal.toFixed(2)} €
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="order-card-footer">
                        <span className="order-total-label">Total pagado:</span>
                        <span className="order-total-price">{parseFloat(order.importeTotal).toFixed(2)} €</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          /* Profile Configuration View */
          <section className="profile-view-container fade-in" aria-label="Configuración de Perfil">
            <article className="profile-card">
              <header className="profile-card-header">
                <h2 className="profile-card-title">Configuración de Usuario</h2>
                <p className="profile-card-subtitle">Administra y actualiza la información de tu perfil de VinyLab</p>
              </header>

              {profileError && <div className="error-message fade-in spaced-error">{profileError}</div>}
              {profileSuccess && <div className="success-message fade-in spaced-success">{profileSuccess}</div>}

              <form onSubmit={enviarPerfil}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-nombre">Nombre Completo</label>
                  <input
                    type="text"
                    id="profile-nombre"
                    name="nombre"
                    className="form-input"
                    placeholder="Tu nombre completo"
                    value={profileData.nombre}
                    onChange={cambioPerfil}
                    required
                  />
                </div>

                 <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="profile-email"
                    name="email"
                    className="form-input"
                    placeholder="Tu correo electrónico"
                    value={profileData.email}
                    onChange={cambioPerfil}
                    required
                  />
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
                    onChange={cambioPerfil}
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
                    onChange={cambioPerfil}
                  />
                </div>

                <div className="profile-form-footer">
                  <button 
                    type="submit" 
                    className="btn-primary btn-flex-no-margin" 
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </article>
          </section>
        )}
      </main>

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()} aria-label="Carrito de compras">
            <header className="cart-drawer-header">
              <div className="cart-drawer-header-left">
                <h2 className="cart-drawer-title">
                  Tu carrito
                </h2>
                {cart.length > 0 && (
                  <button 
                    type="button" 
                    className="btn-clear-cart" 
                    onClick={vaciarCarrito}
                    title="Vaciar carrito"
                  >
                    Vaciar
                  </button>
                )}
              </div>
              <button 
                type="button" 
                className="btn-close-cart" 
                onClick={() => setIsCartOpen(false)}
                title="Cerrar Carrito"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </header>
            
            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-vinyl">💿</div>
                  <h3>Tu carrito está vacío</h3>
                  <p>Parece que aún no has agregado nada. ¡Explora nuestro catálogo y llévate tu música favorita!</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-cover">
                      {item.portada ? (
                        <img src={item.portada} alt={item.titulo} />
                      ) : (
                        <div className="fallback-cover-medium">💿</div>
                      )}
                    </div>
                    
                    <div className="cart-item-info">
                      <h4 className="cart-item-title" title={item.titulo}>{item.titulo}</h4>
                      <p className="cart-item-artist">{item.artista ? item.artista.nombre : 'Artista'}</p>
                      <span className="cart-item-price">{parseFloat(item.precio).toFixed(2)} €</span>
                    </div>
                    
                    <div className="cart-item-actions">
                      <button 
                        type="button" 
                        className="btn-remove-item"
                        onClick={() => eliminarDelCarrito(item.id)}
                        title="Eliminar producto"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                      
                      <div className="cart-item-qty">
                        <button 
                          type="button" 
                          className="qty-btn"
                          onClick={() => actualizarCantidad(item.id, item.quantity - 1, item.stock)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button 
                          type="button" 
                          className="qty-btn"
                          onClick={() => actualizarCantidad(item.id, item.quantity + 1, item.stock)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-totals-row">
                  <span className="cart-totals-label">Total ({cartItemCount} {cartItemCount === 1 ? 'artículo' : 'artículos'}):</span>
                  <span className="cart-totals-value">{cartTotal.toFixed(2)} €</span>
                </div>
                <button 
                  type="button" 
                  className="btn-checkout"
                  onClick={abrirPasarelaPago}
                >
                  Completar Compra
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Payment Gateway Modal Overlay */}
      {isPaymentOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card fade-in">
            {isPaymentSuccess ? (
              <div className="payment-success-screen">
                <div className="success-icon-wrapper animate-pop">
                  <svg className="success-checkmark" viewBox="0 0 52 52">
                    <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <h2>¡Pago exitoso!</h2>
              </div>
            ) : (
              <div className="payment-modal-body">
                <button 
                  type="button" 
                  className="btn-close-payment" 
                  onClick={() => setIsPaymentOpen(false)}
                  disabled={isProcessingPayment}
                  title="Cancelar y cerrar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <div className="payment-layout-cols">
                  <div className="payment-card-preview-col">
                    <h3>Resumen de Pago</h3>

                    {/* Breakdown with details of the order */}
                    <div className="payment-order-details">
                      {cart.map(item => (
                        <div key={item.id} className="payment-detail-item">
                          <div className="payment-detail-cover">
                            {item.portada ? (
                              <img src={item.portada} alt={item.titulo} />
                            ) : (
                              <div className="payment-detail-fallback-cover">💿</div>
                            )}
                          </div>
                          <div className="payment-detail-info">
                            <h4 className="payment-detail-title" title={item.titulo}>{item.titulo}</h4>
                            <p className="payment-detail-artist-qty">
                              {item.artista ? item.artista.nombre : 'Artista'} • Cantidad: {item.quantity}
                            </p>
                          </div>
                          <div className="payment-detail-subtotal">
                            {(parseFloat(item.precio) * item.quantity).toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="payment-summary-box">
                      <div className="summary-row total">
                        <span>Total a Pagar:</span>
                        <span>{cartTotal.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  <div className="payment-form-col">
                    <h2>Introduce tu tarjeta</h2>

                    {paymentError && (
                      <div className="error-message payment-error-alert fade-in">
                        ⚠️ {paymentError}
                      </div>
                    )}

                    <form onSubmit={enviarPago}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="card-nombre">Nombre del Titular</label>
                        <input
                          type="text"
                          id="card-nombre"
                          name="nombre"
                          className="form-input"
                          placeholder=""
                          value={paymentData.nombre}
                          onChange={cambioInputPago}
                          disabled={isProcessingPayment}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="card-numero">Número de Tarjeta</label>
                        <input
                          type="text"
                          id="card-numero"
                          name="numero"
                          className="form-input card-num-input"
                          placeholder=""
                          value={paymentData.numero}
                          onChange={cambioInputPago}
                          disabled={isProcessingPayment}
                          required
                        />
                      </div>

                      <div className="form-row-two-cols">
                        <div className="form-group">
                          <label className="form-label" htmlFor="card-expiracion">Vencimiento</label>
                          <input
                            type="text"
                            id="card-expiracion"
                            name="expiracion"
                            className="form-input"
                            placeholder="MM/YY"
                            value={paymentData.expiracion}
                            onChange={cambioInputPago}
                            disabled={isProcessingPayment}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="card-cvv">CVV</label>
                          <input
                            type="password"
                            id="card-cvv"
                            name="cvv"
                            className="form-input"
                            placeholder="•••"
                            value={paymentData.cvv}
                            onChange={cambioInputPago}
                            disabled={isProcessingPayment}
                            required
                          />
                        </div>
                      </div>

                      <div className="payment-actions-row">
                        <button
                          type="button"
                          className="btn-payment-cancel"
                          onClick={() => setIsPaymentOpen(false)}
                          disabled={isProcessingPayment}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn-payment-submit"
                          disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? (
                            <span className="spinner-loader-row">
                              <span className="payment-spinner"></span>
                              Verificando...
                            </span>
                          ) : (
                            `Pagar ${cartTotal.toFixed(2)} €`
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`toast-notification ${toast.type || 'success'} ${toast.show ? 'show' : ''}`}>
        <div className="toast-content">
          {toast.type === 'error' ? (
            <svg className="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ) : (
            <svg className="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          <span className="toast-text">{toast.message}</span>
        </div>
      </div>
    </div>
  );
};

export default Tienda;
