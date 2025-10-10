// Early_Childhood_latest/server.js
const path = require('path');
const express = require('express');
const session = require('express-session');
const db = require('./db');
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
const reportRoutes = require('./routes/reportRoutes'); // NEW
const feedbackRoutes = require('./routes/feedbackRoutes');


// --- API routes
app.use('/api', userRoutes);           // e.g. /api/login, /api/users
app.use('/api/children', childrenRoutes); // e.g. /api/children, /api/children/:id
app.use('/api/reports', reportRoutes);    // NEW  /api/reports?childId=...
app.use('/api/feedbacks', feedbackRoutes);


// --- Page routes
app.get('/', (req, res) => {
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

app.get('/individual-child-dash', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'individual-child-dash.html'));
});

app.get('/observation-report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'observation-report.html'));
});

app.get('/anecdotal-record', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'anecdotal-record.html'));
});

app.get('/summative-assessment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'summative-assessment.html'));
});

app.get('/report-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'report-list.html'));
});

app.get('/report-view', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'report-view.html'));
});

app.get('/feedback-view', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'feedback-view.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

