import { Fragment } from 'react';

// Tabla visual que muestra las columnas de datos y los botones de acción para editar o eliminar cada fila
const TablaDatosCrud = ({
  columns,
  data,
  loading,
  expandableRowRender,
  expandedRows,
  onToggleExpand,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return <div className="loading-message">Cargando datos...</div>;
  }

  const columnsToShow = columns.filter(col => !col.hideInTable);

  return (
    <div className="crud-table-container">
      <table className="crud-table">
        <thead>
          <tr>
            {expandableRowRender && <th className="th-detail">Detalle</th>}
            {columnsToShow.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <Fragment key={row.id}>
              <tr>
                {expandableRowRender && (
                  <td className="td-center">
                    <button
                      type="button"
                      className="btn-expand"
                      onClick={() => onToggleExpand(row.id)}
                      title={expandedRows[row.id] ? "Contraer detalles" : "Expandir detalles"}
                    >
                      {expandedRows[row.id] ? '▼' : '▶'}
                    </button>
                  </td>
                )}
                {columnsToShow.map(col => {
                  let cellValue = row[col.key];
                  if (col.render) {
                    cellValue = col.render(row);
                  } else if (typeof cellValue === 'boolean') {
                    cellValue = cellValue ? 'Sí' : 'No';
                  } else if (typeof cellValue === 'object' && cellValue !== null) {
                    cellValue = cellValue.nombre || cellValue.id || JSON.stringify(cellValue);
                  }
                  return <td key={col.key}>{cellValue}</td>;
                })}
                <td>
                  <div className="table-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => onEdit(row)}
                      title="Editar registro"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon delete" 
                      onClick={() => onDelete(row.id)}
                      title="Eliminar registro"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              {expandableRowRender && expandedRows[row.id] && (
                <tr className="expanded-row-details">
                  <td colSpan={columnsToShow.length + 2}>
                    <div className="expanded-details-container">
                      {expandableRowRender(row)}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {data.length === 0 && (
            <tr>
              <td 
                colSpan={columnsToShow.length + (expandableRowRender ? 2 : 1)} 
                className="td-center"
              >
                No hay registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaDatosCrud;
