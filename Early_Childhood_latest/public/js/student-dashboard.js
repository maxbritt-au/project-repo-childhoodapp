// public/js/student-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    window.location.href = '/';
    return;
  }

  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    greetingEl.textContent = `Hello, ${user.name}!`;
  } else {
    const fallbackH2 = document.querySelector('.hero-profile-info h2');
    if (fallbackH2) {
      fallbackH2.textContent = `Hello, ${user.name}!`;
    }
  }

  const idEl = document.getElementById('studentId');
  if (idEl) {
    if (user.userId) {
      idEl.textContent = `Student ID: ${user.userId}`;
    } else {
      idEl.textContent = '';
    }
  }

  const reportsList = document.querySelector('.reports-list');
  
  async function loadReports() {
    try {
      const response = await fetch(`/api/reports?studentId=${user.userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports.');
      }
      const reports = await response.json();
      renderReports(reports);
    } catch (error) {
      console.error('Error loading reports:', error);
      reportsList.innerHTML = '<li><p>Failed to load recent reports.</p></li>';
    }
  }

  function renderReports(reports) {
    reportsList.innerHTML = '';
    if (reports.length === 0) {
      reportsList.innerHTML = '<li><p>No reports found.</p></li>';
      return;
    }

    reports.forEach(report => {
      const date = new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <i class="fas fa-file-pdf"></i>
        <span>${report.title}</span><span>${date}</span>
      `;
      reportsList.appendChild(listItem);
    });
  }

  reportsList.addEventListener('click', (event) => {
    const listItem = event.target.closest('li');
    if (listItem) {
      const reportTitle = listItem.querySelector('span').textContent;
      console.log(`Report clicked: ${reportTitle}`);
    }
  });

  loadReports();

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
    localStorage.removeItem('user');
    if (logoutModal) logoutModal.style.display = 'none';
    window.location.href = '/';
  });

  window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      logoutModal.style.display = 'none';
    }
  });
});