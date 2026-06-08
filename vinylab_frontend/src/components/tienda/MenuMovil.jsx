import { useLanguage } from '../../utils/LanguageContext';

const MenuMovil = ({
  isOpen,
  setIsOpen,
  activeView,
  setActiveView,
  toggleTheme,
  isDarkMode,
  user,
  loadingUser,
  cierreSesion
}) => {
  const { idioma, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
      <nav className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()} aria-label="Navegación móvil">
        <div className="mobile-menu-header">
          <h2 className="mobile-menu-title">{t('menu')}</h2>
          <button 
            type="button" 
            className="btn-close-menu" 
            onClick={() => setIsOpen(false)}
            title={t('payCancelar')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mobile-menu-body">
          <div className="mobile-user-name">
            {loadingUser ? t('cargando') : user ? user.nombre : t('cliente')}
          </div>

          <div className="mobile-menu-items">
            <button 
              type="button"
              className={`mobile-menu-item ${activeView === 'store' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('store');
                setIsOpen(false);
              }}
            >
              {t('catalogo')}
            </button>

            <button 
              type="button"
              className={`mobile-menu-item ${activeView === 'orders' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('orders');
                setIsOpen(false);
              }}
            >
              {t('historialPedidos')}
            </button>

            <button 
              type="button"
              className={`mobile-menu-item ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('profile');
                setIsOpen(false);
              }}
            >
              {t('configuracion')}
            </button>

            <div className="mobile-menu-divider"></div>

            {/* Theme Toggle row inside mobile menu */}
            <div className="mobile-theme-row">
              <span>{idioma === 'es' ? `Modo ${isDarkMode ? 'Día' : 'Noche'}` : `Mode ${isDarkMode ? 'Day' : 'Night'}`}</span>
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
            </div>

            <div className="mobile-menu-divider"></div>

            <button type="button" className="mobile-menu-item logout" onClick={() => { cierreSesion(); setIsOpen(false); }}>
              {t('cerrarSesion')}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MenuMovil;
