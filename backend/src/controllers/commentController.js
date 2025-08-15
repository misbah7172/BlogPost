const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

class CommentController {
  // Validation rules
  static validateComment = [
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters')
  ];

  static async createComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { blogId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Check if blog exists
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const commentId = await Comment.create({
        blogId,
        userId,
        content
      });

      const comment = await Comment.findById(commentId);
      res.status(201).json({
        message: 'Comment added successfully',
        comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getCommentsByBlogId(req, res) {
    try {
      const { blogId } = req.params;

      // Check if blog exists
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const comments = await Comment.findByBlogId(blogId);
      res.json({ comments });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const updated = await Comment.update(id, userId, content);
      if (!updated) {
        return res.status(404).json({ message: 'Comment not found or unauthorized' });
      }

      const comment = await Comment.findById(id);
      res.json({
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const deleted = await Comment.delete(id, userId, userRole);
      if (!deleted) {
        return res.status(404).json({ message: 'Comment not found or unauthorized' });
      }

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = CommentController;
