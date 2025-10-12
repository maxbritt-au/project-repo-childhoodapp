
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('logout-modal');
  const openBtn = document.getElementById('open-logout-modal');
  const cancelBtn = document.getElementById('cancel-logout-btn');
  const confirmBtn = document.getElementById('confirm-logout-btn');

  const showModal = () => {
    if (!modal) return;
    modal.classList.add('open');
    modal.style.display = 'flex'; // override inline display:none if present
  };

  const hideModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.style.display = 'none';
  };

  if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); showModal(); });
  if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {}
      try { localStorage.removeItem('user'); } catch {}
      window.location.href = '/';
    });
  }

  // click outside & ESC to close (optional)
  if (modal) {
    window.addEventListener('click', (ev) => { if (ev.target === modal) hideModal(); });
    window.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hideModal(); });
  }
});


