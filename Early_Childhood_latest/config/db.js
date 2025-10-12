// config/db.js
const mysql = require('mysql2');

const useSSL = String(process.env.DB_SSL || 'true').toLowerCase() === 'true';

// Build the connection config manually — no auto URL parsing
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
  acquireTimeout: 20000,

  /**
   * Railway's MySQL proxy uses a self-signed SSL cert.
   * Render blocks it unless we explicitly allow it.
   */
  ssl: useSSL
    ? {
        rejectUnauthorized: false,   // <- accept self-signed cert
        minVersion: 'TLSv1.2'         // <- enforce secure protocol
      }
    : undefined,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message || err);
    console.error(err);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL!');
    conn.release();
  }
});

// Keep connections warm (optional)
setInterval(() => pool.query('SELECT 1').catch(() => {}), 60000);

module.exports = pool.promise();
