// config/db.js
const mysql = require('mysql2');

// Detect if SSL is required (Railway needs it)
const NEED_SSL =
  process.env.DB_SSL === 'true' ||
  process.env.RENDER === 'true' ||
  (process.env.DB_HOST && process.env.DB_HOST.includes('railway'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000, // 15s timeout
  ssl: NEED_SSL ? { rejectUnauthorized: true } : undefined,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err.message);
  } else {
    console.log("✅ Connected to MySQL!");
    connection.release();
  }
});

module.exports = pool.promise();
