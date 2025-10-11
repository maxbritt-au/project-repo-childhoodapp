// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('[login.js] Script loaded, DOM ready.');
  window.__login_attached = false; // will set true when we wire up the handler

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const msg = document.getElementById('loginMsg');

  if (!form) {
    console.error('[login.js] #loginForm not found.');
    return;
  }

  // Show minimal inline messages
  const showMsg = (text, ok = false) => {
    if (!msg) return;
    msg.textContent = text || '';
    msg.style.color = ok ? '#2e7d32' : '#b00020';
  };

  // Attach submit handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('[login.js] Form submitted.');

    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = (passwordInput?.value || '').trim();

    if (!email || !password) {
      showMsg('Please enter your email and password.');
      return;
    }

    try {
      showMsg('Signing in...', true);
      console.log('[login.js] POST /api/login');

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // keep session cookie on same origin
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      console.log('[login.js] Response:', data);

      if (!res.ok) {
        showMsg(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Save a safe subset to localStorage
      const safeUser = {
        name: data.name,
        role: data.role,
        userId: data.userId,
        email
      };
      try {
        localStorage.setItem('user', JSON.stringify(safeUser));
      } catch {}

      // Route by role (these are your Express page routes)
      if (data.role === 'teacher') {
        window.location.href = '/teacher-dashboard';
      } else if (data.role === 'student') {
        window.location.href = '/student-dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('[login.js] Error:', err);
      showMsg('Server not reachable.');
    }
  });

  window.__login_attached = true;
  console.log('[login.js] Submit handler attached.');
});
