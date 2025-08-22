// public/js/children-dashboard.js
// Works with either table (tbody) or card grid (.grid)

(() => {
  const API_BASE = '/api';
  const ENDPOINTS = {
    list:   () => `${API_BASE}/children`,
    one:    (id) => `${API_BASE}/children/${encodeURIComponent(id)}`,
    create: () => `${API_BASE}/children`,
    update: (id) => `${API_BASE}/children/${encodeURIComponent(id)}`,
    remove: (id) => `${API_BASE}/children/${encodeURIComponent(id)}`
  };

  const $ = (s) => document.querySelector(s);
  const any = (...sels) => sels.map($).find(Boolean) || null;

  // Support both naming schemes
  const els = {
    // container: table tbody OR card grid
    tableBody: any('#childrenTableBody'),
    grid: any('#childrenGrid', '.grid'),

    // controls
    searchInput: any('#childSearch', '#search'),
    sortSelect: any('#childSort', '#sort'),
    refreshBtn: any('#refreshChildren', '#refresh'),
    addBtn: any('#addChildBtn', '#addChild'),

    // modal (optional)
    modal: any('#childModal'),
    modalTitle: any('#childModalTitle'),
    form: any('#childForm'),
    idField: any('#childId'),
    nameField: any('#childName'),
    dobField: any('#childDob'),
    genderField: any('#childGender'),
    notesField: any('#childNotes'),
    cancelBtn: any('#childCancelBtn'),

    // status
    emptyState: any('#childrenEmpty', '.empty'),
    spinner: any('#childrenSpinner'),
    toast: any('#childrenToast'),
    toastMsg: any('#childrenToastMsg'),
  };

  console.log('[children-dashboard] script running');

  let children = [];
  let filtered = [];
  let isSaving = false;

  const show = (el) => el && el.classList.remove('hidden');
  const hide = (el) => el && el.classList.add('hidden');

  const toast = (msg, ms = 2200) => {
    if (!els.toast || !els.toastMsg) return console.log('[toast]', msg);
    els.toastMsg.textContent = msg;
    show(els.toast);
    setTimeout(() => hide(els.toast), ms);
  };

  const setLoading = (b) => (b ? show(els.spinner) : hide(els.spinner));

  const safeJSON = async (res) => {
    const t = await res.text();
    try { return JSON.parse(t); } catch { return { message: t || res.statusText }; }
  };

  // Include cookies so session auth works
  const api = async (url, options = {}) => {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) {
      const err = await safeJSON(res);
      throw new Error(err.message || err.error || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
  };

  // ---------- helpers & normalizers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString();
  };
  const age = (iso) => {
    if (!iso) return '';
    const b = new Date(iso); if (isNaN(b)) return '';
    const n = new Date(); let a = n.getFullYear()-b.getFullYear();
    const m = n.getMonth()-b.getMonth();
    if (m<0 || (m===0 && n.getDate()<b.getDate())) a--;
    return a;
  };

  // Map API rows (child_id, first_name, last_name, dob, gender) -> UI model
  const normalize = (row) => {
    const first = row.first_name || row.firstName || '';
    const last  = row.last_name  || row.lastName  || '';
    const name  = (row.name || `${first} ${last}`).trim();
    return {
      id: row.child_id ?? row.id,
      name: name || 'Unnamed',
      first_name: first,
      last_name: last,
      dob: row.dob || null,
      gender: row.gender || '',
      notes: row.notes || ''
    };
  };

  const initialsFrom = (first, last, name) => {
    const src = (name && name.trim())
      ? name.trim()
      : `${first || ''} ${last || ''}`.trim();
    const parts = src.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map(p => (p[0] || '?').toUpperCase()).join('') || '?';
  };

  // ---------- rendering: table or grid ----------
  const render = (rows) => {
    if (els.tableBody) return renderTable(rows);
    if (els.grid) return renderGrid(rows);
  };

  const renderTable = (rows) => {
    els.tableBody.innerHTML = '';
    if (!rows?.length) { show(els.emptyState); return; }
    hide(els.emptyState);

    const frag = document.createDocumentFragment();
    rows.forEach((c) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed')}</td>
        <td>${esc(fmtDate(c.dob))}</td>
        <td>${esc(String(age(c.dob)))}</td>
        <td>${esc(c.gender || '')}</td>
        <td>${esc((c.notes || '').slice(0, 80))}${(c.notes?.length > 80) ? '…' : ''}</td>
        <td class="text-right">
          <button class="edit" data-id="${c.id}">Edit</button>
          <button class="del" data-id="${c.id}">Delete</button>
        </td>
      `;
      frag.appendChild(tr);
    });
    els.tableBody.appendChild(frag);
  };

  const renderGrid = (rows) => {
    els.grid.innerHTML = '';
    if (!rows?.length) { show(els.emptyState); return; }
    hide(els.emptyState);

    const frag = document.createDocumentFragment();
    rows.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'card';
      const initials = initialsFrom(c.first_name, c.last_name, c.name);
      card.innerHTML = `
        <div class="avatar">${esc(initials)}</div>
        <div class="meta" style="flex:1">
          <h3>${esc(c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed')}</h3>
          <p>DOB: ${esc(fmtDate(c.dob))} • Age: ${esc(String(age(c.dob)))}</p>
          <p>${esc(c.gender || '')}${c.gender && c.notes ? ' • ' : ''}${esc((c.notes || '').slice(0,80))}${(c.notes?.length>80)?'…':''}</p>
          <div class="children-actions" style="margin-top:8px;">
            <button class="edit btn" data-id="${c.id}">Edit</button>
            <button class="del btn" data-id="${c.id}">Delete</button>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });
    els.grid.appendChild(frag);
  };

  // ---------- data ops ----------
  const loadChildren = async () => {
    setLoading(true);
    try {
      const list = await api(ENDPOINTS.list());
      children = Array.isArray(list) ? list.map(normalize) : [];
      applyFilters();
    } catch (e) {
      console.error(e);
      toast(`Failed to load children: ${e.message}`);
      children = [];
      applyFilters();
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const q = (els.searchInput?.value || '').trim().toLowerCase();
    const sortBy = els.sortSelect?.value || 'name-asc';

    filtered = children.filter((c) => {
      if (!q) return true;
      const hay = [
        c.name || '',
        c.first_name || '',
        c.last_name || '',
        c.gender || '',
        c.notes || ''
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });

    const [field, dir] = sortBy.split('-');
    filtered.sort((a,b) => {
      let va = a[field] ?? '';
      let vb = b[field] ?? '';
      if (field === 'dob') {
        va = new Date(va).getTime() || 0;
        vb = new Date(vb).getTime() || 0;
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    render(filtered);
  };

  // ---------- modal helpers (only if present) ----------
  const openModal = (title='Add Child') => {
    if (!els.modal) return;
    els.modalTitle && (els.modalTitle.textContent = title);
    show(els.modal);
  };
  const closeModal = () => {
    if (!els.modal) return;
    hide(els.modal);
    els.form?.reset();
    if (els.idField) els.idField.value = '';
  };
  const fillForm = (c={}) => {
    if (!els.form) return;
    if (els.idField) els.idField.value = c.id ?? '';
    // combine name into single field if that's what your form has
    const combined = (c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim());
    if (els.nameField) els.nameField.value = combined || '';
    if (els.dobField) els.dobField.value = c.dob ? c.dob.slice(0,10) : '';
    if (els.genderField) els.genderField.value = c.gender ?? '';
    if (els.notesField) els.notesField.value = c.notes ?? '';
  };

  // ---------- events ----------
  const debounce = (fn, ms=120) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms);} };

  const wireEvents = () => {
    els.refreshBtn?.addEventListener('click', loadChildren);
    els.searchInput?.addEventListener('input', debounce(applyFilters, 150));
    els.sortSelect?.addEventListener('change', applyFilters);

    els.addBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/add-child';
});

    els.cancelBtn?.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

    els.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSaving) return;
      isSaving = true;
      try {
        // Split the single "Name" field into first/last for your API
        const fullName = (els.nameField?.value || '').trim();
        const [first_name, ...rest] = fullName.split(/\s+/);
        const last_name = rest.join(' ');

        const payload = {
          first_name: first_name || '',
          last_name: last_name || '',
          dob: els.dobField?.value || null,
          gender: els.genderField?.value || null
          // notes not in your API right now; add if you add column
        };

        if (!payload.first_name || !payload.last_name) throw new Error('First and last name are required');
        if (payload.dob && Number.isNaN(new Date(payload.dob).getTime())) throw new Error('DOB is invalid');

        const id = els.idField?.value;
        if (id) {
          await api(ENDPOINTS.update(id), { method: 'PUT', body: JSON.stringify(payload) });
          toast('Child updated');
        } else {
          await api(ENDPOINTS.create(), { method: 'POST', body: JSON.stringify(payload) });
          toast('Child created');
        }
        closeModal();
        await loadChildren();
      } catch (err) {
        console.error(err); toast(err.message || 'Save failed');
      } finally {
        isSaving = false;
      }
    });

    // delegate edit/delete on both table + grid
    const container = els.tableBody || els.grid;
    container?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      const id = btn.dataset.id; if (!id) return;

      if (btn.classList.contains('edit')) {
        try {
          const raw = await api(ENDPOINTS.one(id));
          const c = normalize(raw);
          fillForm(c);
          openModal('Edit Child');
        } catch (err) {
          console.error(err); toast('Failed to load child');
        }
      }
      if (btn.classList.contains('del')) {
        if (!confirm('Delete this child?')) return;
        try { await api(ENDPOINTS.remove(id), { method: 'DELETE' }); toast('Child deleted'); await loadChildren(); }
        catch (err) { console.error(err); toast('Delete failed'); }
      }
    });

    // close modal by backdrop
    els.modal?.addEventListener('click', (e)=>{ if (e.target === els.modal) closeModal(); });
  };

  document.addEventListener('DOMContentLoaded', async () => {
    wireEvents();
    await loadChildren();
  });
})();
