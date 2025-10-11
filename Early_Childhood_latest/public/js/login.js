// public/js/login.js
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[login.js] DOM ready');

    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!form) {
      console.error('[login.js] loginForm not found');
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (emailInput?.value || '').trim().toLowerCase();
      const password = (passwordInput?.value || '').trim();
      if (!email || !password) {
        alert('Please enter your email and password.');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const prev = btn?.textContent;
      if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

      try {
        // Same-origin call; session cookie is set via Set-Cookie
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        let data = {};
        try { data = await res.json(); } catch {}

        if (!res.ok) {
          console.error('[login.js] login failed', data);
          alert(data.message || 'Login failed.');
          return;
        }

        // Store minimal info; real auth is the session cookie
        const safeUser = {
          name: data.name,
          role: data.role,
          userId: data.userId,
          email
        };
        localStorage.setItem('user', JSON.stringify(safeUser));

        // Redirect based on role (your server has page routes like /teacher-dashboard)
        if (data.role === 'teacher') {
          window.location.href = '/teacher-dashboard';
        } else if (data.role === 'student') {
          window.location.href = '/student-dashboard';
        } else if (data.role === 'parent') {
          window.location.href = '/';
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        console.error('[login.js] network error', err);
        alert('Unable to reach the server. Please try again.');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = prev || 'Login'; }
      }
    });
  });
})();
