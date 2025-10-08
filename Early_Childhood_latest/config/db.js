const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'zihan123',
    database: 'early_childhood_education_app'
});

db.connect((err)=>{
    if(err){
        console.error("Error connecting to MySQL: ", err.stack);
        return;
    }
    console.log("Connected to MySQL as ID", db.threadId);
});

module.exports = db;
