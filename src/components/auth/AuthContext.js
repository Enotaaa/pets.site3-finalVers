import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return token && userData ? { ...JSON.parse(userData), token } : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('https://pets.xn--80ahdri7a.site/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({ ...userData, token });
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token verification error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const userData = { 
          email, 
          token: data.data.token,
          ...data.data.user
        };
        
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return { success: true, data: userData };
      }
      return { success: false, error: 'Неверный email или пароль' };
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('https://pets.xn--80ahdri7a.site/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Ошибка регистрации' 
        };
      }
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};