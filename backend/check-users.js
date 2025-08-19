const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'blog_db',
  user: 'postgres',
  password: 'admin'
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    console.log('All users:', result.rows);
    
    // Update the admin user
    const updateResult = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING *',
      ['admin', 'admin@blog.com']
    );
    console.log('Updated user:', updateResult.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
