const { pool } = require('../config/database');

class Blog {
  static async create(blogData) {
    const { title, category, tags, content, excerpt, imageUrl, isPremium, authorId } = blogData;
    
    const [result] = await pool.execute(
      'INSERT INTO blogs (title, category, tags, content, excerpt, image_url, is_premium, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, tags, content, excerpt, imageUrl, isPremium, authorId]
    );
    
    return result.insertId;
  }

  static async findAll(limit = 50, offset = 0, category = null, search = null) {
    let query = `
      SELECT b.*, u.name as author_name,
        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.is_published = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND b.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (b.title LIKE ? OR b.content LIKE ? OR b.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [blogs] = await pool.execute(query, params);
    return blogs;
  }

  static async findById(id) {
    const [blogs] = await pool.execute(`
      SELECT b.*, u.name as author_name,
        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.id = ? AND b.is_published = TRUE
    `, [id]);
    return blogs[0];
  }

  static async update(id, blogData) {
    const { title, category, tags, content, excerpt, imageUrl, isPremium } = blogData;
    
    await pool.execute(
      'UPDATE blogs SET title = ?, category = ?, tags = ?, content = ?, excerpt = ?, image_url = ?, is_premium = ? WHERE id = ?',
      [title, category, tags, content, excerpt, imageUrl, isPremium, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
  }

  static async getCategories() {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category, COUNT(*) as count FROM blogs WHERE is_published = TRUE GROUP BY category ORDER BY category'
    );
    return categories;
  }

  static async checkUserLike(blogId, userId) {
    const [likes] = await pool.execute(
      'SELECT id FROM likes WHERE blog_id = ? AND user_id = ?',
      [blogId, userId]
    );
    return likes.length > 0;
  }

  static async toggleLike(blogId, userId) {
    const isLiked = await this.checkUserLike(blogId, userId);
    
    if (isLiked) {
      await pool.execute(
        'DELETE FROM likes WHERE blog_id = ? AND user_id = ?',
        [blogId, userId]
      );
      return false; // unliked
    } else {
      await pool.execute(
        'INSERT INTO likes (blog_id, user_id) VALUES (?, ?)',
        [blogId, userId]
      );
      return true; // liked
    }
  }

  static async checkUserSave(blogId, userId) {
    const [saves] = await pool.execute(
      'SELECT id FROM saved_posts WHERE blog_id = ? AND user_id = ?',
      [blogId, userId]
    );
    return saves.length > 0;
  }

  static async toggleSave(blogId, userId) {
    const isSaved = await this.checkUserSave(blogId, userId);
    
    if (isSaved) {
      await pool.execute(
        'DELETE FROM saved_posts WHERE blog_id = ? AND user_id = ?',
        [blogId, userId]
      );
      return false; // unsaved
    } else {
      await pool.execute(
        'INSERT INTO saved_posts (blog_id, user_id) VALUES (?, ?)',
        [blogId, userId]
      );
      return true; // saved
    }
  }

  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_blogs,
        SUM(CASE WHEN is_premium = TRUE THEN 1 ELSE 0 END) as premium_blogs,
        SUM(CASE WHEN is_premium = FALSE THEN 1 ELSE 0 END) as free_blogs,
        (SELECT COUNT(*) FROM likes) as total_likes,
        (SELECT COUNT(*) FROM comments) as total_comments
      FROM blogs
      WHERE is_published = TRUE
    `);
    return stats[0];
  }

  static async getSavedBlogs(userId) {
    const [blogs] = await pool.execute(`
      SELECT b.*, u.name as author_name,
        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count,
        sp.created_at as saved_at
      FROM saved_posts sp
      JOIN blogs b ON sp.blog_id = b.id
      LEFT JOIN users u ON b.author_id = u.id
      WHERE sp.user_id = ? AND b.is_published = TRUE
      ORDER BY sp.created_at DESC
    `, [userId]);
    return blogs;
  }
}

module.exports = Blog;
