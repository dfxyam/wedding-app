require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  // Connect to default postgres db first to create the wedding db if it doesn't exist
  database: 'postgres'
});

async function initDB() {
  try {
    const dbName = process.env.DB_NAME || 'wedding';
    
    // Check if database exists
    const res = await pool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }

    await pool.end();

    // Reconnect to the newly created database to create tables
    const weddingPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });

    console.log('Creating table rsvps...');
    await weddingPool.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        attendance_count INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table rsvps created successfully.');
    
    await weddingPool.end();
    console.log('Database initialization complete!');

  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();
