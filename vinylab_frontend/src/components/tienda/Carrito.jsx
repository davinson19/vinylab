import { useLanguage } from '../../utils/LanguageContext';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

// Panel lateral desplegable que muestra la lista de artículos en el carrito
const Carrito = ({
  isOpen,
  setIsOpen,
  cart,
  cartItemCount,
  cartTotal,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout
}) => {
  const { idioma, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsOpen(false)}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()} aria-label={t('cartTitulo')}>
        <header className="cart-drawer-header">
          <div className="cart-drawer-header-left">
            <h2 className="cart-drawer-title">
              {t('cartTitulo')}
            </h2>
            {cart.length > 0 && (
              <button 
                type="button" 
                className="btn-clear-cart" 
                onClick={onClear}
                title={t('cartVaciar')}
              >
                {t('cartVaciar')}
              </button>
            )}
          </div>
          <button 
            type="button" 
            className="btn-close-cart" 
            onClick={() => setIsOpen(false)}
            title={t('payCancelar')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-vinyl">💿</div>
              <h3>{t('cartVacio')}</h3>
              <p>{t('cartVacioTexto')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-cover">
                  {item.portada ? (
                    <img 
                      src={item.portada} 
                      alt={item.titulo} 
                      onError={(e) => { e.target.src = FALLBACK_SVG; }}
                    />
                  ) : (
                    <div className="fallback-cover-medium">💿</div>
                  )}
                </div>
                
                <div className="cart-item-info">
                  <h4 className="cart-item-title" title={item.titulo}>{item.titulo}</h4>
                  <p className="cart-item-artist">
                    {item.artista ? item.artista.nombre : (idioma === 'es' ? 'Artista' : 'Artist')}
                  </p>
                  <span className="cart-item-price">{parseFloat(item.precio).toFixed(2)} €</span>
                </div>
                
                <div className="cart-item-actions">
                  <button 
                    type="button" 
                    className="btn-remove-item"
                    onClick={() => onRemove(item.id)}
                    title={t('cartEliminarItem')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                  
                  <div className="cart-item-qty">
                    <button 
                      type="button" 
                      className="qty-btn"
                      onClick={() => onUpdateQty(item.id, item.quantity - 1, item.stock)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button 
                      type="button" 
                      className="qty-btn"
                      onClick={() => onUpdateQty(item.id, item.quantity + 1, item.stock)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-totals-row">
              <span className="cart-totals-label">
                {t('cartTotalLabel')} ({cartItemCount} {cartItemCount === 1 ? t('cartArticulo') : t('cartArticulos')}):
              </span>
              <span className="cart-totals-value">{cartTotal.toFixed(2)} €</span>
            </div>
            <button 
              type="button" 
              className="btn-checkout"
              onClick={onCheckout}
            >
              {t('cartComprar')}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Carrito;
