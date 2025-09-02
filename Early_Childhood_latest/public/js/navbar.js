// public/js/navbar.js

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return;
    const user = await res.json();

    const dashLink = document.getElementById('dashboardLink');
    if (dashLink) {
      if (user.role === 'teacher') {
        dashLink.href = '/teacher-dashboard';
      } else if (user.role === 'student') {
        dashLink.href = '/student-dashboard';
      } else if (user.role === 'parent') {
        dashLink.href = '/parent-dashboard';
      }
    }
  } catch (err) {
    console.error('Failed to set dashboard link', err);
  }
});
