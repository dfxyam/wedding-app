require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wedding',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function viewData() {
  try {
    const res = await pool.query('SELECT * FROM rsvps ORDER BY created_at DESC');
    console.log(`Ditemukan ${res.rowCount} data RSVP:\n`);
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

viewData();
