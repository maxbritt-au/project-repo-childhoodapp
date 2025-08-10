// Early_Childhood_latest/server.js
const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');

// --- Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve static frontend from /public
// This makes /css, /js, /img, /html available at http://localhost:3000/...
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes (e.g., /api/users)
app.use('/api', userRoutes);

// --- Root route -> serve your main HTML (optional but recommended)
app.get('/', (req, res) => {
  // If your main file is public/html/index.html:
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
  // If you move index.html to public/, change the path to ...('public', 'index.html')
});

// --- Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
