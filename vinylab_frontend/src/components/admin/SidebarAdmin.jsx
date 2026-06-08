const SidebarAdmin = ({
  isOpen,
  setIsOpen,
  tabs,
  activeTab,
  setActiveTab,
  toggleTheme,
  isDarkMode,
  cierreSesion
}) => {
  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <h2>VinyLab</h2>
        <button 
          type="button" 
          className="admin-sidebar-close-btn" 
          onClick={() => setIsOpen(false)}
          title="Cerrar menú"
        >
          &times;
        </button>
      </div>
      <nav className="admin-sidebar-menu" aria-label="Menú de administración">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-menu-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setIsOpen(false);
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <button 
          type="button"
          className="admin-menu-btn admin-sidebar-theme-btn" 
          onClick={toggleTheme}
          title={isDarkMode ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
        >
          {isDarkMode ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        <button type="button" className="admin-logout-btn" onClick={() => { cierreSesion(); setIsOpen(false); }}>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
