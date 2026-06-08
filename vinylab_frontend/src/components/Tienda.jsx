import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import Footer from './Footer';
import { useLanguage } from '../utils/LanguageContext';

// Import subcomponents
import NavbarTienda from './tienda/NavbarTienda';
import MenuMovil from './tienda/MenuMovil';
import BannerBienvenida from './tienda/BannerBienvenida';
import BarraFiltros from './tienda/BarraFiltros';
import GridVinilos from './tienda/GridVinilos';
import HistorialPedidos from './tienda/HistorialPedidos';
import FormularioPerfil from './tienda/FormularioPerfil';
import Carrito from './tienda/Carrito';
import ModalPago from './tienda/ModalPago';
import ModalDetallesVinilo from './tienda/ModalDetallesVinilo';

const Tienda = ({ toggleTheme, isDarkMode, setToken }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

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

  // Cart States (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    if (!userId) return [];
    const saved = localStorage.getItem(`vinylab_cart_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

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
  const [selectedVinyl, setSelectedVinyl] = useState(null);

  // Synchronize cart with localStorage
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`vinylab_cart_${userId}`, JSON.stringify(cart));
  }, [cart, userId]);

  // Load vinyls and categories from database
  const cargarVinilos = useCallback(async () => {
    setLoadingVinyls(true);
    try {
      const data = await fetchApi('/vinilo');
      setVinyls(data);
    } catch (err) {
      console.error("Error al cargar vinilos:", err);
    } finally {
      setLoadingVinyls(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const data = await fetchApi('/categoria');
      const names = ['Todos', ...data.map(c => c.nombre)];
      setDbCategories(names);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  }, []);

  const cargarPedidos = useCallback(async () => {
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
  }, []);

  // Fetch data on mount
  useEffect(() => {
    let active = true;
    const fetchOnMount = async () => {
      // Defer to microtask queue to avoid synchronous setState inside useEffect warning
      await Promise.resolve();
      if (active) {
        cargarVinilos();
        cargarCategorias();
      }
    };
    fetchOnMount();
    return () => {
      active = false;
    };
  }, [cargarVinilos, cargarCategorias]);

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
    let active = true;
    const loadUserProfile = async () => {
      await Promise.resolve();
      if (!userId) {
        if (active) setLoadingUser(false);
        return;
      }
      try {
        const data = await fetchApi(`/usuario/${userId}`);
        if (active) {
          setUser(data);
          setProfileData({
            nombre: data.nombre || '',
            email: data.email || '',
            direccion: data.direccion || '',
            contrasena: '' // leave password blank
          });
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    loadUserProfile();
    return () => {
      active = false;
    };
  }, [userId]);

  // Load orders when active view is 'orders'
  useEffect(() => {
    let active = true;
    const fetchOrdersView = async () => {
      await Promise.resolve();
      if (active && activeView === 'orders') {
        cargarPedidos();
      }
    };
    fetchOrdersView();
    return () => {
      active = false;
    };
  }, [activeView, cargarPedidos]);

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
    setToken(null);
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
      const payload = {
        nombre: profileData.nombre,
        email: profileData.email,
        direccion: profileData.direccion
      };

      if (profileData.contrasena.trim() !== '') {
        payload.contrasena = profileData.contrasena;
      }

      const response = await fetchApi(`/usuario/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        setToken(response.access_token);
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
          showToast(t('noQuedanUnidades'), 'error');
          return prevCart;
        }
        showToast(t('anadidoCarrito'));
        return prevCart.map(item =>
          item.id === vinyl.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (vinyl.stock < 1) {
          showToast(t('noQuedanUnidades'), 'error');
          return prevCart;
        }
        showToast(t('anadidoCarrito'));
        return [...prevCart, { ...vinyl, quantity: 1 }];
      }
    });
  };

  const actualizarCantidad = (vinylId, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      alert(`${t('soloQuedanParte1')}${stock}${t('soloQuedanParte2')}`);
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

  const comprarYa = (vinyl) => {
    if (vinyl.stock <= 0) {
      showToast(t('noQuedanUnidades'), 'error');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === vinyl.id);
      if (existing) {
        return prevCart;
      }
      return [...prevCart, { ...vinyl, quantity: 1 }];
    });

    setSelectedVinyl(null);
    setIsPaymentOpen(true);
    setIsCartOpen(false);
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

    console.log("enviarPago: token =", token);
    console.log("enviarPago: userId =", userId);

    if (!userId) {
      setPaymentError('No se pudo identificar al usuario logueado. Por favor, cierre sesión e inicie sesión de nuevo.');
      return;
    }

    const { numero, nombre, expiracion, cvv } = paymentData;
    if (numero.replace(/\s/g, '').length !== 16) {
      setPaymentError(t('payErrorTarjeta'));
      return;
    }
    if (!nombre.trim()) {
      setPaymentError(t('payErrorTitular'));
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
      setPaymentError(t('payErrorExp'));
      return;
    }
    if (cvv.length !== 3) {
      setPaymentError(t('payErrorCvv'));
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate validation / bank delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        usuarioId: Number(userId),
        importeTotal: parseFloat(cartTotal.toFixed(2)),
        estado: 'PENDIENTE_ENVIO',
        vinilos: cart.map(item => ({
          viniloId: item.id,
          cantidad: item.quantity
        }))
      };

      await fetchApi('/pedido', {
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
    const matchesCategory = activeCategory === 'Todos' || activeCategory === 'All' || (vinyl.categoria && vinyl.categoria.nombre === activeCategory);
    
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    
    const matchesTitle = vinyl.titulo && vinyl.titulo.toLowerCase().includes(q);
    const matchesArtist = vinyl.artista && vinyl.artista.nombre && vinyl.artista.nombre.toLowerCase().includes(q);
    const matchesYear = vinyl.anioLanzamiento && vinyl.anioLanzamiento.toString().includes(q);
    
    return matchesCategory && (matchesTitle || matchesArtist || matchesYear);
  });

  return (
    <div className="store-layout fade-in">
      <NavbarTienda
        activeView={activeView}
        setActiveView={setActiveView}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        user={user}
        loadingUser={loadingUser}
        cartItemCount={cartItemCount}
        cierreSesion={cierreSesion}
        setIsCartOpen={setIsCartOpen}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        dropdownRef={dropdownRef}
      />

      <MenuMovil
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        user={user}
        loadingUser={loadingUser}
        cierreSesion={cierreSesion}
      />

      {activeView === 'store' && <BannerBienvenida user={user} />}

      {/* Main Content Area */}
      <main className="store-content">
        {activeView === 'store' ? (
          <div className="fade-in">
            <BarraFiltros
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              dbCategories={dbCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <GridVinilos
              vinyls={vinyls}
              filteredVinyls={filteredVinyls}
              loadingVinyls={loadingVinyls}
              isRefreshing={isRefreshing}
              onRefresh={actualizarTienda}
              onSelectVinyl={setSelectedVinyl}
              onAddToCart={agregarAlCarrito}
              setSearchQuery={setSearchQuery}
              setActiveCategory={setActiveCategory}
            />
          </div>
        ) : activeView === 'orders' ? (
          <HistorialPedidos
            orders={orders}
            loadingOrders={loadingOrders}
            setActiveView={setActiveView}
          />
        ) : (
          <FormularioPerfil
            profileData={profileData}
            savingProfile={savingProfile}
            profileSuccess={profileSuccess}
            profileError={profileError}
            onChange={cambioPerfil}
            onSubmit={enviarPerfil}
          />
        )}
      </main>

      <Carrito
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        cart={cart}
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        onUpdateQty={actualizarCantidad}
        onRemove={eliminarDelCarrito}
        onClear={vaciarCarrito}
        onCheckout={abrirPasarelaPago}
      />

      <ModalPago
        isOpen={isPaymentOpen}
        setIsOpen={setIsPaymentOpen}
        cart={cart}
        cartTotal={cartTotal}
        paymentData={paymentData}
        paymentError={paymentError}
        isProcessing={isProcessingPayment}
        isSuccess={isPaymentSuccess}
        onChange={cambioInputPago}
        onSubmit={enviarPago}
      />

      <ModalDetallesVinilo
        vinyl={selectedVinyl}
        onClose={() => setSelectedVinyl(null)}
        onAddToCart={agregarAlCarrito}
        onBuyNow={comprarYa}
      />

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

      <Footer />
    </div>
  );
};

export default Tienda;
