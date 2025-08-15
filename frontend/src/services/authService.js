import { apiRequest, setToken, removeToken } from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  // Logout user
  logout: () => {
    removeToken();
  },

  // Get user profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  // Verify token
  verifyToken: async () => {
    return await apiRequest('/auth/verify');
  },

  // Get saved blogs
  getSavedBlogs: async () => {
    return await apiRequest('/auth/saved-blogs');
  },
};
