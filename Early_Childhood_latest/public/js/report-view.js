// public/js/report-view.js

// ---- Utilities
function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchReport(reportId) {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

// ---- Rendering
function renderReport(report) {
  const titleEl = document.getElementById('reportTitle');
  const metaEl  = document.getElementById('reportMeta');
  const container = document.getElementById('reportContent') || document.getElementById('reportViewForm');

  if (titleEl) titleEl.textContent = report.template_title || 'Report';

  const submitted =
    report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : '';
  const submitter = report.student_name || report.created_by || 'Unknown';

  if (metaEl) metaEl.textContent =
    submitted ? `Submitted by ${submitter} on ${submitted}` : `Submitted by ${submitter}`;

  // Parse content safely
  let content;
  try {
    content = typeof report.content === 'string' ? JSON.parse(report.content) : (report.content || {});
  } catch {
    content = { text: report.content };
  }

  // If the page uses a free-form container (#reportContent) render sections,
  // otherwise leave the readonly form that the HTML already builds.
  if (container && container.id === 'reportContent') {
    container.innerHTML = '';
    for (const [key, value] of Object.entries(content)) {
      const section = document.createElement('div');
      section.className = 'report-section';
      section.innerHTML = `<h3>${key}</h3><p>${value || '-'}</p>`;
      container.appendChild(section);
    }
  }
}

// ---- Actions
function wirePrint() {
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
}

/**
 * Ensures a right-aligned blue button exists in the .report-actions row
 * and wires it based on role:
 * - teacher -> "Add Feedback" -> /feedback-add?reportId=...
 * - student -> "View Feedback" -> /feedback-view?reportId=...
 */
function setupFeedbackButton(reportId) {
  const actionsRow =
    document.querySelector('.report-actions') ||
    document.getElementById('actions') ||
    document.querySelector('.actions');

  if (!actionsRow || !reportId) return;

  // Reuse existing button if present; otherwise create one
  let btn = document.getElementById('feedbackBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'feedbackBtn';
    btn.type = 'button';
    btn.className = 'btn primary';
    // push to right
    btn.style.marginLeft = 'auto';
    actionsRow.appendChild(btn);
  }

  const user = getUserFromStorage();
  if (!user || !user.role) {
    btn.style.display = 'none';
    return;
  }

  // Show with role-appropriate text & click
  btn.style.display = 'inline-block';
  btn.replaceWith(btn.cloneNode(true)); // remove old listeners
  btn = document.getElementById('feedbackBtn');

  if (user.role === 'teacher') {
    btn.textContent = 'Add Feedback';
    btn.addEventListener('click', () => {
      window.location.href = `/feedback-add?reportId=${encodeURIComponent(reportId)}`;
    });
  } else if (user.role === 'student') {
    btn.textContent = 'View Feedback';
    btn.addEventListener('click', () => {
      window.location.href = `/feedback-view?reportId=${encodeURIComponent(reportId)}`;
    });
  } else {
    // other roles: hide
    btn.style.display = 'none';
  }
}

/**
 * Sets the "Back to Reports" link if your HTML includes an element with id="backLink".
 * If a childId is present in the URL we keep it in the back link.
 */
function setBackLink(childId) {
  const back = document.getElementById('backLink');
  if (!back) return;
  back.href = childId ? `/report-list?childId=${encodeURIComponent(childId)}` : '/report-list';
}

// ---- Init
(async function init() {
  wirePrint();

  const params = new URLSearchParams(window.location.search);
  const reportId = params.get('reportId') || params.get('id');
  const childId  = params.get('childId');

  // Back link (optional)
  setBackLink(childId);

  if (!reportId) {
    const target = document.getElementById('reportContent') || document.getElementById('reportViewForm');
    if (target) target.innerHTML = '<p>No report ID provided.</p>';
    return;
  }

  // Role-based feedback button
  setupFeedbackButton(reportId);

  // Fetch + render
  try {
    const report = await fetchReport(reportId);
    renderReport(report);
  } catch (err) {
    console.error(err);
    const target = document.getElementById('reportContent') || document.getElementById('reportViewForm');
    if (target) target.innerHTML = '<p>Error loading report.</p>';
  }
})();
