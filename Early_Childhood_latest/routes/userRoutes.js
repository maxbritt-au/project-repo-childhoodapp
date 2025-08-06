const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/users', (req,res)=>{
    db.query('SELECT * FROM users', (err, result)=>{
        if(err){
            console.error('Error fetching users:', err.stack);            
            return res.status(500).send('Database Error');
        }
        res.json(result);
    })
})

module.exports = router;