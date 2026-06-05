import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaCrud from './TablaCrud';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;


const PanelControl = ({ toggleTheme, isDarkMode, setToken }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Triggers de refresco compartidos para borrados en cascada
  const [viniloRefreshTrigger, setViniloRefreshTrigger] = useState(0);
  const [pedidoRefreshTrigger, setPedidoRefreshTrigger] = useState(0);

  const cierreSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  const tabs = [
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'pedidos', label: 'Pedidos' },
  ];

  const obtenerConfiguracionTabla = () => {
    switch (activeTab) {
      case 'usuarios':
        return {
          endpoint: 'usuario',
          title: 'Gestión de Usuarios',
          formTitle: 'Usuarios',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'email', label: 'Email' },
            { key: 'rolId', label: 'Rol', type: 'select', selectEndpoint: 'rol', optionLabel: 'nombre', render: (row) => row.rol ? row.rol.nombre : row.rolId },
            { key: 'direccion', label: 'Dirección', required: false },
            { key: 'contrasena', label: 'Contraseña', type: 'password', hideInTable: true, required: (editingId) => !editingId },
          ]
        };
      default:
        return null;
    }
  };

  const config = obtenerConfiguracionTabla();

  const mostrarCatalogo = () => (
    <div className="admin-column-layout">
      <TablaCrud 
        endpoint="vinilo"
        title="Vinilos"
        refreshTrigger={viniloRefreshTrigger}
        columns={[
          { key: 'id', label: 'ID' },
          { 
            key: 'portada', 
            label: 'Portada', 
            type: 'image', 
            required: false, 
            render: (row) => (
              <div className="table-portada-preview">
                {row.portada ? (
                  <img 
                    src={row.portada} 
                    alt={row.titulo} 
                    onError={(e) => { e.target.src = FALLBACK_SVG; }}
                  />
                ) : (
                  <div className="table-portada-fallback">💿</div>
                )}
              </div>
            )
          },
          { key: 'titulo', label: 'Título' },
          { 
            key: 'descripcion', 
            label: 'Descripción', 
            type: 'textarea', 
            required: false, 
            render: (row) => (
              <div className="table-description-preview" title={row.descripcion}>
                {row.descripcion || '-'}
              </div>
            )
          },
          { key: 'precio', label: 'Precio', type: 'number' },
          { key: 'stock', label: 'Stock', type: 'number' },
          { key: 'anioLanzamiento', label: 'Año', type: 'number' },
          { key: 'categoriaId', label: 'Categoría', type: 'select', selectEndpoint: 'categoria', optionLabel: 'nombre', render: (row) => row.categoria ? row.categoria.nombre : row.categoriaId },
          { key: 'artistaId', label: 'Artista', type: 'select', selectEndpoint: 'artista', optionLabel: 'nombre', render: (row) => row.artista ? row.artista.nombre : row.artistaId },
        ]}
      />
      <TablaCrud 
        endpoint="categoria"
        title="Categorías"
        onDeleteSuccess={() => setViniloRefreshTrigger(prev => prev + 1)}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'nombre', label: 'Nombre' },
        ]}
      />
      <TablaCrud 
        endpoint="artista"
        title="Artistas"
        onDeleteSuccess={() => setViniloRefreshTrigger(prev => prev + 1)}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'nombre', label: 'Nombre' },
        ]}
      />
    </div>
  );

  const mostrarPedidos = () => (
    <div className="admin-column-layout">
      <TablaCrud 
        endpoint="pedido"
        title="Pedidos"
        canAdd={false}
        refreshTrigger={pedidoRefreshTrigger}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'usuarioId', label: 'Usuario', type: 'select', selectEndpoint: 'usuario', optionLabel: 'nombre', render: (row) => row.usuario ? row.usuario.nombre : row.usuarioId },
          { key: 'importeTotal', label: 'Importe Total', type: 'number', render: (row) => `${parseFloat(row.importeTotal).toFixed(2)} €` },
          { key: 'estado', label: 'Estado', render: (row) => row.estado === 'PAGADO' || row.estado === 'pagado' || row.estado === 'PENDIENTE_ENVIO' || row.estado === 'pendiente_envio' ? 'Pendiente de envío' : row.estado },
          { key: 'fechaCreacion', label: 'Fecha Creación', hideInForm: true, render: (row) => new Date(row.fechaCreacion).toLocaleString('es-ES') },
        ]}
        expandableRowRender={(pedido) => {
          if (!pedido.vinilos || pedido.vinilos.length === 0) {
            return <div className="no-details">No hay detalles asociados a este pedido.</div>;
          }
          return (
            <div className="pedido-details-expand">
              <h4>Detalles del pedido</h4>
              <table className="pedido-details-table">
                <thead>
                  <tr>
                    <th className="col-cover">Portada</th>
                    <th>Vinilo</th>
                    <th>Artista</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.vinilos.map((item) => {
                    const vinilo = item.vinilo || {};
                    const precio = parseFloat(vinilo.precio) || 0;
                    const subtotal = precio * item.cantidad;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="table-portada-preview">
                            {vinilo.portada ? (
                              <img 
                                src={vinilo.portada} 
                                alt={vinilo.titulo} 
                                onError={(e) => { e.target.src = FALLBACK_SVG; }}
                              />
                            ) : (
                              <div className="table-portada-fallback">💿</div>
                            )}
                          </div>
                        </td>
                        <td><strong>{vinilo.titulo || `Vinilo #${item.viniloId}`}</strong></td>
                        <td>{vinilo.artista?.nombre || '-'}</td>
                        <td>{precio.toFixed(2)} €</td>
                        <td>{item.cantidad}</td>
                        <td><strong>{subtotal.toFixed(2)} €</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }}
      />
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Mobile Admin Header */}
      <header className="admin-mobile-header">
        <button 
          type="button" 
          className={`admin-hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Menú de Administración"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </header>

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>VinyLab</h2>
          {/* Mobile Close Button in Sidebar */}
          <button 
            type="button" 
            className="admin-sidebar-close-btn" 
            onClick={() => setIsSidebarOpen(false)}
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
                setIsSidebarOpen(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button 
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
          <button className="admin-logout-btn" onClick={() => { cierreSesion(); setIsSidebarOpen(false); }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="admin-content">
        {activeTab === 'catalogo' ? (
          mostrarCatalogo()
        ) : activeTab === 'pedidos' ? (
          mostrarPedidos()
        ) : (
          config && (
            <TablaCrud 
              key={config.endpoint} // reset state on tab change
              endpoint={config.endpoint}
              columns={config.columns}
              title={config.title}
              formTitle={config.formTitle}
              onDeleteSuccess={config.endpoint === 'usuario' ? () => setPedidoRefreshTrigger(prev => prev + 1) : undefined}
            />
          )
        )}

      </main>
    </div>
  );
};

export default PanelControl;
