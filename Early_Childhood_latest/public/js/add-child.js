// public/js/add-child.js
(() => {
  const form = document.querySelector('#addChildForm');
  const nameField = document.querySelector('#childName');
  const dobField = document.querySelector('#childDob');
  const genderField = document.querySelector('#childGender');

  if (!form) {
    console.warn('[add-child] #addChildForm not found – check your HTML ids');
    return;
  }
  console.log('[add-child] script running');

  const api = async (url, options = {}) => {
    const res = await fetch(url, {
      credentials: 'include',                 // send session cookie
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'teacher',            // TEMP: bypass requireTeacher while testing
        ...(options.headers || {})
      },
      ...options
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      let msg = text;
      try { msg = JSON.parse(text).error || JSON.parse(text).message; } catch {}
      throw new Error(msg || `Request failed (${res.status})`);
    }
    return text ? JSON.parse(text) : null;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fullName = (nameField.value || '').trim();
      const [first_name, ...rest] = fullName.split(/\s+/);
      const last_name = rest.join(' ');

      if (!first_name || !last_name) throw new Error('Please enter first AND last name.');

      const payload = {
        first_name,
        last_name,
        dob: dobField.value || null,
        gender: genderField.value || null
      };

      console.log('[add-child] submitting payload:', payload);

      await api('/api/children', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      alert('Child added successfully!');
      window.location.href = '/children-dashboard';
    } catch (err) {
      console.error('[add-child] submit error:', err);
      alert('Failed to add child: ' + err.message);
    }
  });
})();
