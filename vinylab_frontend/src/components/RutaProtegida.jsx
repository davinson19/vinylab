import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, requiereAdmin = true }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  let tokenValido = false;
  let esAdmin = false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    tokenValido = true;
    esAdmin = payload.rolName === 'Admin';
  } catch {
    localStorage.removeItem('token');
  }

  if (!tokenValido) {
    return <Navigate to="/" replace />;
  }

  if (requiereAdmin && !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;
