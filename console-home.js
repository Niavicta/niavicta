/* Niavicta · Console homepage interactions
   Live panel (clock, KPI breathing, activity feed, chart) + scroll reveal.
   No external deps. Respects prefers-reduced-motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Clock ─────────────────────────────────────────────── */
  (function () {
    var el = document.getElementById('clock');
    if (!el) return;
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var d = new Date();
      el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' CET';
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ── KPI breathing ─────────────────────────────────────── */
  (function () {
    if (reduce) return;
    var k1 = document.getElementById('k1');
    var k2 = document.getElementById('k2');
    var v1 = 7, v2 = 96.2;
    setInterval(function () {
      if (Math.random() < 0.35 && k1) {
        v1 = Math.max(5, Math.min(9, v1 + (Math.random() < 0.5 ? -1 : 1)));
        k1.innerHTML = v1 + '<span class="unit">items</span>';
      }
      if (k2) {
        v2 = Math.max(94, Math.min(98.4, v2 + (Math.random() - 0.5) * 0.18));
        k2.innerHTML = v2.toFixed(1) + '<span class="unit">%</span>';
      }
    }, 2200);
  })();

  /* ── Activity feed ─────────────────────────────────────── */
  (function () {
    var feed = document.getElementById('feed');
    var ftime = document.getElementById('ftime');
    if (!feed) return;
    var pool = [
      { msg: 'Nonconformance <b>NC-2026-185</b> opened · line 02', chip: 'Open', cls: 'g' },
      { msg: 'Audit answer drafted for <b>ISO 13485 §8.5.6</b>', chip: 'Drafted', cls: '' },
      { msg: '<b>M. de Boer</b> signed off CAPA on NC-2026-178', chip: 'Signed', cls: 't' },
      { msg: 'Supplier <b>RT-04</b> certificate filed · exp 27 mar 28', chip: 'Filed', cls: '' },
      { msg: 'PO-994 raised by <b>Anouk</b> · €18,420', chip: 'Open', cls: '' },
      { msg: 'Agent <b>v2.3</b> drafted release note · awaiting review', chip: 'Review', cls: 'g' },
      { msg: 'Evidence pack sealed for <b>design review DR-12</b>', chip: 'Sealed', cls: 't' }
    ];
    var i = 0;
    if (reduce) return;
    setInterval(function () {
      var it = pool[i % pool.length]; i++;
      var li = document.createElement('li');
      li.className = 'new';
      var t = new Date();
      var pad = function (n) { return String(n).padStart(2, '0'); };
      li.innerHTML = '<span class="t">' + pad(t.getHours()) + ':' + pad(t.getMinutes()) +
        '</span><span>' + it.msg + '</span><span class="chip ' + it.cls + '">' + it.chip + '</span>';
      feed.insertBefore(li, feed.firstChild);
      while (feed.children.length > 4) feed.removeChild(feed.lastChild);
      if (ftime) ftime.textContent = 'just now';
    }, 5400);
  })();

  /* ── Mini chart ────────────────────────────────────────── */
  (function () {
    var cT = document.getElementById('cT');
    var cTfill = document.getElementById('cT-fill');
    var cG = document.getElementById('cG');
    if (!cT) return;
    var W = 360, H = 80, N = 30;
    var tData = [], gData = [], i;
    for (i = 0; i < N; i++) {
      tData.push(28 + Math.sin(i * 0.6) * 6 + Math.random() * 4);
      gData.push(42 + Math.cos(i * 0.5) * 5 + Math.random() * 3);
    }
    function build(data) {
      var min = 20, max = 60;
      return data.map(function (v, i) {
        var x = (i / (N - 1)) * W;
        var y = H - ((v - min) / (max - min)) * H;
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
    }
    function draw() {
      var pT = build(tData);
      cT.setAttribute('d', pT);
      if (cTfill) cTfill.setAttribute('d', pT + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z');
      if (cG) cG.setAttribute('d', build(gData));
    }
    draw();
    if (reduce) return;
    setInterval(function () {
      tData.shift(); tData.push(28 + Math.sin(Date.now() * 0.0008) * 6 + Math.random() * 4);
      gData.shift(); gData.push(42 + Math.cos(Date.now() * 0.0007) * 5 + Math.random() * 3);
      draw();
    }, 1500);
  })();

  /* ── Industries marquee (duplicated for seamless -50% loop) ── */
  (function () {
    var track = document.getElementById('marquee');
    if (!track) return;
    var items = ['SaaS', 'MedTech', 'Life Sciences', 'Manufacturing', 'ISO 9001',
      'ISO 13485', 'ISO 27001', 'ISO 42001', 'GDPR', 'MDR', 'FDA'];
    function build() {
      var html = '';
      items.forEach(function (it) {
        html += '<span class="item">' + it + '</span><span class="sep" aria-hidden="true"></span>';
      });
      return html;
    }
    // two copies so the -50% keyframe wraps seamlessly
    track.innerHTML = build() + build();
  })();

  /* ── How-it-works walkthrough stepper ──────────────────────
     Cycles the 6 process steps. Auto-advances; clicking a step
     jumps to it and pauses; resumes after a while. */
  (function () {
    var root = document.getElementById('demo');
    if (!root) return;
    var steps = [].slice.call(root.querySelectorAll('.demo-step'));
    var cards = [].slice.call(root.querySelectorAll('.demo-card'));
    var narrs = [].slice.call(document.querySelectorAll('.demo-narr .narr'));
    var bar = document.getElementById('demo-progress');
    var n = steps.length;
    if (!n) return;
    var i = 0, timer = null, paused = false;

    function show(idx) {
      i = (idx + n) % n;
      steps.forEach(function (s, k) { s.classList.toggle('active', k === i); });
      cards.forEach(function (c, k) { c.classList.toggle('active', k === i); });
      narrs.forEach(function (p, k) { p.classList.toggle('active', k === i); });
      if (bar) bar.style.width = ((i + 1) / n * 100) + '%';
    }
    function next() { show(i + 1); }
    function start() {
      if (reduce) return;
      stop();
      timer = setInterval(function () { if (!paused) next(); }, 4600);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    steps.forEach(function (s, k) {
      s.addEventListener('click', function () {
        show(k);
        paused = true;
        stop();
        setTimeout(function () { paused = false; start(); }, 12000);
      });
    });

    show(0);
    // start only when the section scrolls into view (and keep it cheap)
    var started = false;
    function maybeStart() {
      if (started) return;
      var r = root.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.8 && r.bottom > 0) { started = true; start(); window.removeEventListener('scroll', maybeStart); }
    }
    window.addEventListener('scroll', maybeStart, { passive: true });
    maybeStart();
    setTimeout(maybeStart, 400);
  })();

  /* ── Scroll reveal ─────────────────────────────────────────
     getBoundingClientRect + scroll listener (IntersectionObserver and CSS
     transitions both proved unreliable inside nested-iframe preview/embed
     contexts, transitions can freeze at their start frame). The hidden
     base state is gated behind body.reveal-on so content is visible if the
     script never runs, and a safety net force-clears transitions so a frozen
     environment can never trap content at opacity 0. */
  (function () {
    var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    document.body.classList.add('reveal-on');
    if (reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }

    var pend = els.slice();
    var io = null;
    void document.body.offsetWidth; // commit base state so the first batch animates
    function reveal(el, delay) {
      delay = delay || 0;
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('in');
      // watchdog: if a transition is frozen (offscreen/embedded context),
      // snap visible after it should have finished. Never fires in a normal
      // browser, so the animation is preserved.
      setTimeout(function () {
        if (parseFloat(getComputedStyle(el).opacity) < 0.9) { el.style.transition = 'none'; }
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
    window.addEventListener('scroll', function () { if (t) return; t = true; window.requestAnimationFrame(function () { t = false; pass(); }); }, { passive: true, capture: true });
    window.addEventListener('resize', pass, { passive: true });
    pass();
    setTimeout(pass, 200);
    // failsafe: ONLY for contexts where transitions never run at all. If the
    // reveal system actually worked (anything animated in), do nothing -
    // otherwise this flat-snaps tiles that merely peek at the bottom of the
    // first viewport (top between the 0.88·vh trigger line and vh), stealing
    // their scroll entrance.
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
  })();

  /* ── Hint chips fill the consultation field (contact) ──── */
  (function () {
    document.querySelectorAll('[data-fill]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = document.getElementById('ask');
        if (!t) return;
        t.value = b.getAttribute('data-fill');
        t.focus();
      });
    });
  })();

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
