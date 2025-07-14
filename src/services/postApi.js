const axios = require('axios');

const POSTS_API_URL = process.env.REACT_APP_POSTS_API_URL;

// Fonction utilitaire pour gérer les cold starts de Vercel
const handleColdStart = async (apiCall, retryCount = 0, maxRetries = 2) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response?.status === 500 && retryCount < maxRetries) {
      console.log(`🟡 Cold start détecté (erreur 500), retry ${retryCount + 1}/${maxRetries} dans 2 secondes...`);
      console.log(`📄 Détail erreur:`, error.response?.data?.detail);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return handleColdStart(apiCall, retryCount + 1, maxRetries);
    }
    console.error('❌ Erreur API finale:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
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
  baseURL: POSTS_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const postService = {
  // Créer un nouveau post
  createPost: async (postData) => {
    return handleColdStart(async () => {
      console.log('Création d\'un nouveau post...');
      console.log('Données du post:', postData);
      const response = await api.post('/v1/posts', {
        title: postData.title,
        content: postData.content
      });
      console.log('Post créé avec succès:', response.data);
      return response.data;
    });
  },

  // Récupérer tous les posts
  getAllPosts: async () => {
    return handleColdStart(async () => {
      console.log('Récupération de tous les posts...');
      const response = await api.get('/v1/posts');
      const posts = Array.isArray(response.data) ? response.data : [];
      console.log('Posts extraits:', posts);
      return { posts };
    });
  }
};

export default postService;
