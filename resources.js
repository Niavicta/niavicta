/* Niavicta · Resources filter (dependency-free, no build step).
   Reads the resource cards already in resources.html, so each resource is
   written once. Type comes from data-type, topics from the card's .res-tag
   labels. Filters sync to ?type= and ?tag= so a link can open pre-filtered. */
(function () {
  var grid = document.getElementById('res-grid');
  var filter = document.getElementById('res-filter');
  var empty = document.getElementById('res-empty');
  if (!grid || !filter) return;

  var TYPE_LABELS = { template: 'Templates', 'white-paper': 'White papers', podcast: 'Podcasts' };
  function slug(s) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  var cards = Array.prototype.map.call(grid.querySelectorAll('.res-card'), function (el) {
    var tags = {};
    Array.prototype.forEach.call(el.querySelectorAll('.res-tag'), function (t) { tags[slug(t.textContent)] = t.textContent.trim(); });
    return { el: el, type: el.getAttribute('data-type') || '', tags: tags };
  });
  if (!cards.length) return;

  var types = {}, topics = {};
  cards.forEach(function (c) {
    if (c.type) types[c.type] = TYPE_LABELS[c.type] || c.type;
    Object.keys(c.tags).forEach(function (k) { topics[k] = c.tags[k]; });
  });

  var params = new URLSearchParams(location.search);
  var state = { type: params.get('type') || '', tag: params.get('tag') || '' };

  function buildRow(group, options) {
    var row = filter.querySelector('[data-group="' + group + '"]');
    var keys = Object.keys(options).sort(function (a, b) { return options[a].localeCompare(options[b]); });
    [''].concat(keys).forEach(function (key) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = key ? options[key] : 'All';
      b.setAttribute('data-value', key);
      b.addEventListener('click', function () { state[group] = key; apply(); });
      row.appendChild(b);
    });
  }

  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (!state.type || c.type === state.type) && (!state.tag || state.tag in c.tags);
      c.el.hidden = !ok;
      if (ok) shown++;
    });
    Array.prototype.forEach.call(filter.querySelectorAll('button'), function (b) {
      var group = b.parentNode.getAttribute('data-group');
      b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === state[group]));
    });
    if (empty) empty.hidden = shown > 0;
    var q = new URLSearchParams();
    if (state.type) q.set('type', state.type);
    if (state.tag) q.set('tag', state.tag);
    var qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  buildRow('type', types);
  buildRow('tag', topics);
  filter.hidden = false;
  apply();
})();
