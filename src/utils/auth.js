// Login: guarda token y devuelve true si todo ok
export const login = async (email, password) => {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return true;
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '#/login';
};