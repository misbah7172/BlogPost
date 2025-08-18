const express = require('express');
const Visitor = require('../models/Visitor');
const crypto = require('crypto');

const router = express.Router();

// Generate visitor ID from IP and User Agent
const generateVisitorId = (ip, userAgent) => {
  return crypto.createHash('sha256').update(ip + userAgent).digest('hex').substring(0, 16);
};

// Record a visit and get visitor count
router.post('/visit', async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referrer = req.headers.referer || req.headers.referrer || null;
    
    // Generate unique visitor ID based on IP and User Agent
    const visitorId = generateVisitorId(ipAddress, userAgent);
    
    const visitorCount = await Visitor.recordVisit(visitorId, ipAddress, userAgent, referrer);
    
    res.json({
      success: true,
      visitorCount,
      visitorId: visitorId.substring(0, 8) // Return partial ID for client reference
    });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ error: 'Failed to record visit' });
  }
});

// Get total visitor count
router.get('/count', async (req, res) => {
  try {
    const count = await Visitor.getVisitorCount();
    res.json({ visitorCount: count });
  } catch (error) {
    console.error('Error getting visitor count:', error);
    res.status(500).json({ error: 'Failed to get visitor count' });
  }
});

// Get visitor statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Visitor.getVisitorStats();
    const visitorCount = await Visitor.getVisitorCount();
    
    // Enhanced stats for GitHub-style display
    const enhancedStats = {
      totalVisitors: stats.total,
      uniqueVisitors: stats.total, // Same as total since we track unique by visitor_id
      totalViews: visitorCount,
      today: stats.today,
      thisWeek: stats.thisWeek,
      thisMonth: stats.thisMonth
    };
    
    res.json(enhancedStats);
  } catch (error) {
    console.error('Error getting visitor statistics:', error);
    res.status(500).json({ error: 'Failed to get visitor statistics' });
  }
});

// Get recent visitors (admin only)
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentVisitors = await Visitor.getRecentVisitors(limit);
    res.json(recentVisitors);
  } catch (error) {
    console.error('Error getting recent visitors:', error);
    res.status(500).json({ error: 'Failed to get recent visitors' });
  }
});

// Get visitor analytics (admin only)
router.get('/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const analytics = await Visitor.getAnalytics(days);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting visitor analytics:', error);
    res.status(500).json({ error: 'Failed to get visitor analytics' });
  }
});

module.exports = router;