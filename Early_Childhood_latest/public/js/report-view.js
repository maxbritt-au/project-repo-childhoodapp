async function fetchReport(reportId) {
  const res = await fetch(`/api/reports/${reportId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

function renderReport(report) {
  document.getElementById('reportTitle').textContent = report.template_title || 'Report';
  document.getElementById('reportMeta').textContent =
    `Submitted by ${report.student_name} on ${new Date(report.submitted_at).toLocaleDateString()}`;

  let content;
  try {
    content = JSON.parse(report.content);
  } catch {
    content = { text: report.content };
  }

  const container = document.getElementById('reportContent');
  container.innerHTML = '';

  for (const [key, value] of Object.entries(content)) {
    const section = document.createElement('div');
    section.className = 'report-section';
    section.innerHTML = `<h3>${key}</h3><p>${value || '-'}</p>`;
    container.appendChild(section);
  }
}

(async function init() {
  const params = new URLSearchParams(window.location.search);
  const reportId = params.get('id');
  const childId = params.get('childId');

  if (!reportId) {
    document.getElementById('reportContent').innerHTML = '<p>No report ID provided.</p>';
    return;
  }

  // Set back link
  if (childId) {
    document.getElementById('backLink').href = `/report-list?childId=${childId}`;
  }

  try {
    const report = await fetchReport(reportId);
    renderReport(report);
  } catch (err) {
    console.error(err);
    document.getElementById('reportContent').innerHTML = '<p>Error loading report.</p>';
  }
})();
