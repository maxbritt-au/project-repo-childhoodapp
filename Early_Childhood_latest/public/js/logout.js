document.addEventListener('DOMContentLoaded', () => {
    const logoutModal = document.getElementById('logout-modal');
    const openLogoutBtn = document.getElementById('open-logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    if (openLogoutBtn) {
        openLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('open');
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.remove('open');
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            // Remove user session data from local storage
            localStorage.removeItem('user');
            // Redirect to the login page
            window.location.href = '/';
        });
    }
});