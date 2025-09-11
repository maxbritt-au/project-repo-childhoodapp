function getChildId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('childId');
}

const nameEl = document.getElementById('childName');
const avatarEl = document.querySelector('.hero-profile-pic');
const reportsListEl = document.getElementById('reportsList');

const editProfileLink = document.getElementById('editProfileLink');
const newReportLink = document.getElementById('newReportLink');
const allReportsLink = document.getElementById('allReportsLink');
const qaNewReport = document.getElementById('qaNewReport');
const qaAllReports = document.getElementById('qaAllReports');
const deleteChildBtn = document.getElementById('deleteChildBtn'); // 🔑 new

async function fetchJSON(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => ''));
  return res.json();
}

function renderReports(reports) {
  reportsListEl.innerHTML = '';
  if (!reports?.length) {
    reportsListEl.innerHTML = '<li>No reports found for this child.</li>';
    return;
  }

  for (const r of reports) {
    const dateStr = r.submitted_at
      ? new Date(r.submitted_at).toLocaleDateString(undefined, {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        })
      : '';
    const li = document.createElement('li');
    li.innerHTML = `
      <i class="fas fa-file-pdf"></i>
      <span><strong>${r.template_title || 'Report'}</strong> by ${r.student_name}</span>
      <span class="muted">${dateStr}</span>
    `;
    reportsListEl.appendChild(li);
  }
}

async function loadChild(childId) {
  try {
    const child = await fetchJSON(`/api/children/${encodeURIComponent(childId)}`);
    const fullName = [child.first_name, child.last_name].filter(Boolean).join(' ') || 'Unknown';
    nameEl.textContent = fullName;

    if (child.profile_url) avatarEl.src = child.profile_url;

    editProfileLink.href = `/html/edit-child-profile.html?childId=${encodeURIComponent(childId)}`;
    newReportLink.href = `/html/student-report.html?childId=${encodeURIComponent(childId)}`;
    allReportsLink.href = `/html/report-list.html?childId=${encodeURIComponent(childId)}`;
    qaNewReport.href = newReportLink.href;
    qaAllReports.href = allReportsLink.href;
  } catch (e) {
    console.error(e);
    nameEl.textContent = 'Unknown Child';
  }
}

async function loadReports(childId) {
  try {
    const reports = await fetchJSON(`/api/reports?childId=${encodeURIComponent(childId)}&limit=10`);
    renderReports(reports);
  } catch (e) {
    console.error(e);
    renderReports([]);
  }
}

// 🔴 New delete handler
async function deleteChild(childId) {
  if (!childId) return alert('No child ID provided.');

  if (!confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
    return;
  }

  try {
    const res = await fetch(`/api/children/${encodeURIComponent(childId)}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      alert('Child deleted successfully');
      window.location.href = '/children-dashboard';
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Failed to delete child: ' + (err.message || res.statusText));
    }
  } catch (e) {
    console.error('Error deleting child:', e);
    alert('Unexpected error deleting child.');
  }
}

(async function init() {
  const childId = getChildId();
  if (!childId) {
    nameEl.textContent = 'No child selected';
    renderReports([]);
    return;
  }

  await Promise.all([loadChild(childId), loadReports(childId)]);

  // Hook delete button
  if (deleteChildBtn) {
    deleteChildBtn.addEventListener('click', () => deleteChild(childId));
  }
})();
