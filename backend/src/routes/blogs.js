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
    // Create a custom auth middleware that doesn't send error responses
    const optionalAuth = async (req, res, next) => {
      try {
        const token = authHeader.split(' ')[1];
        if (!token) {
          req.user = null;
          return next();
        }

        const jwt = require('jsonwebtoken');
        const { pool } = require('../config/database');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query(
          'SELECT id, name, email, role, subscription_status, subscription_expiry, created_at, updated_at FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          req.user = null;
        } else {
          req.user = result.rows[0];
        }
        next();
      } catch (error) {
        req.user = null;
        next();
      }
    };
    
    optionalAuth(req, res, next);
  } else {
    req.user = null;
    next();
  }
}, BlogController.getAllBlogs);

router.get('/categories', BlogController.getCategories);
router.get('/stats', BlogController.getPublicStats);
router.get('/saved', authenticateToken, BlogController.getSavedBlogs);

router.get('/:id', (req, res, next) => {
  // Try to authenticate but don't require it
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    // Create a custom auth middleware that doesn't send error responses
    const optionalAuth = async (req, res, next) => {
      try {
        const token = authHeader.split(' ')[1];
        if (!token) {
          req.user = null;
          return next();
        }

        const jwt = require('jsonwebtoken');
        const { pool } = require('../config/database');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query(
          'SELECT id, name, email, role, subscription_status, subscription_expiry, created_at, updated_at FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          req.user = null;
        } else {
          req.user = result.rows[0];
        }
        next();
      } catch (error) {
        req.user = null;
        next();
      }
    };
    
    optionalAuth(req, res, next);
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
