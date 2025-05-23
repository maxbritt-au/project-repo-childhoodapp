const students = [
  { id: "30434157", name: "Younus Foisal", img: "../img/student-1.jpeg" },
  { id: "30398757", name: "Max Britt", img: "../img/student-2.jpeg" },
  { id: "30427201", name: "Ashraful Hossain", img: "../img/student-4.jpeg" },

];

const studentContainer = document.getElementById("students");
const resultSection = document.getElementById("result-section");
const profileSection = document.getElementById("profile-section");

let activeResult = null;
let activeProfile = null;

students.forEach((student, index) => {
  const card = document.createElement("div");
  card.className = "student-card";
  card.innerHTML = `
    <strong>${student.name} (${student.id})</strong>
    <button onclick="toggleResult(${index})">View Report</button>
    <button onclick="toggleProfile(${index})">Check Profile</button>
  `;
  studentContainer.appendChild(card);
});

function getMockReport(name) {
  return `
    <h3>Title: Anecdotal Observation on Social Interaction</h3>
    <p><strong>Description:</strong><br>
    During free play, a child named ${name} initiated a puzzle activity and invited two peers to join.
    She demonstrated turn-taking and used encouraging language, such as “You try this one!”
    This spontaneous interaction highlighted her developing social and communication skills.
    She remained engaged for 15 minutes, showing persistence and cooperation.
    This observation indicates progress in her interpersonal development and ability to work collaboratively in group settings.
    </p>
  `;
}

function getMockProfile(student) {
  return `
    <img src="${student.img}" class="profile-img" alt="Student Image">
    <p><strong>Name:</strong> ${student.name}</p>
    <p><strong>ID:</strong> ${student.id}</p>
    <p><strong>Course:</strong> Early Childhood Education and Care</p>
    <p><strong>Admission Year:</strong> 2024</p>
  `;
}

function toggleResult(index) {
  if (activeResult === index) {
    resultSection.innerHTML = "Select a student to view report.";
    activeResult = null;
  } else {
    resultSection.innerHTML = getMockReport(students[index].name);
    appendAddFeedbackButton();
    activeResult = index;
  }
}

function toggleProfile(index) {
  if (activeProfile === index) {
    profileSection.innerHTML = "Select a student to view profile.";
    activeProfile = null;
  } else {
    profileSection.innerHTML = getMockProfile(students[index]);
    activeProfile = index;
  }
}
// feed back button
function appendAddFeedbackButton() {
  // Remove existing button if any
  const existingButton = document.getElementById("add-feedback-button");
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement("button");
  button.id = "add-feedback-button";
  button.textContent = "Add Feedback";
  button.onclick = () => {
    location.href = "/html/teacher-feedback.html";  // ✅ Updated path
  };
  button.style.marginTop = "20px";
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#002b5c";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";

  resultSection.appendChild(button);
}


// Dropdown toggle logic
const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

profileIcon.addEventListener("click", () => {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", function(event) {
  if (!event.target.closest(".profile-dropdown")) {
    dropdownMenu.style.display = "none";
  }

  // Close result and profile if clicked outside student cards
  if (!event.target.closest(".student-card")) {
    resultSection.innerHTML = "Select a student to view report.";
    profileSection.innerHTML = "Select a student to view profile.";
    activeResult = null;
    activeProfile = null;
  }
});
