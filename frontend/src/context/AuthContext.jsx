import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al cargar la página
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await api.get('/auth/me/');
        if (res.data.authenticated) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Verificar sesión cada 2 minutos (verificación ligera)
  useEffect(() => {
    if (loading) return;

    const sessionCheckInterval = setInterval(async () => {
      try {
        const res = await api.get('/auth/me/');
        if (!res.data.authenticated) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    }, 120000); // Verificar cada 2 minutos

    return () => clearInterval(sessionCheckInterval);
  }, [loading]);

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
