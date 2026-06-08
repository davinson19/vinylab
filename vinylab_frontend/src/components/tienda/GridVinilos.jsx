import TarjetaVinilo from './TarjetaVinilo';
import { useLanguage } from '../../utils/LanguageContext';

const GridVinilos = ({
  vinyls,
  filteredVinyls,
  loadingVinyls,
  isRefreshing,
  onRefresh,
  onSelectVinyl,
  onAddToCart,
  setSearchQuery,
  setActiveCategory
}) => {
  const { t } = useLanguage();

  if (loadingVinyls) {
    return (
      <div className="spinning-vinyl-container">
        <div className="spinning-vinyl-wrapper">
          <div className="spinning-vinyl-outer running">
            <div className="spinning-vinyl-grooves"></div>
            <div className="spinning-vinyl-grooves-2"></div>
            <div className="spinning-vinyl-center">
              <div className="spinning-vinyl-hole"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vinyls.length === 0) {
    return (
      <div className="empty-store-container fade-in">
        <div className="spinning-vinyl-wrapper">
          <div className={`spinning-vinyl-outer ${isRefreshing ? 'running' : 'paused'}`}>
            <div className="spinning-vinyl-grooves"></div>
            <div className="spinning-vinyl-grooves-2"></div>
            <div className="spinning-vinyl-center">
              <div className="spinning-vinyl-hole"></div>
            </div>
          </div>
          <svg className={`spinning-vinyl-needle ${isRefreshing ? 'refreshing' : ''}`} viewBox="0 0 100 100">
            <path d="M70 20 L40 65 L45 70" stroke="var(--text-muted)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="36" y="65" width="10" height="15" rx="2" fill="var(--primary)" transform="rotate(-30 41 72)" />
          </svg>
        </div>

        <h2 className="empty-store-title">{t('preparacion')}</h2>
        <p className="empty-store-text">{t('noVinilos')}</p>
        
        <button 
          type="button" 
          className="btn-accent" 
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? t('actualizando') : t('comprobarNovedades')}
        </button>
      </div>
    );
  }

  if (filteredVinyls.length === 0) {
    return (
      <div className="empty-store-container fade-in compact">
        <h2 className="empty-store-title">{t('sinResultados')}</h2>
        <p className="empty-store-text">{t('sinResultadosTexto')}</p>
        <button 
          type="button" 
          className="btn-accent" 
          onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
        >
          {t('limpiarFiltros')}
        </button>
      </div>
    );
  }

  return (
    <section className="vinyl-grid fade-in" aria-label={t('catalogo')}>
      {filteredVinyls.map(vinyl => (
        <TarjetaVinilo
          key={vinyl.id}
          vinyl={vinyl}
          onSelect={onSelectVinyl}
          onAddToCart={onAddToCart}
        />
      ))}
    </section>
  );
};

export default GridVinilos;
