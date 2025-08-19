const { pool } = require('../config/database');

class Blog {
  static async create(blogData) {
    const { title, category, categoryId, tags, content, excerpt, imageUrl, isPremium, authorId, mindmapData } = blogData;
    
    const result = await pool.query(
      'INSERT INTO blogs (title, category, category_id, tags, content, excerpt, image_url, is_premium, author_id, mindmap_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [title, category, categoryId, tags, content, excerpt, imageUrl, isPremium, authorId, mindmapData ? JSON.stringify(mindmapData) : null]
    );
    
    return result.rows[0].id;
  }

  static async findAll(limit = 50, offset = 0, category = null, search = null, includeUnpublished = false) {
    let query = `
      SELECT b.*, u.name as author_name, c.name as category_name, c.color as category_color, c.icon as category_icon,
        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Only filter by published status if not including unpublished blogs (admin view)
    if (!includeUnpublished) {
      conditions.push('b.is_published = TRUE');
    }

    if (category) {
      conditions.push(`(b.category = $${paramIndex} OR c.slug = $${paramIndex + 1})`);
      params.push(category, category);
      paramIndex += 2;
    }

    if (search) {
      conditions.push(`(b.title ILIKE $${paramIndex} OR b.content ILIKE $${paramIndex + 1} OR b.tags ILIKE $${paramIndex + 2})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT b.*, u.name as author_name, c.name as category_name, c.color as category_color, c.icon as category_icon,
        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1 AND b.is_published = TRUE
    `, [id]);
    return result.rows[0];
  }

  static async update(id, blogData) {
    const { title, category, tags, content, excerpt, imageUrl, isPremium, mindmapData } = blogData;
    
    await pool.query(
      'UPDATE blogs SET title = $1, category = $2, tags = $3, content = $4, excerpt = $5, image_url = $6, is_premium = $7, mindmap_data = $8 WHERE id = $9',
      [title, category, tags, content, excerpt, imageUrl, isPremium, mindmapData ? JSON.stringify(mindmapData) : null, id]
    );
  }

  static async updateStatus(id, isPublished) {
    await pool.query(
      'UPDATE blogs SET is_published = $1 WHERE id = $2',
      [isPublished, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
  }

  static async getCategories() {
    const result = await pool.query(
      'SELECT DISTINCT category, COUNT(*) as count FROM blogs WHERE is_published = TRUE GROUP BY category ORDER BY category'
    );
    return result.rows;
  }

  static async checkUserLike(blogId, userId) {
    const result = await pool.query(
      'SELECT id FROM likes WHERE blog_id = $1 AND user_id = $2',
      [blogId, userId]
    );
    return result.rows.length > 0;
  }

  static async toggleLike(blogId, userId) {
    const isLiked = await this.checkUserLike(blogId, userId);
    
    if (isLiked) {
      await pool.query(
        'DELETE FROM likes WHERE blog_id = $1 AND user_id = $2',
        [blogId, userId]
      );
      return false; // unliked
    } else {
      await pool.query(
        'INSERT INTO likes (blog_id, user_id) VALUES ($1, $2) ON CONFLICT (blog_id, user_id) DO NOTHING',
        [blogId, userId]
      );
      return true; // liked
    }
  }

  static async checkUserSave(blogId, userId) {
    const result = await pool.query(
      'SELECT id FROM saved_posts WHERE blog_id = $1 AND user_id = $2',
      [blogId, userId]
    );
    return result.rows.length > 0;
  }

  static async toggleSave(blogId, userId) {
    const isSaved = await this.checkUserSave(blogId, userId);
    
    if (isSaved) {
      await pool.query(
        'DELETE FROM saved_posts WHERE blog_id = $1 AND user_id = $2',
        [blogId, userId]
      );
      return false; // unsaved
    } else {
      await pool.query(
        'INSERT INTO saved_posts (blog_id, user_id) VALUES ($1, $2) ON CONFLICT (blog_id, user_id) DO NOTHING',
        [blogId, userId]
      );
      return true; // saved
    }
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_blogs,
        SUM(CASE WHEN is_premium = TRUE THEN 1 ELSE 0 END) as premium_blogs,
        SUM(CASE WHEN is_premium = FALSE THEN 1 ELSE 0 END) as free_blogs,
        (SELECT COUNT(*) FROM likes) as total_likes,
        (SELECT COUNT(*) FROM comments) as total_comments
      FROM blogs
      WHERE is_published = TRUE
    `);
    return result.rows[0];
  }

  static async getSavedBlogs(userId) {
    const result = await pool.query(`
      SELECT b.*, u.name as author_name,
        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count,
        sp.created_at as saved_at
      FROM saved_posts sp
      JOIN blogs b ON sp.blog_id = b.id
      LEFT JOIN users u ON b.author_id = u.id
      WHERE sp.user_id = $1 AND b.is_published = TRUE
      ORDER BY sp.created_at DESC
    `, [userId]);
    return result.rows;
  }
}

module.exports = Blog;
