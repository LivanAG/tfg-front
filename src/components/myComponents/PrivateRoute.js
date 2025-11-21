// src/components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Si no hay token → redirigir a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    // Si el token expiró → eliminarlo y redirigir
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Si el token no se puede decodificar → eliminar y redirigir
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Si todo va bien → permitir acceso
  return children;
};

export default PrivateRoute;
