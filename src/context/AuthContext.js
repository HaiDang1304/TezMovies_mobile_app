import React, { createContext, useContext } from 'react';
import { useUser } from './UserContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, loading, fetchUser, logout, setUser } = useUser();

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
