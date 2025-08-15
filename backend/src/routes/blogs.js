const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// Public routes (optional auth for user-specific data)
router.get('/', (req, res, next) => {
  // Try to authenticate but don't require it
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, (err) => {
      if (!err) {
        // Authentication successful, continue
        next();
      } else {
        // Authentication failed, but continue without user data
        req.user = null;
        next();
      }
    });
  } else {
    req.user = null;
    next();
  }
}, BlogController.getAllBlogs);

router.get('/categories', BlogController.getCategories);
router.get('/saved', authenticateToken, BlogController.getSavedBlogs);

router.get('/:id', (req, res, next) => {
  // Try to authenticate but don't require it
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, (err) => {
      if (!err) {
        next();
      } else {
        req.user = null;
        next();
      }
    });
  } else {
    req.user = null;
    next();
  }
}, BlogController.getBlogById);

router.get('/:id/likes', (req, res, next) => {
  // Try to authenticate but don't require it
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, (err) => {
      if (!err) {
        next();
      } else {
        req.user = null;
        next();
      }
    });
  } else {
    req.user = null;
    next();
  }
}, BlogController.getLikes);

// Protected routes (require authentication)
router.post('/:id/like', authenticateToken, BlogController.toggleLike);
router.post('/:id/save', authenticateToken, BlogController.toggleSave);

// Admin routes
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  upload.single('image'), 
  handleMulterError,
  BlogController.validateBlog, 
  BlogController.createBlog
);

router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  upload.single('image'), 
  handleMulterError,
  BlogController.validateBlog, 
  BlogController.updateBlog
);

router.delete('/:id', authenticateToken, requireAdmin, BlogController.deleteBlog);

module.exports = router;
