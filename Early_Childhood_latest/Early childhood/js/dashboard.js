document.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.name) {
    document.getElementById('welcomeMessage').innerHTML = `Welcome, ${user.name}! 🎓`;
  } else {
    document.getElementById('welcomeMessage').innerHTML = "Welcome, Student! 🎓";
  }
});