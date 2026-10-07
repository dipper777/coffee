(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var visible = function (s) { return $$(s).filter(function (el) { return el.offsetParent; })[0]; };
  var toContact = function () { var c = visible('.contact'); if (c) c.scrollIntoView({ behavior: 'smooth' }); };
  document.documentElement.classList.add('js');

  // Catalog filter
  var buttons = $$('.filters button'), cards = $$('#grid .card');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      buttons.forEach(function (b) { b.classList.toggle('on', b === btn); });
      cards.forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.tags.split(' ').indexOf(f) !== -1); });
    });
  });

  // Nav / subscribe -> contact
  $$('[data-contact]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); toContact(); }); });
  var sub = $('#subscribe'); if (sub) sub.addEventListener('click', toContact);

  // Contact forms
  $$('.form').forEach(function (form) {
    var note = $('.form-note', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return $('[name=' + n + ']', form).value.trim(); };
      if (!v('name') || !/^\S+@\S+\.\S+$/.test(v('email')) || !v('message')) {
        note.textContent = 'Please fill in your name, a valid email and a message.'; return;
      }
      note.textContent = 'Thank you. We’ll reply soon.'; form.reset();
    });
  });

  // Scroll reveal
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  $$('.about>*,.card,.why-top>*,.pillar,.cat-hero,.filters,.lower>*,.contact-grid>*').forEach(function (el) {
    el.classList.add('rv'); if (io) io.observe(el); else el.classList.add('in');
  });

  // Cart
  var KEY = 'noir-cart', items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return '€' + Math.round(n * 100) / 100; };
  var drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.innerHTML = '<div class="scrim" data-close></div><div class="panel" role="dialog" aria-label="Cart"><div class="ph"><h3>Your cart</h3><button data-close aria-label="Close cart">×</button></div><div class="list"></div><div class="pf"></div></div>';
  document.body.appendChild(drawer);
  var list = $('.list', drawer), pf = $('.pf', drawer), lastFocus;

  function render() {
    var n = items.reduce(function (s, i) { return s + i.qty; }, 0);
    var total = items.reduce(function (s, i) { return s + i.qty * i.price; }, 0);
    $$('[data-count]').forEach(function (c) { c.textContent = n; c.dataset.n = n; });
    if (!items.length) {
      var cat = $('.nav a:nth-child(2)');
      list.innerHTML = '<div class="empty">Your cart is quiet.<br><a href="' + (cat ? cat.getAttribute('href') : '#') + '" data-close>Explore coffee</a></div>';
      pf.innerHTML = ''; return;
    }
    var thumb = ($('.card img') || {}).src || '';
    list.innerHTML = items.map(function (i) {
      return '<div class="it"><img src="' + thumb + '" alt=""><div><b>' + esc(i.name) + '</b><small>' + money(i.price) + '</small><div class="q"><button data-dec="' + esc(i.id) + '" aria-label="Less">−</button><span>' + i.qty + '</span><button data-inc="' + esc(i.id) + '" aria-label="More">+</button></div></div><div><button class="rm" data-rm="' + esc(i.id) + '">Remove</button></div></div>';
    }).join('');
    pf.innerHTML = '<div class="tot"><span>Subtotal</span><span>' + money(total) + '</span></div><button class="btn-dark" data-checkout>Checkout</button><p></p>';
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} render(); }
  function open() { lastFocus = document.activeElement; drawer.classList.add('open'); document.body.classList.add('lock'); setTimeout(function () { $('.ph button', drawer).focus(); }, 50); }
  function close() { drawer.classList.remove('open'); document.body.classList.remove('lock'); if (lastFocus) lastFocus.focus(); }
  function find(id) { return items.filter(function (i) { return i.id === id; })[0]; }

  $$('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.dataset.add, it = find(id);
      if (it) it.qty++; else items.push({ id: id, name: b.dataset.name, price: +b.dataset.price, qty: 1 });
      save(); b.classList.add('ok'); setTimeout(function () { b.classList.remove('ok'); }, 900); open();
    });
  });
  $$('[data-cart]').forEach(function (b) { b.addEventListener('click', open); });
  drawer.addEventListener('click', function (e) {
    var t = e.target, d = t.dataset || {}, it;
    if (d.close !== undefined) close();
    if (d.inc && (it = find(d.inc))) { it.qty++; save(); }
    if (d.dec && (it = find(d.dec))) { it.qty--; if (it.qty < 1) items.splice(items.indexOf(it), 1); save(); }
    if (d.rm) { items = items.filter(function (i) { return i.id !== d.rm; }); save(); }
    if (d.checkout !== undefined) $('.pf p', drawer).textContent = 'Checkout isn’t connected yet. This is a demo.';
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  render();
})();
