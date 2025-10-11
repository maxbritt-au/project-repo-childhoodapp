// public/js/login.js
(() => {
  // Same-origin: empty base uses the current domain (Render service URL)
  const API_BASE = ''; // '' means requests go to https://project-repo-childhoodapp.onrender.com

  // helper: simple fetch with a timeout (prevents “pending” forever)
  async function fetchWithTimeout(url, options = {}, ms = 15000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: ctrl.signal });
    } finally {
      clearTimeout(id);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.log('[login.js] DOM ready');

    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!form) return console.error('loginForm not found');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (emailInput?.value || '').trim().toLowerCase();
      const password = (passwordInput?.value || '').trim();
      if (!email || !password) { alert('Please enter your email and password.'); return; }

      const btn = form.querySelector('button[type="submit"]');
      const prev = btn?.textContent;
      if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // keeps the session cookie
          body: JSON.stringify({ email, password })
        });

        let data = {};
        try { data = await res.json(); } catch {}

        if (!res.ok) {
          console.error('[login.js] /api/login failed:', data);
          alert(data.message || 'Login failed. Please check your credentials.');
          return;
        }

        // Expecting response like: { userId, name, role }
        const safeUser = { userId: data.userId, name: data.name, role: data.role, email };
        localStorage.setItem('user', JSON.stringify(safeUser));

        // Redirect by role (server.js has page routes for these paths)
        if (data.role === 'teacher') {
          window.location.href = '/teacher-dashboard';
        } else if (data.role === 'student') {
          window.location.href = '/student-dashboard';
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        console.error('[login.js] Network/JS error:', err);
        alert(err.name === 'AbortError'
          ? 'Login timed out. Please try again.'
          : 'Unable to reach the server. Please try again.');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = prev || 'Login'; }
      }
    });
  });
})();
