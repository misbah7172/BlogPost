const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0];
  }

  static async findById(id) {
    const [users] = await pool.execute(
      'SELECT id, name, email, subscription_status, subscription_expiry, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateSubscription(userId, status, expiryDate) {
    await pool.execute(
      'UPDATE users SET subscription_status = ?, subscription_expiry = ? WHERE id = ?',
      [status, expiryDate, userId]
    );
  }

  static async getSubscriptionStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscribers,
        SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expired_subscribers,
        SUM(CASE WHEN subscription_status = 'free' THEN 1 ELSE 0 END) as free_users
      FROM users
    `);
    return stats[0];
  }

  static async getSavedBlogs(userId) {
    const [blogs] = await pool.execute(`
      SELECT b.*, sp.created_at as saved_at
      FROM blogs b
      JOIN saved_posts sp ON b.id = sp.blog_id
      WHERE sp.user_id = ?
      ORDER BY sp.created_at DESC
    `, [userId]);
    return blogs;
  }
}

module.exports = User;
