document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const userData = {
    role: document.getElementById('role').value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value
  };

  // Send data to backend
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const result = await res.json();
  if (result.success) {
    window.location.href = '/';
  } else {
    alert(result.message || 'Signup failed');
  }
});


