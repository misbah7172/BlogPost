const { pool } = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { userId, trxId, amount, planType } = transactionData;
    
    const result = await pool.query(
      'INSERT INTO transactions (user_id, trx_id, amount, plan_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, trxId, amount, planType]
    );
    
    return result.rows[0].id;
  }

  static async createApprovedTransaction(transactionData) {
    const { trxId } = transactionData;
    
    // Use user_id = 1 (admin user) for admin-created transaction IDs
    // These will be available for users to claim later
    // Using 'approved' status and 'lifetime' plan as placeholders
    const result = await pool.query(
      'INSERT INTO transactions (user_id, trx_id, amount, plan_type, status, approved_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id',
      [1, trxId, 0, 'lifetime', 'approved']
    );
    
    return result.rows[0].id;
  }

  static async findByTrxId(trxId) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE trx_id = $1',
      [trxId]
    );
    return result.rows[0];
  }

  static async findPendingByTrxId(trxId) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE trx_id = $1 AND status = $2',
      [trxId, 'pending']
    );
    return result.rows[0];
  }

  static async approve(trxId) {
    const result = await pool.query(
      'UPDATE transactions SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE trx_id = $2 AND status = $3',
      ['approved', trxId, 'pending']
    );
    
    if (result.rowCount > 0) {
      // Get transaction details to update user subscription
      const transaction = await this.findByTrxId(trxId);
      if (transaction) {
        const expiryDate = this.calculateExpiryDate(transaction.plan_type);
        await pool.query(
          'UPDATE users SET subscription_status = $1, subscription_expiry = $2 WHERE id = $3',
          ['active', expiryDate, transaction.user_id]
        );
      }
    }
    
    return result.rowCount > 0;
  }

  static async reject(trxId) {
    const result = await pool.query(
      'UPDATE transactions SET status = $1 WHERE trx_id = $2 AND status = $3',
      ['rejected', trxId, 'pending']
    );
    return result.rowCount > 0;
  }

  static calculateExpiryDate(planType) {
    const now = new Date();
    
    if (planType === 'lifetime') {
      // For lifetime subscription, set expiry to 100 years from now
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 100);
      return expiry;
    }

    const expiry = new Date(now);
    switch (planType) {
      case 'monthly':
        expiry.setMonth(expiry.getMonth() + 1);
        break;
      case 'quarterly':
        expiry.setMonth(expiry.getMonth() + 3);
        break;
      case 'yearly':
        expiry.setFullYear(expiry.getFullYear() + 1);
        break;
      default:
        expiry.setMonth(expiry.getMonth() + 1); // Default to monthly
    }

    return expiry;
  }

  static async findAll(limit = 50, offset = 0, status = null) {
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_transactions,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_transactions,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue
      FROM transactions
    `);
    return result.rows[0];
  }

  static getPlanPrices() {
    return {
      lifetime: 30.00,
      monthly: 199.00,
      quarterly: 499.00,
      yearly: 1599.00
    };
  }
}

module.exports = Transaction;
