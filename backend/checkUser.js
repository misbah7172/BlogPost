const { pool } = require('./src/config/database');

async function checkUser() {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['misbah458901@gmail.com']);
    console.log('User data:');
    console.table(result.rows);
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
