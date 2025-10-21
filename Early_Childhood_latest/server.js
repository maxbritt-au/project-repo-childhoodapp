// server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const db = require('./config/db'); // mysql2/promise pool

const app = express();
const PORT = process.env.PORT || 3000;

/* ----------------------------------------------------
 * Basic request log (handy on Render)
 * -------------------------------------------------- */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ----------------------------------------------------
 * CORS
 * - Allows any *.onrender.com by default (or set FRONTEND_ORIGIN to lock it down)
 * - Sends credentials so session cookies work
 * -------------------------------------------------- */
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN?.trim(),        // e.g. https://your-frontend.onrender.com
  /^https?:\/\/[^/]+\.onrender\.com$/,        // any Render app
  'http://localhost:3000',                    // local dev (optional)
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // same-origin/curl
    const ok = allowedOrigins.some(rule =>
      rule instanceof RegExp ? rule.test(origin) : rule === origin
    );
    return cb(ok ? null : new Error(`CORS blocked: ${origin}`), ok);
  },
  credentials: true,
}));

/* ----------------------------------------------------
 * Body parsers
 * -------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------------------------------------------------
 * Trust proxy (needed so secure cookies work on Render)
 * -------------------------------------------------- */
app.set('trust proxy', 1);

/* ----------------------------------------------------
 * Session (secure cookie over HTTPS)
 * If your UI and API are same-origin, 'lax' is ideal.
 * If calling cross-site, switch to sameSite: 'none'.
 * -------------------------------------------------- */
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,            // Render is HTTPS
    sameSite: 'lax',         // use 'none' only if truly cross-site
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

/* ----------------------------------------------------
 * Static assets (serves your /public folder)
 * -------------------------------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ----------------------------------------------------
 * Health & quick DB debug
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

// Temporary: helpful while stabilising deploys
app.get('/api/debug/db', async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS now');
    res.json({ ok: true, now: rows?.[0]?.now });
  } catch (e) { next(e); }
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
app.get('/',                (_req, res) => res.sendFile(html('login.html')));
app.get('/signup',          (_req, res) => res.sendFile(html('signup.html')));
app.get('/student-report',  (_req, res) => res.sendFile(html('student-report.html')));
app.get('/student-dashboard', (_req, res) => res.sendFile(html('student-dashboard.html')));
app.get('/teacher-dashboard', (_req, res) => res.sendFile(html('teacher-dashboard.html')));
app.get('/teacher-feedback',  (_req, res) => res.sendFile(html('teacher-feedback.html')));
app.get('/add-child',       (_req, res) => res.sendFile(html('add-child.html')));
app.get('/children-dashboard', (_req, res) => res.sendFile(html('children-dashboard.html')));
app.get('/individual-child-dash', (_req, res) => res.sendFile(html('individual-child-dash.html')));
app.get('/observation-report', (_req, res) => res.sendFile(html('observation-report.html')));
app.get('/anecdotal-record', (_req, res) => res.sendFile(html('anecdotal-record.html')));
app.get('/summative-assessment', (_req, res) => res.sendFile(html('summative-assessment.html')));
app.get('/report-list',     (_req, res) => res.sendFile(html('report-list.html')));
app.get('/report-view',     (_req, res) => res.sendFile(html('report-view.html')));
app.get('/feedback-view',   (_req, res) => res.sendFile(html('feedback-view.html')));

/* ----------------------------------------------------
 * Error handler (shows real cause in Render logs)
 * -------------------------------------------------- */
app.use((err, _req, res, _next) => {
  console.error('API error:', err.stack || err);
  res.status(500).json({ error: 'Server error', detail: err.message || String(err) });
});

/* ----------------------------------------------------
 * Safety nets
 * -------------------------------------------------- */
process.on('unhandledRejection', (err) => console.error('UnhandledRejection:', err));
process.on('uncaughtException',  (err) => console.error('UncaughtException:', err));

/* ----------------------------------------------------
 * Start server
 * -------------------------------------------------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on :${PORT}`);
});
