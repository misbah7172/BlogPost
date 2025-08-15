import { apiRequest } from './api';

export const commentService = {
  // Get comments for a blog
  getComments: async (blogId) => {
    return await apiRequest(`/comments/blog/${blogId}`);
  },

  // Add comment to blog
  addComment: async (blogId, content) => {
    return await apiRequest(`/comments/blog/${blogId}`, {
      method: 'POST',
      body: { content },
    });
  },

  // Update comment
  updateComment: async (commentId, content) => {
    return await apiRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: { content },
    });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return await apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};
