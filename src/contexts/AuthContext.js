import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement de la page
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      // Debug: afficher la réponse complète
      console.log('Réponse API login:', response);
      console.log('User data:', response.user);
      
      // Adapter la structure de l'utilisateur pour votre API FastAPI
      const userInfo = {
        id: response.user?._id || response.user?.id,
        username: response.user?.username,
        name: response.user?.name,
        last_name: response.user?.lastName || response.user?.last_name,
        email: response.user?.username, // FastAPI utilise username comme email
        is_admin: response.user?.role === 'admin' || response.user?.is_admin || false
      };
      
      console.log('User info processed:', userInfo);
      console.log('Is admin?', userInfo.is_admin);
      
      setUser(userInfo);
      
      // Mettre à jour le localStorage avec la structure adaptée
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
