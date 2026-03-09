// db.js
require("dotenv").config();
const { Pool } = require("pg");

let pool;

// Fungsi untuk mendapatkan pool koneksi (dengan caching untuk serverless)
const getPool = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Wajib SSL untuk production (Neon & Vercel)
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    // Maksimum koneksi per instance serverless (jangan terlalu besar)
    max: 10,
  });

  return pool;
};

module.exports = {
  query: (text, params) => getPool().query(text, params),
};
