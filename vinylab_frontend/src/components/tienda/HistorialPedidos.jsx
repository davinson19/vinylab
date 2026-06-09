import { useLanguage } from '../../utils/LanguageContext';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

// Normaliza el estado del pedido
const formatStatus = (status, t) => {
  const normalized = status ? status.toLowerCase() : '';
  if (normalized === 'pendiente_envio' || normalized === 'pendiente de envío' || normalized === 'pagado') {
    return t('pendienteEnvio');
  }
  if (normalized === 'enviado') {
    return t('enviado');
  }
  if (normalized === 'entregado') {
    return t('entregado');
  }
  return status;
};

// Historial de compras del cliente que lista sus pedidos anteriores, importes y el estado del envío
const HistorialPedidos = ({ orders, loadingOrders, setActiveView }) => {
  const { idioma, t } = useLanguage();

  return (
    <section className="orders-view-container fade-in" aria-label={t('pedidosTitulo')}>
      <header className="orders-view-header">
        <h2 className="orders-view-title">{t('pedidosTitulo')}</h2>
        <p className="orders-view-subtitle">{t('pedidosSub')}</p>
      </header>
      
      {loadingOrders ? (
        <div className="flex-center-padded">
          <div className="spinning-vinyl-wrapper small">
            <div className="spinning-vinyl-outer running">
              <div className="spinning-vinyl-grooves"></div>
              <div className="spinning-vinyl-grooves-2"></div>
              <div className="spinning-vinyl-center">
                <div className="spinning-vinyl-hole"></div>
              </div>
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-container fade-in">
          <div className="empty-orders-icon">📋</div>
          <h3 className="empty-orders-title">{t('noPedidos')}</h3>
          <p className="empty-orders-text">{t('noPedidosTexto')}</p>
          <button 
            type="button" 
            className="btn-secondary-outline btn-width-limit" 
            onClick={() => setActiveView('store')}
          >
            {t('volverTienda')}
          </button>
        </div>
      ) : (
        <div className="orders-list fade-in">
          {orders.map(order => {
            const orderDate = new Date(order.fechaCreacion).toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <article key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-header-meta">
                    <span className="order-meta-label">{t('pedidoLabel')}</span>
                    <span className="order-meta-value order-id">#{order.id}</span>
                  </div>
                  <div className="order-header-meta">
                    <span className="order-meta-label">{t('fechaLabel')}</span>
                    <span className="order-meta-value">{orderDate}</span>
                  </div>
                  <div className="order-header-meta">
                    <span className="order-meta-label">{t('totalLabel')}</span>
                    <span className="order-meta-value">{parseFloat(order.importeTotal).toFixed(2)} €</span>
                  </div>
                  <div className="order-header-meta order-header-meta-wide">
                    <span className="order-meta-label">{t('estadoLabel')}</span>
                    <span className={`order-status-badge ${order.estado.toLowerCase()}`}>
                      {formatStatus(order.estado, t)}
                    </span>
                  </div>
                </div>
                
                <div className="order-card-body">
                  <div className="order-items-list">
                    {order.vinilos && order.vinilos.map(detail => {
                      const unitPrice = detail.vinilo ? parseFloat(detail.vinilo.precio) : 0;
                      const subtotal = unitPrice * detail.cantidad;
                      
                      return (
                        <div key={detail.id} className="order-item-row">
                          <div className="order-item-cover">
                            {detail.vinilo && detail.vinilo.portada ? (
                              <img 
                                src={detail.vinilo.portada} 
                                alt={detail.vinilo.titulo} 
                                onError={(e) => { e.target.src = FALLBACK_SVG; }}
                              />
                            ) : (
                              <div className="fallback-cover-small">💿</div>
                            )}
                          </div>
                          <div className="order-item-details">
                            <div className="order-item-title-artist">
                              <h4 className="order-item-title">{detail.vinilo ? detail.vinilo.titulo : (idioma === 'es' ? 'Vinilo Eliminado' : 'Deleted Vinyl')}</h4>
                              <p className="order-item-artist">{detail.vinilo && detail.vinilo.artista ? detail.vinilo.artista.nombre : (idioma === 'es' ? 'Artista Desconocido' : 'Unknown Artist')}</p>
                            </div>
                            <div className="order-item-price-unit">
                              {unitPrice.toFixed(2)} € / {idioma === 'es' ? 'ud.' : 'unit'}
                            </div>
                            <div className="order-item-quantity">
                              {t('cantidadLabel')}: {detail.cantidad}
                            </div>
                            <div className="order-item-subtotal">
                              {subtotal.toFixed(2)} €
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="order-card-footer">
                  <span className="order-total-label">{t('totalPagadoLabel')}</span>
                  <span className="order-total-price">{parseFloat(order.importeTotal).toFixed(2)} €</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HistorialPedidos;
