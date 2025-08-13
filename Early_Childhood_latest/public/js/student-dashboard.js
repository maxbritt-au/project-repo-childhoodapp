
function toggleDropdown(event) {
  event.stopPropagation();
  const menu = event.currentTarget.querySelector('.dropdown-menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', (event) => {
  const profileMenu = document.querySelector('.profile-menu');
  if (profileMenu && !profileMenu.contains(event.target)) {
    const dropdown = profileMenu.querySelector('.dropdown-menu');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
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

// Logout Modal Logic
const logoutModal = document.getElementById('logout-modal');
const openLogoutBtn = document.getElementById('open-logout-modal');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

// Open the modal
openLogoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logoutModal.style.display = 'flex';
});

// Close the modal
cancelLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
});

// Redirect on confirm
confirmLogoutBtn.addEventListener('click', () => {
  window.location.href = 'login.html'; // This line redirects the user
});

// Close modal if clicked outside
window.addEventListener('click', (event) => {
  if (event.target === logoutModal) {
    logoutModal.style.display = 'none';
  }
});