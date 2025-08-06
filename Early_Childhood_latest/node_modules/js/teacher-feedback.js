// Toggle profile dropdown
const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

profileIcon.addEventListener("click", (e) => {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  e.stopPropagation();
});

window.addEventListener("click", (e) => {
  if (!dropdownMenu.contains(e.target) && e.target !== profileIcon) {
    dropdownMenu.style.display = "none";
  }
});

function submitFeedback() {
  alert("Feedback submitted successfully!");
}

async function exportPDF() {
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

document.getElementById("export-student-btn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Student Report", 20, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Name: Younus Foisal", 20, 40);
  doc.text("ID: 30434157", 20, 50);
  doc.text("Course: Information Technology", 20, 60);

  const observation = `During free play, a child named Mia initiated a puzzle activity and invited two peers to join. She demonstrated turn-taking and used encouraging language, such as “You try this one!” This spontaneous interaction highlighted her developing social and communication skills. Mia remained engaged for 15 minutes, showing persistence and cooperation. This observation indicates progress in her interpersonal development and ability to work collaboratively in group settings.`;

  const lines = doc.splitTextToSize(observation, 170);
  doc.text("Observation:", 20, 80);
  doc.text(lines, 20, 90);

  doc.save("student_report.pdf");
});
