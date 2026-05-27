import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaCrud from './TablaCrud';

const PanelControl = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');

  const cierreSesion = () => {
    localStorage.removeItem('token');
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
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'email', label: 'Email' },
            { key: 'rolId', label: 'Rol', type: 'select', selectEndpoint: 'rol', optionLabel: 'nombre', render: (row) => row.rol ? row.rol.nombre : row.rolId },
            { key: 'direccion', label: 'Dirección', required: false },
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
                  <img src={row.portada} alt={row.titulo} />
                ) : (
                  <div className="table-portada-fallback">💿</div>
                )}
              </div>
            )
          },
          { key: 'titulo', label: 'Título' },
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
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'nombre', label: 'Nombre' },
        ]}
      />
      <TablaCrud 
        endpoint="artista"
        title="Artistas"
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
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'usuarioId', label: 'Usuario', type: 'select', selectEndpoint: 'usuario', optionLabel: 'nombre', render: (row) => row.usuario ? row.usuario.nombre : row.usuarioId },
          { key: 'importeTotal', label: 'Importe Total', type: 'number', render: (row) => `${parseFloat(row.importeTotal).toFixed(2)} €` },
          { key: 'estado', label: 'Estado' },
          { key: 'fechaCreacion', label: 'Fecha Creación', hideInForm: true, render: (row) => new Date(row.fechaCreacion).toLocaleString('es-ES') },
        ]}
        expandableRowRender={(pedido) => {
          if (!pedido.vinilos || pedido.vinilos.length === 0) {
            return <div className="no-details">No hay detalles asociados a este pedido.</div>;
          }
          return (
            <div className="pedido-details-expand">
              <h4>📦 Desglose de Productos del Pedido #{pedido.id}</h4>
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
                          <div className="table-portada-preview table-portada-preview-small">
                            {vinilo.portada ? (
                              <img src={vinilo.portada} alt={vinilo.titulo} />
                            ) : (
                              <div className="table-portada-fallback table-portada-fallback-small">💿</div>
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
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>VinyLab</h2>
        </div>
        <div className="admin-sidebar-menu">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-menu-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
          <button className="admin-logout-btn" onClick={cierreSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div className="admin-content">
        
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
            />
          )
        )}

      </div>
    </div>
  );
};

export default PanelControl;
