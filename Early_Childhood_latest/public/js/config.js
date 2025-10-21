// public/js/config.js
(function () {
  // Always use same origin as the site, not a hard-coded Render domain
  const origin = window.location.origin;

  // Detect if backend path should include /api (it always should in your app)
  window.API_BASE_URL = `${origin}/api`;

  console.log('[config] API_BASE_URL =', window.API_BASE_URL);
})();
