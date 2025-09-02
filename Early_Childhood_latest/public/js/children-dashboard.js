// public/js/children-dashboard.js
// Works with either table (tbody) or card grid (.grid)

(() => {
  const API_BASE = '/api/children';
  const $ = (s) => document.querySelector(s);
  const any = (...sels) => sels.map($).find(Boolean) || null;

  const els = {
    tableBody: any('#childrenTableBody'),
    grid: any('#childrenGrid', '.grid'),
    searchInput: any('#childSearch', '#search'),
    sortSelect: any('#childSort', '#sort'),
    refreshBtn: any('#refreshChildren', '#refresh'),
    addBtn: any('#addChildBtn', '#addChild'),
    emptyState: any('#childrenEmpty', '.empty'),
    spinner: any('#childrenSpinner'),
    toast: any('#childrenToast'),
    toastMsg: any('#childrenToastMsg'),
  };

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

  const api = async (url) => {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const err = await safeJSON(res);
      throw new Error(err.message || err.error || `Request failed (${res.status})`);
    }
    return res.json();
  };

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

  const normalize = (row) => {
    const first = row.first_name || '';
    const last  = row.last_name  || '';
    const name  = (row.name || `${first} ${last}`).trim();
    return {
      id: row.child_id ?? row.id,
      name: name || 'Unnamed',
      first_name: first,
      last_name: last,
      dob: row.dob || null,
      gender: row.gender || '',
      notes: row.notes || '',
      profile_url: row.profile_url || null,
    };
  };

  const initialsFrom = (first, last, name) => {
    const src = (name && name.trim()) ? name.trim() : `${first || ''} ${last || ''}`.trim();
    const parts = src.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map(p => (p[0] || '?').toUpperCase()).join('') || '?';
  };

  let children = [];
  let filtered = [];

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
        <td>
          <a href="/individual-child-dash?childId=${c.id}">
            ${esc(c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed')}
          </a>
        </td>
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
      card.dataset.id = c.id;
      card.tabIndex = 0;
      card.style.cursor = 'pointer';

      const initials = initialsFrom(c.first_name, c.last_name, c.name);
      const avatar = c.profile_url
        ? `<img src="${esc(c.profile_url)}" alt="${esc(c.name)}" style="width:54px;height:54px;border-radius:50%;object-fit:cover">`
        : esc(initials);

      card.innerHTML = `
        <div class="avatar">${avatar}</div>
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

  // map UI sort -> API sort your route supports: last_asc | last_desc | age_asc | age_desc
  const mapSort = (ui) => {
    switch (ui) {
      case 'name-asc': return 'last_asc';
      case 'name-desc': return 'last_desc';
      case 'dob-asc': return 'age_desc'; // younger first = newer DOB
      case 'dob-desc': return 'age_asc'; // older first  = older DOB
      default: return 'last_asc';
    }
  };

  const loadChildren = async () => {
    setLoading(true);
    try {
      const q = (els.searchInput?.value || '').trim();
      const sort = mapSort(els.sortSelect?.value || 'name-asc');
      const params = { q, sort, limit: 200, offset: 0 };
      const url = `${API_BASE}?${new URLSearchParams(params).toString()}`;
      const list = await api(url);
      children = Array.isArray(list) ? list.map(normalize) : [];
      applyFilters(); // local filter too (keeps UI snappy)
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
    const uiSort = els.sortSelect?.value || 'name-asc';

    filtered = children.filter((c) => {
      if (!q) return true;
      const hay = [c.name || '', c.first_name || '', c.last_name || '', c.gender || '', c.notes || '']
        .join(' ').toLowerCase();
      return hay.includes(q);
    });

    // stabilize sort locally for better UX
    const [field, dir] = uiSort.split('-');
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

  const wireEvents = () => {
    els.refreshBtn?.addEventListener('click', loadChildren);
    els.searchInput?.addEventListener('input', () => {
      // re-fetch using q so backend filtering also applies
      clearTimeout(window.__childSearchTimer);
      window.__childSearchTimer = setTimeout(loadChildren, 250);
    });
    els.sortSelect?.addEventListener('change', loadChildren);

    // delegated: edit/delete and card navigation
    const container = els.tableBody || els.grid;
    container?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      const card = e.target.closest('.card');

      if (btn) return; // your existing edit/delete handler lives elsewhere; keep behavior

      if (card && els.grid && !e.target.closest('button')) {
        const id = card.dataset.id;
        if (id) window.location.href = `/individual-child-dash?childId=${encodeURIComponent(id)}`;
      }
    });

    container?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const card = e.target.closest('.card');
        if (card && card.dataset.id) {
          window.location.href = `/individual-child-dash?childId=${encodeURIComponent(card.dataset.id)}`;
        }
      }
    });
  };

  document.addEventListener('DOMContentLoaded', async () => {
    wireEvents();
    await loadChildren();
  });
})();
