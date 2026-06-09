import { useLanguage } from '../../utils/LanguageContext';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

// Ventana flotante de detalles del vinilo que muestra la información completa del disco y permite comprarlo o añadirlo al carrito
const ModalDetallesVinilo = ({ vinyl, onClose, onAddToCart, onBuyNow }) => {
  const { idioma, t } = useLanguage();

  if (!vinyl) return null;

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div 
        className="detail-modal-card fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ '--modal-bg-image': vinyl.portada ? `url(${vinyl.portada})` : 'none' }}
      >
        <button 
          type="button" 
          className="btn-close-detail" 
          onClick={onClose}
          title={t('payCancelar')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="detail-layout-cols">
          {/* Portada de vinilo */}
          <div className="detail-cover-col">
            <div className="detail-cover-wrapper">
              {vinyl.portada ? (
                <img 
                  src={vinyl.portada} 
                  alt={vinyl.titulo} 
                  className="detail-cover-img" 
                  onError={(e) => { e.target.src = FALLBACK_SVG; }}
                />
              ) : (
                <div className="detail-fallback-cover">💿</div>
              )}
            </div>
          </div>
          
          {/* Información del vinilo y botones de compra */}
          <div className="detail-info-col">
            <div className="detail-header-section">
              <span className="detail-category-badge">
                {vinyl.categoria ? vinyl.categoria.nombre : (idioma === 'es' ? 'General' : 'General')}
              </span>
              <h2 className="detail-title" title={vinyl.titulo}>{vinyl.titulo}</h2>
              <h3 className="detail-artist">
                {vinyl.artista ? vinyl.artista.nombre : (idioma === 'es' ? 'Artista Desconocido' : 'Unknown Artist')}
              </h3>
            </div>
            
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <span className="detail-meta-label">{t('anio')}</span>
                <span className="detail-meta-value">{vinyl.anioLanzamiento}</span>
              </div>
            </div>
            
            <div className="detail-description-section">
              <p className="detail-description-text">
                {vinyl.descripcion || (idioma === 'es' ? 'Sin descripción disponible.' : 'No description available.')}
              </p>
            </div>
            
            <div className="detail-price-section">
              <span className="detail-price-label">{t('precio')}</span>
              <span className="detail-price-value">{parseFloat(vinyl.precio).toFixed(2)} €</span>
            </div>
            
            <div className="detail-actions-row">
              <button 
                type="button" 
                className="btn-add-cart-detail" 
                onClick={() => onAddToCart(vinyl)}
                disabled={vinyl.stock <= 0}
                title={vinyl.stock <= 0 ? t('agotado') : t('anadirCarrito')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>{t('anadirCarrito')}</span>
              </button>
              
              <button 
                type="button" 
                className="btn-buy-now-detail" 
                onClick={() => onBuyNow(vinyl)}
                disabled={vinyl.stock <= 0}
                title={vinyl.stock <= 0 ? t('agotado') : t('comprarYa')}
              >
                <span>{t('comprarYa')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesVinilo;
