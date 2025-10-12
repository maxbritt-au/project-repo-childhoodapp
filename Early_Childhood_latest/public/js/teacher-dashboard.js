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
     Helpers
  ================================= */
  const $ = (sel) => document.querySelector(sel);
  const show = (el) => { if (el) el.hidden = false; };
  const hide = (el) => { if (el) el.hidden = true; };
  const setText = (el, txt) => { if (el) el.textContent = txt; };

  const fmtDate = (d) => {
    try {
      if (!d) return "";
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return "";
    }
  };

  /* ===============================
     Students Section
  ================================= */
  const studentContainer = $("#students");
  const infoDisplayArea = $("#info-display-area");
  const infoTitle = $(".info-title");
  const infoSubtitle = $(".info-subtitle");

  let allStudents = [];

  function renderStudentList(students) {
    if (!studentContainer) return;
    studentContainer.innerHTML = "";
    if (!students || !students.length) {
      studentContainer.innerHTML =
        '<p class="placeholder-text">No students found.</p>';
      return;
    }
    students.forEach((s) => {
      const li = document.createElement("li");
      li.className = "student-list-item";
      li.innerHTML = `
        <div class="student-info">
          <img src="${s.img || "../img/student-main.png"}" alt="${s.name || "Student"}" class="student-list-img">
          <div>
            <p>${s.name || "Unnamed"}</p>
            <span>ID: ${s.id ?? ""}</span>
          </div>
        </div>
        <div class="student-actions">
          <a href="#" aria-label="View profile"><i class="fas fa-user"></i></a>
          <a href="#" aria-label="View reports"><i class="fas fa-file-alt"></i></a>
        </div>
      `;

      const [profileBtn, reportBtn] = li.querySelectorAll(".student-actions a");
      profileBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        viewProfile(String(s.id));
      });
      reportBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        viewReport(String(s.id));
      });

      studentContainer.appendChild(li);
    });
  }

  async function loadStudents() {
    if (!studentContainer) return;
    try {
      const res = await fetch("/api/students", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      allStudents = Array.isArray(rows) ? rows : [];
      renderStudentList(allStudents);
    } catch (err) {
      console.error("Error loading students:", err);
      studentContainer.innerHTML =
        '<p class="placeholder-text">Failed to load student list.</p>';
    }
  }

  window.viewProfile = function (studentId) {
    const s = allStudents.find((x) => String(x.id) === String(studentId));
    if (!s || !infoDisplayArea) return;
    setText(infoTitle, "Student Profile");
    setText(infoSubtitle, `Viewing profile for ${s.name || "Student"}`);
    infoDisplayArea.innerHTML = `
      <div class="student-profile-details">
        <div style="text-align:center;">
          <img src="${s.img || "../img/student-main.png"}" alt="${s.name || "Student"}" class="profile-img-large">
        </div>
        <h4>${s.name || "Unnamed"}</h4>
        <p>ID: ${s.id ?? ""}</p>
        <p>Course: ${s.course || "-"}</p>
      </div>
    `;
  };

  window.viewReport = function (studentId) {
    const s = allStudents.find((x) => String(x.id) === String(studentId));
    if (!s || !infoDisplayArea) return;
    setText(infoTitle, "Recent Reports");
    setText(infoSubtitle, `Reports for ${s.name || "Student"}`);
    infoDisplayArea.innerHTML = `
      <ul class="reports-list" style="text-align:left;">
        <li><p>Developmental Checklist</p><span>Feb 15, 2025</span></li>
        <li><p>Learning Story</p><span>Mar 25, 2025</span></li>
        <li><p>Teacher Feedback</p><span>Apr 01, 2025</span></li>
      </ul>
    `;
  };

  /* ===============================
     Recent Reports Section
  ================================= */
  const stateRow = $("#recentReportsState");
  let spinner = $("#recentReportsSpinner");
  let empty = $("#recentReportsEmpty");
  const list = $("#recentReportsList");

  // If spinner/empty aren’t present, create them
  if (stateRow) {
    if (!spinner) {
      spinner = document.createElement("span");
      spinner.id = "recentReportsSpinner";
      spinner.textContent = "Loading…";
      stateRow.appendChild(spinner);
    }
    if (!empty) {
      empty = document.createElement("span");
      empty.id = "recentReportsEmpty";
      empty.textContent = "No recent reports yet.";
      stateRow.appendChild(empty);
    }
    // start hidden
    hide(stateRow);
    hide(spinner);
    hide(empty);
  }

  function renderRecentReports(rows) {
    if (!list) return;

    list.innerHTML = "";
    hide(spinner);
    hide(empty);

    if (!rows || !rows.length) {
      show(stateRow);
      show(empty);
      return;
    }

    rows.forEach((r) => {
      const id = r.id;
      const type = r.report_type || r.type || "Report";
      const childName = r.child_name || r.childName || "Child";
      const created =
        r.created_at || r.createdAt || r.created || r.created_on || null;

      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <p><strong>${type}</strong></p>
          <span class="meta">${childName} • ${fmtDate(created)}</span>
        </div>
        <a href="/report-view?reportId=${encodeURIComponent(id)}" class="btn small">Open</a>
      `;
      list.appendChild(li);
    });

    // hide state row completely once reports are shown
    hide(stateRow);
  }

  async function loadRecentReports(limit = 5) {
    if (!list) return;

    show(stateRow);
    show(spinner);
    hide(empty);
    list.innerHTML = "";

    try {
      const res = await fetch(`/api/reports/recent?limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      console.log("Teacher recent reports payload:", rows);
      renderRecentReports(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Error fetching teacher recent reports:", err);
      show(stateRow);
      hide(empty);
      if (spinner) {
        setText(spinner, "Failed to load reports.");
        show(spinner);
      }
    }
  }

  /* ===============================
     Logout Modal
  ================================= */
  const logoutModal = $("#logout-modal");
  const openLogoutBtn = $("#open-logout-modal");
  const cancelLogoutBtn = $("#cancel-logout-btn");
  const confirmLogoutBtn = $("#confirm-logout-btn");

  const showLogout = () => logoutModal && (logoutModal.style.display = "flex");
  const hideLogout = () => logoutModal && (logoutModal.style.display = "none");

  openLogoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showLogout();
  });
  cancelLogoutBtn?.addEventListener("click", hideLogout);
  confirmLogoutBtn?.addEventListener("click", async () => {
    try {
      localStorage.removeItem("user");
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch (_) {}
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
