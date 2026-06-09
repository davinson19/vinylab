import logo from '../assets/logo.png';
import { useLanguage } from '../utils/LanguageContext';

// Pie de página general que muestra el logo de la marca, derechos de autor y selector de idioma.
const Footer = () => {
  const { idioma, cambiarIdioma, t } = useLanguage();

  return (
    <footer className="store-footer">
      <div className="store-footer-content">
        <div className="store-footer-brand">
          <img src={logo} alt="VinyLab Logo" className="store-footer-logo" />
          <span className="store-footer-title">VinyLab</span>
        </div>
        <p className="store-footer-text">
          &copy; {new Date().getFullYear()} VinyLab. {t('copyright')}
        </p>
        <div className="store-footer-language">
          <svg className="language-globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <select 
            className="language-select" 
            value={idioma} 
            onChange={(e) => cambiarIdioma(e.target.value)}
            aria-label="Language Selector"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
