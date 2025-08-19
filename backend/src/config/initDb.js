const { Pool } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  console.log('🚀 Starting PostgreSQL database initialization...');
  console.log('Database config:', {
    connectionString: process.env.DATABASE_URL ? 'Connected via URL' : 'No URL provided'
  });

  let pool;
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // NeonDB always requires SSL
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error.message);
    console.log('💡 Make sure PostgreSQL URL is correct and accessible');
    return;
  }

  try {
    // Drop tables in reverse dependency order
    await pool.query('DROP TABLE IF EXISTS comments CASCADE');
    await pool.query('DROP TABLE IF EXISTS likes CASCADE');
    await pool.query('DROP TABLE IF EXISTS saved_posts CASCADE');
    await pool.query('DROP TABLE IF EXISTS mindmaps CASCADE');
    await pool.query('DROP TABLE IF EXISTS blogs CASCADE');
    await pool.query('DROP TABLE IF EXISTS transactions CASCADE');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP TABLE IF EXISTS visitors CASCADE');

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'expired')),
        subscription_expiry TIMESTAMP NULL,
        role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create categories table
    await pool.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        slug VARCHAR(100) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created');

    // Create blogs table
    await pool.query(`
      CREATE TABLE blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        category VARCHAR(100) NOT NULL,
        tags TEXT,
        content TEXT NOT NULL,
        excerpt TEXT,
        image_url VARCHAR(500),
        is_premium BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        author_id INT DEFAULT 1 REFERENCES users(id) ON DELETE SET NULL,
        mindmap_data JSONB
      )
    `);
    console.log('✅ Blogs table created');

    // Create transactions table
    await pool.query(`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        trx_id VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'yearly', 'lifetime')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        payment_method VARCHAR(50) DEFAULT 'bkash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL
      )
    `);
    console.log('✅ Transactions table created');

    // Create comments table
    await pool.query(`
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Comments table created');

    // Create likes table
    await pool.query(`
      CREATE TABLE likes (
        id SERIAL PRIMARY KEY,
        blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )
    `);
    console.log('✅ Likes table created');

    // Create saved_posts table
    await pool.query(`
      CREATE TABLE saved_posts (
        id SERIAL PRIMARY KEY,
        blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )
    `);
    console.log('✅ Saved posts table created');

    // Create visitors table
    await pool.query(`
      CREATE TABLE visitors (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(32) UNIQUE NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        referrer VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for visitors table
    await pool.query(`CREATE INDEX idx_visitors_visitor_id ON visitors(visitor_id)`);
    await pool.query(`CREATE INDEX idx_visitors_ip_address ON visitors(ip_address)`);
    await pool.query(`CREATE INDEX idx_visitors_created_at ON visitors(created_at)`);
    
    console.log('✅ Visitors table created');

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4)
    `, ['Admin', 'admin@blogsite.com', adminPassword, 'admin']);
    console.log('✅ Default admin user created (email: admin@blogsite.com, password: admin123)');

    // Insert categories
    const categories = [
      ['Database', 'Database design, optimization, and management techniques', 'database', '#10B981', 'Database'],
      ['Programming', 'Programming languages, concepts, and best practices', 'programming', '#3B82F6', 'Code'],
      ['Frontend', 'Frontend development, UI/UX, and client-side technologies', 'frontend', '#8B5CF6', 'Monitor'],
      ['Backend', 'Server-side development, APIs, and system architecture', 'backend', '#F59E0B', 'Server'],
      ['AI Tools', 'Artificial Intelligence, Machine Learning, and AI applications', 'ai-tools', '#EF4444', 'Brain'],
      ['Software Tools', 'Development tools, IDEs, and productivity software', 'software-tools', '#06B6D4', 'Tool'],
      ['Hosting', 'Web hosting, cloud services, and deployment strategies', 'hosting', '#84CC16', 'Cloud'],
      ['Electronics', 'Hardware, IoT, embedded systems, and electronics projects', 'electronics', '#F97316', 'Cpu'],
      ['DevOps', 'CI/CD, infrastructure, containerization, and automation', 'devops', '#6366F1', 'GitBranch'],
      ['Mobile Development', 'iOS, Android, React Native, and mobile app development', 'mobile-development', '#EC4899', 'Smartphone'],
      ['Web Security', 'Cybersecurity, web security, and best practices', 'web-security', '#DC2626', 'Shield'],
      ['Data Science', 'Data analysis, visualization, and statistical computing', 'data-science', '#059669', 'BarChart3'],
      ['Game Development', 'Game design, engines, and interactive entertainment', 'game-development', '#7C3AED', 'Gamepad2'],
      ['Blockchain', 'Cryptocurrency, smart contracts, and decentralized applications', 'blockchain', '#F59E0B', 'Link']
    ];

    for (const [name, description, slug, color, icon] of categories) {
      await pool.query(`
        INSERT INTO categories (name, description, slug, color, icon)
        VALUES ($1, $2, $3, $4, $5)
      `, [name, description, slug, color, icon]);
    }
    console.log('✅ Categories created');

    // Insert sample blogs
    const sampleBlogs = [
      {
        title: 'Getting Started with React Hooks',
        category: 'Programming',
        tags: 'react,javascript,hooks',
        content: 'React Hooks revolutionized the way we write React components. In this comprehensive guide, we\'ll explore useState, useEffect, and custom hooks. useState allows us to add state to functional components, while useEffect handles side effects and lifecycle methods. We\'ll also build custom hooks to share logic between components.',
        excerpt: 'Learn React Hooks from basic concepts to advanced patterns with practical examples.',
        is_premium: false
      },
      {
        title: 'Complete Node.js Backend Development Guide',
        category: 'Backend',
        tags: 'nodejs,backend,express,api',
        content: 'Building robust backend applications with Node.js requires understanding of modern patterns and best practices. This comprehensive guide covers Express.js setup, middleware creation, RESTful API design, authentication with JWT, and database integration.',
        excerpt: 'Discover patterns and practices for building Node.js applications that scale.',
        is_premium: false
      },
      {
        title: 'Modern Frontend Development with React and TypeScript',
        category: 'Frontend',
        tags: 'react,typescript,frontend,modern',
        content: 'Modern frontend development has evolved significantly with the introduction of TypeScript and advanced React patterns. This comprehensive guide covers type-safe development, component composition, and state management.',
        excerpt: 'Master modern frontend development with React, TypeScript, and contemporary best practices.',
        is_premium: true
      },
      {
        title: 'AI-Powered Development Tools: Boost Your Productivity',
        category: 'AI Tools',
        tags: 'ai,productivity,development,tools',
        content: 'Artificial Intelligence is transforming how we write code. Discover the latest AI-powered development tools including GitHub Copilot, ChatGPT for coding, and automated testing tools.',
        excerpt: 'Explore how AI tools can enhance your development workflow and increase productivity.',
        is_premium: false
      },
      {
        title: 'Docker and Kubernetes: Complete DevOps Guide',
        category: 'DevOps',
        tags: 'docker,kubernetes,devops,containers',
        content: 'Containerization has revolutionized software deployment and scalability. This premium guide covers Docker fundamentals, container orchestration with Kubernetes, and CI/CD pipelines.',
        excerpt: 'Master containerization and orchestration with Docker and Kubernetes for modern DevOps.',
        is_premium: true
      },
      {
        title: 'PostgreSQL Database Optimization Techniques',
        category: 'Database',
        tags: 'postgresql,database,optimization,performance',
        content: 'PostgreSQL is a powerful relational database system. Learn advanced optimization techniques including indexing strategies, query optimization, and performance tuning for production applications.',
        excerpt: 'Optimize your PostgreSQL database for maximum performance and scalability.',
        is_premium: true
      }
    ];

    for (const blog of sampleBlogs) {
      const categoryResult = await pool.query('SELECT id FROM categories WHERE slug = $1', [blog.category.toLowerCase().replace(' ', '-')]);
      const categoryId = categoryResult.rows[0]?.id || 1;
      
      await pool.query(`
        INSERT INTO blogs (title, category_id, category, tags, content, excerpt, is_premium)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [blog.title, categoryId, blog.category, blog.tags, blog.content, blog.excerpt, blog.is_premium]);
    }

    console.log('✅ Sample blog posts created');
    console.log('🎉 PostgreSQL Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error creating database schema:', error);
    console.error('Error details:', error.message);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔐 Database connection closed');
    }
  }
};

// Run if called directly
if (require.main === module) {
  createDatabase().catch(console.error);
}

module.exports = createDatabase;
