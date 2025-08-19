const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'blog_db',
  user: 'postgres',
  password: 'admin'
});

async function updateToAdmin() {
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
      ['admin', 'admin@blog.com']
    );
    console.log('User updated to admin:', result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateToAdmin();
