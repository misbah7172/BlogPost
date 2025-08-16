import { apiRequest } from './api';

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    return await apiRequest('/categories');
  },

  // Get category statistics
  getCategoryStats: async () => {
    return await apiRequest('/categories/stats');
  },

  // Get category by slug
  getCategory: async (slug) => {
    return await apiRequest(`/categories/${slug}`);
  },

  // Get blogs in a category
  getCategoryBlogs: async (slug, params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const queryString = searchParams.toString();
    return await apiRequest(`/categories/${slug}/blogs${queryString ? `?${queryString}` : ''}`);
  },

  // Admin functions
  createCategory: async (categoryData) => {
    return await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id, categoryData) => {
    return await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id) => {
    return await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

export default categoryService;
