// public/js/login.js
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[login.js] DOM ready');

    const form = document.getElementById('loginForm');
    const emailEl = document.getElementById('email');
    const passEl  = document.getElementById('password');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form || !emailEl || !passEl) {
      console.error('[login.js] Missing required elements');
      return;
    }

    // Always hit the same origin the page was served from
    const API_BASE = `${window.location.origin}/api`;
    console.log('[login.js] API_BASE =', API_BASE);

    // Small helper to restore the button label/state
    const setBusy = (busy) => {
      if (!submitBtn) return;
      submitBtn.disabled = !!busy;
      submitBtn.textContent = busy ? 'Signing in…' : 'Login';
    };

    // Optional: basic email check
    const isEmail = (v) => /\S+@\S+\.\S+/.test(v);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = (emailEl.value || '').trim().toLowerCase();
      const password = (passEl.value || '').trim();

      if (!email || !password) {
        alert('Please enter your email and password.');
        return;
      }
      if (!isEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      setBusy(true);

      // Timeout guard so the UI never hangs forever
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',               // send/receive session cookie
          body: JSON.stringify({ email, password }),
          signal: ctrl.signal
        });

        // Try to parse JSON, but don't crash if not JSON
        let payload = null;
        try { payload = await res.json(); } catch { payload = null; }

        if (!res.ok) {
          const msg =
            (payload && (payload.message || payload.error || payload.detail)) ||
            `Login failed (HTTP ${res.status})`;
          console.error('[login.js] login failed:', res.status, payload);
          alert(msg);
          return;
        }

        // Expecting shape: { userId, role, name, ... }
        const user = payload || {};
        const safeUser = {
          userId: user.userId,
          role: user.role,
          name: user.name,
          email
        };
        localStorage.setItem('user', JSON.stringify(safeUser));
        console.log('[login.js] login OK', safeUser);

        // Redirect by role (fallback to home)
        const byRole = {
          teacher: '/teacher-dashboard',
          student: '/student-dashboard',
          parent:  '/',
        };
        window.location.href = byRole[safeUser.role] || '/';
      } catch (err) {
        console.error('[login.js] network error:', err);
        const msg = err?.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : 'Unable to reach the server. Please try again.';
        alert(msg);
      } finally {
        clearTimeout(t);
        setBusy(false);
      }
    });
  });
})();
