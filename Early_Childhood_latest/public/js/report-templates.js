
document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('recentReportsList');
    const searchEl = document.getElementById('recentSearch');
    const viewAllBtn = document.getElementById('viewAllReports');

    let allReports = [];

    async function loadRecent() {
        try {
            const res = await fetch('/api/reports/recent?limit=8', { credentials: 'include' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            allReports = await res.json();
            render(allReports);
        } catch (e) {
            console.error('Failed to load recent reports', e);
            listEl.innerHTML = '<li class="muted">Could not load recent reports.</li>';
        }
    }

    function render(items) {
        if (!items.length) {
            listEl.innerHTML = '<li class="muted">No recent reports.</li>';
            return;
        }

        listEl.innerHTML = items.map(r => `
            <li class="recent-item">
                <a class="pill"
                   href="/html/report-view.html?reportId=${encodeURIComponent(r.id)}"
                   title="View this ${escapeHtml(r.report_type)}">
                   ${escapeHtml(r.report_type)}
                </a>
                <div class="meta">
                    <span class="label">Student:</span> ${escapeHtml(r.student_name)}
                    <span class="sep">•</span>
                    <span class="label">Child:</span> ${escapeHtml(r.child_name)}
                </div>
                <div class="time" title="${new Date(r.created_at).toLocaleString()}">
                    ${timeAgo(r.created_at)}
                </div>
            </li>
        `).join('');
    }

    function filter() {
        const q = (searchEl.value || '').toLowerCase();
        const filtered = allReports.filter(r =>
            (r.report_type || '').toLowerCase().includes(q) ||
            (r.student_name || '').toLowerCase().includes(q) ||
            (r.child_name || '').toLowerCase().includes(q)
        );
        render(filtered);
    }

    function timeAgo(iso) {
        const d = new Date(iso);
        const s = Math.floor((Date.now() - d.getTime()) / 1000);
        const m = Math.floor(s / 60), h = Math.floor(m / 60), dys = Math.floor(h / 24);
        if (dys > 0) return `${dys}d ago`;
        if (h > 0) return `${h}h ago`;
        if (m > 0) return `${m}m ago`;
        return 'just now';
    }

    function escapeHtml(str='') {
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    searchEl?.addEventListener('input', filter);
    viewAllBtn?.addEventListener('click', () => {
        window.location.href = '/report-list';
    });

    (function () {
        const params = new URLSearchParams(window.location.search);
        const childId = params.get('childId');
        if (!childId) return;
        document.querySelectorAll('.template-card[href]').forEach(a => {
            const url = new URL(a.getAttribute('href'), window.location.origin);
            url.searchParams.set('childId', childId);
            a.setAttribute('href', url.pathname + '?' + url.searchParams.toString());
        });
    })();

    loadRecent();
});