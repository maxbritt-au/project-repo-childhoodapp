// server.js
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN
  || 'https://project-repo-childhoodapp.onrender.com';

// ---------- Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- CORS (allow frontend domain and cookies)
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ---------- Sessions (cross-site cookies require SameSite=None; Secure)
app.set('trust proxy', 1); // required on Render to set Secure cookies
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'none',   // <-- cross-site
    secure: true        // <-- Render uses HTTPS
  }
}));

// ---------- Static
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Routes
app.use('/api', require('./routes/userRoutes'));
app.use('/api/children', require('./routes/childrenRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

// Page routes (keep)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'signup.html')));
app.get('/student-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'student-dashboard.html')));
app.get('/teacher-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-dashboard.html')));
app.get('/student-report', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'student-report.html')));
app.get('/children-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'children-dashboard.html')));
app.get('/individual-child-dash', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'individual-child-dash.html')));
app.get('/observation-report', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'observation-report.html')));
app.get('/anecdotal-record', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'anecdotal-record.html')));
app.get('/summative-assessment', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'summative-assessment.html')));
app.get('/report-list', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'report-list.html')));
app.get('/report-view', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'report-view.html')));
app.get('/teacher-feedback', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-feedback.html')));
app.get('/feedback-view', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'feedback-view.html')));
app.get('/add-child', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'add-child.html')));

// Health endpoint (useful on Render)
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
