// public/js/login.js
const API_BASE_URL = 'https://project-repo-childhoodapp.onrender.com';
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeInput = document.getElementById('rememberMe');

  // Prefill remembered email on load
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (rememberMeInput) rememberMeInput.checked = true;
  }

  if (!form) {
    console.error('loginForm not found on the page.');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = (passwordInput?.value || '').trim();
    const rememberMe = rememberMeInput?.checked === true;

    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || 'Login failed. Please check your email and password.');
        return;
      }

      // Store only non-sensitive info
      const safeUser = {
        name: data.name,
        role: data.role,
        userId: data.userId,
        email
      };
      localStorage.setItem('user', JSON.stringify(safeUser));

      // Remember email only (not password)
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirect by role (adjust paths if needed)
      if (data.role === 'teacher') {
        window.location.href = '/html/teacher-dashboard.html';
      } else if (data.role === 'student') {
        window.location.href = '/html/student-dashboard.html';
      } else if (data.role === 'parent') {
        window.location.href = '/html/parent-dashboard.html';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An unexpected error occurred while logging in.');
    }
  });
});
