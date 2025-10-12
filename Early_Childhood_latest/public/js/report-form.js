// public/js/report-form.js

document.addEventListener('DOMContentLoaded', () => {

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
});