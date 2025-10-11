// Early_Childhood_latest/server.js
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------------------
   Trust proxy (Render) so req.secure works
---------------------------- */
app.set('trust proxy', 1);

/* ---------------------------
   CORS (allow Render app + local dev)
---------------------------- */
const allowedOrigins = [
  process.env.CORS_ORIGIN,                                // e.g. https://project-repo-childhoodapp.onrender.com
  'https://project-repo-childhoodapp.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin or tools that send no origin (like curl/SSR)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

/* ---------------------------
   Core parsers
---------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------
   Session (secure in production behind proxy)
---------------------------- */
const isProd = process.env.NODE_ENV === 'production';
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd // true only in prod; works with trust proxy on Render
    }
  })
);

/* ---------------------------
   Static files
---------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------------------
   Routes (API)
---------------------------- */
const userRoutes = require('./routes/userRoutes');
const childrenRoutes = require('./routes/childrenRoutes');
const reportRoutes = require('./routes/reportRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api', userRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedbacks', feedbackRoutes);

/* ---------------------------
   Health check (Render)
---------------------------- */
app.get('/api/health', (req, res) => {
  // If you'd like to also check DB connectivity, uncomment below:
  // db.query('SELECT 1', [], (err) => {
  //   if (err) return res.status(500).json({ ok: false, db: 'down' });
  //   return res.json({ ok: true, db: 'up' });
  // });
  res.json({ ok: true });
});

/* ---------------------------
   Page routes (keep these so direct URLs work)
---------------------------- */
const htmlDir = path.join(__dirname, 'public', 'html');

app.get('/', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'login.html'));
});
app.get('/login', (_req, res) => {
  // Optional alias so /login works (not only /)
  res.sendFile(path.join(htmlDir, 'login.html'));
});

app.get('/signup', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'signup.html'));
});

app.get('/student-report', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'student-report.html'));
});

app.get('/student-dashboard', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'student-dashboard.html'));
});

app.get('/teacher-dashboard', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'teacher-dashboard.html'));
});

app.get('/teacher-feedback', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'teacher-feedback.html'));
});

app.get('/add-child', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'add-child.html'));
});

app.get('/children-dashboard', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'children-dashboard.html'));
});

app.get('/individual-child-dash', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'individual-child-dash.html'));
});

app.get('/observation-report', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'observation-report.html'));
});

app.get('/anecdotal-record', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'anecdotal-record.html'));
});

app.get('/summative-assessment', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'summative-assessment.html'));
});

app.get('/report-list', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'report-list.html'));
});

app.get('/report-view', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'report-view.html'));
});

app.get('/feedback-view', (_req, res) => {
  res.sendFile(path.join(htmlDir, 'feedback-view.html'));
});

/* ---------------------------
   404 for unknown (non-asset) routes
---------------------------- */
app.use((req, res, next) => {
  // If it’s a file under /public, let static middleware handle 404.
  if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/img/')) {
    return res.status(404).end();
  }
  // Otherwise, send a friendly 404 page or redirect to login.
  return res.status(404).sendFile(path.join(htmlDir, 'login.html'));
});

/* ---------------------------
   Error handler
---------------------------- */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err?.message || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* ---------------------------
   Start server
---------------------------- */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
