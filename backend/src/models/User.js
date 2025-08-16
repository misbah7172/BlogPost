const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    
    return result.rows[0].id;
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, subscription_status, subscription_expiry, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateSubscription(userId, status, expiryDate) {
    await pool.query(
      'UPDATE users SET subscription_status = $1, subscription_expiry = $2 WHERE id = $3',
      [status, expiryDate, userId]
    );
  }

  static async getSubscriptionStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscribers,
        SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expired_subscribers,
        SUM(CASE WHEN subscription_status = 'free' THEN 1 ELSE 0 END) as free_users
      FROM users
    `);
    return result.rows[0];
  }

  static async getSavedBlogs(userId) {
    const result = await pool.query(`
      SELECT b.*, sp.created_at as saved_at
      FROM blogs b
      JOIN saved_posts sp ON b.id = sp.blog_id
      WHERE sp.user_id = $1
      ORDER BY sp.created_at DESC
    `, [userId]);
    return result.rows;
  }
}

module.exports = User;
