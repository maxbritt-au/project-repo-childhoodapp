// public/js/teacher-dashboard.js

const studentContainer = document.getElementById("students");
const infoDisplayArea = document.getElementById("info-display-area");
const infoTitle = document.querySelector(".info-title");
const infoSubtitle = document.querySelector(".info-subtitle");
const addFeedbackBtn = document.getElementById("add-feedback-btn");

let allStudents = [];

function renderStudentList(students) {
  studentContainer.innerHTML = '';
  if (students.length === 0) {
    studentContainer.innerHTML = '<p class="placeholder-text">No students found.</p>';
    return;
  }
  
  students.forEach(student => {
    const listItem = document.createElement("li");
    listItem.className = "student-list-item";
    listItem.innerHTML = `
      <div class="student-info">
        <img src="${student.img}" alt="${student.name}" class="student-list-img">
        <div>
          <p>${student.name}</p>
          <span>ID: ${student.id}</span>
        </div>
      </div>
      <div class="student-actions">
        <a href="#" onclick="viewProfile('${student.id}'); return false;"><i class="fas fa-user"></i></a>
        <a href="#" onclick="viewReport('${student.id}'); return false;"><i class="fas fa-file-alt"></i></a>
      </div>
    `;
    studentContainer.appendChild(listItem);
  });
}

async function loadStudents() {
  try {
    const response = await fetch('/api/students', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch students.');
    }
    const studentsData = await response.json();
    allStudents = studentsData;
    renderStudentList(allStudents);
  } catch (error) {
    console.error('Error loading students:', error);
    studentContainer.innerHTML = '<p class="placeholder-text">Failed to load student list.</p>';
  }
}

function viewProfile(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  infoTitle.textContent = "Student Profile";
  infoSubtitle.textContent = `Viewing profile for ${student.name}`;
  infoDisplayArea.innerHTML = `
    <div class="student-profile-details">
      <div style="text-align: center;">
        <img src="${student.img}" alt="${student.name}" class="profile-img-large">
      </div>
      <h4>${student.name}</h4>
      <p>ID: ${student.id}</p>
      <p>Course: ${student.course}</p>
    </div>
  `;
}

function viewReport(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  infoTitle.textContent = "Recent Reports";
  infoSubtitle.textContent = `Reports for ${student.name}`;
  infoDisplayArea.innerHTML = `
    <ul class="reports-list" style="text-align: left;">
      <li><p>Developmental Checklist</p><span>Feb 15, 2025</span></li>
      <li><p>Learning Story</p><span>Mar 25, 2025</span></li>
      <li><p>Teacher Feedback</p><span>Apr 01, 2025</span></li>
    </ul>
  `;
}

loadStudents();

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