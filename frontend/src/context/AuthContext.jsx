import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al cargar la página
  useEffect(() => {
    api.get('/auth/me/')
      .then((res) => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        // Sin sesión activa
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    setUser(res.data.user);
    return res.data;
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // La sesión puede haber expirado
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
