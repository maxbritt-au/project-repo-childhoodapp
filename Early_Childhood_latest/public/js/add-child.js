(function init() {
  // Optional client-side gate if you store role in localStorage on login
  const role = localStorage.getItem('role');
  if (role && role !== 'teacher') {
    alert('Only teachers can access this page.');
    window.location.href = '/';
    return;
  }

  const form = document.getElementById('addChildForm');
  const msg = document.getElementById('msg');

  function showMessage(text, type) {
    msg.textContent = text;
    msg.className = 'alert ' + type;
    msg.style.display = 'block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.style.display = 'none';

    const first_name = document.getElementById('first_name').value.trim();
    const last_name  = document.getElementById('last_name').value.trim();
    const dob        = document.getElementById('dob').value;     // yyyy-mm-dd
    const gender     = document.getElementById('gender').value;

    // Simple validation
    if (!first_name || !last_name || !dob || !gender) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your backend auth middleware reads this header as a fallback:
          ...(role ? { 'x-user-role': role } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ first_name, last_name, dob, gender })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add child');
      }

      showMessage(`Child added! New ID: ${data.child_id}`, 'success');
      form.reset();
    } catch (err) {
      showMessage(err.message || 'Something went wrong.', 'error');
    }
  });
})();
