document.getElementById("viewProfileBtn").addEventListener("click", () => {
  const profile = document.getElementById("profileDetails");
  profile.classList.toggle("hidden");
});

// Submit Feedback
document.getElementById("submitBtn").addEventListener("click", () => {
  const title = document.getElementById("feedbackTitle").value;
  const description = document.getElementById("description").value;

  if (!description.trim()) {
    alert("Please write some feedback.");
    return;
  }

  alert("Feedback submitted successfully!");
});

// Profile dropdown toggle (on click)
const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

profileIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
  dropdownMenu.style.display = "none";
});
