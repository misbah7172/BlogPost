const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

class AuthController {
  // Validation rules
  static validateRegister = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ];

  static validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ];

  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Handle profile image upload
      let photoURL = null;
      if (req.file) {
        // Create the image URL (assuming you serve static files from /uploads)
        photoURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }

      // Create user
      const userId = await User.create({ name, email, password, photoURL });

      // Generate JWT
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Get user data (without password)
      const user = await User.findById(userId);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Validate password
      const isValidPassword = await User.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getSavedBlogs(req, res) {
    try {
      const savedBlogs = await User.getSavedBlogs(req.user.id);
      res.json({ savedBlogs });
    } catch (error) {
      console.error('Get saved blogs error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static verifyToken(req, res) {
    // If we reach here, the token is valid (middleware passed)
    res.json({
      valid: true,
      user: req.user
    });
  }

  // Firebase user registration to database
  static async registerFirebaseUser(req, res) {
    try {
      const { uid, name, email, photoURL } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ message: 'Firebase UID and email are required' });
      }

      // Check if user already exists by email
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        // User already exists, return existing user data
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
          message: 'User already exists',
          token,
          user: existingUser,
          isNewUser: false
        });
      }

      // Create new user with Firebase data
      const userId = await User.createFirebaseUser({ 
        firebaseUid: uid, 
        name: name || 'Firebase User', 
        email, 
        photoURL 
      });

      // Generate JWT
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Get user data
      const user = await User.findById(userId);

      res.status(201).json({
        message: 'Firebase user registered successfully',
        token,
        user,
        isNewUser: true
      });

    } catch (error) {
      console.error('Firebase user registration error:', error);
      res.status(500).json({ 
        message: 'Failed to register Firebase user',
        error: error.message 
      });
    }
  }
}

module.exports = AuthController;
