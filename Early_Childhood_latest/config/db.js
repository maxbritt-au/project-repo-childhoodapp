// config/db.js
const mysql = require('mysql2');

// Prefer a full DB URL if provided (Railway sometimes gives one)
// Example: mysql://USER:PASSWORD@HOST:PORT/DBNAME
const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || '';

/**
 * Railway's public MySQL endpoint usually requires SSL.
 * Set DB_SSL=false in Render if you truly don't want SSL.
 */
const wantSSL =
  String(process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';

const baseOptions = {
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 8),
  queueLimit: 0,
  connectTimeout: 20_000,
  acquireTimeout: 20_000,
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

if (DATABASE_URL) {
  pool = makePoolFromUrl(DATABASE_URL);
} else {
  // Field-by-field envs (Render → Environment tab)
  pool = mysql.createPool({
    host: process.env.DB_HOST,       // e.g. crossover.proxy.rlwy.net
    user: process.env.DB_USER,       // e.g. root (or Railway user)
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,   // e.g. railway
    port: Number(process.env.DB_PORT || 3306),
    ...baseOptions,
  });
}

// One-time connection test (don't crash the process in prod if it fails once)
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

// EXPORT CALLBACK-BASED POOL (note: NO `.promise()` here)
module.exports = pool;
