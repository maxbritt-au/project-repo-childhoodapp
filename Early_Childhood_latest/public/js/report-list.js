async function fetchReports(childId) {
  const res = await fetch(`/api/reports?childId=${encodeURIComponent(childId)}&limit=50`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

function renderReports(reports, childId) {
  const container = document.getElementById('reportsList');
  container.innerHTML = '';

  if (!reports.length) {
    container.innerHTML = '<p>No reports found for this child.</p>';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'reports-ul';

  reports.forEach(r => {
    const li = document.createElement('li');
    li.className = 'report-item';
    const dateStr = new Date(r.submitted_at).toLocaleDateString();
    li.innerHTML = `
      <strong>${r.template_title || 'Report'}</strong> 
      by ${r.student_name} 
      <span class="muted">(${dateStr})</span>
      <a href="/report-view?id=${r.id}&childId=${childId}" class="btn small">Open</a>
    `;
    list.appendChild(li);
  });

  container.appendChild(list);
}

(async function init() {
  const params = new URLSearchParams(window.location.search);
  const childId = params.get('childId');
  if (!childId) {
    document.getElementById('reportsList').innerHTML = '<p>No childId provided in URL.</p>';
    return;
  }

  try {
    const reports = await fetchReports(childId);
    renderReports(reports, childId);
  } catch (err) {
    console.error(err);
    document.getElementById('reportsList').innerHTML = '<p>Error loading reports.</p>';
  }
})();
