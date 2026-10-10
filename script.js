(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header state
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = $('.menu-toggle'), mnav = $('#mobile-nav');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mnav.hidden = !open;
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

  // Scroll reveal
  const items = $$('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('has-motion');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: .1, rootMargin: '0px 0px -20px 0px' });
    items.forEach(i => io.observe(i));
  }

  // Lookbook filters
  const gallery = $('#gallery');
  const tiles = $$('.g-item', gallery);
  const filters = $$('.filter');
  let visible = tiles;
  filters.forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filters.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    tiles.forEach(t => { t.hidden = !(cat === 'all' || t.dataset.cat === cat); });
    visible = tiles.filter(t => !t.hidden);
  }));

  // Lightbox
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCount = $('.lb-count', lb), lbFull = $('.lb-full', lb);
  let idx = 0;
  const show = i => {
    idx = (i + visible.length) % visible.length;
    const t = visible[idx];
    lbImg.src = t.href;
    lbImg.alt = $('img', t).alt;
    lbFull.href = t.href;
    lbCount.textContent = `${idx + 1} / ${visible.length}`;
  };
  const open = i => { lb.hidden = false; document.body.classList.add('lock'); show(i); $('.lb-close', lb).focus(); };
  const close = () => { lb.hidden = true; document.body.classList.remove('lock'); lbImg.src = ''; };
  tiles.forEach(t => t.addEventListener('click', e => { e.preventDefault(); open(visible.indexOf(t)); }));
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });

  $('#year').textContent = new Date().getFullYear();
})();
