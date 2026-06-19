import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const val = localStorage.getItem('token');
    return (val === 'null' || val === 'undefined') ? null : val;
  });
  const [username, setUsername] = useState(() => {
    const val = localStorage.getItem('username');
    return (val === 'null' || val === 'undefined') ? null : val;
  });
  const [role, setRole] = useState(() => {
    const val = localStorage.getItem('role');
    return (val === 'null' || val === 'undefined') ? null : val;
  });
  const [loading, setLoading] = useState(false);

  const login = (newToken, newUsername, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setUsername(newUsername);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  const isDoctor = role === 'ROLE_DOCTOR' || role === 'DOCTOR';
  const isPatient = role === 'ROLE_PATIENT' || role === 'PATIENT';

  return (
    <AuthContext.Provider value={{ token, username, role, isAuthenticated, isAdmin, isDoctor, isPatient, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
