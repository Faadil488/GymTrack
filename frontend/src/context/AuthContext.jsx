import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on application mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Corrupted localStorage user data
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Parse payload to get user info if needed, or simply store username
      const userData = { username };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.detail || 'Invalid username or password';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (username, email, password, passwordConfirm) => {
    try {
      await api.post('/auth/register/', {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      // Format error message to be readable
      let errorMessage = 'Registration failed.';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'string') {
          errorMessage = errors;
        } else if (errors.password) {
          errorMessage = errors.password[0];
        } else if (errors.username) {
          errorMessage = errors.username[0];
        } else if (errors.email) {
          errorMessage = errors.email[0];
        } else if (errors.non_field_errors) {
          errorMessage = errors.non_field_errors[0];
        }
      }
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
