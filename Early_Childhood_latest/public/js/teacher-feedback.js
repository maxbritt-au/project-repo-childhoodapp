/* ================================
   Logout modal controls
================================ */
const logoutModal = document.getElementById('logout-modal');
const openLogoutBtn = document.getElementById('open-logout-modal');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

if (openLogoutBtn) {
  openLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (logoutModal) logoutModal.style.display = 'flex';
  });
}
if (cancelLogoutBtn) {
  cancelLogoutBtn.addEventListener('click', () => {
    if (logoutModal) logoutModal.style.display = 'none';
  });
}
if (confirmLogoutBtn) {
  confirmLogoutBtn.addEventListener('click', () => {
    window.location.href = '/';
  });
}
window.addEventListener('click', (event) => {
  if (event.target === logoutModal) logoutModal.style.display = 'none';
});

/* ================================
   Small helpers used by exporter
================================ */
function getFirstText(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const t = (el.innerText || el.textContent || '').trim();
      if (t) return t;
    }
  }
  return '';
}

function getFeedbackItemsFromDOM() {
  const containers = document.querySelectorAll(
    '#feedbackList .feedback-item, #feedbackList .feedback-card, .feedback-list .feedback-item, .feedback-entry, .feedback-card'
  );
  const items = [];
  containers.forEach(card => {
    const title =
      (card.querySelector('.feedback-title, h4, strong')?.innerText ||
        card.querySelector('.card-title')?.innerText || '').trim();
    const body =
      (card.querySelector('.feedback-body, .body, p')?.innerText ||
        card.querySelector('.card-text')?.innerText || '').trim();
    const ts =
      (card.querySelector('time, .feedback-date, .muted, .timestamp')?.innerText || '').trim();
    if (title || body || ts) items.push({ title, body, created_at: ts });
  });
  return items;
}

/* ================================
   PDF helpers
================================ */
function writeWrapped(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text || '', maxWidth);
  for (const line of lines) {
    if (y > 285) { doc.addPage(); y = 20; }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function writeSection(doc, heading, body, y) {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(14);
  doc.text(heading, 20, y); y += 8;
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(12);
  y = writeWrapped(doc, body || '(none)', 20, y, 170, 6);
  y += 8;
  return y;
}

/* ================================
   Export PDF WITH cover page
   (reads canonical metadata set by loadReport)
================================ */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 30;

  // Canonical metadata from page (set in teacher-feedback.html script)
  const metaEl = document.getElementById('reportIdHidden');
  const reportId = metaEl?.value || 'Unknown';
  const childName = metaEl?.dataset?.childName || 'Unknown';
  const childId = metaEl?.dataset?.childId || '';
  const teacherName = metaEl?.dataset?.teacherName || 'Teacher';

  const reportTitle = getFirstText(['.report-title', '#reportTitle']) || 'Report';
  const studentInfo = getFirstText(['#studentInfo', '.student-info']);
  let reportDate = '';
  const m = /—\s*(.+)$/.exec(studentInfo);
  if (m) reportDate = m[1];
  const exportDate = new Date().toLocaleDateString();

  // ===== COVER PAGE =====
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(reportTitle, 20, y); y += 20;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(`Child: ${childName}${childId ? ` (ID: ${childId})` : ''}${reportDate ? ` — ${reportDate}` : ''}`, 20, y); y += 10;
  doc.text(`Report ID: ${reportId}`, 20, y); y += 10;
  doc.text(`Teacher: ${teacherName}`, 20, y); y += 10;
  doc.text(`Date Exported: ${exportDate}`, 20, y); y += 20;

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(12);
  doc.text('Summarised report with developmental observations and feedback.', 20, y);

  // New page after cover
  doc.addPage();
  y = 20;

  // ===== REPORT SECTIONS =====
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(16);
  doc.text('Report Details', 20, y); y += 12;

  const sectionEls = document.querySelectorAll('#reportBody .report-chunk');
  if (!sectionEls.length) {
    y = writeSection(doc, 'Report', '(No content found)', y);
  } else {
    sectionEls.forEach((sec) => {
      const title = (sec.querySelector('.report-sub-title')?.innerText || '').trim() || 'Section';
      const text = (sec.querySelector('.report-text')?.innerText || '').trim() || '';
      y = writeSection(doc, title, text, y);
    });
  }

  // ===== TEACHER FEEDBACK =====
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(16);
  doc.text('Teacher Feedback', 20, y); y += 10;
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(12);

  const feedbackCards = getFeedbackItemsFromDOM();
  const newTitle = (document.getElementById('feedback-title')?.value || '').trim();
  const newDesc = (document.getElementById('feedback-description')?.value || '').trim();
  if (newTitle || newDesc) {
    feedbackCards.unshift({
      title: newTitle || 'Untitled Feedback',
      body: newDesc || '',
      created_at: new Date().toLocaleString(),
    });
  }

  if (!feedbackCards.length) {
    y = writeWrapped(doc, '(No feedback provided)', 20, y, 170, 6);
  } else {
    feedbackCards.forEach((f, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('Helvetica', 'bold');
      doc.text(`${i + 1}. ${f.title}`, 20, y); y += 6;
      if (f.created_at) {
        doc.setFont('Helvetica', 'italic');
        y = writeWrapped(doc, f.created_at, 20, y, 170, 6);
      }
      doc.setFont('Helvetica', 'normal');
      y = writeWrapped(doc, f.body, 20, y, 170, 6);
      y += 8;
    });
  }

  // Footer
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y); y += 10;
  doc.setFontSize(10);
  doc.text('Generated automatically from Early Childhood Teacher App', 20, y); y += 6;
  doc.text(`© ${new Date().getFullYear()} Federation University Project`, 20, y);

  const safeTitle = reportTitle.replace(/[^\w\s-]/g, '').slice(0, 40);
  doc.save(`${safeTitle || 'report'}_with_feedback.pdf`);
}

/* ================================
   Feedback form handler (optional toast)
================================ */
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', function (event) {
    event.preventDefault();
    alert('Feedback submitted successfully!');
  });
}

/* ================================
   Hook Export button
================================ */
document.getElementById('exportBtn')?.addEventListener('click', exportPDF);
