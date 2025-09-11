// public/js/navbar.js
document.addEventListener('DOMContentLoaded', async () => {
  const dashLink = document.getElementById('dashboardLink');
  const logoLink =
    document.getElementById('dashboardLogoLink') ||
    document.querySelector('.logo-link');

  const allNavLinks = Array.from(document.querySelectorAll('.nav-links a'));

  // Where each role should land (prefer pretty routes)
  const pretty = {
    teacher: '/teacher-dashboard',
    student: '/student-dashboard',
    parent:  '/parent-dashboard',
  };

  // Fallbacks if you still use /html/*.html pages
  const hard = {
    teacher: '/html/teacher-dashboard.html',
    student: '/html/student-dashboard.html',
    parent:  '/html/parent-dashboard.html',
  };

  const setHomeHref = (role) => {
    const r = (role || '').toLowerCase();
    const href = pretty[r] || hard[r] || '/';
    if (dashLink) dashLink.setAttribute('href', href);
    if (logoLink) logoLink.setAttribute('href', href);
  };

  // 1) Optimistic localStorage fallback (fast)
  let lsRole = localStorage.getItem('role');
  if (!lsRole) {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      lsRole = u.role || u.user_type || u.type || null;
    } catch {}
  }
  if (lsRole) setHomeHref(lsRole);

  // 2) Authoritative role from server (overwrites)
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (res.ok) {
      const me = await res.json();
      const role = me?.role || me?.user_type || me?.type;
      if (role) setHomeHref(role);
    } else if (!lsRole) {
      // If we couldn't resolve a role at all, at least point home
      if (dashLink && (!dashLink.getAttribute('href') || dashLink.getAttribute('href') === '#')) {
        dashLink.setAttribute('href', '/');
      }
      if (logoLink && (!logoLink.getAttribute('href') || logoLink.getAttribute('href') === '#')) {
        logoLink.setAttribute('href', '/');
      }
    }
  } catch (err) {
    // Network errors; keep localStorage result if present
    if (!lsRole) {
      if (dashLink && (!dashLink.getAttribute('href') || dashLink.getAttribute('href') === '#')) {
        dashLink.setAttribute('href', '/');
      }
      if (logoLink && (!logoLink.getAttribute('href') || logoLink.getAttribute('href') === '#')) {
        logoLink.setAttribute('href', '/');
      }
    }
  }

  // 3) Ensure no link is left as "#"
  if (dashLink && dashLink.getAttribute('href') === '#') dashLink.setAttribute('href', '/');
  if (logoLink && logoLink.getAttribute('href') === '#') logoLink.setAttribute('href', '/');

  // 4) Auto-highlight the correct nav item based on the current page
  const path = (location.pathname || '').toLowerCase();

  // Heuristics for sections
  const isReports = [
    'student-report', 'report-list', 'report-view',
    'observation-report', 'anecdotal-record', 'summative-assessment'
  ].some(seg => path.includes(seg));

  const isChildren = [
    'children-dashboard', 'child', 'add-child', 'edit-child'
  ].some(seg => path.includes(seg));

  const section = isReports ? 'reports' : (isChildren ? 'children' : 'dashboard');

  // Clear any stale .active from HTML
  allNavLinks.forEach(a => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });

  const activate = (predicate) => {
    const link = allNavLinks.find(predicate);
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  };

  switch (section) {
    case 'reports':
      activate(a =>
        (a.href && /student-report|report-list|report-view|anecdotal|summative|observation/i.test(a.href)) ||
        /reports/i.test(a.textContent || '')
      );
      break;

    case 'children':
      activate(a =>
        (a.href && /children-dashboard|add-child|edit-child|child/i.test(a.href)) ||
        /child/i.test(a.textContent || '')
      );
      break;

    default:
      activate(a => a === dashLink || /dashboard/i.test(a.textContent || ''));
      break;
  }
});
