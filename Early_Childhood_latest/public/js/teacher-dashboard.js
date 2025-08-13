const students = [
  { id: "30436982", name: "Nesar Uddin", img: "../img/student-2.png", course: "Bachelor in Information Technology" },
  { id: "30434157", name: "Younus Foisal", img: "../img/student-1.png", course: "Early Childhood Education" },
  { id: "30398757", name: "Max Britt", img: "../img/student-3.png", course: "Early Childhood Education" },
  { id: "30427201", name: "Ashraful Hossain", img: "../img/student-1.png", course: "Early Childhood Education" },
  { id: "30436123", name: "Arafat Uddin", img: "../img/student-2.png", course: "Early Childhood Education" },
  { id: "30436456", name: "Andrew Pham", img: "../img/student-3.png", course: "Early Childhood Education" },
];

const studentContainer = document.getElementById("students");
const infoDisplayArea = document.getElementById("info-display-area");
const infoTitle = document.querySelector(".info-title");
const infoSubtitle = document.querySelector(".info-subtitle");
const addFeedbackBtn = document.getElementById("add-feedback-btn");

function renderStudentList() {
  studentContainer.innerHTML = '';
  students.forEach((student, index) => {
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
        <a href="#" onclick="viewProfile(${index}); return false;"><i class="fas fa-user"></i></a>
        <a href="#" onclick="viewReport(${index}); return false;"><i class="fas fa-file-alt"></i></a>
      </div>
    `;
    studentContainer.appendChild(listItem);
  });
}

// Initial render
renderStudentList();

// Function to view a student's profile
function viewProfile(index) {
  const student = students[index];
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

// Function to view a student's report
function viewReport(index) {
  const student = students[index];
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

// Theme Toggle Logic
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

// Logout Modal Logic
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