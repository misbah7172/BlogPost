const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure user still exists
    const [users] = await pool.execute(
      'SELECT id, name, email, role, subscription_status, subscription_expiry, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireSubscription = (req, res, next) => {
  const now = new Date();
  const isSubscribed = req.user.subscription_status === 'active' && 
                      new Date(req.user.subscription_expiry) > now;
  
  if (!isSubscribed) {
    return res.status(403).json({ 
      message: 'Active subscription required',
      subscriptionStatus: req.user.subscription_status,
      subscriptionExpiry: req.user.subscription_expiry
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSubscription
};
