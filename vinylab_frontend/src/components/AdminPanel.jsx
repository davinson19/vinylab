import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from './CrudTable';

const AdminPanel = () => {
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
          <h2>VinyLab Admin</h2>
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
