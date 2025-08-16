const { pool } = require('../config/database');

class Category {
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  }

  static async getBySlug(slug) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
      [slug]
    );
    return result.rows[0];
  }

  static async create(categoryData) {
    const { name, description, slug, color, icon } = categoryData;
    
    const result = await pool.query(
      'INSERT INTO categories (name, description, slug, color, icon) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, description, slug, color || '#3B82F6', icon]
    );
    
    return result.rows[0].id;
  }

  static async update(id, categoryData) {
    const { name, description, slug, color, icon, is_active } = categoryData;
    
    await pool.query(
      'UPDATE categories SET name = $1, description = $2, slug = $3, color = $4, icon = $5, is_active = $6 WHERE id = $7',
      [name, description, slug, color, icon, is_active, id]
    );
  }

  static async delete(id) {
    await pool.query(
      'UPDATE categories SET is_active = false WHERE id = $1',
      [id]
    );
  }

  static async getCategoryStats() {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.color,
        c.icon,
        COUNT(b.id) as blog_count,
        SUM(CASE WHEN b.is_premium = true THEN 1 ELSE 0 END) as premium_count,
        SUM(CASE WHEN b.is_premium = false THEN 1 ELSE 0 END) as free_count
      FROM categories c
      LEFT JOIN blogs b ON c.id = b.category_id AND b.is_published = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.slug, c.color, c.icon
      ORDER BY blog_count DESC, c.name ASC
    `);
    return result.rows;
  }

  static async getBlogsInCategory(categoryId, limit = null, offset = 0) {
    let query = `
      SELECT b.*, u.name as author_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.category_id = $1 AND b.is_published = true
      ORDER BY b.publish_date DESC
    `;
    
    const params = [categoryId];
    let paramIndex = 2;
    
    if (limit) {
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = Category;
