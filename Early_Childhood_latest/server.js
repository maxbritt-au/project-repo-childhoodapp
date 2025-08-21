// Early_Childhood_latest/server.js
const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// --- Import routes
const userRoutes = require('./routes/userRoutes');
const childrenRoutes = require('./routes/childrenRoutes');

// --- Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes
app.use('/api', userRoutes);
app.use('/api/children', childrenRoutes);

// --- Page routes
app.get('/login', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'))
);
app.get('/signup', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'signup.html'))
);
app.get('/student-report', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'student-report.html'))
);
app.get('/student-dashboard', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'student-dashboard.html'))
);
app.get('/teacher-dashboard', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-dashboard.html'))
);
app.get('/teacher-feedback', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-feedback.html'))
);

// --- New pages
app.get('/add-child', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'html', 'add-child.html'))
);

app.get('/children-dashboard', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'html', 'children-dashboard.html');
  res.sendFile(filePath);
});

// --- Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
