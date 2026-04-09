import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Credentials
const CREDENTIALS = [
  { username: 'admin', password: 'admin@123', role: 'Admin', displayName: 'System Administrator', department: 'IT', email: 'admin@insurancecaffe.com' },
  { username: 'user', password: 'user@123', role: 'User', displayName: 'Operations User', department: 'Operations', email: 'user@insurancecaffe.com' },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('ic_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username, password) => {
    const match = CREDENTIALS.find(
      (c) => c.username === username && c.password === password
    );
    if (match) {
      const user = { username: match.username, role: match.role, displayName: match.displayName, department: match.department, email: match.email };
      setCurrentUser(user);
      sessionStorage.setItem('ic_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('ic_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
