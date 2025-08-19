const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');

class BlogController {
  // Validation rules
  static validateBlog = [
    body('title').trim().isLength({ min: 3, max: 500 }).withMessage('Title must be 3-500 characters'),
    body('category').trim().isLength({ min: 2, max: 100 }).withMessage('Category must be 2-100 characters'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
    body('tags').optional().trim(),
    body('isPremium').optional().isBoolean().withMessage('isPremium must be boolean')
  ];

  static async getAllBlogs(req, res) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const offset = (page - 1) * limit;

      const blogs = await Blog.findAll(parseInt(limit), parseInt(offset), category, search);

      // Filter premium content for non-subscribers and non-admins
      let filteredBlogs = blogs;
      if (!req.user || 
          (req.user.role !== 'admin' && 
           (req.user.subscription_status !== 'active' || 
            (req.user.subscription_expiry && new Date(req.user.subscription_expiry) <= new Date())))) {
        filteredBlogs = blogs.map(blog => {
          if (blog.is_premium) {
            return {
              ...blog,
              content: blog.excerpt || blog.content.substring(0, 200) + '...',
              isPremiumLocked: true
            };
          }
          return blog;
        });
      }

      // Add user interaction data if logged in
      if (req.user) {
        for (let blog of filteredBlogs) {
          blog.isLiked = await Blog.checkUserLike(blog.id, req.user.id);
          blog.isSaved = await Blog.checkUserSave(blog.id, req.user.id);
        }
      }

      res.json({
        blogs: filteredBlogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: blogs.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get blogs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getBlogById(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Check if user can access premium content
      const canAccessPremium = req.user && (
        req.user.role === 'admin' || 
        (req.user.subscription_status === 'active' && 
         new Date(req.user.subscription_expiry) > new Date())
      );

      if (blog.is_premium && !canAccessPremium) {
        return res.status(403).json({
          message: 'Premium subscription required',
          blog: {
            ...blog,
            content: blog.excerpt || blog.content.substring(0, 300) + '...',
            isPremiumLocked: true
          }
        });
      }

      // Add user interaction data if logged in
      if (req.user) {
        blog.isLiked = await Blog.checkUserLike(id, req.user.id);
        blog.isSaved = await Blog.checkUserSave(id, req.user.id);
      } else {
        blog.isLiked = false;
        blog.isSaved = false;
      }

      res.json({ blog });
    } catch (error) {
      console.error('Get blog error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async createBlog(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, category, categoryId, tags, content, excerpt, isPremium, mindmapData } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const blogId = await Blog.create({
        title,
        category,
        categoryId,
        tags,
        content,
        excerpt,
        imageUrl,
        isPremium: isPremium === 'true' || isPremium === true,
        authorId: req.user.id,
        mindmapData: mindmapData ? (typeof mindmapData === 'string' ? JSON.parse(mindmapData) : mindmapData) : null
      });

      const blog = await Blog.findById(blogId);
      res.status(201).json({
        message: 'Blog created successfully',
        blog
      });
    } catch (error) {
      console.error('Create blog error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateBlog(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, category, tags, content, excerpt, isPremium, mindmapData } = req.body;
      
      // Check if blog exists
      const existingBlog = await Blog.findById(id);
      if (!existingBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingBlog.image_url;

      await Blog.update(id, {
        title,
        category,
        tags,
        content,
        excerpt,
        imageUrl,
        isPremium: isPremium === 'true' || isPremium === true,
        mindmapData: mindmapData ? (typeof mindmapData === 'string' ? JSON.parse(mindmapData) : mindmapData) : null
      });

      const blog = await Blog.findById(id);
      res.json({
        message: 'Blog updated successfully',
        blog
      });
    } catch (error) {
      console.error('Update blog error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteBlog(req, res) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      await Blog.delete(id);
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await Blog.getCategories();
      res.json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const isLiked = await Blog.toggleLike(id, req.user.id);
      
      // Get updated likes count
      const updatedBlog = await Blog.findById(id);
      
      res.json({
        message: isLiked ? 'Blog liked' : 'Blog unliked',
        liked: isLiked,
        likesCount: updatedBlog.likes_count
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async toggleSave(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const isSaved = await Blog.toggleSave(id, req.user.id);
      
      res.json({
        message: isSaved ? 'Blog saved' : 'Blog unsaved',
        saved: isSaved
      });
    } catch (error) {
      console.error('Toggle save error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getLikes(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      res.json({
        likes: blog.likes_count,
        isLiked: req.user ? await Blog.checkUserLike(id, req.user.id) : false
      });
    } catch (error) {
      console.error('Get likes error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getSavedBlogs(req, res) {
    try {
      const userId = req.user.id;
      const savedBlogs = await Blog.getSavedBlogs(userId);
      
      res.json({
        blogs: savedBlogs,
        totalCount: savedBlogs.length,
        premiumCount: savedBlogs.filter(blog => blog.is_premium).length,
        likesCount: 0 // We can implement this later if needed
      });
    } catch (error) {
      console.error('Get saved blogs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getPublicStats(req, res) {
    try {
      const Blog = require('../models/Blog');
      const User = require('../models/User');
      
      const [blogStats, userStats] = await Promise.all([
        Blog.getStats(),
        User.getSubscriptionStats()
      ]);

      // Return public-friendly stats
      res.json({
        totalBlogs: blogStats.total_blogs || 0,
        premiumBlogs: blogStats.premium_blogs || 0,
        totalUsers: userStats.total_users || 0,
        activeSubscribers: userStats.active_subscribers || 0
      });
    } catch (error) {
      console.error('Get public stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = BlogController;
