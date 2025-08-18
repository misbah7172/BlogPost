const { pool } = require('../config/database');

class Visitor {
  static async getVisitorCount() {
    try {
      const result = await pool.query(
        'SELECT COUNT(DISTINCT visitor_id) as total_visitors FROM visitors'
      );
      return parseInt(result.rows[0].total_visitors) || 0;
    } catch (error) {
      console.error('Error getting visitor count:', error);
      return 0;
    }
  }

  static async recordVisit(visitorId, ipAddress, userAgent, referrer = null) {
    try {
      // Check if this visitor has visited today
      const today = new Date().toISOString().split('T')[0];
      const existingVisit = await pool.query(
        'SELECT id FROM visitors WHERE visitor_id = $1 AND DATE(created_at) = $2',
        [visitorId, today]
      );

      if (existingVisit.rows.length === 0) {
        // Record new visit for today
        await pool.query(
          `INSERT INTO visitors (visitor_id, ip_address, user_agent, referrer, created_at) 
           VALUES ($1, $2, $3, $4, NOW())`,
          [visitorId, ipAddress, userAgent, referrer]
        );
      }

      // Return total unique visitors
      return await this.getVisitorCount();
    } catch (error) {
      console.error('Error recording visit:', error);
      return await this.getVisitorCount();
    }
  }

  static async getVisitorStats() {
    try {
      const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
        pool.query('SELECT COUNT(DISTINCT visitor_id) as count FROM visitors'),
        pool.query(
          'SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE DATE(created_at) = CURRENT_DATE'
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
}

module.exports = Visitor;
