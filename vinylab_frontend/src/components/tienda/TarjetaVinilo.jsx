import { useLanguage } from '../../utils/LanguageContext';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

const TarjetaVinilo = ({ vinyl, onSelect, onAddToCart }) => {
  const { idioma, t } = useLanguage();

  return (
    <article className="vinyl-card">
      <div 
        className="vinyl-cover-container" 
        onClick={() => onSelect(vinyl)} 
        style={{ cursor: 'pointer' }}
      >
        <span className="vinyl-category-badge">
          {vinyl.categoria ? vinyl.categoria.nombre : (idioma === 'es' ? 'General' : 'General')}
        </span>
        {vinyl.portada ? (
          <img 
            src={vinyl.portada} 
            alt={vinyl.titulo} 
            className="vinyl-cover-img" 
            onError={(e) => { e.target.src = FALLBACK_SVG; }}
          />
        ) : (
          <div className="fallback-cover-large">💿</div>
        )}
      </div>
      
      <div 
        className="vinyl-info" 
        onClick={() => onSelect(vinyl)} 
        style={{ cursor: 'pointer' }}
      >
        <h3 className="vinyl-card-title" title={vinyl.titulo}>{vinyl.titulo}</h3>
        <p className="vinyl-card-artist">
          {vinyl.artista ? vinyl.artista.nombre : (idioma === 'es' ? 'Artista Desconocido' : 'Unknown Artist')}
        </p>
        
        <div className="vinyl-card-meta">
          <span className="vinyl-card-year">{vinyl.anioLanzamiento}</span>
          {vinyl.stock <= 0 ? (
            <span className="vinyl-stock-badge out-of-stock">{t('agotado')}</span>
          ) : vinyl.stock <= 3 ? (
            <span className="vinyl-stock-badge low-stock">{t('ultimasUnidades')}</span>
          ) : null}
        </div>
      </div>
      
      <div className="vinyl-card-footer">
        <span className="vinyl-card-price">{parseFloat(vinyl.precio).toFixed(2)} €</span>
        <button 
          type="button" 
          className="btn-add-cart" 
          onClick={() => onAddToCart(vinyl)}
          disabled={vinyl.stock <= 0}
          title={vinyl.stock <= 0 ? t('agotado') : t('anadirCarrito')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>
    </article>
  );
};

export default TarjetaVinilo;
