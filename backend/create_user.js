const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, subscription_status) VALUES ($1, $2, $3, $4) RETURNING id',
      ['MD Habibulla Misba', 'misba@example.com', hashedPassword, 'active']
    );
    console.log('✅ Created user with ID:', result.rows[0].id);
    
    // Also list all users
    const users = await pool.query('SELECT id, name, email, role, subscription_status FROM users');
    console.log('📋 All users:', users.rows);
  } catch(err) {
    console.log('❌ Error:', err.message);
  }
  await pool.end();
})();
