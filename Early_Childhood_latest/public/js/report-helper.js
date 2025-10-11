// public/js/report-helper.js
const API_BASE_URL = 'https://project-repo-childhoodapp.onrender.com';
/**
 * POST to /api/reports
 * @param {Object} options
 * @param {number|string} options.childId
 * @param {number|string} options.templateId
 * @param {string} options.content
 */
async function saveReport({ childId, templateId, content }) {
  if (!childId || !templateId || !content) {
    throw new Error('childId, templateId, and content are required');
  }

  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      child_id: Number(childId),
      template_id: Number(templateId),
      content
    })
  });

  if (!res.ok) {
    // try JSON error, otherwise raw text
    let msg = 'Failed to save report';
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {
      try { msg = await res.text(); } catch {}
    }
    throw new Error(msg);
  }

  return res.json();
}

/**
 * Attach save handler to a template form
 * @param {string} formSelector
 * @param {{templateId:number, getContent:()=>any}} config
 */
function attachReportForm(formSelector, { templateId, getContent }) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  // Prefer dropdown -> URL -> hidden input fallback
  const childSelectEl = document.getElementById('childSelect');
  const urlChildId = new URLSearchParams(window.location.search).get('childId');
  const hiddenChildEl = document.getElementById('childId');

  function resolveChildId() {
    if (childSelectEl && childSelectEl.value) return childSelectEl.value;
    if (urlChildId) return urlChildId;
    if (hiddenChildEl && hiddenChildEl.value) return hiddenChildEl.value;
    return null;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const childId = resolveChildId();
      if (!childId) {
        throw new Error('Please select a child before saving.');
      }

      let content = getContent();
      // Ensure content is a non-empty string
      if (typeof content !== 'string') {
        content = JSON.stringify(content ?? {});
      }
      if (!content || content === '{}' || content.trim() === '') {
        throw new Error('Please fill in the form before saving.');
      }

      await saveReport({ childId, templateId, content });
      alert('Report saved successfully ✅');

      // Redirect to your new list page; change to '/reports' if you use the old one.
      window.location.assign(`/report-list?childId=${encodeURIComponent(childId)}`);
    } catch (err) {
      console.error(err);
      alert('Error saving report: ' + (err?.message || String(err)));
    }
  });
}
