// server.js
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Basic request log (helps on Render)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: 'https://project-repo-childhoodapp.onrender.com',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true // Render is HTTPS; keep this true in prod
  }
}));

// Static site
app.use(express.static(path.join(__dirname, 'public')));

// --- Health check (tests DB too)
app.get('/api/healthz', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    console.error('Healthz DB error:', e.message);
    res.status(500).json({ ok: false, error: 'db' });
  }
});

// Routes
const userRoutes = require('./routes/userRoutes');
const childrenRoutes = require('./routes/childrenRoutes');
const reportRoutes = require('./routes/reportRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api', userRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Page routes (keep your original mappings)
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'login.html')));
app.get('/signup', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'signup.html')));
app.get('/student-report', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'student-report.html')));
app.get('/student-dashboard', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'student-dashboard.html')));
app.get('/teacher-dashboard', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-dashboard.html')));
app.get('/teacher-feedback', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'teacher-feedback.html')));
app.get('/add-child', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'add-child.html')));
app.get('/children-dashboard', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'children-dashboard.html')));
app.get('/individual-child-dash', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'individual-child-dash.html')));
app.get('/observation-report', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'observation-report.html')));
app.get('/anecdotal-record', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'anecdotal-record.html')));
app.get('/summative-assessment', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'summative-assessment.html')));
app.get('/report-list', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'report-list.html')));
app.get('/report-view', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'report-view.html')));
app.get('/feedback-view', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'feedback-view.html')));

// Global safety nets (avoid 502 from crashes)
process.on('unhandledRejection', (err) => console.error('UnhandledRejection:', err));
process.on('uncaughtException', (err) => console.error('UncaughtException:', err));

app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
