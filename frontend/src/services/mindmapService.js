import { apiRequest } from './api';

const mindmapService = {
  // Create a new mindmap
  create: async (mindmapData) => {
    try {
      const response = await apiRequest('/mindmaps', {
        method: 'POST',
        body: mindmapData
      });
      return response;
    } catch (error) {
      console.error('Error creating mindmap:', error);
      throw error;
    }
  },

  // Get mindmap by ID
  getById: async (id) => {
    try {
      const response = await apiRequest(`/mindmaps/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching mindmap:', error);
      throw error;
    }
  },

  // Get mindmap by blog ID
  getByBlogId: async (blogId) => {
    try {
      const response = await apiRequest(`/mindmaps/blog/${blogId}`);
      return response;
    } catch (error) {
      console.error('Error fetching mindmap by blog ID:', error);
      throw error;
    }
  },

  // Update mindmap
  update: async (id, mindmapData) => {
    try {
      const response = await apiRequest(`/mindmaps/${id}`, {
        method: 'PUT',
        body: mindmapData
      });
      return response;
    } catch (error) {
      console.error('Error updating mindmap:', error);
      throw error;
    }
  },

  // Delete mindmap
  delete: async (id) => {
    try {
      const response = await apiRequest(`/mindmaps/${id}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting mindmap:', error);
      throw error;
    }
  },

  // Get author's mindmaps
  getAuthorMindmaps: async () => {
    try {
      const response = await apiRequest('/mindmaps/author/me');
      return response;
    } catch (error) {
      console.error('Error fetching author mindmaps:', error);
      throw error;
    }
  },

  // Get admin stats
  getAdminStats: async () => {
    try {
      const response = await apiRequest('/mindmaps/admin/stats');
      return response;
    } catch (error) {
      console.error('Error fetching mindmap stats:', error);
      throw error;
    }
  }
};

export default mindmapService;
