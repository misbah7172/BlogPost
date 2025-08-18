const { pool } = require('../config/database');
const crypto = require('crypto');

class Visitor {
  static generateVisitorId(ip, userAgent) {
    return crypto.createHash('sha256').update(ip + userAgent).digest('hex').substring(0, 16);
  }

  static async recordVisit(visitorId, ipAddress, userAgent, referrer = null) {
    try {
      // Check if this exact visitor ID already exists
      const existingResult = await pool.query(
        'SELECT id FROM visitors WHERE visitor_id = $1',
        [visitorId]
      );

      // If visitor doesn't exist, create new record
      if (existingResult.rows.length === 0) {
        await pool.query(
          'INSERT INTO visitors (visitor_id, ip_address, user_agent, referrer) VALUES ($1, $2, $3, $4)',
          [visitorId, ipAddress, userAgent, referrer]
        );
      } else {
        // Update the existing visitor's last visit time
        await pool.query(
          'UPDATE visitors SET created_at = CURRENT_TIMESTAMP WHERE visitor_id = $1',
          [visitorId]
        );
      }

      // Return total visitor count
      return await this.getVisitorCount();
    } catch (error) {
      console.error('Error recording visit:', error);
      throw error;
    }
  }

  static async getVisitorCount() {
    try {
      const result = await pool.query('SELECT COUNT(*) as count FROM visitors');
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('Error getting visitor count:', error);
      return 0;
    }
  }

  static async getVisitorStats() {
    try {
      const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
        pool.query('SELECT COUNT(DISTINCT visitor_id) as count FROM visitors'),
        pool.query(
          'SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE created_at >= CURRENT_DATE'
        ),
        pool.query(
          'SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE created_at >= NOW() - INTERVAL \'7 days\''
        ),
        pool.query(
          'SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE created_at >= NOW() - INTERVAL \'30 days\''
        )
      ]);

      return {
        total: parseInt(totalResult.rows[0].count) || 0,
        today: parseInt(todayResult.rows[0].count) || 0,
        thisWeek: parseInt(weekResult.rows[0].count) || 0,
        thisMonth: parseInt(monthResult.rows[0].count) || 0
      };
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      return { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };
    }
  }

  static async getRecentVisitors(limit = 10) {
    try {
      const result = await pool.query(
        `SELECT visitor_id, ip_address, user_agent, referrer, created_at 
         FROM visitors 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting recent visitors:', error);
      return [];
    }
  }

  static async getAnalytics(days = 7) {
    try {
      const result = await pool.query(
        `SELECT DATE(created_at) as date, COUNT(DISTINCT visitor_id) as unique_visitors, COUNT(*) as total_visits
         FROM visitors 
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting visitor analytics:', error);
      return [];
    }
  }
}

module.exports = Visitor;