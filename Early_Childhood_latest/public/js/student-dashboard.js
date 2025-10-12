// public/js/student-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Auth gate via localStorage
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    window.location.href = '/';
    return;
  }

  // --- Greeting / header
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    greetingEl.textContent = `Hello, ${user.name}!`;
  } else {
    const fallbackH2 = document.querySelector('.hero-profile-info h2');
    if (fallbackH2) fallbackH2.textContent = `Hello, ${user.name}!`;
  }

  const idEl = document.getElementById('studentId');
  if (idEl) idEl.textContent = user.userId ? `Student ID: ${user.userId}` : '';

  // --- Recent Reports
  const recentListEl = document.querySelector('.reports-list');
  const recentEmptyMsg = 'No reports found.';
  const recentErrorMsg = 'Failed to load recent reports.';

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch {
      return '';
    }
  }

  function renderRecent(rows) {
    if (!recentListEl) return;

    recentListEl.innerHTML = '';
    if (!rows || !rows.length) {
      recentListEl.innerHTML = `<li><p>${recentEmptyMsg}</p></li>`;
      return;
    }

    rows.forEach(r => {
      const childName = [r.child_first_name, r.child_last_name].filter(Boolean).join(' ');
      const dateStr = fmtDate(r.submitted_at);
      const li = document.createElement('li');
      li.innerHTML = `
        <i class="fas fa-file-pdf"></i>
        <span><strong>${r.template_title || 'Report'}</strong>${childName ? ` — ${childName}` : ''}</span>
        <span class="muted">${dateStr}</span>
      `;
      li.addEventListener('click', () => {
        if (r.child_id) {
          window.location.href = `/report-list?childId=${encodeURIComponent(r.child_id)}`;
        }
      });
      recentListEl.appendChild(li);
    });
  }

  async function loadRecent() {
    if (!recentListEl) return;
    try {
      const res = await fetch('/api/reports/recent/my?limit=5', { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text().catch(() => recentErrorMsg));
      const rows = await res.json();
      renderRecent(rows);
    } catch (err) {
      console.error('Error loading recent reports:', err);
      recentListEl.innerHTML = `<li><p>${recentErrorMsg}</p></li>`;
    }
  }

  loadRecent();

  // --- Click logging (optional)
  recentListEl?.addEventListener('click', (event) => {
    const li = event.target.closest('li');
    if (li) {
      const firstSpan = li.querySelector('span');
      console.log('Report clicked:', firstSpan ? firstSpan.textContent : '(unknown)');
    }
  });

  // --- Logout modal wiring (robust)
  const logoutModal = document.getElementById('logout-modal');
  const openLogoutBtn = document.getElementById('open-logout-modal');
  const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
  const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

  // Ensure modal is hidden on page load
  if (logoutModal) {
    logoutModal.classList.remove('open');
    logoutModal.setAttribute('aria-hidden', 'true');
    logoutModal.style.display = 'none';
  }

  function showLogout() {
    if (!logoutModal) return;
    logoutModal.classList.add('open');
    logoutModal.removeAttribute('aria-hidden');
    logoutModal.style.display = 'flex';
  }

  function hideLogout() {
    if (!logoutModal) return;
    logoutModal.classList.remove('open');
    logoutModal.setAttribute('aria-hidden', 'true');
    logoutModal.style.display = 'none';
  }

  openLogoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    showLogout();
  });

  cancelLogoutBtn?.addEventListener('click', hideLogout);

  confirmLogoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('user');
    hideLogout();
    window.location.href = '/';
  });

  window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      hideLogout();
    }
  });
});