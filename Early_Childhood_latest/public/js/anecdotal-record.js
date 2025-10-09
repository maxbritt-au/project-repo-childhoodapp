// public/js/anecdotal-record.js
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    window.location.href = '/';
    return;
  }

  const form = document.getElementById('anecdotalForm');
  const childSelect = document.getElementById('childSelect');
  const cancelBtn = document.getElementById('cancelBtn');
  const dateInput = document.getElementById('observationDate');
  const templateIdInput = document.getElementById('templateId');

  // default date -> today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;

  function setSelectPlaceholder(text) {
    childSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = text;
    childSelect.appendChild(opt);
  }

  async function loadChildren() {
    try {
      setSelectPlaceholder('Loading children…');

      const res = await fetch('/api/children', { credentials: 'include' });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('Children fetch failed:', res.status, txt);
        setSelectPlaceholder('Failed to load children');
        return;
      }

      const children = await res.json(); // [{ child_id, first_name, last_name, ... }]
      if (!Array.isArray(children) || children.length === 0) {
        setSelectPlaceholder('No children found');
        return;
      }

      childSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose a child...';
      childSelect.appendChild(placeholder);

      children.forEach((child) => {
        const option = document.createElement('option');
        const id = child.child_id ?? child.id ?? child.childId;
        const first = child.first_name ?? child.firstName ?? '';
        const last = child.last_name ?? child.lastName ?? '';
        const label = [first, last].filter(Boolean).join(' ').trim() || child.name || `Child ${id ?? ''}`;

        option.value = id != null ? String(id) : '';
        option.textContent = label;
        childSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading children:', err);
      setSelectPlaceholder('Error loading children');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      const childId = childSelect.value;
      const templateId = Number(templateIdInput?.value);

      if (!childId) {
        alert('Please select a child.');
        return;
      }
      if (!Number.isInteger(templateId) || templateId <= 0) {
        alert('Template ID missing/invalid.');
        return;
      }

      // Map to the keys your viewer expects
      const contentObj = {
        type: 'anecdotal',
        date: document.getElementById('observationDate').value,
        setting: document.getElementById('settingContext').value,
        observation: document.getElementById('observation').value,
        significance: document.getElementById('significance').value,
        domains: document.getElementById('domains').value,
        eylf: document.getElementById('eylf').value,
        theory: document.getElementById('theory').value,
        planning_ideas: document.getElementById('planningIdeas').value
      };

      const payload = {
        child_id: Number(childId),
        template_id: templateId,      // Anecdotal = 2
        content: JSON.stringify(contentObj)
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Failed to submit report (${res.status}) ${txt}`);
      }

      // Success -> go back to student-report list
      window.location.href = '/html/student-report.html';
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to save record. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Record';
    }
  });

  cancelBtn.addEventListener('click', () => {
    window.location.href = '/html/student-report.html';
  });

  loadChildren();
});
