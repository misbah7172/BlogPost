const { pool } = require('../config/database');

class Comment {
  static async create(commentData) {
    const { blogId, userId, content } = commentData;
    
    const result = await pool.query(
      'INSERT INTO comments (blog_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
      [blogId, userId, content]
    );
    
    return result.rows[0].id;
  }

  static async findByBlogId(blogId) {
    const result = await pool.query(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at DESC
    `, [blogId]);
    
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);
    
    return result.rows[0];
  }

  static async delete(id, userId, userRole = 'user') {
    let query = 'DELETE FROM comments WHERE id = $1';
    let params = [id];

    // Only allow deletion by comment owner or admin
    if (userRole !== 'admin') {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rowCount > 0;
  }

  static async update(id, userId, content) {
    const result = await pool.query(
      'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      [content, id, userId]
    );
    
    return result.rowCount > 0;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_comments,
        COUNT(DISTINCT user_id) as unique_commenters,
        COUNT(DISTINCT blog_id) as blogs_with_comments
      FROM comments
    `);
    return result.rows[0];
  }
}

module.exports = Comment;
