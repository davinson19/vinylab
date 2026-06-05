import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../utils/api';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;


const SubirImagen = ({ value, onChange, label, required }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const archivo = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result); // Base64 string
    };
    reader.readAsDataURL(file);
  };

  const arrastrar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const soltar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      archivo(e.dataTransfer.files[0]);
    }
  };

  const modificarArchivo = (e) => {
    if (e.target.files && e.target.files[0]) {
      archivo(e.target.files[0]);
    }
  };

  const borrar = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const obtenerTamanoImagen = () => {
    if (!value) return '';
    if (value.startsWith('http')) return 'Imagen remota (URL)';
    const bytes = Math.round((value.length * 3) / 4);
    if (bytes < 1024) return `${bytes} B`;
    const kb = (bytes / 1024).toFixed(1);
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <section className="image-input-container" aria-label="Cargador de imagen">
        <div 
          className={`image-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={arrastrar}
          onDragOver={arrastrar}
          onDragLeave={arrastrar}
          onDrop={soltar}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="file-input-hidden"
            accept="image/*"
            onChange={modificarArchivo}
          />
          <span className="dropzone-icon">🖼️</span>
          <span className="dropzone-text">Arrastra una imagen aquí o haz clic para buscar</span>
          <span className="dropzone-subtext">Soporta PNG, JPG, WEBP</span>
        </div>

        {value && (
          <div className="image-preview-panel fade-in">
            <div className="image-preview-box">
              <img src={value} alt="Previsualización de portada" onError={(e) => { e.target.src = FALLBACK_SVG; }} />
            </div>
            <div className="image-preview-info">
              <div className="image-preview-title" title={value.startsWith('data:') ? 'Imagen en Base64' : value}>
                {value.startsWith('data:') ? 'Imagen cargada localmente' : value}
              </div>
              <div className="image-preview-size">{obtenerTamanoImagen()}</div>
              <button 
                type="button" 
                className="btn-remove-image" 
                onClick={borrar}
              >
                Eliminar Portada
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const TablaCrud = ({ endpoint, columns, title, formTitle, canAdd = true, expandableRowRender, refreshTrigger, onDeleteSuccess }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expandedRows, setExpandedRows] = useState({});

  const alternarExpansionFila = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectOptions, setSelectOptions] = useState({});

  const cargarDatos = async () => {
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
  };

  useEffect(() => {
    cargarDatos();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const eventSource = new EventSource(`${baseUrl}/realtime/sse`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        // Comprobar si el tipo de evento coincide con el recurso de la tabla actual (ej. 'vinilo_')
        if (type.startsWith(`${endpoint}_`)) {
          console.log(`TablaCrud [${endpoint}] recibió evento en tiempo real:`, type, data);
          
          if (type === `${endpoint}_created`) {
            setData(prev => {
              // Evitar duplicados
              if (prev.some(item => item.id === data.id)) return prev;
              return [data, ...prev];
            });
          } else if (type === `${endpoint}_updated`) {
            setData(prev => prev.map(item => item.id === data.id ? data : item));
          } else if (type === `${endpoint}_deleted`) {
            setData(prev => prev.filter(item => item.id !== data.id));
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
      eventSource.close();
    };
  }, [endpoint]);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    cargarDatos();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionsData = {};
      for (const col of columns) {
        if (col.type === 'select' && col.selectEndpoint) {
          try {
            const data = await fetchApi(`/${col.selectEndpoint}`);
            optionsData[col.key] = data;
          } catch (err) {
            console.error(`Error fetching options for ${col.key}:`, err);
          }
        }
      }
      setSelectOptions(optionsData);
    };
    fetchOptions();
  }, [columns]);

  const esRequerido = (col) => {
    if (col.key === 'id') return false;
    if (col.required === false) return false;
    if (typeof col.required === 'function') {
      return col.required(editingId);
    }
    return true;
  };

  const abrirModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      const copy = { ...item };
      delete copy.contrasena;
      setFormData(copy);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const cambioInput = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    
    const col = columns.find(c => c.key === name);
    if (col && col.type === 'select') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      parsedValue = e.target.checked;
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();

    // Validar que no haya valores numéricos negativos
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
      // Remove relationships or complex nested objects before sending
      const payload = { ...formData };
      
      // Clean payload for standard foreign keys where we only need the ID
      // You may need to adapt this depending on the exact DTOs
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

      <div className="crud-table-container">
        {loading ? (
          <div className="loading-message">Cargando datos...</div>
        ) : (
          <table className="crud-table">
            <thead>
              <tr>
                {expandableRowRender && <th className="th-detail">Detalle</th>}
                {columns.filter(col => !col.hideInTable).map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <React.Fragment key={row.id}>
                  <tr>
                    {expandableRowRender && (
                      <td className="td-center">
                        <button
                          type="button"
                          className="btn-expand"
                          onClick={() => alternarExpansionFila(row.id)}
                          title={expandedRows[row.id] ? "Contraer detalles" : "Expandir detalles"}
                        >
                          {expandedRows[row.id] ? '▼' : '▶'}
                        </button>
                      </td>
                    )}
                    {columns.filter(col => !col.hideInTable).map(col => {
                      let cellValue = row[col.key];
                      if (col.render) {
                        cellValue = col.render(row);
                      } else if (typeof cellValue === 'boolean') {
                        cellValue = cellValue ? 'Sí' : 'No';
                      } else if (typeof cellValue === 'object' && cellValue !== null) {
                        // Fallback for nested objects
                        cellValue = cellValue.nombre || cellValue.id || JSON.stringify(cellValue);
                      }
                      return <td key={col.key}>{cellValue}</td>;
                    })}
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon" onClick={() => abrirModal(row)}>
                          ✏️
                        </button>
                        <button className="btn-icon delete" onClick={() => eliminarRegistro(row.id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandableRowRender && expandedRows[row.id] && (
                    <tr className="expanded-row-details">
                      <td colSpan={columns.filter(col => !col.hideInTable).length + 2}>
                        <div className="expanded-details-container">
                          {expandableRowRender(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.filter(col => !col.hideInTable).length + (expandableRowRender ? 2 : 1)} className="td-center">
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Editar' : 'Agregar'} {formTitle || title}</h3>
              <button className="modal-close" onClick={cerrarModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="crud-form" onSubmit={enviarFormulario}>
                {columns.map(col => {
                  if (col.key === 'id' && !editingId) return null; // usually auto-increment
                  if (col.hideInForm) return null;
                  
                  if (col.type === 'image') {
                    return (
                      <SubirImagen
                        key={col.key}
                        label={col.label}
                        value={formData[col.key] || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, [col.key]: val }))}
                        required={esRequerido(col) && !formData[col.key]}
                      />
                    );
                  }
                  
                  return (
                    <div className="form-group" key={col.key}>
                      <label className="form-label">{col.label}</label>
                      {col.type === 'select' ? (
                        <select
                          name={col.key}
                          className="form-input"
                          value={formData[col.key] !== undefined ? formData[col.key] : ''}
                          onChange={cambioInput}
                          disabled={col.key === 'id'}
                          required={esRequerido(col)}
                        >
                          <option value="">Seleccione...</option>
                          {(selectOptions[col.key] || []).map(opt => {
                            let labelStr = '';
                            if (typeof col.optionLabel === 'function') {
                              labelStr = col.optionLabel(opt);
                            } else {
                              labelStr = opt[col.optionLabel || 'nombre'] || opt.id;
                            }
                            return (
                              <option key={opt.id} value={opt.id}>
                                {labelStr}
                              </option>
                            );
                          })}
                        </select>
                      ) : col.type === 'boolean' ? (
                        <input
                          type="checkbox"
                          name={col.key}
                          checked={formData[col.key] || false}
                          onChange={cambioInput}
                        />
                      ) : col.type === 'textarea' ? (
                        <textarea
                          name={col.key}
                          className="form-input form-textarea"
                          value={formData[col.key] !== undefined ? formData[col.key] : ''}
                          onChange={cambioInput}
                          disabled={col.key === 'id'}
                          required={esRequerido(col)}
                          rows={3}
                        />
                      ) : (
                        <input
                          type={col.type || 'text'}
                          name={col.key}
                          className="form-input"
                          value={formData[col.key] !== undefined ? formData[col.key] : ''}
                          onChange={cambioInput}
                          disabled={col.key === 'id'}
                          required={esRequerido(col)}
                          min={col.type === 'number' ? "0" : undefined}
                          step={col.type === 'number' ? (col.key === 'precio' || col.key === 'importeTotal' ? 'any' : '1') : undefined}
                        />
                      )}
                    </div>
                  );
                })}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button type="submit" form="crud-form" className="btn-primary btn-modal-save">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TablaCrud;
