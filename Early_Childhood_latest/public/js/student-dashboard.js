// public/js/student-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Auth gate via localStorage (kept as-is)
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
  const recentListEl  = document.querySelector('.reports-list'); // your existing UL
  const recentEmptyMsg = 'No reports found.';
  const recentErrorMsg = 'Failed to load recent reports.';

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
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
      // click: go to that child's report list (adjust if you have a detail page)
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

  // --- (Optional) click logging on list
  recentListEl?.addEventListener('click', (event) => {
    const li = event.target.closest('li');
    if (li) {
      const firstSpan = li.querySelector('span');
      console.log('Report clicked:', firstSpan ? firstSpan.textContent : '(unknown)');
    }
  });

  // --- Logout modal wiring (kept as-is)
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
