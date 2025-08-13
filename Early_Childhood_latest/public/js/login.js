document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.email === email && user.password === password) {
    alert('Login successful!');
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    if (user.role === 'teacher') {
      window.location.href = 'teacher-dashboard.html';
    } else if (user.role === 'student') {
      window.location.href = 'student-dashboard.html';
    } else if (user.role === 'parent') {
      window.location.href = 'parent-dashboard.html';
    }
  } else {
    alert('Invalid login credentials!');
  }
});


window.onload = function() {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
};
