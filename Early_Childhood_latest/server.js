const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;
//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : 'Andrew21062005@',
    database: 'early_childhood_edu_app'
});

db.connect((err)=>{
    if(err){
        console.log('Error connecting to MySQL: ', err.stack);        
        return;
    }
    console.log('Connected to MySQL as ID ', db.threadId);
})
// Routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/api/users', (req,res)=>{
    db.query('SELECT * FROM users;', (err, result)=>{
        if(err){
            console.error('Error when executing the query', err.stack);
            res.status(500).send('Error fetching users');
            return;
        }
        res.json(result);
    });
})

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
})