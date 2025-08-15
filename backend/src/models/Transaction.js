const { pool } = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { userId, trxId, amount, planType } = transactionData;
    
    const [result] = await pool.execute(
      'INSERT INTO transactions (user_id, trx_id, amount, plan_type) VALUES (?, ?, ?, ?)',
      [userId, trxId, amount, planType]
    );
    
    return result.insertId;
  }

  static async findByTrxId(trxId) {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE trx_id = ?',
      [trxId]
    );
    return transactions[0];
  }

  static async findPendingByTrxId(trxId) {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE trx_id = ? AND status = "pending"',
      [trxId]
    );
    return transactions[0];
  }

  static async approve(trxId) {
    const [result] = await pool.execute(
      'UPDATE transactions SET status = "approved", approved_at = NOW() WHERE trx_id = ? AND status = "pending"',
      [trxId]
    );
    
    if (result.affectedRows > 0) {
      // Get transaction details to update user subscription
      const transaction = await this.findByTrxId(trxId);
      if (transaction) {
        const expiryDate = this.calculateExpiryDate(transaction.plan_type);
        await pool.execute(
          'UPDATE users SET subscription_status = "active", subscription_expiry = ? WHERE id = ?',
          [expiryDate, transaction.user_id]
        );
      }
    }
    
    return result.affectedRows > 0;
  }

  static async reject(trxId) {
    const [result] = await pool.execute(
      'UPDATE transactions SET status = "rejected" WHERE trx_id = ? AND status = "pending"',
      [trxId]
    );
    return result.affectedRows > 0;
  }

  static calculateExpiryDate(planType) {
    const now = new Date();
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

    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [transactions] = await pool.execute(query, params);
    return transactions;
  }

  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_transactions,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_transactions,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue
      FROM transactions
    `);
    return stats[0];
  }

  static getPlanPrices() {
    return {
      monthly: 199.00,
      quarterly: 499.00,
      yearly: 1599.00
    };
  }
}

module.exports = Transaction;
