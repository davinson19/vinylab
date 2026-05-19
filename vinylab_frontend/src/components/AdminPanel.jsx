import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from './CrudTable';

const AdminPanel = ({ toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const tabs = [
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'roles', label: 'Roles' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'artistas', label: 'Artistas' },
    { id: 'vinilos', label: 'Vinilos' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'detalles-pedido', label: 'Detalles de Pedido' },
  ];

  // Column definitions for different entities
  const getTableConfig = () => {
    switch (activeTab) {
      case 'usuarios':
        return {
          endpoint: 'usuario',
          title: 'Gestión de Usuarios',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'email', label: 'Email' },
            { key: 'rolId', label: 'Rol ID', type: 'number' },
            { key: 'direccion', label: 'Dirección', required: false },
            { key: 'verificado', label: 'Verificado', type: 'boolean' },
          ]
        };
      case 'roles':
        return {
          endpoint: 'rol',
          title: 'Gestión de Roles',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
          ]
        };
      case 'categorias':
        return {
          endpoint: 'categoria',
          title: 'Gestión de Categorías',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
          ]
        };
      case 'artistas':
        return {
          endpoint: 'artista',
          title: 'Gestión de Artistas',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
          ]
        };
      case 'vinilos':
        return {
          endpoint: 'vinilo',
          title: 'Gestión de Vinilos',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'titulo', label: 'Título' },
            { key: 'precio', label: 'Precio', type: 'number' },
            { key: 'stock', label: 'Stock', type: 'number' },
            { key: 'anioLanzamiento', label: 'Año', type: 'number' },
            { key: 'categoriaId', label: 'Categoría ID', type: 'number' },
            { key: 'artistaId', label: 'Artista ID', type: 'number' },
          ]
        };
      case 'pedidos':
        return {
          endpoint: 'pedido',
          title: 'Gestión de Pedidos',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'usuarioId', label: 'Usuario ID', type: 'number' },
            { key: 'importeTotal', label: 'Importe Total', type: 'number' },
            { key: 'estado', label: 'Estado' },
            { key: 'fechaCreacion', label: 'Fecha Creación', hideInForm: true },
          ]
        };
      case 'detalles-pedido':
        return {
          endpoint: 'detalle-pedido', // endpoint might be 'detalle-pedido' in NestJS based on module name
          title: 'Detalles de Pedido',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'pedidoId', label: 'Pedido ID', type: 'number' },
            { key: 'viniloId', label: 'Vinilo ID', type: 'number' },
            { key: 'cantidad', label: 'Cantidad', type: 'number' },
          ]
        };
      default:
        return null;
    }
  };

  const config = getTableConfig();

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
            className="admin-menu-btn" 
            onClick={toggleTheme}
            style={{ marginBottom: '0.5rem', width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          <button className="admin-logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div className="admin-content">
        {config && (
          <CrudTable 
            key={config.endpoint} // reset state on tab change
            endpoint={config.endpoint}
            columns={config.columns}
            title={config.title}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
