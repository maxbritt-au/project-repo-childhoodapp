// public/js/signup.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const roleInput = document.getElementById('role');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const submitBtn = form?.querySelector('button[type="submit"]');

  const VALID_ROLES = new Set(['student', 'teacher', 'parent']);

  if (!form) {
    console.error('signupForm not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const roleRaw = roleInput?.value || '';
    const role = VALID_ROLES.has(roleRaw) ? roleRaw : 'student'; // fallback to valid enum
    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = (passwordInput?.value || '').trim();
    const confirmPassword = (confirmInput?.value || '').trim();

    // Basic client-side validation
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Optional light email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Do NOT send confirmPassword to backend
        body: JSON.stringify({ role, name, email, password })
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        if (res.status === 409) {
          alert('That email is already in use.');
        } else if (res.status === 400) {
          alert(result.message || 'Please check your details and try again.');
        } else {
          alert(result.message || 'Signup failed. Please try again.');
        }
        return;
      }

      alert('Account created! Please log in.');
      window.location.href = '/'; // back to login
    } catch (err) {
      console.error('Signup error:', err);
      alert('An unexpected error occurred during signup.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    }
  });
});
