import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    nombre: '',
    direccion: '',
    rolId: 2, // Default to client
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const url = `http://localhost:3000${endpoint}`;

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
        setSuccess('¡Inicio de sesión exitoso!');
        localStorage.setItem('token', data.access_token);
        
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          if (payload.rolName === 'Admin') {
            navigate('/admin');
          } else {
            // Navigate to catalog or home for client
            navigate('/');
          }
        } catch (e) {
          console.error("Error decoding token", e);
        }
      } else {
        setSuccess('¡Registro completado exitosamente! Ahora puedes iniciar sesión.');
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

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass-panel">
        <div className="auth-header">
          <h1 className="auth-title">VinyLab</h1>
          <p className="auth-subtitle">
            {!isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta hoy'}
          </p>
        </div>

        {error && <div className="error-message fade-in">{error}</div>}
        {success && <div className="success-message fade-in">{success}</div>}

        <form onSubmit={handleSubmit} className="fade-in" key={isLogin ? 'login' : 'register'}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form-input"
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              className="form-input"
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="direccion">Dirección (Opcional)</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                className="form-input"
                placeholder="Tu dirección de envío"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
          <button type="button" onClick={toggleAuthMode} className="auth-toggle-link">
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
