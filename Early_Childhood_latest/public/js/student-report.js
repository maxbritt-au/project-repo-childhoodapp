// public/js/student-reports.js

function getChildId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('childId');
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  if (!res.ok) throw new Error(await res.text().catch(()=>''));
  return res.json();
}

async function loadChildren() {
    const childSelect = document.getElementById('child-select');
    if (!childSelect) return;

    try {
        const children = await fetchJSON('/api/children');
        
        childSelect.innerHTML = '';
        if (children.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No children found';
            childSelect.appendChild(option);
            childSelect.disabled = true;
            return;
        }

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '— Select a child —';
        childSelect.appendChild(defaultOption);

        children.forEach(child => {
            const option = document.createElement('option');
            option.value = child.child_id;
            option.textContent = `${child.first_name} ${child.last_name}`;
            childSelect.appendChild(option);
        });

        const urlChildId = getChildId();
        if (urlChildId) {
            childSelect.value = urlChildId;
        }
    } catch (err) {
        console.error('Failed to load children:', err);
        childSelect.innerHTML = '<option value="">Failed to load children</option>';
        childSelect.disabled = true;
    }
}

document.getElementById('reportForm').addEventListener('submit', async function(event) {
  event.preventDefault(); 

  const reportTitle = document.getElementById('report-title').value.trim();
  const reportType = document.getElementById('report-type').value.trim();
  const reportDescription = document.getElementById('report-description').value.trim();
  const childId = document.getElementById('child-select').value;
  const reportFile = document.getElementById('report-file').files[0];

  if (!childId) {
      alert('Please select a child.');
      return;
  }

  if (!reportTitle || !reportDescription) {
    alert('Please fill out the report title and details.');
    return;
  }

  try {
    const me = await fetchJSON('/api/me');
    const studentId = me.id;

    const payload = {
      student_id: studentId,
      child_id: childId,
      template_id: reportType || 1,
      content: reportDescription
    };

    await fetchJSON('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    alert('Report submitted successfully!');
    document.getElementById('reportForm').reset();
  } catch (err) {
    console.error('Submit error:', err);
    alert('Failed to submit report: ' + err.message);
  }
});

const logoutModal = document.getElementById('logout-modal');
const openLogoutBtn = document.getElementById('open-logout-modal');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

openLogoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logoutModal.style.display = 'flex';
});

cancelLogoutBtn.addEventListener('click', () => {
  logoutModal.style.display = 'none';
});

confirmLogoutBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

window.addEventListener('click', (event) => {
  if (event.target === logoutModal) {
    logoutModal.style.display = 'none';
  }
});

loadChildren();