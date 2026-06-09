import { useState, useRef } from 'react';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

// Componente que permite seleccionar o arrastrar archivos de imagen y previsualizarlos antes de guardarlos
const SubirImagen = ({ value, onChange, label }) => {
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
      onChange(e.target.result); 
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

export default SubirImagen;
