document.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.name) {
    document.getElementById('studentName').textContent = user.name;
  } else {
    document.getElementById('studentName').textContent = "Student Name";
  }
});