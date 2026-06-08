import logo from '../../assets/logo.png';
import { useLanguage } from '../../utils/LanguageContext';

const NavbarTienda = ({
  activeView,
  setActiveView,
  toggleTheme,
  isDarkMode,
  user,
  loadingUser,
  cartItemCount,
  cierreSesion,
  setIsCartOpen,
  isDropdownOpen,
  setIsDropdownOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  dropdownRef
}) => {
  const { t } = useLanguage();

  return (
    <header className="store-navbar">
      <button 
        type="button"
        className="store-brand" 
        onClick={() => { setActiveView('store'); setIsMobileMenuOpen(false); }} 
        title={t('volverTienda')}
      >
        <img src={logo} alt="VinyLab Logo" className="store-logo" />
        <span className="store-title">VinyLab</span>
      </button>

      <div className="store-nav-actions">
        {/* Cart Button */}
        <button
          type="button"
          className="nav-btn nav-btn-relative"
          onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
          title={t('verCarrito')}
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
            title={isDarkMode ? t('modoDia') : t('modoNoche')}
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
              type="button"
              className={`user-avatar-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title={t('miCuenta')}
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
                    {loadingUser ? t('cargando') : user ? user.nombre : t('cliente')}
                  </div>
                </div>
                
                <button 
                  type="button"
                  className={`dropdown-item ${activeView === 'orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('orders');
                    setIsDropdownOpen(false);
                  }}
                >
                  {t('historialPedidos')}
                </button>

                <button 
                  type="button"
                  className={`dropdown-item ${activeView === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveView('profile');
                    setIsDropdownOpen(false);
                  }}
                >
                  {t('configuracion')}
                </button>

                <div className="dropdown-divider"></div>

                <button type="button" className="dropdown-item logout" onClick={cierreSesion}>
                  {t('cerrarSesion')}
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
          title={t('menu')}
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
  );
};

export default NavbarTienda;
