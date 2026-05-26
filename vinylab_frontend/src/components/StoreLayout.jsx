import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import logo from '../assets/logo.png';

const StoreLayout = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // States
  const [activeView, setActiveView] = useState('store'); // 'store' | 'profile' | 'orders'
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

  // Orders States
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
  const loadVinyls = async () => {
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

  const loadCategories = async () => {
    try {
      const data = await fetchApi('/categoria');
      const names = ['Todos', ...data.map(c => c.nombre)];
      setDbCategories(names);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const loadOrders = async () => {
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
    loadVinyls();
    loadCategories();
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
      loadOrders();
    }
  }, [activeView]);

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

  // Cart Operations
  const addToCart = (vinyl) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === vinyl.id);
      if (existing) {
        if (existing.quantity >= vinyl.stock) {
          alert(`Lo sentimos, no hay más stock disponible para "${vinyl.titulo}".`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === vinyl.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (vinyl.stock < 1) {
          alert(`Lo sentimos, "${vinyl.titulo}" está agotado.`);
          return prevCart;
        }
        return [...prevCart, { ...vinyl, quantity: 1 }];
      }
    });
    setIsCartOpen(true); // Auto-open cart for premium feel
  };

  const updateQuantity = (vinylId, newQty, stock) => {
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

  const removeFromCart = (vinylId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== vinylId));
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.precio) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
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

      alert(`¡Pedido #${response.id} realizado con éxito!`);
      setCart([]);
      setIsCartOpen(false);
      loadVinyls(); // Reload vinyls to refresh stocks
      setActiveView('orders'); // Open orders view
    } catch (err) {
      alert(err.message || 'Error al procesar el pedido. Inténtelo de nuevo.');
    }
  };

  const handleRefreshStore = async () => {
    setIsRefreshing(true);
    await Promise.all([loadVinyls(), loadCategories()]);
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
        <button className="store-brand" onClick={() => setActiveView('store')} title="Ir a la tienda">
          <img src={logo} alt="VinyLab Logo" className="store-logo" />
          <span className="store-title">VinyLab</span>
        </button>

        <div className="store-nav-actions">
          {/* Cart Button */}
          <button
            type="button"
            className="nav-btn"
            style={{ position: 'relative' }}
            onClick={() => setIsCartOpen(true)}
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
                  className={`dropdown-item ${activeView === 'orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('orders');
                    setIsDropdownOpen(false);
                  }}
                >
                  📋 Mis Pedidos
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
              <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <div className="spinning-vinyl-wrapper">
                  <div className="spinning-vinyl-outer" style={{ animationPlayState: 'running' }}>
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
                  <div className="spinning-vinyl-outer" style={{ animationPlayState: isRefreshing ? 'running' : 'paused' }}>
                    <div className="spinning-vinyl-grooves"></div>
                    <div className="spinning-vinyl-grooves-2"></div>
                    <div className="spinning-vinyl-center">
                      <div className="spinning-vinyl-hole"></div>
                    </div>
                  </div>
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
            ) : filteredVinyls.length === 0 ? (
              <div className="empty-store-container fade-in" style={{ padding: '3rem 2rem' }}>
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
              <div className="vinyl-grid fade-in">
                {filteredVinyls.map(vinyl => (
                  <div key={vinyl.id} className="vinyl-card">
                    <div className="vinyl-cover-container">
                      <span className="vinyl-category-badge">{vinyl.categoria ? vinyl.categoria.nombre : 'General'}</span>
                      {vinyl.portada ? (
                        <img src={vinyl.portada} alt={vinyl.titulo} className="vinyl-cover-img" />
                      ) : (
                        <div style={{ fontSize: '4.5rem', userSelect: 'none' }}>💿</div>
                      )}
                      
                      <div className="vinyl-hover-disc">
                        <div className="vinyl-hover-disc-grooves"></div>
                        <div className="vinyl-hover-disc-center"></div>
                      </div>
                    </div>
                    
                    <div className="vinyl-info">
                      <h3 className="vinyl-card-title" title={vinyl.titulo}>{vinyl.titulo}</h3>
                      <p className="vinyl-card-artist">{vinyl.artista ? vinyl.artista.nombre : 'Artista Desconocido'}</p>
                      
                      <div className="vinyl-card-meta">
                        <span className="vinyl-card-year">{vinyl.anioLanzamiento}</span>
                        {vinyl.stock > 5 ? (
                          <span className="vinyl-stock-badge in-stock">En Stock ({vinyl.stock})</span>
                        ) : vinyl.stock > 0 ? (
                          <span className="vinyl-stock-badge low-stock">¡Últimas {vinyl.stock} u.!</span>
                        ) : (
                          <span className="vinyl-stock-badge out-of-stock">Agotado</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="vinyl-card-footer">
                      <span className="vinyl-card-price">{parseFloat(vinyl.precio).toFixed(2)} €</span>
                      <button 
                        type="button" 
                        className="btn-add-cart" 
                        onClick={() => addToCart(vinyl)}
                        disabled={vinyl.stock <= 0}
                      >
                        {vinyl.stock <= 0 ? 'Agotado' : '🛒 Añadir'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeView === 'orders' ? (
          /* My Orders View */
          <div className="orders-view-container fade-in">
            <div className="orders-view-header">
              <h2 className="orders-view-title">Mis Pedidos</h2>
              <p className="orders-view-subtitle">Consulta el historial y los detalles de tus compras en VinyLab</p>
            </div>
            
            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinning-vinyl-wrapper" style={{ width: '80px', height: '80px' }}>
                  <div className="spinning-vinyl-outer" style={{ animationPlayState: 'running' }}>
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
                  className="btn-secondary-outline" 
                  onClick={() => setActiveView('store')}
                  style={{ maxWidth: '200px' }}
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
                    <div key={order.id} className="order-card">
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
                        <div className="order-header-meta" style={{ minWidth: '120px' }}>
                          <span className="order-meta-label">Estado</span>
                          <span className={`order-status-badge ${order.estado.toLowerCase()}`}>
                            {order.estado}
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
                                    <div style={{ fontSize: '1.5rem' }}>💿</div>
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
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2 className="cart-drawer-title">
                🛒 Tu Carrito
              </h2>
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
            </div>
            
            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-vinyl">💿</div>
                  <h3>Tu carrito está vacío</h3>
                  <p>Parece que aún no has agregado nada. ¡Explora nuestro catálogo y llévate tu música favorita!</p>
                  <button 
                    type="button" 
                    className="btn-accent" 
                    onClick={() => setIsCartOpen(false)}
                    style={{ marginTop: '1rem' }}
                  >
                    Volver a comprar
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-cover">
                      {item.portada ? (
                        <img src={item.portada} alt={item.titulo} />
                      ) : (
                        <div style={{ fontSize: '2rem' }}>💿</div>
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
                        onClick={() => removeFromCart(item.id)}
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
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button 
                          type="button" 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
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
                  onClick={handleCheckout}
                >
                  Completar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreLayout;
