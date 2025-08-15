const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/blog/:blogId', CommentController.getCommentsByBlogId);

// Protected routes
router.post('/blog/:blogId', authenticateToken, CommentController.validateComment, CommentController.createComment);
router.put('/:id', authenticateToken, CommentController.validateComment, CommentController.updateComment);
router.delete('/:id', authenticateToken, CommentController.deleteComment);

module.exports = router;
