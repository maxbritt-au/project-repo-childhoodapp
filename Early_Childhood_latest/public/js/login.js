// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeInput = document.getElementById('rememberMe');

  // Prefill remembered email on load
  try {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && emailInput) {
      emailInput.value = rememberedEmail;
      if (rememberMeInput) rememberMeInput.checked = true;
    }
  } catch {}

  if (!form) {
    console.error('loginForm not found on the page.');
    return;
  }

  let submitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    submitting = true;

    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = (passwordInput?.value || '').trim();
    const rememberMe = rememberMeInput?.checked === true;

    if (!email || !password) {
      alert('Please enter your email and password.');
      submitting = false;
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // IMPORTANT: include cookies for session auth
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      // If response isn't JSON (e.g. 500 with HTML), avoid crashing
      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          (res.status === 401 ? 'Invalid email or password.' : 'Login failed.');
        alert(msg);
        submitting = false;
        return;
      }

      // Store only non-sensitive info
      const safeUser = {
        name: data.name,
        role: data.role,
        userId: data.userId,
        email
      };
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch {}

      // Remember email only (not password)
      try {
        if (rememberMe) localStorage.setItem('rememberedEmail', email);
        else localStorage.removeItem('rememberedEmail');
      } catch {}

      // Redirect by role using your Express page routes
      const role = (data.role || '').toLowerCase();
      if (role === 'teacher') {
        window.location.href = '/teacher-dashboard';
      } else if (role === 'student') {
        window.location.href = '/student-dashboard';
      } else if (role === 'parent') {
        // only if you have this route set up on the server
        window.location.href = '/parent-dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An unexpected error occurred while logging in.');
    } finally {
      submitting = false;
    }
  });
});
