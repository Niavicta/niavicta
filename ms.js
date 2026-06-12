/* Niavicta · Fluent redesign, reveal on scroll + role-view switcher.
   Instant-safe: content can never stay hidden. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal - staggered, rises into view as each section enters.
     IntersectionObserver is primary (fires regardless of which ancestor
     scrolls); a rect-based scroll pass and an in-view failsafe back it up. */
  var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (els.length) {
    document.body.classList.add('reveal-on');
    if (reduce) {
      els.forEach(function (e) { e.classList.add('in'); });
    } else {
      var pend = els.slice();
      var io = null;
      // commit the base (opacity:0) state once so the first batch animates
      // rather than snapping. rAF is unreliable in offscreen iframes, so we
      // force a synchronous reflow instead and add .in directly.
      void document.body.offsetWidth;
      function reveal(el, delay) {
        delay = delay || 0;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('in');
        // Watchdog: CSS transitions don't advance in some offscreen/embedded
        // contexts (compositor paused). If the element is still hidden after
        // the animation should have finished, snap it visible without a
        // transition. In a normal browser opacity is already 1 by now, so
        // this never fires and the animation is preserved.
        setTimeout(function () {
          if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
            el.style.transition = 'none';
          }
        }, delay + 1100);
      }
      function revealBatch(list) {
        list = list.filter(function (el) { return pend.indexOf(el) > -1; });
        if (!list.length) return;
        // items entering together cascade top-to-bottom
        list.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
        list.forEach(function (el, k) {
          pend.splice(pend.indexOf(el), 1);
          if (io) io.unobserve(el);
          reveal(el, Math.min(k, 6) * 85);
        });
      }
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function (entries) {
          var hit = [];
          entries.forEach(function (e) { if (e.isIntersecting) hit.push(e.target); });
          revealBatch(hit);
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
        pend.forEach(function (el) { io.observe(el); });
      }
      function pass() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var batch = pend.filter(function (el) { var r = el.getBoundingClientRect(); return r.top < vh * 0.88 && r.bottom > 0; });
        revealBatch(batch);
      }
      var t = false;
      window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; pass(); }); }, { passive: true, capture: true });
      window.addEventListener('resize', pass, { passive: true });
      pass();
      setTimeout(pass, 200);
      // failsafe: ONLY for contexts where transitions never run at all (e.g. a
      // paused compositor in an offscreen iframe). If the reveal system actually
      // worked (anything animated in), do nothing - otherwise this flat-snaps
      // tiles that merely peek at the bottom of the first viewport (top between
      // the trigger line at 0.88·vh and vh), stealing their scroll entrance.
      setTimeout(function () {
        var working = els.some(function (el) {
          return el.classList.contains('in') && parseFloat(getComputedStyle(el).opacity) > 0.9;
        });
        if (working) return;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        pend.slice().forEach(function (el) {
          if (el.getBoundingClientRect().top < vh) {
            if (io) io.unobserve(el);
            el.style.transition = 'none'; el.classList.add('in');
            pend.splice(pend.indexOf(el), 1);
          }
        });
      }, 2600);
    }
  }

  /* role-view switcher: same record, three surfaces */
  var tabs = [].slice.call(document.querySelectorAll('.fs-tab'));
  var views = [].slice.call(document.querySelectorAll('.fs-view'));
  if (tabs.length) {
    function show(i) {
      tabs.forEach(function (x, k) { x.classList.toggle('on', k === i); });
      views.forEach(function (v, k) { v.classList.toggle('on', k === i); });
    }
    var stop = false, auto = null;
    tabs.forEach(function (x, i) { x.addEventListener('click', function () { show(i); stop = true; if (auto) clearInterval(auto); }); });
    show(0);
    if (!reduce) {
      auto = setInterval(function () {
        if (stop) { clearInterval(auto); return; }
        var c = tabs.findIndex(function (x) { return x.classList.contains('on'); });
        show((c + 1) % tabs.length);
      }, 3000);
    }
  }

  /* privacy notice: honest "no cookies" card, shown once then remembered.
     Stays hidden until JS confirms it hasn't been acknowledged, so returning
     visitors never see a flash. If localStorage is unavailable (private mode,
     blocked), we treat that as acknowledged rather than nag every visit. */
  var pn = document.getElementById('privnote');
  if (pn) {
    var PN_KEY = 'niavicta_notice_ack', acked;
    try { acked = window.localStorage.getItem(PN_KEY); } catch (e) { acked = '1'; }
    if (!acked) {
      pn.hidden = false;
      var pnOk = document.getElementById('privnote-ok');
      if (pnOk) pnOk.addEventListener('click', function () {
        pn.hidden = true;
        try { window.localStorage.setItem(PN_KEY, '1'); } catch (e) {}
      });
    }
  }

  /* clock (optional, only if present) */
  var clk = document.getElementById('clock');
  if (clk) {
    function pad(n){return String(n).padStart(2,'0');}
    function tick(){var d=new Date();clk.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+' CET';}
    tick(); setInterval(tick, 30000);
  }

  /* mobile nav toggle (hamburger) - only acts when the toggle is visible (<1080px) */
  (function () {
    var hdr = document.querySelector('header.site');
    var tog = hdr && hdr.querySelector('.navtoggle');
    if (!hdr || !tog) return;
    tog.addEventListener('click', function () {
      var open = hdr.classList.toggle('menu-open');
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    [].slice.call(hdr.querySelectorAll('nav a')).forEach(function (a) {
      a.addEventListener('click', function () {
        hdr.classList.remove('menu-open');
        tog.setAttribute('aria-expanded', 'false');
      });
    });
  })();
})();
