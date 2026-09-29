/* Sticky "book a call" bar. Appears once the visitor scrolls past the first screen,
   hides again near the page's own closing call to action, and never covers the
   first-visit privacy notice. One include per page: <script src="sticky-book.js" defer></script> */
(function(){
  if (/book\.html$/.test(location.pathname)) return;
  var css = ''
    + '.sb-bar{position:fixed;right:20px;bottom:20px;z-index:150;display:flex;align-items:center;gap:14px;background:#0E2240;color:#fff;border-radius:14px;padding:10px 10px 10px 18px;box-shadow:0 18px 40px -16px rgba(14,34,64,.55);transform:translateY(140%);opacity:0;transition:transform .3s ease,opacity .3s ease;max-width:calc(100vw - 40px)}'
    + '.sb-bar.on{transform:none;opacity:1}'
    + '.sb-bar .sb-t{font-size:14px;line-height:1.3}'
    + '.sb-bar .sb-t b{display:block;font-size:14.5px}'
    + '.sb-bar .sb-t span{color:#B9C6D6;font-size:12.5px}'
    + '.sb-bar a{flex:none;background:#4FB3A2;color:#0E2240;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;padding:11px 16px;white-space:nowrap}'
    + '.sb-bar a:hover,.sb-bar a:focus-visible{background:#6FCBBB;outline:2px solid #fff;outline-offset:2px}'
    + '@media (max-width:640px){.sb-bar{left:12px;right:12px;bottom:12px;max-width:none}.sb-bar .sb-t span{display:none}}'
    + '@media (prefers-reduced-motion:reduce){.sb-bar{transition:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var bar = document.createElement('div');
  bar.className = 'sb-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Book a call');
  bar.innerHTML = '<div class="sb-t"><b>Free 20-minute call with a lead auditor</b><span>No obligation. You leave with a clear first step.</span></div>'
    + '<a href="book.html">Book a call</a>';
  document.body.appendChild(bar);
  var closeCta = document.getElementById('close');
  function update(){
    var past = window.scrollY > window.innerHeight * 0.9;
    var nearClose = false;
    if (closeCta) { var r = closeCta.getBoundingClientRect(); nearClose = r.top < window.innerHeight && r.bottom > 0; }
    var pn = document.getElementById('privnote');
    var privOpen = pn && !pn.hidden;
    bar.classList.toggle('on', past && !nearClose && !privOpen);
  }
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
  update();
})();
