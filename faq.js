/* Niavicta · FAQ search + render (dependency-free, no build step).
   Shared by faq.html (search over the most-asked set) and
   all-questions.html (full categorised library + filter).
   Reads window.NIANAV_FAQ / window.NIANAV_FAQ_CATS from faq-data.js. */
(function () {
  var DATA = window.NIANAV_FAQ || [];
  var CATS = window.NIANAV_FAQ_CATS || [];
  var CATLABEL = {};
  CATS.forEach(function (c) { CATLABEL[c[0]] = c[1]; });

  // Light synonym expansion so different wordings still find the answer.
  var SYN = {
    cost: ['price', 'pricing', 'expensive', 'afford'],
    price: ['cost', 'pricing'],
    integrate: ['connect', 'integration', 'connector', 'connectors'],
    connect: ['integrate', 'integration', 'connector'],
    secure: ['security', 'safe', 'protect', 'protection'],
    security: ['secure', 'safe', 'data', 'protect'],
    audit: ['auditor', 'inspection', 'evidence'],
    gdpr: ['privacy', 'erasure', 'data', 'protection'],
    ai: ['agent', 'agents', 'artificial', 'intelligence', 'llm'],
    agent: ['ai'],
    compliant: ['compliance', 'compliant', 'regulated', 'regulatory'],
    compliance: ['compliant', 'regulated', 'regulatory'],
    start: ['begin', 'onboard', 'onboarding', 'setup', 'set'],
    onboarding: ['start', 'setup', 'project', 'zero'],
    qms: ['quality', 'management'],
    doc: ['document', 'documents'],
    document: ['doc', 'documents'],
    template: ['templates', 'procedure', 'procedures'],
    role: ['roles', 'capability', 'capabilities', 'permission'],
  };

  // Common words that should not drive matching on their own.
  var STOP = {};
  ('a an and are as at be but by can could do does for from how i in is it its my of on or our ' +
   'that the their them they this to us we what when where which who why will with you your would not no')
    .split(' ').forEach(function (w) { STOP[w] = 1; });

  function norm(s) { return (s || '').toLowerCase().replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function words(s) { return norm(s).split(' ').filter(function (w) { return w.length > 1; }); }
  function tokens(s) { return norm(s).split(' ').filter(function (t) { return t.length > 1 && !STOP[t]; }); }
  function hasTerms(s) { return tokens(s).length > 0; }
  function expand(ts) {
    var out = {};
    ts.forEach(function (t) { out[t] = 1; (SYN[t] || []).forEach(function (x) { out[x] = 1; }); });
    return Object.keys(out);
  }

  // Bounded Levenshtein distance: bails out (returns max+1) as soon as the best
  // possible distance exceeds `max`, so typo-tolerance stays cheap.
  function editDist(a, b, max) {
    var al = a.length, bl = b.length;
    if (Math.abs(al - bl) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= bl; j++) prev[j] = j;
    for (i = 1; i <= al; i++) {
      cur[0] = i; var best = i;
      for (j = 1; j <= bl; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      for (j = 0; j <= bl; j++) prev[j] = cur[j];
    }
    return prev[bl];
  }

  // How well a query token `t` matches a single haystack word `w`, 0..1.
  // Exact > prefix (either direction) > substring > fuzzy (typo within edit distance).
  function wordMatch(t, w) {
    if (w === t) return 1;
    if (w.indexOf(t) === 0) return 0.9;                            // word starts with token - powers "as you type"
    if (w.length >= 4 && t.indexOf(w) === 0) return 0.85;          // token starts with word (inflections: audit→auditing)
    if (t.length >= 3 && w.indexOf(t) !== -1) return 0.72;          // substring
    if (t.length >= 4 && w.length >= 4) {                          // fuzzy - tolerate typos
      var max = t.length <= 6 ? 1 : 2;
      if (editDist(t, w, max) <= max) return 0.6;
    }
    return 0;
  }

  // Best match quality of token `t` anywhere in a word list.
  function bestIn(t, wlist) {
    var best = 0;
    for (var i = 0; i < wlist.length; i++) {
      var q = wordMatch(t, wlist[i]);
      if (q > best) { best = q; if (best === 1) break; }
    }
    return best;
  }

  // Precompute per-item word lists for each weighted field.
  DATA.forEach(function (it) {
    it._q = norm(it.q);
    it._al = (it.aliases || []).map(norm).join('  ');
    it._qw = words(it.q);
    it._alw = words((it.aliases || []).join(' '));
    it._aw = words(it.a);
    it._cw = words(CATLABEL[it.cat] || it.cat);
  });

  function score(it, qtokens) {
    var s = 0, matched = 0;
    for (var i = 0; i < qtokens.length; i++) {
      var t = qtokens[i];
      // Question / aliases / category are "strong" intent fields: only a landing
      // there qualifies an item as a result. The answer body only boosts ranking,
      // so a query that merely shares a common word with some answer (e.g. "much"
      // in "how much does it cost") doesn't surface an unrelated question.
      var strong = 4 * bestIn(t, it._qw) + 3 * bestIn(t, it._alw) + 2 * bestIn(t, it._cw);
      var hit = strong + 1 * bestIn(t, it._aw);
      if (hit > 0) s += hit;
      if (strong >= 1) matched++;
    }
    // whole-phrase bonus on the question / aliases
    var phrase = norm(qtokens.join(' '));
    if (phrase && (it._q.indexOf(phrase) !== -1 || it._al.indexOf(phrase) !== -1)) s += 6;
    return { s: s, matched: matched };
  }

  function search(q) {
    var raw = tokens(q);
    if (!raw.length) return [];
    var qt = expand(raw);
    var scored = [];
    DATA.forEach(function (it) {
      var r = score(it, qt);
      // require at least one of the user's actual words to land meaningfully
      if (r.matched > 0) scored.push({ it: it, s: r.s, m: r.matched });
    });
    scored.sort(function (a, b) { return b.m - a.m || b.s - a.s; });
    // Trim the long tail: keep items within 40% of the best score (the top always
    // survives), capped. No fixed floor, so a single decent fuzzy match isn't nuked.
    if (scored.length) {
      var floor = scored[0].s * 0.4;
      scored = scored.filter(function (x) { return x.s >= floor; }).slice(0, 12);
    }
    return scored.map(function (x) { return x.it; });
  }

  function makeItem(it) {
    var d = document.createElement('details');
    d.className = 'faq-item';
    var sum = document.createElement('summary');
    var label = document.createElement('span');
    label.textContent = it.q;
    var ic = document.createElement('span');
    ic.className = 'ic';
    sum.appendChild(label); sum.appendChild(ic);
    var ans = document.createElement('div');
    ans.className = 'ans';
    ans.innerHTML = it.a;
    d.appendChild(sum); d.appendChild(ans);
    return d;
  }

  function listWrap(items) {
    var w = document.createElement('div');
    w.className = 'faq-list';
    items.forEach(function (it) { w.appendChild(makeItem(it)); });
    return w;
  }

  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); var a = arguments, c = this; t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  // ── Page wiring ──────────────────────────────────────────────────────
  function initSearchPage() {
    var input = document.getElementById('faq-search');
    var featured = document.getElementById('faq-featured');
    var results = document.getElementById('faq-results');
    var status = document.getElementById('faq-status');
    if (!input || !featured || !results) return false;

    function render() {
      var q = input.value.trim();
      // Empty, or only stopwords / too-short fragments ("what", "is it"): keep the
      // common questions on screen rather than scaring the visitor with the empty state.
      if (!q || !hasTerms(q)) {
        results.innerHTML = ''; results.hidden = true;
        featured.hidden = false;
        if (status) status.textContent = '';
        return;
      }
      var hits = search(q);
      featured.hidden = true;
      results.hidden = false;
      results.innerHTML = '';
      if (!hits.length) {
        if (status) status.textContent = '';
        var e = document.createElement('div');
        e.className = 'faq-empty';
        e.innerHTML = 'No answer matched <b>&ldquo;' + escapeHtml(q) + '&rdquo;</b> yet. ' +
          'Tell us what you are trying to figure out and we will answer it directly. ' +
          '<a href="mailto:hello@niavicta.com?subject=Question%20about%20nianav%20OS">hello@niavicta.com</a>';
        results.appendChild(e);
        return;
      }
      if (status) status.textContent = hits.length + (hits.length === 1 ? ' answer' : ' answers');
      results.appendChild(listWrap(hits));
    }
    input.addEventListener('input', debounce(render, 120));
    return true;
  }

  function initLibraryPage() {
    var input = document.getElementById('faq-search');
    var cats = document.getElementById('faq-cats');
    var lib = document.getElementById('faq-library');
    var status = document.getElementById('faq-status');
    if (!lib) return false;
    var activeCat = 'all';

    // build category filter chips
    if (cats) {
      var mk = function (key, label) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = label; b.dataset.cat = key;
        if (key === 'all') b.classList.add('active');
        b.addEventListener('click', function () {
          activeCat = key;
          Array.prototype.forEach.call(cats.children, function (c) { c.classList.toggle('active', c === b); });
          render();
        });
        return b;
      };
      cats.appendChild(mk('all', 'All'));
      CATS.forEach(function (c) {
        if (DATA.some(function (it) { return it.cat === c[0]; })) cats.appendChild(mk(c[0], c[1]));
      });
    }

    function renderGrouped() {
      lib.innerHTML = '';
      CATS.forEach(function (c) {
        if (activeCat !== 'all' && activeCat !== c[0]) return;
        var items = DATA.filter(function (it) { return it.cat === c[0]; });
        if (!items.length) return;
        var group = document.createElement('div');
        group.className = 'faq-group';
        var h = document.createElement('h3');
        h.innerHTML = c[1] + ' <span>' + items.length + '</span>';
        group.appendChild(h);
        group.appendChild(listWrap(items));
        lib.appendChild(group);
      });
    }

    function render() {
      var q = input ? input.value.trim() : '';
      // Empty or no real search terms ("what"): show the full grouped library.
      if (!q || !hasTerms(q)) {
        renderGrouped();
        if (status) status.textContent = '';
        return;
      }
      var hits = search(q);
      if (activeCat !== 'all') hits = hits.filter(function (it) { return it.cat === activeCat; });
      lib.innerHTML = '';
      if (!hits.length) {
        var e = document.createElement('div');
        e.className = 'faq-empty';
        e.innerHTML = 'No answer matched <b>&ldquo;' + escapeHtml(q) + '&rdquo;</b> yet. ' +
          'Ask us directly and we will answer it. ' +
          '<a href="mailto:hello@niavicta.com?subject=Question%20about%20nianav%20OS">hello@niavicta.com</a>';
        lib.appendChild(e);
        if (status) status.textContent = '';
        return;
      }
      if (status) status.textContent = hits.length + (hits.length === 1 ? ' answer' : ' answers');
      lib.appendChild(listWrap(hits));
    }
    if (input) input.addEventListener('input', debounce(render, 120));
    render();
    return true;
  }

  function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function init() { if (!initLibraryPage()) initSearchPage(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
