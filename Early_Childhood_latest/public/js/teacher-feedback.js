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
    window.location.href = 'login.html';
  });
}
window.addEventListener('click', (event) => {
  if (event.target === logoutModal) {
    logoutModal.style.display = 'none';
  }
});

/* ================================
   Helpers (DOM getters)
================================ */

/** Safely get trimmed innerText from the first matching selector (or '') */
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

/** URL query param getter (if you need it later) */
function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

/** Collect all existing/previous feedback items rendered on the page */
function getFeedbackItemsFromDOM() {
  // Add/adjust selectors to match your markup
  const containers = document.querySelectorAll(
    '#feedbackList .feedback-item, #feedbackList .feedback-card, .feedback-list .feedback-item, .feedback-entry, .feedback-card'
  );

  const items = [];
  containers.forEach(card => {
    const title =
      (card.querySelector('.feedback-title, h4, strong')?.innerText ||
        card.querySelector('.card-title')?.innerText ||
        '').trim();
    const body =
      (card.querySelector('.feedback-body, .body, p')?.innerText ||
        card.querySelector('.card-text')?.innerText ||
        '').trim();
    const ts =
      (card.querySelector('time, .feedback-date, .muted, .timestamp')?.innerText || '').trim();
    if (title || body || ts) items.push({ title, body, created_at: ts });
  });
  return items;
}

/* ================================
   UNIVERSAL Report extractor (deduped)
   Works across multiple report types by scanning headings
   AND avoids duplicate sections
================================ */
function getReportFromDOM() {
  const report = {
    title: getFirstText(['#report-title', '.report-title', '.card-header h3', '.card-header h2', 'h2', 'h3']),
    childName: getFirstText(['#childName', '.child-name', '.student-name']),
    authorName: getFirstText(['#authorName', '.author-name', '.submitted-by']),
    dateRange: getFirstText(['#reportDate', '.report-date', '.date-range']),
    sections: []
  };

  // Lock onto the left-side report area if you have a consistent class
  const container =
    document.querySelector('.left-panel') ||           // <-- use your real left-panel class if you have one
    document.querySelector('.report-card') ||
    document.querySelector('.report-section') ||
    document.querySelector('.card') ||
    document.body;

  // Scan in order; treat heading-like nodes as section titles and
  // capture the immediate next text node as the content.
  const els = [...container.querySelectorAll('h2, h3, h4, strong, b, p, div, span')];
  const seen = new Set(); // prevent duplicate section titles

  for (let i = 0; i < els.length; i++) {
    const headingNode = els[i];
    const nextNode = els[i + 1];

    const headingText = (headingNode.innerText || '').trim();
    const nextText = (nextNode?.innerText || '').trim();

    // Filters: must have heading + body, heading not overlong, not repeated,
    // looks like a label, and not equal to the overall card title.
    if (!headingText || !nextText) continue;
    if (headingText.length > 60) continue;
    if (report.title && headingText === report.title) continue;

    const isLabel = /^(observation|activity|context|learning|outcomes|progress|skills|development|area)/i
      .test(headingText);

    if (isLabel) {
      const key = headingText.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      report.sections.push({
        title: headingText,
        content: nextText
      });
    }
  }

  // Fallback: if nothing detected, try a single big content block
  if (!report.sections.length) {
    const bigBlock = getFirstText(['#report-content', '.report-content', '.card-body']);
    if (bigBlock) {
      report.sections.push({ title: report.title || 'Report', content: bigBlock });
    }
  }

  return report;
}

/* ================================
   PDF helpers (wrapping, sections)
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
  if (y > 280) { doc.addPage(); y = 20; }
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(14);
  doc.text(heading, 20, y); y += 8;
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(12);
  y = writeWrapped(doc, body || '(none)', 20, y, 170, 6);
  y += 6;
  return y;
}

/* ================================
   Export PDF (report + all feedback)
================================ */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  // 1) Report (dynamic, deduped)
  const report = getReportFromDOM();

  // 2) Feedback
  const existingFeedback = getFeedbackItemsFromDOM();
  const feedbackTitle = (document.getElementById('feedback-title')?.value || '').trim();
  const feedbackDescription = (document.getElementById('feedback-description')?.value || '').trim();
  const allFeedback = [...existingFeedback];

  if (feedbackTitle || feedbackDescription) {
    allFeedback.unshift({
      title: feedbackTitle || 'Untitled',
      body: feedbackDescription || '',
      created_at: new Date().toLocaleString()
    });
  }

  // ========== HEADER ==========
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(18);
  doc.text(`${report.title || 'Observation'} & Teacher Feedback`, 20, y); y += 12;

  doc.setFont('Helvetica', 'normal'); doc.setFontSize(12);
  const child = getFirstText(['#childName', '.child-name', '.student-name']);
  if (child) { doc.text(`Child: ${child}`, 20, y); y += 7; }
  if (report.authorName) { doc.text(`Author: ${report.authorName}`, 20, y); y += 7; }
  doc.text(`Date: ${report.dateRange || new Date().toLocaleString()}`, 20, y); y += 10;

  // ========== REPORT SECTIONS ==========
  if (report.sections && report.sections.length) {
    for (const s of report.sections) {
      y = writeSection(doc, s.title, s.content, y);
    }
  } else {
    y = writeSection(doc, 'Report', '(No report content found)', y);
  }

  // ========== FEEDBACK ==========
  if (y > 280) { doc.addPage(); y = 20; }
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(14);
  doc.text('Teacher Feedback', 20, y); y += 8;
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(12);

  if (!allFeedback.length) {
    y = writeWrapped(doc, '(No feedback)', 20, y, 170, 6);
  } else {
    allFeedback.forEach((f, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const heading = `${idx + 1}. ${f.title || 'Untitled'}`;
      doc.setFont('Helvetica', 'bold'); doc.text(heading, 20, y); y += 6;
      if (f.created_at) {
        doc.setFont('Helvetica', 'italic');
        y = writeWrapped(doc, String(f.created_at), 20, y, 170, 6);
      }
      doc.setFont('Helvetica', 'normal');
      y = writeWrapped(doc, f.body || '(no content)', 20, y, 170, 6);
      y += 4;
    });
  }

  // ========== SAVE ==========
  doc.save('report_and_feedback.pdf');
}

/* ================================
   Feedback form handler
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
   <button type="button" id="exportBtn">Export to PDF</button>
================================ */
document.getElementById('exportBtn')?.addEventListener('click', exportPDF);
