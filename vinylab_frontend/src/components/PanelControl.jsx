import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaCrud from './admin/TablaCrud';
import SidebarAdmin from './admin/SidebarAdmin';
import HeaderAdmin from './admin/HeaderAdmin';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

// Panel principal de admin desde donde se gestionan usuarios, vinilos y pedidos
const PanelControl = ({ toggleTheme, isDarkMode, setToken }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [viniloRefreshTrigger, setViniloRefreshTrigger] = useState(0);
  const [pedidoRefreshTrigger, setPedidoRefreshTrigger] = useState(0);

  // Cierra la sesión borrando los datos guardados en el navegador y volviendo a la página de acceso
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

  // Configura columnas, nombres y campos según la pestaña activa
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

  // Muestra el catálogo con tablas para gestionar vinilos, categorías y artistas
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

  // Muestra los pedidos con un desglose de los productos comprados
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
          { 
            key: 'estado', 
            label: 'Estado', 
            type: 'select', 
            options: [
              { value: 'PENDIENTE_ENVIO', label: 'Pendiente de envío' },
              { value: 'ENVIADO', label: 'Enviado' },
              { value: 'ENTREGADO', label: 'Entregado' }
            ], 
            render: (row) => {
              const status = row.estado ? row.estado.toLowerCase() : '';
              if (status === 'pendiente_envio' || status === 'pendiente de envío' || status === 'pagado') {
                return 'Pendiente de envío';
              }
              if (status === 'enviado') {
                return 'Enviado';
              }
              if (status === 'entregado') {
                return 'Entregado';
              }
              return row.estado;
            }
          },
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
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <HeaderAdmin isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <SidebarAdmin
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        cierreSesion={cierreSesion}
      />

      <main className="admin-content">
        {activeTab === 'catalogo' ? (
          mostrarCatalogo()
        ) : activeTab === 'pedidos' ? (
          mostrarPedidos()
        ) : (
          config && (
            <TablaCrud 
              key={config.endpoint}
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
