// public/js/navbar.js
document.addEventListener('DOMContentLoaded', async () => {
  const dashLink = document.getElementById('dashboardLink');
  if (!dashLink) return;

  const pretty = {
    teacher: '/teacher-dashboard',
    student: '/student-dashboard',
    parent:  '/parent-dashboard',
  };

  const hard = {
    teacher: '/html/teacher-dashboard.html',
    student: '/html/student-dashboard.html',
    parent:  '/html/parent-dashboard.html',
  };

  const setHref = (role) => {
    // Prefer pretty routes if you’ve added them (see section B).
    dashLink.href = pretty[role] || hard[role] || '/';
  };

  // 1) Optimistic fallback from localStorage (in case /api/me fails)
  const lsRole = localStorage.getItem('role');
  if (lsRole) setHref(lsRole);

  // 2) Authoritative fetch (overwrites the fallback if it succeeds)
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (res.ok) {
      const user = await res.json();
      if (user?.role) setHref(user.role);
    } else {
      // Optional: if no role known at all, send to login/home
      if (!lsRole) dashLink.href = '/';
    }
  } catch (err) {
    console.error('Failed to set dashboard link', err);
    if (!lsRole) dashLink.href = '/';
  }
});
