// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Prefer a single DATABASE_URL (e.g. from Railway)
const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || '';

const wantSSL = String(process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';

const baseOptions = {
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 8),
  queueLimit: 0,
  connectTimeout: 20000,
  acquireTimeout: 20000,
  ssl: wantSSL ? { rejectUnauthorized: false } : undefined,
};

function makePoolFromUrl(url) {
  const u = new URL(url);
  return mysql.createPool({
    host: u.hostname,
    user: decodeURIComponent(u.username || ''),
    password: decodeURIComponent(u.password || ''),
    database: u.pathname.replace(/^\//, ''),
    port: Number(u.port || 3306),
    ...baseOptions,
  });
}

let pool;

// If DATABASE_URL exists (Railway)
if (DATABASE_URL) {
  pool = makePoolFromUrl(DATABASE_URL);
} else {
  // Otherwise use field-by-field env vars
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    port: Number(process.env.DB_PORT || 3306),
    ...baseOptions,
  });
}

// Quick startup test (non-fatal)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL!');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

// Optional keep-alive for free tiers
setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 60000);

module.exports = pool;
