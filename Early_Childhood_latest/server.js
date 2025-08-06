const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes')
//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api', userRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
})