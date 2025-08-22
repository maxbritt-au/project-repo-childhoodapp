// Early_Childhood_latest/server.js
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session middleware (MUST be before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret', // use an env var in prod
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false   // set true only if using HTTPS
  }
}));

// --- Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// --- Import routes
const userRoutes = require('./routes/userRoutes');
const childrenRoutes = require('./routes/childrenRoutes');

// --- API routes
app.use('/api', userRoutes);           // e.g. /api/login, /api/users
app.use('/api/children', childrenRoutes); // e.g. /api/children, /api/children/:id

// --- Page routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'signup.html'));
});

app.get('/student-report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'student-report.html'));
});

app.get('/student-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'student-dashboard.html'));
});

app.get('/teacher-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-dashboard.html'));
});

app.get('/teacher-feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-feedback.html'));
});

app.get('/add-child', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'add-child.html'));
});

app.get('/children-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'children-dashboard.html'));
});

// --- Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
