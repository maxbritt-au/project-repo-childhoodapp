document.getElementById('reportForm').addEventListener('submit', function(event) {
  event.preventDefault(); 

  const reportTitle = document.getElementById('report-title').value;
  const reportType = document.getElementById('report-type').value;
  const reportDescription = document.getElementById('report-description').value;
  const reportFile = document.getElementById('report-file').files[0];

  if (reportTitle && reportDescription) {
    console.log('Report Title:', reportTitle);
    console.log('Report Type:', reportType);
    console.log('Report Description:', reportDescription);
    if (reportFile) {
      console.log('File Name:', reportFile.name);
    }
    
    alert('Report submitted successfully!');
    
    document.getElementById('reportForm').reset();
  } else {
    alert('Please fill out the report title and details.');
  }
});

const themeToggle = document.querySelector('.theme-icons');
const body = document.body;

const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  body.classList.add(currentTheme);
} else {
  body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark-mode');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light-mode');
  }
});

const logoutModal = document.getElementById('logout-modal');
const openLogoutBtn = document.getElementById('open-logout-modal');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

openLogoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logoutModal.style.display = 'flex';
});

cancelLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
});

confirmLogoutBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

window.addEventListener('click', (event) => {
  if (event.target === logoutModal) {
    logoutModal.style.display = 'none';
  }
});