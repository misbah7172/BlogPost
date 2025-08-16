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
      let paramCount = 0;

      if (subscription_status) {
        paramCount++;
        query += ` WHERE subscription_status = $${paramCount}`;
        params.push(subscription_status);
      }

      paramCount++;
      query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
      params.push(parseInt(limit));
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset));

      const { pool } = require('../config/database');
      const result = await pool.query(query, params);
      const users = result.rows;

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
      const recentTransactionsResult = await pool.query(`
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);
      const recentTransactions = recentTransactionsResult.rows;

      // Get recent comments
      const recentCommentsResult = await pool.query(`
        SELECT c.*, u.name as user_name, b.title as blog_title
        FROM comments c
        JOIN users u ON c.user_id = u.id
        JOIN blogs b ON c.blog_id = b.id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);
      const recentComments = recentCommentsResult.rows;

      // Get recent blog views (if you implement view tracking)
      const recentBlogsResult = await pool.query(`
        SELECT b.*, u.name as author_name
        FROM blogs b
        JOIN users u ON b.author_id = u.id
        ORDER BY b.created_at DESC
        LIMIT 10
      `);
      const recentBlogs = recentBlogsResult.rows;

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
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'weekly':
          dateFormat = 'YYYY-WW';
          break;
        case 'yearly':
          dateFormat = 'YYYY';
          break;
        default:
          dateFormat = 'YYYY-MM';
      }

      const result = await pool.query(`
        SELECT 
          TO_CHAR(approved_at, $1) as period,
          COUNT(*) as transaction_count,
          SUM(amount) as total_revenue,
          plan_type
        FROM transactions 
        WHERE status = 'approved' AND approved_at IS NOT NULL
        GROUP BY period, plan_type
        ORDER BY period DESC
        LIMIT 12
      `, [dateFormat]);
      const revenueData = result.rows;

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
          const usersResult = await pool.query(`
            SELECT id, name, email, subscription_status, subscription_expiry, created_at
            FROM users
          `);
          data = usersResult.rows;
          filename = 'users_export';
          break;

        case 'transactions':
          const transactionsResult = await pool.query(`
            SELECT t.*, u.name as user_name, u.email as user_email
            FROM transactions t
            JOIN users u ON t.user_id = u.id
          `);
          data = transactionsResult.rows;
          filename = 'transactions_export';
          break;

        case 'blogs':
          const blogsResult = await pool.query(`
            SELECT b.*, u.name as author_name
            FROM blogs b
            JOIN users u ON b.author_id = u.id
          `);
          data = blogsResult.rows;
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

  // Blog management methods
  static async getAllBlogs(req, res) {
    try {
      const { page = 1, limit = 50, category, search, status } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT b.*, u.name as author_name, c.name as category_name, c.color as category_color,
          (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count,
          (SELECT COUNT(*) FROM saved_posts WHERE blog_id = b.id) as saves_count
        FROM blogs b
        LEFT JOIN users u ON b.author_id = u.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (category) {
        paramCount++;
        query += ` AND (b.category = $${paramCount}`;
        params.push(category);
        paramCount++;
        query += ` OR c.slug = $${paramCount})`;
        params.push(category);
      }

      if (search) {
        const searchTerm = `%${search}%`;
        paramCount++;
        query += ` AND (b.title ILIKE $${paramCount}`;
        params.push(searchTerm);
        paramCount++;
        query += ` OR b.content ILIKE $${paramCount}`;
        params.push(searchTerm);
        paramCount++;
        query += ` OR b.tags ILIKE $${paramCount})`;
        params.push(searchTerm);
      }

      if (status === 'published') {
        query += ' AND b.is_published = TRUE';
      } else if (status === 'draft') {
        query += ' AND b.is_published = FALSE';
      } else if (status === 'premium') {
        query += ' AND b.is_premium = TRUE';
      }

      paramCount++;
      query += ` ORDER BY b.created_at DESC LIMIT $${paramCount}`;
      params.push(parseInt(limit));
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset));

      const { pool } = require('../config/database');
      const result = await pool.query(query, params);
      const blogs = result.rows;

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM blogs b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const countParams = [];
      let countParamCount = 0;

      if (category) {
        countParamCount++;
        countQuery += ` AND (b.category = $${countParamCount}`;
        countParams.push(category);
        countParamCount++;
        countQuery += ` OR c.slug = $${countParamCount})`;
        countParams.push(category);
      }

      if (search) {
        const searchTerm = `%${search}%`;
        countParamCount++;
        countQuery += ` AND (b.title ILIKE $${countParamCount}`;
        countParams.push(searchTerm);
        countParamCount++;
        countQuery += ` OR b.content ILIKE $${countParamCount}`;
        countParams.push(searchTerm);
        countParamCount++;
        countQuery += ` OR b.tags ILIKE $${countParamCount})`;
        countParams.push(searchTerm);
      }

      if (status === 'published') {
        countQuery += ' AND b.is_published = TRUE';
      } else if (status === 'draft') {
        countQuery += ' AND b.is_published = FALSE';
      } else if (status === 'premium') {
        countQuery += ' AND b.is_premium = TRUE';
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = countResult.rows[0].total;

      res.json({
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          totalPages: Math.ceil(total / limit),
          hasMore: (page * limit) < total
        }
      });
    } catch (error) {
      console.error('Get all blogs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getBlogById(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      res.json({ blog });
    } catch (error) {
      console.error('Get blog by ID error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateBlogStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_published, is_premium } = req.body;

      const { pool } = require('../config/database');
      await pool.query(
        'UPDATE blogs SET is_published = $1, is_premium = $2 WHERE id = $3',
        [is_published, is_premium, id]
      );

      res.json({ message: 'Blog status updated successfully' });
    } catch (error) {
      console.error('Update blog status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteBlog(req, res) {
    try {
      const { id } = req.params;

      const { pool } = require('../config/database');
      await pool.query('DELETE FROM blogs WHERE id = $1', [id]);

      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = AdminController;
