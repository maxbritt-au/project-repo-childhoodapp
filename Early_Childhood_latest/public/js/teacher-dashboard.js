// public/js/teacher-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     Auth gate
  ================================= */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    window.location.href = "/";
    return;
  }

  /* ===============================
     Students Section
  ================================= */
  const studentContainer = document.getElementById("students");
  const infoDisplayArea = document.getElementById("info-display-area");
  const infoTitle = document.querySelector(".info-title");
  const infoSubtitle = document.querySelector(".info-subtitle");

  let allStudents = [];

  function renderStudentList(students) {
    studentContainer.innerHTML = "";
    if (!students.length) {
      studentContainer.innerHTML = '<p class="placeholder-text">No students found.</p>';
      return;
    }
    students.forEach((student) => {
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
      const res = await fetch("/api/students", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch students.");
      const rows = await res.json();
      allStudents = rows;
      renderStudentList(allStudents);
    } catch (err) {
      console.error("Error loading students:", err);
      studentContainer.innerHTML =
        '<p class="placeholder-text">Failed to load student list.</p>';
    }
  }

  window.viewProfile = function (studentId) {
    const student = allStudents.find((s) => s.id === studentId);
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
  };

  window.viewReport = function (studentId) {
    const student = allStudents.find((s) => s.id === studentId);
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
  };

  /* ===============================
     Recent Reports Section
  ================================= */
  const stateRow = document.getElementById("recentReportsState");
  const spinner = document.getElementById("recentReportsSpinner");
  const empty = document.getElementById("recentReportsEmpty");
  const list = document.getElementById("recentReportsList");

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function renderRecentReports(rows) {
    if (!list) return;
    list.innerHTML = "";
    if (!rows || !rows.length) {
      spinner.classList.add("hidden");
      empty.classList.remove("hidden");
      return;
    }
    rows.forEach((r) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <p><strong>${r.report_type}</strong></p>
          <span class="meta">
            ${r.child_name} • ${r.student_name} • ${fmtDate(r.created_at)}
          </span>
        </div>
        <a href="/report-view?reportId=${r.id}" class="btn small">Open</a>
      `;
      list.appendChild(li);
    });

    // hide state row once reports are loaded
    spinner.classList.add("hidden");
    empty.classList.add("hidden");
    if (stateRow) stateRow.classList.add("hidden");
  }

  async function loadRecentReports(limit = 5) {
    if (!spinner || !empty || !list) return;
    spinner.classList.remove("hidden");
    empty.classList.add("hidden");
    try {
      const res = await fetch(`/api/reports/recent?limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      console.log("Teacher recent reports payload:", rows);
      renderRecentReports(rows);
    } catch (err) {
      console.error("Error fetching teacher recent reports:", err);
      spinner.classList.remove("hidden");
      spinner.textContent = "Failed to load reports.";
      empty.classList.add("hidden");
    }
  }

  /* ===============================
     Logout Modal
  ================================= */
  const logoutModal = document.getElementById("logout-modal");
  const openLogoutBtn = document.getElementById("open-logout-modal");
  const cancelLogoutBtn = document.getElementById("cancel-logout-btn");
  const confirmLogoutBtn = document.getElementById("confirm-logout-btn");

  function showLogout() {
    logoutModal.style.display = "flex";
  }
  function hideLogout() {
    logoutModal.style.display = "none";
  }

  openLogoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showLogout();
  });
  cancelLogoutBtn?.addEventListener("click", hideLogout);
  confirmLogoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("user");
    hideLogout();
    window.location.href = "/";
  });
  window.addEventListener("click", (e) => {
    if (e.target === logoutModal) hideLogout();
  });

  /* ===============================
     Init
  ================================= */
  loadStudents();
  loadRecentReports(5);
});
