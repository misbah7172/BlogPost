const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  console.log('🚀 Starting database initialization...');
  console.log('Database config:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '***' : 'empty',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'blog_subscription_db'
  });

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    console.log('✅ MySQL connection established');
  } catch (error) {
    console.error('❌ Failed to connect to MySQL:', error.message);
    console.log('💡 Make sure MySQL is running and credentials are correct');
    return;
  }

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'blog_subscription_db'}`);
    console.log('✅ Database created successfully');

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'blog_subscription_db'}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        subscription_status ENUM('free', 'active', 'expired') DEFAULT 'free',
        subscription_expiry DATETIME NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create blogs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        tags TEXT,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        image_url VARCHAR(500),
        is_premium BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        publish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        author_id INT DEFAULT 1,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Blogs table created');

    // Create transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        trx_id VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        plan_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'bkash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Transactions table created');

    // Create comments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Comments table created');

    // Create likes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (blog_id, user_id),
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Likes table created');

    // Create saved_posts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_save (blog_id, user_id),
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Saved posts table created');

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await connection.query(`
      INSERT IGNORE INTO users (name, email, password_hash, role) 
      VALUES ('Admin', 'admin@blogsite.com', ?, 'admin')
    `, [adminPassword]);

    console.log('✅ Default admin user created (email: admin@blogsite.com, password: admin123)');

    // Insert sample blogs
    await connection.query(`
      INSERT IGNORE INTO blogs (title, category, tags, content, excerpt, is_premium) VALUES
      ('Getting Started with React Hooks', 'Programming', 'react,javascript,hooks', 'React Hooks revolutionized the way we write React components. In this comprehensive guide, we''ll explore useState, useEffect, and custom hooks. useState allows us to add state to functional components, while useEffect lets us perform side effects in functional components. Custom hooks enable us to extract component logic into reusable functions. React Hooks provide a more direct API to the React concepts you already know: props, state, context, refs, and lifecycle.', 'Learn the fundamentals of React Hooks and how they can simplify your component logic.', FALSE),
      ('Advanced Database Optimization Techniques', 'Database', 'mysql,optimization,performance', 'Database performance is crucial for any application. This premium content covers advanced indexing strategies, query optimization, and performance tuning. We''ll explore how to analyze query execution plans, implement proper indexing strategies, optimize JOIN operations, and use database-specific features for better performance. Understanding how databases work internally is key to building scalable applications that can handle large amounts of data efficiently.', 'Master advanced database optimization techniques to boost your application performance.', TRUE),
      ('Building Scalable Node.js Applications', 'Backend', 'nodejs,scalability,architecture', 'Scalability is key to successful applications. Learn how to structure your Node.js applications for growth, implement caching, and handle high traffic. We''ll cover architectural patterns like microservices, event-driven architecture, and proper error handling. You''ll also learn about load balancing, database optimization, and monitoring strategies that ensure your applications can scale from hundreds to millions of users.', 'Discover patterns and practices for building Node.js applications that scale.', FALSE)
    `);

    console.log('✅ Sample blog posts created');
    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error creating database schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed');
    }
  }
};

// Run if called directly
if (require.main === module) {
  createDatabase().catch(console.error);
}

module.exports = createDatabase;
