// public/js/student-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  // ------- Read logged-in user -------
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    window.location.href = '/';
    return;
  }

  console.log('[dashboard] user from localStorage:', user);

  // ------- Greeting (with fallback if no #greeting) -------
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    greetingEl.textContent = `Hello, ${user.name}!`;
  } else {
    // fallback: replace the first h2 inside the hero block (where "Hello, Nesar!" is)
    const fallbackH2 = document.querySelector('.hero-profile-info h2');
    if (fallbackH2) {
      fallbackH2.textContent = `Hello, ${user.name}!`;
    } else {
      console.warn('[dashboard] No greeting element found.');
    }
  }

  // ------- Student ID if available -------
  const idEl = document.getElementById('studentId');
  if (idEl) {
    if (user.userId) {
      idEl.textContent = `Student ID: ${user.userId}`;
    } else {
      idEl.textContent = '';
    }
  }

  // ------- Dropdown (profile menu) -------
  function toggleDropdown(event) {
    event.stopPropagation();
    const menu = event.currentTarget.querySelector('.dropdown-menu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
  // If you have a trigger element, wire it:
  // document.querySelector('.profile-menu')?.addEventListener('click', toggleDropdown);

  document.addEventListener('click', (event) => {
    const profileMenu = document.querySelector('.profile-menu');
    if (profileMenu && !profileMenu.contains(event.target)) {
      const dropdown = profileMenu.querySelector('.dropdown-menu');
      if (dropdown) dropdown.style.display = 'none';
    }
  });

  // ------- Theme toggle -------
  const themeToggle = document.querySelector('.theme-icons');
  const body = document.body;
  const currentTheme = localStorage.getItem('theme');
  body.classList.add(currentTheme || 'light-mode');

  themeToggle?.addEventListener('click', () => {
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

  // ------- Logout Modal -------
  const logoutModal = document.getElementById('logout-modal');
  const openLogoutBtn = document.getElementById('open-logout-modal');
  const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
  const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

  openLogoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (logoutModal) logoutModal.style.display = 'flex';
  });

  cancelLogoutBtn?.addEventListener('click', () => {
    if (logoutModal) logoutModal.style.display = 'none';
  });

  confirmLogoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('user'); // keep rememberedEmail
    if (logoutModal) logoutModal.style.display = 'none';
    window.location.href = '/';
  });

  window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      logoutModal.style.display = 'none';
    }
  });
});
