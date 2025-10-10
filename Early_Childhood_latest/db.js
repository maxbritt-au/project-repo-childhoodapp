const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,       // must exist
  user: process.env.DB_USER,       // must exist
  password: process.env.DB_PASSWORD, // must exist
  database: process.env.DB_NAME,   // must exist
  port: process.env.DB_PORT || 3306
});

connection.connect(err => {
  if (err) {
    console.error("Error connecting to MySQL: ", err);
    process.exit(1); // stop server if DB connection fails
  }
  console.log("Connected to MySQL!");
});

module.exports = connection;
