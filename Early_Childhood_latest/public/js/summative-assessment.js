document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;

    if (!user) {
        window.location.href = '/';
        return;
    }

    const form = document.getElementById('summativeForm');
    const childSelect = document.getElementById('childSelect');
    const cancelBtn = document.getElementById('cancelBtn');
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('date').value = today;

    async function loadChildren() {
        try {
            const res = await fetch('/api/children/my', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load children');
            const children = await res.json();
            
            childSelect.innerHTML = '<option value="">— Select a child —</option>';
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.first_name} ${child.last_name}`;
                childSelect.appendChild(option);
            });

            childSelect.addEventListener('change', () => {
                const chosen = children.find(c => c.id == childSelect.value);
                if (chosen?.dob) {
                    const dob = new Date(chosen.dob);
                    const diff = Date.now() - dob.getTime();
                    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                    document.getElementById('age').value = age;
                } else {
                    document.getElementById('age').value = '';
                }
            });
        } catch (err) {
            console.error('Error loading children:', err);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const formData = {
                child_id: childSelect.value,
                date: document.getElementById('date').value,
                age: document.getElementById('age').value,
                period: document.getElementById('period').value,
                summary: document.getElementById('summary').value,
                domains: document.getElementById('domains').value,
                outcomes: document.getElementById('outcomes').value,
                template_type: 'summative'
            };

            const res = await fetch('/api/reports/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to submit report');

            window.location.href = '/html/student-report.html';
            
        } catch (err) {
            console.error('Error submitting report:', err);
            alert('Failed to save report. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Report';
        }
    });

    cancelBtn.addEventListener('click', () => {
        window.location.href = '/html/student-report.html';
    });

    loadChildren();
});