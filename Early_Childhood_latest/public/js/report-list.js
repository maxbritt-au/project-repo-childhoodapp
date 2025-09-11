async function fetchReports(childId) {
  const res = await fetch(`/api/reports?childId=${encodeURIComponent(childId)}&limit=50`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

async function deleteReport(id) {
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(msg || 'Failed to delete report');
  }
  return true;
}

function safeHTML(str = '') {
  return String(str).replace(/[&<>"']/g, m => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]
  ));
}

async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
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

    const dateStr = r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '';
    const viewHref =
      // use whichever route you serve the view from; both are supported by your report-view
      `/html/report-view.html?reportId=${encodeURIComponent(r.id)}&childId=${encodeURIComponent(childId)}`;

    li.innerHTML = `
      <strong>${safeHTML(r.template_title || 'Report')}</strong>
      by ${safeHTML(r.student_name || '')}
      <span class="muted">(${safeHTML(dateStr)})</span>
      <div class="actions">
        <a href="${viewHref}" class="btn small">Open</a>
        <button class="btn small danger" data-id="${safeHTML(String(r.id))}">Delete</button>
      </div>
    `;

    // Wire up delete
    li.querySelector('button.danger')?.addEventListener('click', async (ev) => {
      const btn = ev.currentTarget;
      const id = btn.getAttribute('data-id');
      const title = r.template_title || 'report';

      if (!confirm(`Delete this ${title}?\nThis action cannot be undone.`)) return;

      // Optimistic UI: disable button while deleting
      const prevText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Deleting…';

      try {
        await deleteReport(id);
        li.remove(); // remove from DOM
        // If the list becomes empty, show a note:
        if (!list.querySelector('.report-item')) {
          container.innerHTML = '<p>No reports found for this child.</p>';
        }
      } catch (err) {
        alert(err.message || 'Failed to delete report.');
        btn.disabled = false;
        btn.textContent = prevText;
      }
    });

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
