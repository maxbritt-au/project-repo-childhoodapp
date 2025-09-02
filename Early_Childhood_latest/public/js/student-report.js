// public/js/student-reports.js

function getChildId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('childId');
}

// Simple helper to fetch with session cookies
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  if (!res.ok) throw new Error(await res.text().catch(()=>''));
  return res.json();
}

document.getElementById('reportForm').addEventListener('submit', async function(event) {
  event.preventDefault(); 

  const reportTitle = document.getElementById('report-title').value.trim();
  const reportType = document.getElementById('report-type').value.trim();
  const reportDescription = document.getElementById('report-description').value.trim();
  const reportFile = document.getElementById('report-file').files[0];

  if (!reportTitle || !reportDescription) {
    alert('Please fill out the report title and details.');
    return;
  }

  try {
    // 🔑 1. Get student_id from session
    const me = await fetchJSON('/api/me');   // <-- assumes you already expose a /api/me endpoint
    const studentId = me.id;

    // 🔑 2. Get child_id from URL
    const childId = getChildId();

    // 🔑 3. Get template_id (optional: if report-type maps to templates table)
    const templateId = reportType || 1;

    // 🔑 4. Prepare form data
    const payload = {
      student_id: studentId,
      child_id: childId,
      template_id: templateId,
      content: reportDescription
    };

    // 🔑 5. Send JSON to backend
    await fetchJSON('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Report Title:', reportTitle);
    console.log('Report Type:', reportType);
    console.log('Report Description:', reportDescription);
    if (reportFile) {
      console.log('File Name:', reportFile.name);
      // For file upload you’ll need a separate endpoint using multer or similar
    }

    alert('Report submitted successfully!');
    document.getElementById('reportForm').reset();
  } catch (err) {
    console.error('Submit error:', err);
    alert('Failed to submit report: ' + err.message);
  }
});

// -------------------- THEME TOGGLE --------------------
const themeToggle = document.querySelector('.theme-icons');
const body = document.body;

const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  body.classList.add(currentTheme);
} else {
  body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark-mode');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light-mode');
  }
});

// -------------------- LOGOUT MODAL --------------------
const logoutModal = document.getElementById('logout-modal');
const openLogoutBtn = document.getElementById('open-logout-modal');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

openLogoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logoutModal.style.display = 'flex';
});

cancelLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
});

confirmLogoutBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

window.addEventListener('click', (event) => {
  if (event.target === logoutModal) {
    logoutModal.style.display = 'none';
  }
});
