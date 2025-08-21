// public/js/children-dashboard.js
(function () {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const search = document.getElementById('search');
  const genderFilter = document.getElementById('genderFilter');
  const sort = document.getElementById('sort');
  const addChildBtn = document.getElementById('add-child-btn');

  // ---- Role-based UI control (teacher sees "Add Child"; students don't) ----
  const role =
    localStorage.getItem('userRole') || // preferred
    localStorage.getItem('role') || ''; // fallback if older pages used "role"
  if (role !== 'teacher' && addChildBtn) addChildBtn.style.display = 'none';

  let all = [];

  function ageFromDOB(dob) {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d)) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  function initials(first, last) {
    return (String(first || '')[0] || '').toUpperCase() + (String(last || '')[0] || '').toUpperCase();
  }

  function fmtDOB(dob) {
    if (!dob) return '';
    const d = new Date(dob);
    if (isNaN(d)) return dob;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function render(list) {
    grid.innerHTML = '';
    if (!list.length) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    list.forEach(c => {
      const a = ageFromDOB(c.dob);
      const card = document.createElement('a');
      card.className = 'cardlink';
      card.href = '#'; // later: point to /child/:id when you build a child profile page

      card.innerHTML = `
        <div class="card">
          <div class="avatar">${initials(c.first_name, c.last_name) || '?'}</div>
          <div class="meta">
            <h3>${c.first_name || ''} ${c.last_name || ''}</h3>
            <p>DOB: ${fmtDOB(c.dob)} ${a != null ? `• Age: ${a}` : ''}</p>
            <p>Gender: ${c.gender || '-'}</p>
            <p style="opacity:.7">ID: ${c.child_id}</p>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const q = search.value.trim().toLowerCase();
    const g = genderFilter.value;

    let list = all.filter(c => {
      const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
      const okSearch = !q || name.includes(q);
      const okGender = !g || c.gender === g;
      return okSearch && okGender;
    });

    switch (sort.value) {
      case 'last_desc':
        list.sort((a, b) => String(b.last_name || '').localeCompare(String(a.last_name || '')));
        break;
      case 'age_desc':
        list.sort((a, b) => (ageFromDOB(b.dob) || -1) - (ageFromDOB(a.dob) || -1)); // oldest first
        break;
      case 'age_asc':
        list.sort((a, b) => (ageFromDOB(a.dob) || 999) - (ageFromDOB(b.dob) || 999)); // youngest first
        break;
      case 'last_asc':
      default:
        list.sort((a, b) => String(a.last_name || '').localeCompare(String(b.last_name || '')));
    }

    render(list);
  }

  async function load() {
    try {
      const headers = role ? { 'x-user-role': role } : {}; // satisfy requireLogin() during dev
      const res = await fetch('/api/children', {
        headers,
        credentials: 'include'
      });

      if (!res.ok) {
        let reason = `(${res.status})`;
        try {
          const err = await res.json();
          if (err?.error) reason += ` ${err.error}`;
        } catch (_) {}

        console.warn('Failed to load children', reason);
        all = [];
        empty.style.display = 'block';
        empty.textContent =
          res.status === 401
            ? 'Please log in to view children (401).'
            : `Could not load children ${reason}`;
        return;
      }

      const data = await res.json();
      all = Array.isArray(data) ? data : [];
      applyFilters();
    } catch (e) {
      console.error('Failed to load children:', e);
      all = [];
      empty.style.display = 'block';
      empty.textContent = 'Network error loading children.';
    }
  }

  search.addEventListener('input', applyFilters);
  genderFilter.addEventListener('change', applyFilters);
  sort.addEventListener('change', applyFilters);

  load();
})();
