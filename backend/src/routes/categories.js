const express = require('express');
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Category.getCategoryStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.getBySlug(slug);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Get blogs in a category
router.get('/:slug/blogs', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const category = await Category.getBySlug(slug);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const blogs = await Category.getBlogsInCategory(category.id, parseInt(limit), parseInt(offset));
    
    res.json({
      category,
      blogs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: blogs.length
      }
    });
  } catch (error) {
    console.error('Error fetching category blogs:', error);
    res.status(500).json({ error: 'Failed to fetch category blogs' });
  }
});

// Create new category (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, description, slug, color, icon } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    
    const categoryId = await Category.create({
      name,
      description,
      slug,
      color,
      icon
    });
    
    res.status(201).json({
      message: 'Category created successfully',
      categoryId
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Category name or slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { name, description, slug, color, icon, is_active } = req.body;
    
    await Category.update(id, {
      name,
      description,
      slug,
      color,
      icon,
      is_active
    });
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    await Category.delete(id);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
