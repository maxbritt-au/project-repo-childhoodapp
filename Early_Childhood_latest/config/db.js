// config/db.js
require('dotenv').config();
const mysql = require('mysql2'); // <-- callback API (not promise)

// Prefer a single DATABASE_URL (e.g. from Railway)
const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || '';

/**
 * SSL is required when connecting from Render to hosted MySQL (Railway, etc).
 * DB_SSL=true enables it. Default to true if unset.
 */
const wantSSL = String(process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';

const baseOptions = {
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 8),
  queueLimit: 0,
  connectTimeout: 20_000,
  acquireTimeout: 20_000,
  // For callback API, set false when not using SSL
  ssl: wantSSL ? { rejectUnauthorized: false } : false,
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

// If DATABASE_URL exists (Railway style), prefer it
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

// One-time connection test (non-fatal)
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.code || err.message);
  } else {
    console.log('✅ Connected to MySQL!');
    conn.release();
  }
});

// Keep-alive ping for free tiers
setInterval(() => {
  pool.query('SELECT 1', () => {});
}, 60_000);

module.exports = pool; // <-- callback-based pool
