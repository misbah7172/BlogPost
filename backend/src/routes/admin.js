const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard and analytics
router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/analytics/revenue', AdminController.getRevenueAnalytics);
router.get('/activity/recent', AdminController.getRecentActivity);

// User management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/subscription', AdminController.updateUserSubscription);

// Blog management
router.get('/blogs', AdminController.getAllBlogs);
router.get('/blogs/:id', AdminController.getBlogById);
router.put('/blogs/:id/status', AdminController.updateBlogStatus);
router.delete('/blogs/:id', AdminController.deleteBlog);

// Transaction management
router.post('/transactions/bulk-approve', AdminController.bulkApproveTransactions);

// Data export
router.get('/export', AdminController.exportData);

module.exports = router;
