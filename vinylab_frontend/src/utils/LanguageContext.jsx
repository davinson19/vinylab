import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  es: {
    // Footer
    copyright: "Todos los derechos reservados.",
    
    // Login / Registro
    nombre: "Nombre",
    nombrePlaceholder: "Tu nombre completo",
    email: "Correo Electrónico",
    emailPlaceholder: "correo@ejemplo.com",
    contrasena: "Contraseña",
    contrasenaPlaceholder: "••••••••",
    direccion: "Dirección (Opcional)",
    direccionPlaceholder: "Tu dirección de envío",
    procesando: "Procesando...",
    iniciarSesion: "Iniciar Sesión",
    registrarse: "Registrarse",
    noCuenta: "¿No tienes una cuenta? ",
    yaCuenta: "¿Ya tienes una cuenta? ",
    registrateAqui: "Regístrate aquí",
    iniciaSesion: "Inicia sesión",
    exitoLogin: "¡Inicio de sesión exitoso!",
    exitoRegistro: "¡Registro completado exitosamente! Ahora puedes iniciar sesión.",
    
    // Catálogo / Barra de navegación
    tienda: "VinyLab",
    verCarrito: "Ver Carrito de Compras",
    modoDia: "Cambiar a Modo Día",
    modoNoche: "Cambiar a Modo Noche",
    miCuenta: "Mi Cuenta",
    historialPedidos: "Historial de pedidos",
    configuracion: "Configuración",
    cerrarSesion: "Cerrar Sesión",
    menu: "Menú",
    catalogo: "Catálogo de Vinilos",
    buscarPlaceholder: "Buscar vinilo, artista o año...",
    todos: "Todos",
    preparacion: "El catálogo está en preparación",
    noVinilos: "Actualmente no hay vinilos disponibles en nuestra base de datos. Nuestros curadores musicales y administradores están trabajando para agregar los mejores éxitos muy pronto.",
    comprobarNovedades: "🔄 Comprobar Novedades",
    actualizando: "Actualizando catálogo...",
    sinResultados: "Sin resultados",
    sinResultadosTexto: "No hemos encontrado ningún vinilo que coincida con tus filtros actuales o tu criterio de búsqueda.",
    limpiarFiltros: "Limpiar Filtros",
    ultimasUnidades: "¡Últimas unidades!",
    agotado: "Agotado",
    anadirCarrito: "Añadir al carrito",
    cargando: "Cargando...",
    cliente: "Cliente VinyLab",
    noQuedanUnidades: "No quedan más unidades",
    anadidoCarrito: "Añadir al carrito",
    soloQuedanParte1: "Lo sentimos, solo hay ",
    soloQuedanParte2: " unidades disponibles.",
    
    // Historial de pedidos
    pedidosTitulo: "Historial de pedidos",
    pedidosSub: "Consulta el historial y los detalles de tus compras en VinyLab",
    noPedidos: "No tienes pedidos",
    noPedidosTexto: "Aún no has realizado ninguna compra en VinyLab. Explora nuestro catálogo y agrega tus vinilos favoritos para realizar tu primer pedido.",
    volverTienda: "Ir a la Tienda",
    pedidoLabel: "Pedido",
    fechaLabel: "Fecha",
    totalLabel: "Total",
    estadoLabel: "Estado",
    pendienteEnvio: "Pendiente de envío",
    enviado: "Enviado",
    entregado: "Entregado",
    cantidadLabel: "Cantidad",
    totalPagadoLabel: "Total pagado:",
    
    // Perfil del usuario
    profileTitulo: "Configuración de Usuario",
    profileSub: "Administra y actualiza la información de tu perfil de VinyLab",
    profileNombre: "Nombre Completo",
    profileEmail: "Correo Electrónico",
    profileDireccion: "Dirección de Envío",
    profileDireccionPlaceholder: "Tu dirección de envío física",
    profileContrasena: "Nueva Contraseña",
    profileContrasenaPlaceholder: "•••••••• (dejar en blanco para no cambiar)",
    profileGuardando: "Guardando...",
    profileGuardar: "Guardar Cambios",
    profileExito: "¡Perfil actualizado con éxito!",
    
    // Carrito de compra
    cartTitulo: "Tu carrito",
    cartVaciar: "Vaciar",
    cartVacio: "Tu carrito está vacío",
    cartVacioTexto: "Parece que aún no has agregado nada. ¡Explora nuestro catálogo y llévate tu música favorita!",
    cartEliminarItem: "Eliminar producto",
    cartTotalLabel: "Total",
    cartArticulo: "artículo",
    cartArticulos: "artículos",
    cartComprar: "Completar Compra",
    
    // Pasarela de pago
    payResumen: "Resumen de Pago",
    payTotalPagar: "Total a Pagar:",
    payIntroduceTarjeta: "Introduce tu tarjeta",
    payNombreTitular: "Nombre del Titular",
    payNumeroTarjeta: "Número de Tarjeta",
    payVencimiento: "Vencimiento",
    payCvv: "CVV",
    payCancelar: "Cancelar",
    payVerificando: "Verificando...",
    payPagarBoton: "Pagar",
    payExitoso: "¡Pago exitoso!",
    payErrorTarjeta: "El número de tarjeta debe tener 16 dígitos.",
    payErrorTitular: "Por favor, ingresa el nombre del titular.",
    payErrorExp: "La fecha de expiración debe tener formato MM/YY.",
    payErrorCvv: "El código CVV debe tener 3 dígitos.",
    
    // Detalles del vinilo
    detallesVinilo: "Detalles del vinilo",
    comprarYa: "Comprar ya",
    anio: "Año de lanzamiento",
    stockDisponible: "Stock disponible",
    precio: "Precio",
    descripcion: "Descripción"
  },
  en: {
    // Footer
    copyright: "All rights reserved.",
    
    // Login / Registro
    nombre: "Name",
    nombrePlaceholder: "Your full name",
    email: "Email Address",
    emailPlaceholder: "email@example.com",
    contrasena: "Password",
    contrasenaPlaceholder: "••••••••",
    direccion: "Address (Optional)",
    direccionPlaceholder: "Your shipping address",
    procesando: "Processing...",
    iniciarSesion: "Log In",
    registrarse: "Register",
    noCuenta: "Don't have an account? ",
    yaCuenta: "Already have an account? ",
    registrateAqui: "Register here",
    iniciaSesion: "Log in",
    exitoLogin: "Login successful!",
    exitoRegistro: "Registration completed successfully! You can now log in.",
    
    // Catálogo / Barra de navegación
    tienda: "VinyLab",
    verCarrito: "View Shopping Cart",
    modoDia: "Switch to Day Mode",
    modoNoche: "Switch to Night Mode",
    miCuenta: "My Account",
    historialPedidos: "Order history",
    configuracion: "Settings",
    cerrarSesion: "Log Out",
    menu: "Menu",
    catalogo: "Vinyl Catalog",
    buscarPlaceholder: "Search vinyl, artist or year...",
    todos: "All",
    preparacion: "The catalog is in preparation",
    noVinilos: "Currently there are no vinyls available in our database. Our music curators and administrators are working to add the best hits very soon.",
    comprobarNovedades: "🔄 Check for Updates",
    actualizando: "Updating catalog...",
    sinResultados: "No results found",
    sinResultadosTexto: "We couldn't find any vinyl matching your current filters or search criteria.",
    limpiarFiltros: "Clear Filters",
    ultimasUnidades: "Low stock!",
    agotado: "Out of stock",
    anadirCarrito: "Add to cart",
    cargando: "Loading...",
    cliente: "VinyLab Customer",
    noQuedanUnidades: "No units left in stock",
    anadidoCarrito: "Added to cart",
    soloQuedanParte1: "Sorry, there are only ",
    soloQuedanParte2: " units available.",
    
    // Historial de pedidos
    pedidosTitulo: "Order History",
    pedidosSub: "Check the history and details of your purchases in VinyLab",
    noPedidos: "You have no orders",
    noPedidosTexto: "You have not made any purchases in VinyLab yet. Explore our catalog and add your favorite vinyls to place your first order.",
    volverTienda: "Go to Shop",
    pedidoLabel: "Order",
    fechaLabel: "Date",
    totalLabel: "Total",
    estadoLabel: "Status",
    pendienteEnvio: "Pending shipment",
    enviado: "Shipped",
    entregado: "Delivered",
    cantidadLabel: "Quantity",
    totalPagadoLabel: "Total paid:",
    
    // Perfil del usuario
    profileTitulo: "User Settings",
    profileSub: "Manage and update your VinyLab profile information",
    profileNombre: "Full Name",
    profileEmail: "Email Address",
    profileDireccion: "Shipping Address",
    profileDireccionPlaceholder: "Your physical shipping address",
    profileContrasena: "New Password",
    profileContrasenaPlaceholder: "•••••••• (leave blank to keep current)",
    profileGuardando: "Saving...",
    profileGuardar: "Save Changes",
    profileExito: "Profile updated successfully!",
    
    // Carrito de compra
    cartTitulo: "Your cart",
    cartVaciar: "Empty",
    cartVacio: "Your cart is empty",
    cartVacioTexto: "It looks like you haven't added anything yet. Explore our catalog and grab your favorite music!",
    cartEliminarItem: "Remove product",
    cartTotalLabel: "Total",
    cartArticulo: "item",
    cartArticulos: "items",
    cartComprar: "Complete Purchase",
    
    // Pasarela de pago
    payResumen: "Payment Summary",
    payTotalPagar: "Total to Pay:",
    payIntroduceTarjeta: "Enter your card details",
    payNombreTitular: "Cardholder Name",
    payNumeroTarjeta: "Card Number",
    payVencimiento: "Expiration Date",
    payCvv: "CVV",
    payCancelar: "Cancel",
    payVerificando: "Verifying...",
    payPagarBoton: "Pay",
    payExitoso: "Payment successful!",
    payErrorTarjeta: "Card number must be 16 digits.",
    payErrorTitular: "Please enter the cardholder name.",
    payErrorExp: "Expiration date must be in MM/YY format.",
    payErrorCvv: "CVV code must be 3 digits.",
    
    // Detalles del vinilo
    detallesVinilo: "Vinyl details",
    comprarYa: "Buy now",
    anio: "Release year",
    stockDisponible: "Available stock",
    precio: "Price",
    descripcion: "Description"
  }
};

// Proveedor de idioma que guarda la preferencia del usuario y traduce los textos del sitio web.
export const LanguageProvider = ({ children }) => {
  const [idioma, setIdioma] = useState(() => {
    return localStorage.getItem('idioma') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('idioma', idioma);
  }, [idioma]);

  // Cambia el idioma actual y lo guarda en el almacenamiento del navegador.
  const cambiarIdioma = (nuevoIdioma) => {
    if (translations[nuevoIdioma]) {
      setIdioma(nuevoIdioma);
    }
  };

  // Obtiene el texto traducido según la palabra clave que le pasemos.
  const t = (key) => {
    return translations[idioma]?.[key] || translations['es']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ idioma, cambiarIdioma, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook que permite a cualquier componente obtener fácilmente las traducciones y cambiar el idioma
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe estar dentro de un LanguageProvider');
  }
  return context;
};
