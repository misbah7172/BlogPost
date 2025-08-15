const { pool } = require('../config/database');

class Comment {
  static async create(commentData) {
    const { blogId, userId, content } = commentData;
    
    const [result] = await pool.execute(
      'INSERT INTO comments (blog_id, user_id, content) VALUES (?, ?, ?)',
      [blogId, userId, content]
    );
    
    return result.insertId;
  }

  static async findByBlogId(blogId) {
    const [comments] = await pool.execute(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = ?
      ORDER BY c.created_at DESC
    `, [blogId]);
    
    return comments;
  }

  static async findById(id) {
    const [comments] = await pool.execute(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);
    
    return comments[0];
  }

  static async delete(id, userId, userRole = 'user') {
    let query = 'DELETE FROM comments WHERE id = ?';
    let params = [id];

    // Only allow deletion by comment owner or admin
    if (userRole !== 'admin') {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async update(id, userId, content) {
    const [result] = await pool.execute(
      'UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [content, id, userId]
    );
    
    return result.affectedRows > 0;
  }

  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_comments,
        COUNT(DISTINCT user_id) as unique_commenters,
        COUNT(DISTINCT blog_id) as blogs_with_comments
      FROM comments
    `);
    return stats[0];
  }
}

module.exports = Comment;
