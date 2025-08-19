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
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const { pool } = require('../config/database');
      const result = await pool.query(query, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM users';
      const countParams = [];
      if (subscription_status) {
        countQuery += ' WHERE subscription_status = $1';
        countParams.push(subscription_status);
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        users: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalUsers: totalCount,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateUserSubscription(req, res) {
    try {
      const { userId } = req.params;
      const { subscriptionStatus, subscriptionExpiry } = req.body;

      if (!['free', 'active', 'expired'].includes(subscriptionStatus)) {
        return res.status(400).json({ message: 'Invalid subscription status' });
      }

      const { pool } = require('../config/database');
      await pool.query(
        'UPDATE users SET subscription_status = $1, subscription_expiry = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [subscriptionStatus, subscriptionExpiry, userId]
      );

      res.json({ message: 'User subscription updated successfully' });
    } catch (error) {
      console.error('Update user subscription error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getRecentActivity(req, res) {
    try {
      const { pool } = require('../config/database');
      
      // Get recent blogs, comments, and transactions
      const [blogs, comments, transactions] = await Promise.all([
        pool.query(`
          SELECT b.id, b.title, b.created_at, u.name as author_name, 'blog' as type
          FROM blogs b 
          JOIN users u ON b.author_id = u.id 
          ORDER BY b.created_at DESC 
          LIMIT 5
        `),
        pool.query(`
          SELECT c.id, c.content, c.created_at, u.name as user_name, b.title as blog_title, 'comment' as type
          FROM comments c 
          JOIN users u ON c.user_id = u.id 
          JOIN blogs b ON c.blog_id = b.id 
          ORDER BY c.created_at DESC 
          LIMIT 5
        `),
        pool.query(`
          SELECT t.id, t.trx_id, t.amount, t.status, t.created_at, u.name as user_name, 'transaction' as type
          FROM transactions t 
          JOIN users u ON t.user_id = u.id 
          ORDER BY t.created_at DESC 
          LIMIT 5
        `)
      ]);

      const activity = [
        ...blogs.rows,
        ...comments.rows,
        ...transactions.rows
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

      res.json({ activity });
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getRevenueAnalytics(req, res) {
    try {
      const { period = 'monthly' } = req.query;
      const { pool } = require('../config/database');

      let dateFormat, dateInterval;
      switch (period) {
        case 'daily':
          dateFormat = 'YYYY-MM-DD';
          dateInterval = '1 day';
          break;
        case 'weekly':
          dateFormat = 'YYYY-"W"WW';
          dateInterval = '1 week';
          break;
        case 'yearly':
          dateFormat = 'YYYY';
          dateInterval = '1 year';
          break;
        default: // monthly
          dateFormat = 'YYYY-MM';
          dateInterval = '1 month';
      }

      const result = await pool.query(`
        SELECT 
          TO_CHAR(approved_at, $1) as period,
          SUM(amount) as revenue,
          COUNT(*) as transaction_count
        FROM transactions 
        WHERE status = 'approved' 
          AND approved_at >= CURRENT_DATE - INTERVAL '6 ${dateInterval}'
        GROUP BY TO_CHAR(approved_at, $1)
        ORDER BY period
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

  static async addTransactionId(req, res) {
    try {
      const { trxId } = req.body;

      if (!trxId || trxId.trim().length < 8) {
        return res.status(400).json({ message: 'Transaction ID must be at least 8 characters' });
      }

      const trimmedTrxId = trxId.trim();

      // Check if transaction ID already exists (this ensures uniqueness)
      const existingTransaction = await Transaction.findByTrxId(trimmedTrxId);
      if (existingTransaction) {
        return res.status(409).json({ 
          message: 'Transaction ID already exists. Each transaction ID must be unique.',
          existing: {
            id: existingTransaction.id,
            status: existingTransaction.status,
            createdAt: existingTransaction.created_at
          }
        });
      }

      // Create a new "approved" transaction with this ID
      const transactionId = await Transaction.createApprovedTransaction({
        trxId: trimmedTrxId
      });

      res.status(201).json({
        message: 'Transaction ID added successfully',
        transactionId,
        trxId: trimmedTrxId,
        status: 'approved'
      });
    } catch (error) {
      console.error('Add transaction ID error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Blog management functions
  static async getAllBlogs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const blogs = await Blog.findAll(limit, offset, null, null, true); // Include unpublished blogs for admin
      res.json({ blogs });
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
      const { is_published } = req.body;
      
      await Blog.updateStatus(id, is_published);
      res.json({ message: 'Blog status updated successfully' });
    } catch (error) {
      console.error('Update blog status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      await Blog.delete(id);
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error);
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
          const users = await pool.query('SELECT id, name, email, subscription_status, subscription_expiry, created_at FROM users ORDER BY created_at DESC');
          data = users.rows;
          filename = `users_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'transactions':
          const transactions = await pool.query(`
            SELECT t.*, u.name as user_name, u.email as user_email 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            ORDER BY t.created_at DESC
          `);
          data = transactions.rows;
          filename = `transactions_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'blogs':
          const blogs = await pool.query(`
            SELECT b.*, u.name as author_name 
            FROM blogs b 
            JOIN users u ON b.author_id = u.id 
            ORDER BY b.created_at DESC
          `);
          data = blogs.rows;
          filename = `blogs_export_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          return res.status(400).json({ message: 'Invalid export type' });
      }

      if (format === 'csv') {
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csv);
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

  static convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}

module.exports = AdminController;
