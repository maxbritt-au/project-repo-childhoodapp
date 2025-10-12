
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    const roleBasedLinks = {
        'student': {
            'Dashboard': 'student-dashboard.html',
            'Submit Report': 'student-report.html'
        },
        'teacher': {
            'Dashboard': 'teacher-dashboard.html',
            'Feedback': 'teacher-feedback.html',
            'Children': 'children-dashboard.html',
        }
    };

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.role) {
        return;
    }

    navLinks.forEach(link => {
        const linkText = link.textContent.trim();
        const correctPath = roleBasedLinks[user.role]?.[linkText];
        
        if (correctPath && link.getAttribute('href').startsWith('/')) {
            link.href = `/html/${correctPath}`;
        }
    });
});