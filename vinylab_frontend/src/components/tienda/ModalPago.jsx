import { useLanguage } from '../../utils/LanguageContext';

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="%231e1e2e"/><circle cx="50" cy="50" r="40" fill="%230f0f15" stroke="%23313244" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="%2345475a" stroke-dasharray="8,6" stroke-width="1"/><circle cx="50" cy="50" r="20" fill="none" stroke="%2345475a" stroke-dasharray="6,4" stroke-width="1"/><circle cx="50" cy="50" r="12" fill="%23cba6f7"/><circle cx="50" cy="50" r="4" fill="%230f0f15"/></svg>`;

const ModalPago = ({
  isOpen,
  setIsOpen,
  cart,
  cartTotal,
  paymentData,
  paymentError,
  isProcessing,
  isSuccess,
  onChange,
  onSubmit
}) => {
  const { idioma, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-card fade-in">
        {isSuccess ? (
          <div className="payment-success-screen">
            <div className="success-icon-wrapper animate-pop">
              <svg className="success-checkmark" viewBox="0 0 52 52">
                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2>{t('payExitoso')}</h2>
          </div>
        ) : (
          <div className="payment-modal-body">
            <button 
              type="button" 
              className="btn-close-payment" 
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
              title={t('payCancelar')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="payment-layout-cols">
              <div className="payment-card-preview-col">
                <h3>{t('payResumen')}</h3>

                {/* Breakdown with details of the order */}
                <div className="payment-order-details">
                  {cart.map(item => (
                    <div key={item.id} className="payment-detail-item">
                      <div className="payment-detail-cover">
                        {item.portada ? (
                          <img 
                            src={item.portada} 
                            alt={item.titulo} 
                            onError={(e) => { e.target.src = FALLBACK_SVG; }}
                          />
                        ) : (
                          <div className="payment-detail-fallback-cover">💿</div>
                        )}
                      </div>
                      <div className="payment-detail-info">
                        <h4 className="payment-detail-title" title={item.titulo}>{item.titulo}</h4>
                        <p className="payment-detail-artist-qty">
                          {item.artista ? item.artista.nombre : (idioma === 'es' ? 'Artista' : 'Artist')} • {t('cantidadLabel')}: {item.quantity}
                        </p>
                      </div>
                      <div className="payment-detail-subtotal">
                        {(parseFloat(item.precio) * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>

                <div className="payment-summary-box">
                  <div className="summary-row total">
                    <span>{t('payTotalPagar')}</span>
                    <span>{cartTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div className="payment-form-col">
                <h2>{t('payIntroduceTarjeta')}</h2>

                {paymentError && (
                  <div className="error-message payment-error-alert fade-in">
                    ⚠️ {paymentError}
                  </div>
                )}

                <form onSubmit={onSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-nombre">{t('payNombreTitular')}</label>
                    <input
                      type="text"
                      id="card-nombre"
                      name="nombre"
                      className="form-input"
                      value={paymentData.nombre}
                      onChange={onChange}
                      disabled={isProcessing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="card-numero">{t('payNumeroTarjeta')}</label>
                    <input
                      type="text"
                      id="card-numero"
                      name="numero"
                      className="form-input card-num-input"
                      value={paymentData.numero}
                      onChange={onChange}
                      disabled={isProcessing}
                      required
                    />
                  </div>

                  <div className="form-row-two-cols">
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-expiracion">{t('payVencimiento')}</label>
                      <input
                        type="text"
                        id="card-expiracion"
                        name="expiracion"
                        className="form-input"
                        placeholder="MM/YY"
                        value={paymentData.expiracion}
                        onChange={onChange}
                        disabled={isProcessing}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="card-cvv">{t('payCvv')}</label>
                      <input
                        type="password"
                        id="card-cvv"
                        name="cvv"
                        className="form-input"
                        placeholder="•••"
                        value={paymentData.cvv}
                        onChange={onChange}
                        disabled={isProcessing}
                        required
                      />
                    </div>
                  </div>

                  <div className="payment-actions-row">
                    <button
                      type="button"
                      className="btn-payment-cancel"
                      onClick={() => setIsOpen(false)}
                      disabled={isProcessing}
                    >
                      {t('payCancelar')}
                    </button>
                    <button
                      type="submit"
                      className="btn-payment-submit"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="spinner-loader-row">
                          <span className="payment-spinner"></span>
                          {t('payVerificando')}
                        </span>
                      ) : (
                        `${t('payPagarBoton')} ${cartTotal.toFixed(2)} €`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalPago;
