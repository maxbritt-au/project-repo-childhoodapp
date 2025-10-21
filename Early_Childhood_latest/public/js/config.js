// public/js/config.js
(function () {
  const origin = window.location.origin;       // e.g. https://project-repo-childhoodapp-uuxl.onrender.com
  window.API_BASE_URL = `${origin}/api`;
  console.log('[config] API_BASE_URL =', window.API_BASE_URL);
})();
