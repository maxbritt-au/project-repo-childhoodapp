// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'crossover.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'PRWymnaPBQMlSLWVgklfrdamiGWQqJHK',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 40052
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

module.exports = connection;
