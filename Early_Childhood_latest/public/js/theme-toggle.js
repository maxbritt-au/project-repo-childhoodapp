document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-icons');
    const body = document.body;
  
    // Set initial theme based on local storage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
      body.classList.add(currentTheme);
    } else {
      body.classList.add('light-mode');
    }
  
    // Add event listener for toggling the theme
    themeToggle?.addEventListener('click', () => {
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
  });