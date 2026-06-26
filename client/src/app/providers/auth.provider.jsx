import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import authApi from '../../features/auth/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [tokens, setTokens] = useLocalStorage('tokens', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (tokens?.accessToken) {
        try {
          const response = await authApi.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Auth init error:', error);
          setUser(null);
          setTokens(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
const { user, accessToken, refreshToken } = response.data.data;    setUser(user);
    setTokens({ accessToken, refreshToken });
    return response;
  };

  const logout = async () => {
    if (tokens?.accessToken) {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setUser(null);
    setTokens(null);
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    return response;
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken(tokens.refreshToken);
      const { accessToken, refreshToken } = response.data;
      setTokens({ accessToken, refreshToken });
      return response;
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const value = {
    user,
    tokens,
    loading,
    isAuthenticated: !!user && !!tokens,
    login,
    logout,
    register,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};