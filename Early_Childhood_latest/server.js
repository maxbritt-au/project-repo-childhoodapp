// server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const db = require('./config/db'); // mysql2 pool

const app = express();
const PORT = process.env.PORT || 3000;

/* ----------------------------------------------------
 * Request logging (handy for Render logs)
 * -------------------------------------------------- */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ----------------------------------------------------
 * CORS setup
 * -------------------------------------------------- */
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN?.trim(),
  /^https?:\/\/[^/]+\.onrender\.com$/,  // any Render app
  'http://localhost:3000',              // local dev
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow same-origin / server-side
    const ok = allowedOrigins.some(rule =>
      rule instanceof RegExp ? rule.test(origin) : rule === origin
    );
    return cb(ok ? null : new Error(`CORS blocked: ${origin}`), ok);
  },
  credentials: true,
}));

// ✅ Explicitly handle preflight (important for Safari & JSON POSTs)
app.options('*', cors());

/* ----------------------------------------------------
 * JSON and URL-encoded body parsers
 * -------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------------------------------------------------
 * Trust Render's reverse proxy for secure cookies
 * -------------------------------------------------- */
app.set('trust proxy', 1);

/* ----------------------------------------------------
 * Secure session cookies
 * -------------------------------------------------- */
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,            // Render uses HTTPS
    sameSite: 'lax',         // 'none' only if frontend hosted separately
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

/* ----------------------------------------------------
 * Static files
 * -------------------------------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ----------------------------------------------------
 * Health checks & DB test endpoints
 * -------------------------------------------------- */
app.get('/api/healthz', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e) {
    console.error('Healthz DB error:', e);
    res.status(500).json({ ok: false, error: 'db' });
  }
});

// Optional debugging route to confirm DB connectivity
app.get('/api/debug/db', async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS now');
    res.json({ ok: true, now: rows?.[0]?.now });
  } catch (e) { next(e); }
});

// Simple test to confirm frontend ↔ backend path
app.post('/api/test', (req, res) => {
  console.log('[TEST] received', req.body);
  res.json({ ok: true, msg: 'Server reachable!' });
});

/* ----------------------------------------------------
 * API routes
 * -------------------------------------------------- */
const userRoutes = require('./routes/userRoutes');
const childrenRoutes = require('./routes/childrenRoutes');
const reportRoutes = require('./routes/reportRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api', userRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedbacks', feedbackRoutes);

/* ----------------------------------------------------
 * Page routes
 * -------------------------------------------------- */
const html = (p) => path.join(__dirname, 'public', 'html', p);

app.get('/', (_req, res) => res.sendFile(html('login.html')));
app.get('/signup', (_req, res) => res.sendFile(html('signup.html')));
app.get('/student-report', (_req, res) => res.sendFile(html('student-report.html')));
app.get('/student-dashboard', (_req, res) => res.sendFile(html('student-dashboard.html')));
app.get('/teacher-dashboard', (_req, res) => res.sendFile(html('teacher-dashboard.html')));
app.get('/teacher-feedback', (_req, res) => res.sendFile(html('teacher-feedback.html')));
app.get('/add-child', (_req, res) => res.sendFile(html('add-child.html')));
app.get('/children-dashboard', (_req, res) => res.sendFile(html('children-dashboard.html')));
app.get('/individual-child-dash', (_req, res) => res.sendFile(html('individual-child-dash.html')));
app.get('/observation-report', (_req, res) => res.sendFile(html('observation-report.html')));
app.get('/anecdotal-record', (_req, res) => res.sendFile(html('anecdotal-record.html')));
app.get('/summative-assessment', (_req, res) => res.sendFile(html('summative-assessment.html')));
app.get('/report-list', (_req, res) => res.sendFile(html('report-list.html')));
app.get('/report-view', (_req, res) => res.sendFile(html('report-view.html')));
app.get('/feedback-view', (_req, res) => res.sendFile(html('feedback-view.html')));

/* ----------------------------------------------------
 * Global error handler
 * -------------------------------------------------- */
app.use((err, _req, res, _next) => {
  console.error('API error:', err.stack || err);
  res.status(500).json({ error: 'Server error', detail: err.message || String(err) });
});

/* ----------------------------------------------------
 * Safety nets
 * -------------------------------------------------- */
process.on('unhandledRejection', (err) => console.error('UnhandledRejection:', err));
process.on('uncaughtException', (err) => console.error('UncaughtException:', err));

/* ----------------------------------------------------
 * Start server
 * -------------------------------------------------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
