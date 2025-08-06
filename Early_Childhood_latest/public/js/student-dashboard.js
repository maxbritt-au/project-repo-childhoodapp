
function toggleDropdown(event) {
  event.stopPropagation(); // Prevent click bubbling
  const menu = event.currentTarget;
  menu.classList.toggle('active');
}

// Close dropdown if clicked outside
document.addEventListener('click', () => {
  const dropdown = document.querySelector('.profile-menu');
  dropdown.classList.remove('active');
});


let currentSection = '';

function toggleSection(section) {
  const display = document.getElementById('info-display');

  if (currentSection === section) {
    display.innerHTML = '';
    currentSection = '';
    return;
  }

  currentSection = section;

  switch (section) {
    case 'profile':
      display.innerHTML = `
        <h3>Student Profile</h3>
        <p><strong>Name:</strong> Younus</p>
        <p><strong>ID:</strong> 30434157</p>
        <p><strong>Course:</strong> Early Childhood Education and Care</p>
        <p><strong>GPA:</strong> 6.0</p>
        <p><strong>Major:</strong> Children Development</p>
        <p><strong>Admission Year:</strong> 2024</p>
      `;
      break;

    case 'edit':
      display.innerHTML = `
        <h3>Edit Profile</h3>
        <p><strong>Mobile Number:</strong> +618983....</p>
        <p><strong>Email:</strong> yfoisal@students.federation.edu.au</p>
        <p><strong>Birth Year:</strong> 2008</p>
      `;
      break;

    case 'report':
      display.innerHTML = `
         <h3>Title: Anecdotal Observation on Social Interaction</h3>
    <p><strong>Description:</strong><br>
    During free play, a child named ${name} Foisal initiated a puzzle activity and invited two peers to join.
    She demonstrated turn-taking and used encouraging language, such as “You try this one!”
    This spontaneous interaction highlighted her developing social and communication skills.
    She remained engaged for 15 minutes, showing persistence and cooperation.
    This observation indicates progress in her interpersonal development and ability to work collaboratively in group settings.
    </p>
      `;
      break;
  }
}

// Close info when clicking outside
document.addEventListener('click', function (event) {
  const infoBox = document.getElementById('info-display');
  const buttons = document.querySelector('.buttons');

  if (!infoBox.contains(event.target) && !buttons.contains(event.target)) {
    infoBox.innerHTML = '';
    currentSection = '';
  }
});
