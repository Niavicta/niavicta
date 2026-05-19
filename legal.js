(function () {
  // We remember the user's "Continue" click for the rest of the browser
  // session so the notice does not reappear on every internal navigation,
  // and shows again the next time the site is opened. We use sessionStorage
  // (not localStorage) so the state is scoped to this tab/session, never
  // persisted across visits — this is the strictly functional minimum
  // needed to make the consent UI itself usable.
  var STORAGE_KEY = 'niavicta:privacy-notice-dismissed';

  function storage() {
    try { return window.sessionStorage; } catch (e) { return null; }
  }

  function isDismissed() {
    var s = storage();
    if (!s) return false;
    try { return s.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }

  function rememberDismissal() {
    var s = storage();
    if (!s) return;
    try { s.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  function closeNotice() {
    var notice = document.querySelector('.privacy-notice');
    if (notice) notice.hidden = true;
    rememberDismissal();
  }

  function initPrivacyNotice() {
    if (document.querySelector('.privacy-notice')) return;
    if (isDismissed()) return;

    var notice = document.createElement('aside');
    notice.className = 'privacy-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'true');
    notice.setAttribute('aria-labelledby', 'privacy-notice-title');
    notice.innerHTML = [
      '<div class="privacy-notice__panel">',
      '<h2 id="privacy-notice-title">Privacy and cookies</h2>',
      '<p>This website uses locally hosted fonts and does not use analytics, advertising pixels, third-party embeds, cookies, or localStorage. A single sessionStorage entry is used only to remember that you have dismissed this notice for the rest of your browser session. Standard server logs may still be created by the website host to deliver and secure the site.</p>',
      '<div class="privacy-notice__actions">',
      '<button class="btn-primary" type="button" data-privacy-close>Continue</button>',
      '<a class="btn-ghost" href="privacy-policy.html">Privacy policy</a>',
      '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(notice);
    notice.querySelector('[data-privacy-close]').addEventListener('click', closeNotice);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacyNotice);
  } else {
    initPrivacyNotice();
  }
})();
