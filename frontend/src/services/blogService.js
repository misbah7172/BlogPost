import { apiRequest } from './api';

export const blogService = {
  // Get all blogs with optional filters
  getBlogs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const queryString = searchParams.toString();
    return await apiRequest(`/blogs${queryString ? `?${queryString}` : ''}`);
  },

  // Get single blog by ID
  getBlog: async (id) => {
    return await apiRequest(`/blogs/${id}`);
  },

  // Get blog categories
  getCategories: async () => {
    return await apiRequest('/blogs/categories');
  },

  // Like/unlike blog
  toggleLike: async (id) => {
    return await apiRequest(`/blogs/${id}/like`, {
      method: 'POST',
    });
  },

  // Save/unsave blog
  toggleSave: async (id) => {
    return await apiRequest(`/blogs/${id}/save`, {
      method: 'POST',
    });
  },

  // Get blog likes
  getLikes: async (id) => {
    return await apiRequest(`/blogs/${id}/likes`);
  },

  // Admin functions
  createBlog: async (blogData) => {
    const formData = new FormData();
    
    Object.keys(blogData).forEach(key => {
      if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });

    return await apiRequest('/blogs', {
      method: 'POST',
      body: formData,
    });
  },

  updateBlog: async (id, blogData) => {
    const formData = new FormData();
    
    Object.keys(blogData).forEach(key => {
      if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });

    return await apiRequest(`/blogs/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  deleteBlog: async (id) => {
    return await apiRequest(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  // Get saved blogs for user
  getSavedBlogs: async () => {
    return await apiRequest('/blogs/saved');
  },

  // Get all blogs (admin)
  getAllBlogs: async () => {
    return await apiRequest('/admin/blogs');
  },

  // Add blog comment
  addComment: async (blogId, content) => {
    return await apiRequest(`/comments/blog/${blogId}`, {
      method: 'POST',
      body: { content },
    });
  },

  // Get blog comments
  getComments: async (blogId) => {
    return await apiRequest(`/comments/blog/${blogId}`);
  },
};
