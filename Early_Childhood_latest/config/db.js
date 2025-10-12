// config/db.js
const mysql = require('mysql2');

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || '';

const wantSSL = String(process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';

const baseOptions = {
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 8),
  queueLimit: 0,
  connectTimeout: 20000,
  acquireTimeout: 20000,
  ssl: wantSSL ? { rejectUnauthorized: false } : undefined
};

let pool;
if (DATABASE_URL) {
  pool = mysql.createPool({ uri: DATABASE_URL, ...baseOptions });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    ...baseOptions
  });
}

// first-connection log (but don’t crash in production after boot)
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.code || err.message);
  } else {
    console.log('✅ Connected to MySQL!');
    conn.release();
  }
});

// keep alive (free tiers)
setInterval(() => { pool.query('SELECT 1').catch(() => {}); }, 60000);

module.exports = pool.promise();
