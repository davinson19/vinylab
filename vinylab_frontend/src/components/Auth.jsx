import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';

const Auth = ({ toggleTheme, isDarkMode, setToken }) => {
  const navigate = useNavigate();
  const { idioma, cambiarIdioma, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    nombre: '',
    direccion: '',
    rolId: 2, // Default to client
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}${endpoint}`;

    try {
      const payload = isLogin
        ? { email: formData.email, contrasena: formData.contrasena }
        : {
          email: formData.email,
          contrasena: formData.contrasena,
          nombre: formData.nombre,
          direccion: formData.direccion,
          rolId: formData.rolId,
        };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error en la solicitud');
      }

      if (isLogin) {
        setSuccess(t('exitoLogin'));
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);

        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          if (payload.rolName === 'Admin') {
            navigate('/admin');
          } else {
            // Navigate to catalog for client
            navigate('/catalogo');
          }
        } catch (e) {
          console.error("Error decoding token", e);
        }
      } else {
        setSuccess(t('exitoRegistro'));
        setIsLogin(true); // Switch to login after successful registration
        // Reset specific fields but keep email
        setFormData((prev) => ({ ...prev, contrasena: '', nombre: '', direccion: '' }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const alternarModo = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <>
      <div className="auth-controls-fixed">
        <div className="auth-language-selector">
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
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-fixed-theme-toggle"
          title={isDarkMode ? t('modoDia') : t('modoNoche')}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
      <main className="auth-container fade-in">
        <section className="glass-panel">
          <header className="auth-header">
            <h1 className="auth-title">VinyLab</h1>
          </header>

        {error && <div className="error-message fade-in">{error}</div>}
        {success && <div className="success-message fade-in">{success}</div>}

        <form onSubmit={manejarEnvio} className="fade-in" key={isLogin ? 'login' : 'register'}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">{t('nombre')}</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form-input"
                placeholder={t('nombrePlaceholder')}
                value={formData.nombre}
                onChange={manejarCambio}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contrasena">{t('contrasena')}</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              className="form-input"
              placeholder={t('contrasenaPlaceholder')}
              value={formData.contrasena}
              onChange={manejarCambio}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="direccion">{t('direccion')}</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                className="form-input"
                placeholder={t('direccionPlaceholder')}
                value={formData.direccion}
                onChange={manejarCambio}
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('procesando') : isLogin ? t('iniciarSesion') : t('registrarse')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? t('noCuenta') : t('yaCuenta')}
          <button type="button" onClick={alternarModo} className="auth-toggle-link">
            {isLogin ? t('registrateAqui') : t('iniciaSesion')}
          </button>
        </div>
      </section>
    </main>
    </>
  );
};

export default Auth;
