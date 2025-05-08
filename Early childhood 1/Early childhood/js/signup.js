document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  const user = { email, password, role };
  localStorage.setItem('user', JSON.stringify(user));

  alert('Signup successful! Please login now.');
  window.location.href = 'login.html';
});


