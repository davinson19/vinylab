import SubirImagen from './SubirImagen';

// Modal con formulario para añadir o editar registros de la base de datos
const ModalCrud = ({
  isOpen,
  onClose,
  editingId,
  formTitle,
  title,
  columns,
  formData,
  onChange,
  onSubmit,
  selectOptions,
  setFormData
}) => {
  if (!isOpen) return null;

  // Decide si un campo de texto es obligatorio rellenar o no para poder guardar
  const esRequerido = (col) => {
    if (col.key === 'id') return false;
    if (col.required === false) return false;
    if (typeof col.required === 'function') {
      return col.required(editingId);
    }
    return true;
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingId ? 'Editar' : 'Agregar'} {formTitle || title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">&times;</button>
        </div>
        <div className="modal-body">
          <form id="crud-form" onSubmit={onSubmit}>
            {columns.map(col => {
              if (col.key === 'id' && !editingId) return null;
              if (col.hideInForm) return null;
              
              if (col.type === 'image') {
                return (
                  <SubirImagen
                    key={col.key}
                    label={col.label}
                    value={formData[col.key] || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, [col.key]: val }))}
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
                      onChange={onChange}
                      disabled={col.key === 'id'}
                      required={esRequerido(col)}
                    >
                      <option value="">Seleccione...</option>
                      {(selectOptions[col.key] || []).map(opt => {
                        const val = opt.id !== undefined ? opt.id : opt.value;
                        const labelStr = opt.label || opt.nombre || val;
                        return (
                          <option key={val} value={val}>
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
                      onChange={onChange}
                    />
                  ) : col.type === 'textarea' ? (
                    <textarea
                      name={col.key}
                      className="form-input form-textarea"
                      value={formData[col.key] !== undefined ? formData[col.key] : ''}
                      onChange={onChange}
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
                      onChange={onChange}
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
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="crud-form" className="btn-primary btn-modal-save">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCrud;
