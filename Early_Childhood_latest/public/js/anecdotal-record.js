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
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('observationDate').value = today;

    async function loadChildren() {
        try {
            const res = await fetch('/api/children/my', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load children');
            const children = await res.json();
            
            childSelect.innerHTML = '<option value="">Choose a child...</option>';
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.first_name} ${child.last_name}`;
                childSelect.appendChild(option);
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
                observation_date: document.getElementById('observationDate').value,
                context: document.getElementById('observationContext').value,
                narrative: document.getElementById('narrativeNotes').value,
                significance: document.getElementById('significance').value,
                template_type: 'anecdotal'
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