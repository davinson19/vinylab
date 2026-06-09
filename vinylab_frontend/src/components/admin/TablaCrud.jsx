import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '../../utils/api';
import TablaDatosCrud from './TablaDatosCrud';
import ModalCrud from './ModalCrud';

// Componente de tabla inteligente que permite ver, crear, editar y eliminar datos del servidor
const TablaCrud = ({
  endpoint,
  columns,
  title,
  formTitle,
  canAdd = true,
  expandableRowRender,
  refreshTrigger,
  onDeleteSuccess
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expandedRows, setExpandedRows] = useState({});

  // Muestra u oculta los detalles de una fila específica
  const alternarExpansionFila = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectOptions, setSelectOptions] = useState({});

  // Carga toda la lista de datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchApi(`/${endpoint}`);
      setData(result);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Se conecta al servidor en segundo plano para escuchar cambios en tiempo real
  useEffect(() => {
    let active = true;
    
    const inicializar = async () => {
      await Promise.resolve();
      if (active) {
        cargarDatos();
      }
    };
    
    inicializar();

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const eventSource = new EventSource(`${baseUrl}/realtime/sse`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data: eventData } = payload;

        if (type.startsWith(`${endpoint}_`)) {
          console.log(`TablaCrud [${endpoint}] recibió evento en tiempo real:`, type, eventData);
          
          if (type === `${endpoint}_created`) {
            setData(prev => {
              if (prev.some(item => item.id === eventData.id)) return prev;
              return [eventData, ...prev];
            });
          } else if (type === `${endpoint}_updated`) {
            setData(prev => prev.map(item => item.id === eventData.id ? eventData : item));
          } else if (type === `${endpoint}_deleted`) {
            setData(prev => prev.filter(item => item.id !== eventData.id));
          }
        }
      } catch (err) {
        console.error(`Error al procesar evento SSE en TablaCrud [${endpoint}]:`, err);
      }
    };

    eventSource.onerror = (err) => {
      console.error(`Error en la conexión SSE de TablaCrud [${endpoint}]. Reconectando...`, err);
      eventSource.close();
    };

    return () => {
      active = false;
      eventSource.close();
    };
  }, [endpoint, cargarDatos]);

  const isFirstMount = useRef(true);
  // Recarga los datos cuando se dispara una alerta de cambio desde otro componente
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    cargarDatos();
  }, [refreshTrigger, cargarDatos]);

  // Busca y descarga las opciones para los campos de selección de categorías o artistas 
  useEffect(() => {
    const fetchOptions = async () => {
      const optionsData = {};
      for (const col of columns) {
        if (col.type === 'select') {
          if (col.options) {
            optionsData[col.key] = col.options;
          } else if (col.selectEndpoint) {
            try {
              const res = await fetchApi(`/${col.selectEndpoint}`);
              optionsData[col.key] = res;
            } catch (err) {
              console.error(`Error fetching options for ${col.key}:`, err);
            }
          }
        }
      }
      setSelectOptions(optionsData);
    };
    fetchOptions();
  }, [columns]);

  // Modal para crear un elemento nuevo o editar uno ya existente cargando sus datos
  const abrirModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      const copy = { ...item };
      delete copy.contrasena;
      
      columns.forEach(col => {
        if (col.type === 'number' && copy[col.key] !== undefined && copy[col.key] !== null && copy[col.key] !== '') {
          copy[col.key] = Number(copy[col.key]);
        }
      });
      
      setFormData(copy);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  // Cierra la ventana del formulario y limpia el contenido temporal
  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  // Actualiza los valores guardados del formulario cuando el usuario escribe en un campo
  const cambioInput = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    
    const col = columns.find(c => c.key === name);
    if (col && col.type === 'select') {
      const numVal = Number(value);
      parsedValue = value === '' ? '' : (isNaN(numVal) ? value : numVal);
    } else if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      parsedValue = e.target.checked;
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  // Guarda los datos en el servidor, validando primero que los números no sean menores a cero
  const enviarFormulario = async (e) => {
    e.preventDefault();

    for (const col of columns) {
      if (col.type === 'number') {
        const val = formData[col.key];
        if (val !== undefined && val !== '' && Number(val) < 0) {
          alert(`El campo "${col.label}" no puede ser negativo.`);
          return;
        }
      }
    }

    try {
      const payload = { ...formData };
      
      Object.keys(payload).forEach(key => {
        if (typeof payload[key] === 'object' && payload[key] !== null) {
          delete payload[key];
        }
      });

      if (editingId && (payload.contrasena === undefined || payload.contrasena === '')) {
        delete payload.contrasena;
      }

      if (editingId) {
        await fetchApi(`/${endpoint}/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi(`/${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      cerrarModal();
      cargarDatos();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Borra un registro pidiendo confirmación al usuario y advirtiendo si afectará a otros datos en cascada
  const eliminarRegistro = async (id) => {
    let mensajeConfirmacion = '¿Estás seguro de que deseas eliminar este registro?';

    if (endpoint === 'artista') {
      mensajeConfirmacion = '⚠️ ¡ATENCIÓN! El borrado en cascada está activo.\n\nAl eliminar este artista se borrarán permanentemente todos sus vinilos asociados y las referencias a estos en los pedidos existentes.\n\n¿Estás seguro de que deseas continuar con la eliminación del artista?';
    } else if (endpoint === 'categoria') {
      mensajeConfirmacion = '⚠️ ¡ATENCIÓN! El borrado en cascada está activo.\n\nAl eliminar esta categoría se borrarán permanentemente todos los vinilos de esta categoría y las referencias a estos en los pedidos existentes.\n\n¿Estás seguro de que deseas continuar con la eliminación de la categoría?';
    } else if (endpoint === 'usuario') {
      mensajeConfirmacion = '⚠️ ¡ATENCIÓN! El borrado en cascada está activo.\n\nAl eliminar este usuario se borrarán permanentemente todos sus pedidos y los detalles de compra asociados a los mismos.\n\n¿Estás seguro de que deseas continuar con la eliminación del usuario?';
    } else if (endpoint === 'vinilo') {
      mensajeConfirmacion = '⚠️ ¡ATENCIÓN! El borrado en cascada está activo.\n\nAl eliminar este vinilo se borrarán permanentemente los detalles de compra asociados a este disco en todos los pedidos.\n\n¿Estás seguro de que deseas continuar con la eliminación del vinilo?';
    } else if (endpoint === 'pedido') {
      mensajeConfirmacion = '⚠️ ¡ATENCIÓN! El borrado en cascada está activo.\n\nAl eliminar este pedido se borrarán permanentemente todos los detalles de compra asociados al mismo.\n\n¿Estás seguro de que deseas continuar con la eliminación del pedido?';
    }

    if (window.confirm(mensajeConfirmacion)) {
      try {
        await fetchApi(`/${endpoint}/${id}`, {
          method: 'DELETE',
        });
        cargarDatos();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (err) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  return (
    <section className="crud-container fade-in" aria-label={`Panel de Gestión de ${title}`}>
      <header className="admin-header">
        <h2>{title}</h2>
        {canAdd && (
          <button className="btn-primary btn-add-new" onClick={() => abrirModal()}>
            + Agregar Nuevo
          </button>
        )}
      </header>

      {error && <div className="error-message spaced-error">{error}</div>}

      <TablaDatosCrud
        columns={columns}
        data={data}
        loading={loading}
        expandableRowRender={expandableRowRender}
        expandedRows={expandedRows}
        onToggleExpand={alternarExpansionFila}
        onEdit={abrirModal}
        onDelete={eliminarRegistro}
      />

      <ModalCrud
        isOpen={isModalOpen}
        onClose={cerrarModal}
        editingId={editingId}
        formTitle={formTitle}
        title={title}
        columns={columns}
        formData={formData}
        onChange={cambioInput}
        onSubmit={enviarFormulario}
        selectOptions={selectOptions}
        setFormData={setFormData}
      />
    </section>
  );
};

export default TablaCrud;
