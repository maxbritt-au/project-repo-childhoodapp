const courses = [
    { name: "Early Childhood Education", id: "ECE101", students: 25 },
    { name: "Child Psychology", id: "PSY201", students: 18 },
    { name: "Creative Arts in Education", id: "ART301", students: 30 },
    { name: "Curriculum Design", id: "CUR401", students: 22 }
  ];
  
  const courseGrid = document.getElementById("courses-grid");

  courses.forEach(course => {
    const courseCard = document.createElement("div");
    courseCard.className = "course-card card";
    courseCard.innerHTML = `
      <div class="course-info">
        <h3 class="course-title">${course.name}</h3>
        <p class="course-id">Course ID: ${course.id}</p>
        <p class="enrolled-students">Students: ${course.students}</p>
      </div>
      <div class="course-actions">
        <button class="action-btn">View Students</button>
      </div>
    `;
    courseGrid.appendChild(courseCard);
  });
  

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