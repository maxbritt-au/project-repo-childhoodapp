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

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const title = document.getElementById("feedback-title").value.trim();
  const description = document.getElementById("feedback-description").value.trim();

  if (!title && !description) {
    alert("Please fill out the feedback title or description before exporting.");
    return;
  }

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Teacher Feedback", 20, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Title: ${title || "(none)"}`, 20, 40);
  doc.text("Description:", 20, 60);

  const lines = doc.splitTextToSize(description || "(none)", 170);
  doc.text(lines, 20, 70);

  doc.save("teacher_feedback.pdf");
}

document.getElementById('feedbackForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Feedback submitted successfully!');
});