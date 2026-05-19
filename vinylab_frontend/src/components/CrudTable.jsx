import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

const CrudTable = ({ endpoint, columns, title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const loadData = async () => {
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
    loadData();
  }, [endpoint]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      parsedValue = e.target.checked;
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      handleCloseModal();
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar este registro?`)) {
      try {
        await fetchApi(`/${endpoint}/${id}`, {
          method: 'DELETE',
        });
        loadData();
      } catch (err) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  return (
    <div className="crud-container fade-in">
      <div className="admin-header">
        <h1>{title}</h1>
        <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => handleOpenModal()}>
          + Agregar Nuevo
        </button>
      </div>

      {error && <div className="error-message" style={{marginBottom: '1rem'}}>{error}</div>}

      <div className="crud-table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>
        ) : (
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  {columns.map(col => {
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
                      <button className="btn-icon" onClick={() => handleOpenModal(row)}>
                        ✏️
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(row.id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>
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
              <h3>{editingId ? 'Editar' : 'Agregar'} {title}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="crud-form" onSubmit={handleSubmit}>
                {columns.map(col => {
                  if (col.key === 'id' && !editingId) return null; // usually auto-increment
                  if (col.hideInForm) return null;
                  
                  return (
                    <div className="form-group" key={col.key}>
                      <label className="form-label">{col.label}</label>
                      {col.type === 'boolean' ? (
                        <input
                          type="checkbox"
                          name={col.key}
                          checked={formData[col.key] || false}
                          onChange={handleChange}
                        />
                      ) : (
                        <input
                          type={col.type || 'text'}
                          name={col.key}
                          className="form-input"
                          value={formData[col.key] !== undefined ? formData[col.key] : ''}
                          onChange={handleChange}
                          disabled={col.key === 'id'}
                          required={col.required !== false && col.key !== 'id'}
                        />
                      )}
                    </div>
                  );
                })}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
              <button type="submit" form="crud-form" className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudTable;
