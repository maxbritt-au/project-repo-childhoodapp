// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid login credentials');
    }

    const data = await res.json(); // expects: { role, name }

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Redirect based on role
    if (data.role === 'teacher') {
      window.location.href = '/html/teacher-dashboard.html';
    } else if (data.role === 'student') {
      window.location.href = '/html/student-dashboard.html';
    } else if (data.role === 'parent') {
      window.location.href = '/html/parent-dashboard.html';
    } else {
      window.location.href = '/html/dashboard.html';
    }
  } catch (err) {
    alert(err.message);
  }
});

// Autofill email
window.addEventListener('DOMContentLoaded', () => {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
});
