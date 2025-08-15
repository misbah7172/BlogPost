const Blog = require('../models/Blog');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Comment = require('../models/Comment');

class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const [blogStats, userStats, transactionStats, commentStats] = await Promise.all([
        Blog.getStats(),
        User.getSubscriptionStats(),
        Transaction.getStats(),
        Comment.getStats()
      ]);

      res.json({
        blogs: blogStats,
        users: userStats,
        transactions: transactionStats,
        comments: commentStats,
        revenue: {
          total: transactionStats.total_revenue,
          monthly: transactionStats.total_revenue // You can calculate monthly revenue separately
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, subscription_status } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, name, email, subscription_status, subscription_expiry, role, created_at
        FROM users
      `;
      const params = [];

      if (subscription_status) {
        query += ' WHERE subscription_status = ?';
        params.push(subscription_status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [users] = await require('../config/database').pool.execute(query, params);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: users.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateUserSubscription(req, res) {
    try {
      const { userId } = req.params;
      const { subscription_status, subscription_expiry } = req.body;

      // Validate input
      const validStatuses = ['free', 'active', 'expired'];
      if (!validStatuses.includes(subscription_status)) {
        return res.status(400).json({ message: 'Invalid subscription status' });
      }

      if (subscription_status === 'active' && !subscription_expiry) {
        return res.status(400).json({ message: 'Expiry date required for active subscription' });
      }

      await User.updateSubscription(userId, subscription_status, subscription_expiry);

      res.json({ message: 'User subscription updated successfully' });
    } catch (error) {
      console.error('Update user subscription error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getRecentActivity(req, res) {
    try {
      const { pool } = require('../config/database');

      // Get recent transactions
      const [recentTransactions] = await pool.execute(`
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);

      // Get recent comments
      const [recentComments] = await pool.execute(`
        SELECT c.*, u.name as user_name, b.title as blog_title
        FROM comments c
        JOIN users u ON c.user_id = u.id
        JOIN blogs b ON c.blog_id = b.id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);

      // Get recent blog views (if you implement view tracking)
      const [recentBlogs] = await pool.execute(`
        SELECT b.*, u.name as author_name
        FROM blogs b
        JOIN users u ON b.author_id = u.id
        ORDER BY b.created_at DESC
        LIMIT 10
      `);

      res.json({
        recentTransactions,
        recentComments,
        recentBlogs
      });
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getRevenueAnalytics(req, res) {
    try {
      const { pool } = require('../config/database');
      const { period = 'monthly' } = req.query;

      let dateFormat;
      switch (period) {
        case 'daily':
          dateFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          dateFormat = '%Y-%u';
          break;
        case 'yearly':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }

      const [revenueData] = await pool.execute(`
        SELECT 
          DATE_FORMAT(approved_at, ?) as period,
          COUNT(*) as transaction_count,
          SUM(amount) as total_revenue,
          plan_type
        FROM transactions 
        WHERE status = 'approved' AND approved_at IS NOT NULL
        GROUP BY period, plan_type
        ORDER BY period DESC
        LIMIT 12
      `, [dateFormat]);

      res.json({ revenueData, period });
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async bulkApproveTransactions(req, res) {
    try {
      const { transactionIds } = req.body;

      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({ message: 'Transaction IDs array required' });
      }

      let approved = 0;
      for (const trxId of transactionIds) {
        const success = await Transaction.approve(trxId);
        if (success) approved++;
      }

      res.json({
        message: `${approved} transactions approved successfully`,
        approved,
        total: transactionIds.length
      });
    } catch (error) {
      console.error('Bulk approve transactions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async exportData(req, res) {
    try {
      const { type, format = 'json' } = req.query;
      const { pool } = require('../config/database');

      let data;
      let filename;

      switch (type) {
        case 'users':
          const [users] = await pool.execute(`
            SELECT id, name, email, subscription_status, subscription_expiry, created_at
            FROM users
          `);
          data = users;
          filename = 'users_export';
          break;

        case 'transactions':
          const [transactions] = await pool.execute(`
            SELECT t.*, u.name as user_name, u.email as user_email
            FROM transactions t
            JOIN users u ON t.user_id = u.id
          `);
          data = transactions;
          filename = 'transactions_export';
          break;

        case 'blogs':
          const [blogs] = await pool.execute(`
            SELECT b.*, u.name as author_name
            FROM blogs b
            JOIN users u ON b.author_id = u.id
          `);
          data = blogs;
          filename = 'blogs_export';
          break;

        default:
          return res.status(400).json({ message: 'Invalid export type' });
      }

      if (format === 'csv') {
        // For CSV export, you'd need to implement CSV conversion
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        // Implement CSV conversion here
        res.json({ message: 'CSV export not implemented yet' });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(data);
      }
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = AdminController;
