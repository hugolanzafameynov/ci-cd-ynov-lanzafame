import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Fonction utilitaire pour gérer les cold starts de Vercel
const handleColdStart = async (apiCall, retryCount = 0, maxRetries = 2) => {
  try {
    return await apiCall();
  } catch (error) {
    // Si c'est une erreur 500 (cold start) et on peut encore retry
    if (error.response?.status === 500 && retryCount < maxRetries) {
      console.log(`🟡 Cold start détecté (erreur 500), retry ${retryCount + 1}/${maxRetries} dans 2 secondes...`);
      console.log(`📄 Détail erreur:`, error.response?.data?.detail);
      
      // Attendre plus longtemps pour le cold start (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return handleColdStart(apiCall, retryCount + 1, maxRetries);
    }
    
    // Gestion des erreurs finales avec messages plus clairs
    console.error('❌ Erreur API finale:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Message d'erreur plus informatif
    const errorMsg = error.response?.data?.detail || 
                    error.response?.data?.error || 
                    error.response?.data?.message ||
                    `Erreur ${error.response?.status}: ${error.response?.statusText}` ||
                    'Erreur de connexion à l\'API';
    
    const customError = new Error(errorMsg);
    customError.originalError = error;
    throw customError;
  }
};

// Configuration d'axios avec l'URL de base
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Inscription - avec gestion automatique des cold starts
  register: async (userData) => {
    return handleColdStart(async () => {
      console.log('Tentative d\'inscription...');
      const response = await api.post('/v1/users', {
        username: userData.username,
        password: userData.password,
        name: userData.name,
        lastName: userData.last_name
      });
      return response.data;
    });
  },

  // Connexion - avec gestion automatique des cold starts
  login: async (credentials) => {
    return handleColdStart(async () => {
      console.log('Tentative de connexion...');
      
      const response = await api.post('/v1/login', {
        username: credentials.email,
        password: credentials.password
      });
      
      console.log('Réponse login réussie:', response.data);
      
      const { token, access_token, user } = response.data;
      const authToken = token || access_token;
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    });
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Récupérer le profil utilisateur (utilise la liste des users pour l'instant)
  getProfile: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Pour FastAPI, on récupère le profil via la liste des utilisateurs
      const response = await api.get('/v1/users');
      const userProfile = response.data.find(u => u.id === currentUser.id || u.username === currentUser.username);
      
      if (!userProfile) {
        throw new Error('Profil utilisateur non trouvé');
      }
      
      return { user: userProfile };
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération du profil' };
    }
  }
};

export const userService = {
  // Récupérer tous les utilisateurs (admin seulement) - avec gestion automatique des cold starts
  getAllUsers: async () => {
    return handleColdStart(async () => {
      console.log('Récupération de la liste des utilisateurs...');
      const response = await api.get('/v1/users');
      console.log('Réponse getAllUsers:', response.data);
      
      // Votre API renvoie "utilisateurs" au lieu de "users"
      const users = response.data.utilisateurs || response.data.users || response.data || [];
      console.log('Users extraits:', users);
      
      return { users: users };
    });
  },

  // Supprimer un utilisateur (admin seulement) - avec gestion automatique des cold starts
  deleteUser: async (userId) => {
    return handleColdStart(async () => {
      console.log('Tentative de suppression utilisateur ID:', userId);
      const response = await api.delete(`/v1/users/${userId}`);
      console.log('Suppression réussie:', response.data);
      return response.data;
    });
  }
};

export default api;
