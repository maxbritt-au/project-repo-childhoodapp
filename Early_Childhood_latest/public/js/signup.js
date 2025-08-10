document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const role = document.getElementById('role').value;
  const agree = document.getElementById('agree').checked;

  if (password !== confirmPassword) {
    alert('❌ Passwords do not match!');
    return;
  }

  if (!agree) {
    alert('❌ You must accept the terms and conditions.');
    return;
  }

  const user = { name, email, password, role };

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const result = await response.text();

    if (response.ok) {
      alert('✅ Signup successful! You can now log in.');
      window.location.href = 'login.html';
    } else {
      alert('❌ Signup failed: ' + result);
    }
  } catch (error) {
    alert('❌ Network error: ' + error.message);
  }
});
