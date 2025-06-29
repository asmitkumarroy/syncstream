import React, { createContext, useState, useEffect } from 'react';

// 1. Create the context
export const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // 3. Check local storage for a token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // 4. Login function
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  // 5. Logout function
  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  // 6. Value to be provided to consuming components
  const contextValue = {
    token,
    login,
    logout,
    isAuthenticated: !!token, // A handy boolean to check if logged in
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};