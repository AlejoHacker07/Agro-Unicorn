/* =========================================================
   UNICORN · lógica compartida de todas las páginas
   Usa catalogo.js y el carrito guardado en el navegador (localStorage "carrito").
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  /* ---------- Íconos de línea (idea 6) ---------- */
  const P = {
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.4 12.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7.5H6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12Z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.5 7.5 9.5 4.3-1 7.5-4.9 7.5-9.5V6Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
    truck: '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 14 10"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
    tt: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 3 2.5 5 5.5 5.2"/>',
    drop: '<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    spray: '<path d="M9 8h6v13H9zM10 8V5h4v3M14 5h3M19 3v.01M19 6v.01M21 4.5v.01"/>',
    hammer: '<path d="m14 7 3-3 4 4-3 3M14 7l-9.5 9.5a2.1 2.1 0 0 0 3 3L17 10M14 7l3 3"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L20 11l-9 9a2.1 2.1 0 0 1-3-3l9-9-.3.3a4 4 0 0 0-5-5l2.6 2.6-2.1 2.1Z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    helmet: '<path d="M3 17h18M5 17v-3a7 7 0 0 1 14 0v3M10 7.5V5h4v2.5"/>',
    oil: '<path d="M4 9h9l3 3h3l2-2v7H4ZM8 9V6h3M18 15.5v.01"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z"/><circle cx="8" cy="8" r="1.5"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
    bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    yt: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10.5 9.5 4 2.5-4 2.5Z"/>',
    heart: '<path d="M12 20.5s-8-4.7-8-10.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>'
  };
  const icon = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  window.icon = icon;
  // <i data-i="cart"></i> en el HTML se vuelve el ícono
  const hydrateIcons = (root = document) => $$('i[data-i]', root).forEach(el => { el.outerHTML = icon(el.dataset.i, el.className); });

  /* ---------- Arreglo 2: un solo modo oscuro, en <html> ---------- */
  const setTheme = dark => {
    document.documentElement.classList.toggle('dark-mode', dark);
    try { localStorage.setItem('modo-oscuro', dark ? 'activado' : 'desactivado'); } catch (e) {}
    $$('.theme-btn').forEach(b => { b.innerHTML = icon(dark ? 'sun' : 'moon'); b.setAttribute('aria-label', dark ? 'Modo claro' : 'Modo oscuro'); });
  };
  let dark = false;
  try { dark = localStorage.getItem('modo-oscuro') === 'activado'; } catch (e) {}

  /* ---------- Carrito (mismo formato que la página actual) ---------- */
  const readCart = () => { try { return JSON.parse(localStorage.getItem('carrito')) || []; } catch (e) { return []; } };
  const writeCart = c => { try { localStorage.setItem('carrito', JSON.stringify(c)); } catch (e) {} };
  const precioNum = s => Number(String(s).replace(/[^\d]/g, '')) || 0;
  const byId = id => CATALOGO.find(p => p.id === id);
  const mk = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const readList = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
  const writeList = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const readFavs = () => readList('favoritos');
  const isFav = id => readFavs().includes(id);

  /* ---------- 12. Números que se animan ---------- */
  function tween(el, to, fmt = n => String(Math.round(n))) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 450;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function updateBadges(bump) {
    const n = readCart().reduce((s, p) => s + (p.cantidad || 0), 0);
    $$('.cart-badge').forEach(b => {
      b.classList.toggle('on', n > 0);
      tween(b, n);
      if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
  }

  function addToCart(id, fromImg) {
    const p = byId(id);
    if (!p || !p.disponible) return;
    const c = readCart();
    const ex = c.find(x => x.titulo === p.titulo);
    if (ex) ex.cantidad++; else c.push({ titulo: p.titulo, imagen: p.imagens[0], precio: String(p.precio), cantidad: 1 });
    writeCart(c);
    fly(fromImg, () => { updateBadges(true); renderDrawer(); wiggle(); });
    toast(`${icon('check')} Agregado al carrito`);
  }
  window.agregar = addToCart;

  const wiggle = () => $$('.cart-target').forEach(el => { el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle'); });

  /* ---------- 7. El producto vuela al carrito ---------- */
  function fly(img, done) {
    const target = $$('.cart-target').find(el => el.offsetParent !== null);
    if (!img || !target || reduce) { done(); return; }
    const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    const f = document.createElement('img');
    f.src = img.currentSrc || img.src; f.className = 'flyer'; f.alt = '';
    Object.assign(f.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const s = 28 / a.width;
    f.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 120}px) scale(${(1 + s) / 2})`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.2 }
    ], { duration: 750, easing: EASE }).onfinish = () => { f.remove(); done(); };
  }

  /* ---------- Toast ---------- */
  let toastEl, toastT;
  function toast(html, ms = 1800) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast glass'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = html; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms);
  }
  window.toast = toast;

  /* ---------- 4. Tarjeta única + 17. carga elegante ---------- */
  function card(p, i = 0) {
    const et = etiquetaDe(p);
    return `
      <article class="card glow reveal${p.disponible ? '' : ' is-out'}" style="--i:${i % 8}; --amb-local:${(window.AMB || {})[p.cat] || '245, 124, 0'}" data-id="${p.id}" data-amb="${p.cat}" tabindex="0" aria-label="${escHTML(p.titulo)}">
        <div class="card-media skeleton">
          ${et ? `<span class="tag ${et.clase}">${et.texto}</span>` : ''}
          ${p.eco ? '<span class="tag eco">Eco</span>' : ''}
          <img src="${p.imagens[0]}" alt="" loading="lazy" decoding="async">
          <button class="fav" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${isFav(p.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}">${icon('heart')}</button>
        </div>
        <div class="card-body">
          <span class="card-cat">${escHTML(p.marca && p.marca !== 'Otras marcas' ? p.marca : CATEGORIAS[p.cat].nombre)}</span>
          <h3>${escHTML(p.titulo)}</h3>
          ${window.piezasPill ? window.piezasPill(p) : ''}
          ${p.specs.length ? `<div class="chips">${p.specs.slice(0, 2).map(([, t]) => `<span class="chip">${escHTML(t)}</span>`).join('')}</div>` : ''}
          <div class="price-row">
            <div>
              ${p.precioAntes > p.precio ? `<span class="price-old">${formatoCOP(p.precioAntes)}</span> <span class="save">Ahorras ${formatoCOP(p.precioAntes - p.precio)}</span>` : ''}
              <span class="price">${formatoCOP(p.precio)}</span>
            </div>
            <button class="add" data-add="${p.id}" ${p.disponible ? '' : 'disabled'} aria-label="${p.disponible ? 'Agregar al carrito' : 'Agotado'}">${icon(p.disponible ? 'plus' : 'x')}</button>
          </div>
        </div>
      </article>`;
  }
  window.cardHTML = card;

  function wireImages(root = document) {
    $$('.skeleton img', root).forEach(img => {
      const ok = () => { img.classList.add('loaded'); img.parentElement.classList.add('ready'); };
      if (img.complete && img.naturalWidth) ok(); else { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); }
    });
  }

  /* ---------- 9. Aparición suave ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(root = document) {
    $$('.reveal:not(.in)', root).forEach(el => io && !reduce ? io.observe(el) : el.classList.add('in'));
  }
  window.mount = root => { hydrateIcons(root); wireImages(root); reveal(root); };
  window.abrirProducto = id => openSheet(id);

  /* =========================================================
     8. DETALLE: crece desde la tarjeta / hoja inferior en celular
     ========================================================= */
  let sheet, scrim, lastCard;
  const mobile = () => matchMedia('(max-width: 760px)').matches;
  function buildSheet() {
    scrim = document.createElement('div'); scrim.className = 'scrim';
    sheet = document.createElement('div'); sheet.className = 'sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
    document.body.append(scrim, sheet);
    scrim.addEventListener('click', closeSheet);
    // arrastrar hacia abajo para cerrar (celular)
    let y0 = null, dy = 0;
    sheet.addEventListener('pointerdown', e => { if (!mobile() || sheet.scrollTop > 0 || e.target.closest('button,a')) return; y0 = e.clientY; dy = 0; sheet.setPointerCapture(e.pointerId); });
    sheet.addEventListener('pointermove', e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    sheet.addEventListener('pointerup', () => { if (y0 === null) return; y0 = null; if (dy > 110) closeSheet(); else { sheet.style.transform = ''; sheet.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration: 300, easing: EASE }); } });
  }

  function openSheet(id, fromCard) {
    const p = byId(id); if (!p) return;
    if (!sheet) buildSheet();
    writeList('vistos', [id, ...readList('vistos').filter(x => x !== id)].slice(0, 10));
    lastCard = fromCard || null;
    const et = etiquetaDe(p);
    sheet.setAttribute('aria-label', p.titulo);
    sheet.innerHTML = `
      <span class="grabber" aria-hidden="true"></span>
      <button class="icon-btn sheet-close" aria-label="Cerrar">${icon('x')}</button>
      <div class="sheet-media">
        ${et ? `<span class="tag ${et.clase}">${et.texto}</span>` : ''}
        <img class="main" src="${p.imagens[0]}" alt="${escHTML(p.titulo)}">
        ${p.imagens.length > 1 ? `<div class="thumbs">${p.imagens.map((src, i) => `<button aria-label="Foto ${i + 1}" aria-pressed="${i === 0}" data-src="${src}"><img src="${src}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>` : ''}
      </div>
      <div class="sheet-info">
        <span class="eyebrow">${escHTML(CATEGORIAS[p.cat].nombre)}${p.marca && p.marca !== 'Otras marcas' ? ' · ' + escHTML(p.marca) : ''}</span>
        <h2>${escHTML(p.titulo)}</h2>
        <div class="buy">
          <div class="buy-price">
            ${p.precioAntes > p.precio ? `<span class="price-old">${formatoCOP(p.precioAntes)}</span>` : ''}
            <span class="price">${formatoCOP(p.precio)}</span>
          </div>
          <div class="sheet-actions">
            <button class="btn btn-primary" data-add="${p.id}" ${p.disponible ? '' : 'disabled'}>${icon('cart')} ${p.disponible ? 'Agregar al carrito' : 'Agotado'}</button>
            <button class="icon-btn fav fav-lg" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${isFav(p.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}">${icon('heart')}</button>
          </div>
        </div>
        <p class="desc">${escHTML(p.descripcion)}</p>
        ${window.sheetSpecs ? window.sheetSpecs(p) : ''}
        ${window.sheetExtra ? window.sheetExtra(p) : ''}
        <a class="btn btn-ghost sheet-cat" href="${CATEGORIAS[p.cat].pagina}">Ver ${escHTML(CATEGORIAS[p.cat].nombre)}</a>
      </div>`;
    $('.sheet-close', sheet).onclick = closeSheet;
    $$('[data-rel]', sheet).forEach(b => b.onclick = () => openSheet(b.dataset.rel));
    $$('.thumbs button', sheet).forEach(b => b.onclick = () => {
      $('.main', sheet).src = b.dataset.src;
      $$('.thumbs button', sheet).forEach(x => x.setAttribute('aria-pressed', x === b));
    });
    sheet.style.transform = '';
    sheet.classList.add('open'); scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (!reduce) sheet.animate(sheetFrames(), { duration: 480, easing: EASE });
    $('.sheet-close', sheet).focus({ preventScroll: true });
  }

  function sheetFrames() {
    if (mobile()) return [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }];
    const fin = 'translate(-50%, -50%) scale(1)';
    if (!lastCard || !lastCard.isConnected) return [{ transform: 'translate(-50%, -48%) scale(0.96)', opacity: 0 }, { transform: fin, opacity: 1 }];
    const r = lastCard.getBoundingClientRect(), s = sheet.getBoundingClientRect();
    const dx = r.left + r.width / 2 - innerWidth / 2, dy = r.top + r.height / 2 - innerHeight / 2;
    return [{ transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${r.width / s.width})`, opacity: 0.4, borderRadius: '28px' }, { transform: fin, opacity: 1 }];
  }

  function closeSheet() {
    if (!sheet || !sheet.classList.contains('open')) return;
    scrim.classList.remove('open');
    const done = () => { sheet.classList.remove('open'); sheet.style.transform = ''; document.body.style.overflow = ''; if (lastCard) lastCard.focus({ preventScroll: true }); };
    if (reduce) return done();
    const f = sheetFrames().reverse();
    if (mobile()) f[0] = { transform: sheet.style.transform || 'translateY(0)' };
    sheet.animate(f, { duration: 320, easing: EASE, fill: 'forwards' }).onfinish = e => { e.target.cancel(); done(); };
  }

  /* =========================================================
     15. CARRITO LATERAL
     ========================================================= */
  let drawer, favs, undo = null;
  const FREE = 1500000;   // envío gratis desde este valor (igual que en el asistente)
  function buildDrawer() {
    drawer = document.createElement('aside');
    drawer.className = 'drawer glass'; drawer.setAttribute('aria-label', 'Carrito');
    drawer.innerHTML = `
      <div class="drawer-head"><h2>Tu carrito</h2><button class="icon-btn" data-close-drawer aria-label="Cerrar carrito">${icon('x')}</button></div>
      <div class="drawer-list"></div>
      <div class="drawer-foot">
        <div class="ship" hidden><span data-ship></span><div class="ship-bar"><i></i></div></div>
        <div class="total"><span>Subtotal</span><b data-total>$ 0</b></div>
        <a class="btn btn-primary" href="carrito.html">Ir a pagar ${icon('arrow')}</a>
      </div>`;
    document.body.appendChild(drawer);
    drawer.addEventListener('click', e => {
      const b = e.target.closest('[data-q]'); if (!b) return;
      const c = readCart(), i = +b.dataset.i, it = c[i]; if (!it) return;
      const prev = it.cantidad; it.cantidad += +b.dataset.q;
      if (it.cantidad <= 0) {
        c.splice(i, 1); undo = { it: { ...it, cantidad: prev }, i };
        toast(`Producto quitado <button class="toast-btn" data-undo>Deshacer</button>`, 4500);
      }
      writeCart(c); renderDrawer(); updateBadges(true);
    });
  }
  function renderDrawer() {
    if (!drawer) buildDrawer();
    const c = readCart();
    const total = c.reduce((s, p) => s + precioNum(p.precio) * (p.cantidad || 1), 0);
    $('.drawer-list', drawer).innerHTML = c.length ? c.map((p, i) => `
      <div class="line">
        <img src="${escHTML(p.imagen || '')}" alt="" loading="lazy" decoding="async">
        <div><b>${escHTML(p.titulo)}</b><small>${formatoCOP(precioNum(p.precio))}</small></div>
        <div class="line-act">
          <div class="stepper">
            <button data-q="-1" data-i="${i}" aria-label="Quitar uno">${icon('minus')}</button>
            <span>${p.cantidad}</span>
            <button data-q="1" data-i="${i}" aria-label="Agregar uno">${icon('plus')}</button>
          </div>
          <button class="icon-btn trash" data-q="-9999" data-i="${i}" aria-label="Quitar del carrito">${icon('trash')}</button>
        </div>
      </div>`).join('') : `<div class="empty">${icon('cart')}<p>Tu carrito está vacío.</p></div>`;
    tween($('[data-total]', drawer), total, formatoCOP);
    const left = Math.max(0, FREE - total);
    $('.ship', drawer).hidden = !c.length;
    $('[data-ship]', drawer).innerHTML = left ? `Te faltan <b>${formatoCOP(left)}</b> para el envío gratis` : `${icon('check')} ¡Tu envío es gratis!`;
    $('.ship-bar i', drawer).style.width = Math.min(100, total / FREE * 100) + '%';
  }

  /* ---------- Favoritos: corazón en cada producto + panel lateral ---------- */
  function paintFavs() {
    const f = readFavs();
    $$('[data-fav]').forEach(b => { const on = f.includes(b.dataset.fav); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Guardar en favoritos'); });
    $$('.fav-badge').forEach(b => { b.textContent = f.length; b.classList.toggle('on', f.length > 0); });
  }
  function toggleFav(id, btn) {
    const f = readFavs(), i = f.indexOf(id);
    i < 0 ? f.unshift(id) : f.splice(i, 1);
    writeList('favoritos', f); paintFavs();
    if (btn && i < 0 && !reduce) btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 420, easing: EASE });
    if (favs?.classList.contains('open')) renderFavs();
  }
  function renderFavs() {
    if (!favs) {
      favs = document.createElement('aside'); favs.className = 'drawer glass'; favs.setAttribute('aria-label', 'Favoritos');
      favs.innerHTML = `<div class="drawer-head"><h2>Tus favoritos</h2><button class="icon-btn" data-close-drawer aria-label="Cerrar favoritos">${icon('x')}</button></div><div class="drawer-list"></div>`;
      document.body.appendChild(favs);
    }
    const list = readFavs().map(byId).filter(Boolean);
    $('.drawer-list', favs).innerHTML = list.length ? list.map(p => `
      <div class="line">
        <img src="${p.imagens[0]}" alt="" loading="lazy" decoding="async">
        <div><b>${escHTML(p.titulo)}</b><small>${formatoCOP(p.precio)}</small></div>
        <div class="line-act">
          <button class="add" data-add="${p.id}" ${p.disponible ? '' : 'disabled'} aria-label="${p.disponible ? 'Agregar al carrito' : 'Agotado'}">${icon(p.disponible ? 'plus' : 'x')}</button>
          <button class="icon-btn fav" data-fav="${p.id}" aria-pressed="true" aria-label="Quitar de favoritos">${icon('heart')}</button>
        </div>
      </div>`).join('') : `<div class="empty">${icon('heart')}<p>Aún no tienes favoritos.<br>Toca el corazón de un producto para guardarlo.</p></div>`;
  }
  const overlay = () => { if (!scrim) buildSheet(); scrim.classList.add('open'); scrim.onclick = closeDrawer; };
  const openDrawer = () => { renderDrawer(); favs?.classList.remove('open'); drawer.classList.add('open'); overlay(); };
  const openFavs = () => { renderFavs(); drawer?.classList.remove('open'); favs.classList.add('open'); overlay(); };
  const closeDrawer = () => { drawer?.classList.remove('open'); favs?.classList.remove('open'); scrim.classList.remove('open'); scrim.onclick = closeSheet; };

  window.guardarFavorito = id => { if (!isFav(id)) toggleFav(id); };

  /* ---------- Pie de página único: se escribe aquí y sale igual en todas las páginas ---------- */
  function buildFooter() {
    const f = $('.footer'); if (!f) return;
    const cats = ['campo', 'agua', 'fumigacion', 'energia', 'construccion', 'ferreteria'].map(c => `<li><a href="${CATEGORIAS[c].pagina}">${CATEGORIAS[c].nombre}</a></li>`).join('');
    f.innerHTML = `
    <div class="wrap footer-grid">
      <div>
        <a class="brand" href="UNICORN.html"><img src="https://agro.unicorn.com.co/web/image/16724/20200424%20auls_planobordeazul_v1.png" alt=""><span>AGRO UNICORN</span></a>
        <p>Maquinaria de calidad para el campo colombiano desde 1995.</p>
        <div class="social">
          <a href="https://www.facebook.com/agrounicorn.bogota" target="_blank" rel="noopener" aria-label="Facebook"><i data-i="fb"></i></a>
          <a href="https://www.instagram.com/agro_unicorn" target="_blank" rel="noopener" aria-label="Instagram"><i data-i="ig"></i></a>
          <a href="https://www.tiktok.com/@agro_unicorn" target="_blank" rel="noopener" aria-label="TikTok"><i data-i="tt"></i></a>
          <a href="https://www.youtube.com/@agro-unicorn" target="_blank" rel="noopener" aria-label="YouTube"><i data-i="yt"></i></a>
        </div>
      </div>
      <div><h4>Productos</h4><ul>${cats}</ul></div>
      <div><h4>Empresa</h4><ul><li><a href="nosotros.html">Sobre nosotros</a></li><li><a href="nosotros.html#trabaja">Trabaja con nosotros</a></li></ul></div>
      <div><h4>Soporte</h4><ul><li><a href="soporte.html#garantia">Garantía</a></li><li><a href="soporte.html#manuales">Manuales</a></li></ul></div>
    </div>
    <div class="wrap" style="margin-top:32px">© 2026 UNICORN. Todos los derechos reservados.</div>`;
    hydrateIcons(f);
  }

  /* ---------- Vistos recientemente (arriba del pie de página) ---------- */
  function renderVistos() {
    const foot = $('.footer');
    if (!foot || $('.checkout') || $('.vistos') || !$('[data-vistos]')) return;   // solo en la página de productos
    const list = readList('vistos').map(byId).filter(Boolean).slice(0, 10);
    if (!list.length) return;
    const sec = mk(`<section class="section vistos"><div class="wrap"><div class="section-head reveal"><span class="eyebrow">Para ti</span><h2 class="h-section">Vistos recientemente.</h2></div><div class="rail" aria-label="Vistos recientemente">${list.map(card).join('')}</div></div></section>`);
    foot.before(sec); window.mount(sec);
  }

  /* =========================================================
     14. BUSCADOR TIPO SPOTLIGHT
     ========================================================= */
  let spot, sel = 0, hits = [];
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function buildSpot() {
    spot = document.createElement('div'); spot.className = 'spot glass'; spot.setAttribute('role', 'dialog'); spot.setAttribute('aria-label', 'Buscar productos');
    spot.innerHTML = `
      <label class="spot-field">${icon('search')}<span class="sr-only">Buscar</span>
        <input type="search" placeholder="Busca entre ${CATALOGO.length} productos…" autocomplete="off" role="combobox" aria-controls="spotList" aria-expanded="true"></label>
      <ul class="spot-results" id="spotList" role="listbox"></ul>
      <div class="spot-hint">↑ ↓ para moverte · Enter para abrir · Esc para cerrar</div>`;
    document.body.appendChild(spot);
    const input = $('input', spot);
    input.addEventListener('input', () => { sel = 0; search(input.value); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, hits.length - 1); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
      else if (e.key === 'Enter' && hits[sel]) { closeSpot(); openSheet(hits[sel].id); }
    });
    $('.spot-results', spot).addEventListener('click', e => { const li = e.target.closest('li'); if (li) { closeSpot(); openSheet(li.dataset.id); } });
  }
  function search(q) {
    const t = norm(q.trim());
    hits = t ? CATALOGO.filter(p => norm(`${p.titulo} ${p.marca} ${p.tipo}`).includes(t)).slice(0, 8)
             : CATALOGO.filter(p => etiquetaDe(p) && p.disponible).slice(0, 6);
    paint(t);
  }
  function paint(t) {
    $('.spot-results', spot).innerHTML = hits.length ? hits.map((p, i) => `
      <li role="option" aria-selected="${i === sel}" data-id="${p.id}">
        <img src="${p.imagens[0]}" alt="">
        <div><b>${escHTML(p.titulo)}</b><small>${escHTML(CATEGORIAS[p.cat].nombre)}${window.piezasDe && window.piezasDe(p).length ? ' · ' + window.piezasDe(p).length + ' piezas compatibles' : ''}</small></div>
        <span class="p">${formatoCOP(p.precio)}</span>
      </li>`).join('') : '<li aria-disabled="true"><span></span><div><b>Sin resultados</b><small>Prueba con "motosierra", "Stihl" o "filtro"</small></div></li>';
  }
  function openSpot() {
    if (!spot) buildSpot();
    if (!scrim) buildSheet();
    spot.classList.add('open'); scrim.classList.add('open'); scrim.onclick = closeSpot;
    const input = $('input', spot); input.value = ''; search(''); setTimeout(() => input.focus(), 50);
  }
  function closeSpot() { spot.classList.remove('open'); scrim.classList.remove('open'); scrim.onclick = closeSheet; }

  /* =========================================================
     11. CARRUSEL ARRASTRABLE (con inercia, puntos y avance solo)
     ========================================================= */
  window.makeRail = (rail, dotsEl, prev, next) => {
    const step = () => (rail.firstElementChild?.offsetWidth || 280) + 20;
    const pages = () => Math.max(1, Math.ceil((rail.scrollWidth - rail.clientWidth) / step()) + 1);
    const paintDots = () => {
      const n = Math.min(pages(), 10), cur = Math.round(rail.scrollLeft / step());
      dotsEl.innerHTML = Array.from({ length: n }, (_, i) => `<span class="${i === Math.min(cur, n - 1) ? 'on' : ''}"></span>`).join('');
    };
    const go = d => {
      const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      if (d > 0 && end) rail.scrollTo({ left: 0, behavior: 'smooth' });
      else rail.scrollBy({ left: d * step(), behavior: reduce ? 'auto' : 'smooth' });
    };
    prev.onclick = () => go(-1); next.onclick = () => go(1);
    rail.addEventListener('scroll', () => requestAnimationFrame(paintDots), { passive: true });
    // arrastre con mouse (en celular ya es nativo)
    let x0, s0, v = 0, lastX, lastT, moved = false, pid;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; x0 = lastX = e.clientX; s0 = rail.scrollLeft; lastT = performance.now(); moved = false; pid = e.pointerId; });
    rail.addEventListener('pointermove', e => {
      if (x0 == null) return;
      // capturar solo al arrastrar: si no, el clic de la tarjeta se lo queda el carrusel
      if (!moved && Math.abs(e.clientX - x0) > 5) { moved = true; rail.classList.add('dragging'); rail.setPointerCapture(pid); }
      if (!moved) return;
      rail.scrollLeft = s0 - (e.clientX - x0);
      const t = performance.now(); v = (e.clientX - lastX) / Math.max(1, t - lastT); lastX = e.clientX; lastT = t;
    });
    const end = () => {
      if (x0 == null) return; x0 = null;
      if (!moved) { rail.classList.remove('dragging'); return; }
      let vel = -v * 16;
      const glide = () => { rail.scrollLeft += vel; vel *= 0.92; if (Math.abs(vel) > 0.5) requestAnimationFrame(glide); else rail.classList.remove('dragging'); };
      reduce ? rail.classList.remove('dragging') : requestAnimationFrame(glide);
    };
    rail.addEventListener('pointerup', end); rail.addEventListener('pointercancel', end);
    rail.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    let paused = false;
    ['pointerenter', 'focusin', 'touchstart'].forEach(ev => rail.addEventListener(ev, () => paused = true, { passive: true }));
    ['pointerleave', 'focusout'].forEach(ev => rail.addEventListener(ev, () => paused = false));
    let seen = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => seen = es[0].isIntersecting).observe(rail);
    if (!reduce) setInterval(() => { if (!paused && seen && !document.hidden) go(1); }, 3500);
    paintDots(); addEventListener('resize', paintDots);
  };

  /* =========================================================
     LUZ AMBIENTE (el color de cada categoría sigue al mouse)
     ========================================================= */
  const AMB = { campo: '46, 125, 50', agua: '0, 119, 182', energia: '255, 183, 3', fumigacion: '157, 78, 221', construccion: '230, 57, 70', ferreteria: '127, 140, 141', accesorios: '0, 137, 123', lubricantes: '245, 124, 0', repuestos: '57, 73, 171', piezas: '0, 137, 123', marca: '245, 124, 0' };
  window.AMB = AMB;
  let ambEl, ambBase = null;
  const ambLayer = () => { if (!ambEl) { ambEl = document.createElement('div'); ambEl.className = 'ambient'; ambEl.setAttribute('aria-hidden', 'true'); document.body.prepend(ambEl); } return ambEl; };
  window.setAmbient = key => {
    const el = ambLayer(), rgb = AMB[key];
    if (rgb) { el.style.setProperty('--amb', rgb); el.classList.add('on'); } else el.classList.remove('on');
  };
  window.baseAmbient = key => { ambBase = key; setAmbient(key); };
  let mq = false;
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || mq) return;
    mq = true;
    requestAnimationFrame(() => {
      mq = false;
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
      // brillo local dentro de tarjetas, mosaicos y cuadros
      const g = e.target.closest && e.target.closest('.glow');
      if (g) { const r = g.getBoundingClientRect(); g.style.setProperty('--gx', e.clientX - r.left + 'px'); g.style.setProperty('--gy', e.clientY - r.top + 'px'); }
    });
  }, { passive: true });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest && e.target.closest('[data-amb]');
    if (t) setAmbient(t.dataset.amb);
  });
  document.addEventListener('pointerout', e => {
    const t = e.target.closest && e.target.closest('[data-amb]');
    if (t && !t.contains(e.relatedTarget)) setAmbient(ambBase);
  });

  /* Marcas aliadas: cinta que avanza sola en ciclo y se detiene al pasar el mouse */
  window.makeMarquee = track => {
    track.innerHTML += track.innerHTML; // dos copias para que el ciclo no tenga salto
    let x = 0, paused = false, last = performance.now(), seen = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => seen = es[0].isIntersecting).observe(track.parentElement);
    track.parentElement.addEventListener('pointerenter', () => paused = true);
    track.parentElement.addEventListener('pointerleave', () => paused = false);
    const loop = t => {
      const dt = Math.min(64, t - last); last = t;
      if (!paused && seen && !document.hidden) {
        x -= dt * 0.05; // 50 px por segundo
        const half = track.scrollWidth / 2;
        if (half && -x >= half) x += half;
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  /* =========================================================
     ACORDEÓN DE CATEGORÍAS
     Se abre la tarjeta que tiene el mouse; al salir espera un momento antes
     de cerrarse, para que pasar por el espacio entre tarjetas no dé saltos.
     ========================================================= */
  window.makeAccordion = acc => {
    const cards = [...acc.children];
    acc.style.setProperty('--n', cards.length);
    let t;
    const set = i => {
      clearTimeout(t);
      if (matchMedia('(max-width: 860px)').matches) return;
      cards.forEach((c, k) => c.classList.toggle('active', k === i));
      acc.classList.toggle('has-active', i >= 0);
      acc.style.gridTemplateColumns = i < 0 ? '' : cards.map((_, k) => k === i ? '3.2fr' : '1fr').join(' ');
    };
    cards.forEach((c, i) => { c.addEventListener('pointerenter', () => set(i)); c.addEventListener('focus', () => set(i)); });
    acc.addEventListener('pointerleave', () => { t = setTimeout(() => set(-1), 260); });
    acc.addEventListener('focusout', e => { if (!acc.contains(e.relatedTarget)) set(-1); });
  };

  /* =========================================================
     Arranque
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    hydrateIcons();
    buildFooter();
    setTheme(dark);
    // corazón de favoritos junto al carrito (en todas las páginas)
    $$('.header-actions').forEach(h => h.insertBefore(mk(`<button class="icon-btn fav-btn" data-open-favs aria-label="Ver favoritos">${icon('heart')}<span class="badge fav-badge">0</span></button>`), $('.cart-btn', h)));
    paintFavs(); renderVistos();
    updateBadges(false);
    reveal();
    wireImages();

    // 1. el menú se achica al bajar
    const header = $('.site-header');
    // barra de avance de lectura
    const bar = mk('<div class="progress" aria-hidden="true"></div>'); document.body.prepend(bar);
    const onScroll = () => {
      const y = scrollY;
      header && header.classList.toggle('is-scrolled', y > 24);
      bar.style.transform = `scaleX(${Math.min(1, y / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // el título de la portada aparece palabra por palabra
    const h1 = $('.hp h1');
    if (h1 && !reduce) {
      let n = 0;
      const split = node => [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) c.replaceWith(...c.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? document.createTextNode(w) : mk(`<span class="w" style="--w:${n++}">${w}</span>`)));
        else if (c.nodeType === 1) split(c);
      });
      split(h1); h1.classList.remove('reveal'); h1.classList.add('words');
    }

    // las páginas se cargan por adelantado al apuntar a un enlace
    const pre = new Set();
    const prefetch = e => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || a.origin !== location.origin || a.hash || pre.has(a.href)) return;
      pre.add(a.href); document.head.append(Object.assign(document.createElement('link'), { rel: 'prefetch', href: a.href }));
    };
    document.addEventListener('pointerover', prefetch, { passive: true }); document.addEventListener('touchstart', prefetch, { passive: true });

    // un solo manejador para todos los clics
    document.addEventListener('click', e => {
      const t = e.target;
      const fav = t.closest('[data-fav]');
      if (fav) { e.stopPropagation(); toggleFav(fav.dataset.fav, fav); return; }
      if (t.closest('[data-undo]')) {
        if (undo) { const c = readCart(); c.splice(Math.min(undo.i, c.length), 0, undo.it); writeCart(c); undo = null; renderDrawer(); updateBadges(true); toastEl.classList.remove('show'); }
        return;
      }
      const add = t.closest('[data-add]');
      if (add) { e.stopPropagation(); const cardImg = add.closest('.card, .sheet, .line')?.querySelector('.card-media img, .sheet-media img.main, .line img'); addToCart(add.dataset.add, cardImg); return; }
      if (t.closest('.theme-btn')) { dark = !dark; setTheme(dark); return; }
      if (t.closest('[data-open-cart]')) { e.preventDefault(); openDrawer(); return; }
      if (t.closest('[data-open-favs]')) { e.preventDefault(); openFavs(); return; }
      if (t.closest('[data-close-drawer]')) { closeDrawer(); return; }
      if (t.closest('[data-open-search]')) { e.preventDefault(); openSpot(); return; }
      if (t.closest('.fab')) { window.toggleChat && toggleChat(); return; }   // el chat vive en asistente.js
      const c = t.closest('.card[data-id]');
      if (c) openSheet(c.dataset.id, c);
    });
    document.addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); openSpot(); }
      else if (e.key === 'Escape') { if (spot?.classList.contains('open')) closeSpot(); else if (drawer?.classList.contains('open') || favs?.classList.contains('open')) closeDrawer(); else closeSheet(); }
      else if (e.key === 'Enter' && document.activeElement?.matches('.card[data-id]')) openSheet(document.activeElement.dataset.id, document.activeElement);
    });
  });
})();

// luz de fondo que sigue el scroll (html::before en estilo.css): una actualización por cuadro, no por evento
(() => { let q = 0; addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(() => { q = 0; document.documentElement.style.setProperty('--sy', scrollY); }); }, { passive: true }); })();

/* ===== Liquid glass: píldora del menú, brillo y tilt con el mouse, lupa del producto ===== */
(() => {
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches, calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pill(bar, sel) {            // píldora que se desliza hacia el enlace apuntado o activo
    if (!bar || calm) return;
    const p = Object.assign(document.createElement('i'), { className: 'lg-pill', ariaHidden: 'true' }); bar.prepend(p); bar.classList.add('has-pill');
    const go = a => { if (!a) { p.classList.remove('on'); return; } const r = a.getBoundingClientRect(), b = bar.getBoundingClientRect();
      p.style.cssText = `width:${r.width}px;height:${r.height}px;transform:translate(${r.left - b.left}px,${r.top - b.top}px)`; p.classList.add('on'); };
    const home = () => go(bar.querySelector('[aria-current="page"]'));
    bar.addEventListener('pointerover', e => go(e.target.closest(sel)));
    bar.addEventListener('pointerleave', home); addEventListener('resize', home); home(); setTimeout(home, 400);
  }
  function glow() {
    if (!fine || calm) return;
    document.querySelectorAll('.card,.tile,.cat-card,.feature,.quote,.panel-box').forEach(el => {
      if (el.querySelector(':scope>.sheen')) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.append(Object.assign(document.createElement('i'), { className: 'sheen', ariaHidden: 'true' }));
    });
  }
  const tiltable = '.card,.tile,.cat-card,.feature,.quote';
  document.addEventListener('pointermove', e => {
    if (!fine || calm) return;
    const el = e.target.closest?.('.card,.tile,.cat-card,.feature,.quote,.panel-box'); if (!el) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
    if (el.matches(tiltable)) { el.classList.add('tilting'); el.style.setProperty('--ry', (x - .5) * 7 + 'deg'); el.style.setProperty('--rx', (.5 - y) * 7 + 'deg'); }
  }, { passive: true });
  document.addEventListener('pointerout', e => { const el = e.target.closest?.(tiltable); if (el && !el.contains(e.relatedTarget)) { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); } }, { passive: true });
  // lupa en la ficha del producto
  document.addEventListener('pointermove', e => { const m = e.target.closest?.('.sheet-media'); if (!m || !fine) return; const r = m.getBoundingClientRect();
    m.style.setProperty('--zx', (e.clientX - r.left) / r.width * 100 + '%'); m.style.setProperty('--zy', (e.clientY - r.top) / r.height * 100 + '%'); m.classList.add('zoom'); }, { passive: true });
  document.addEventListener('pointerout', e => { const m = e.target.closest?.('.sheet-media'); if (m && !m.contains(e.relatedTarget)) m.classList.remove('zoom'); }, { passive: true });
  document.addEventListener('DOMContentLoaded', () => {
    pill(document.querySelector('.nav'), 'a'); pill(document.querySelector('.tabbar'), 'a,button'); glow();
    // las tarjetas se pintan después (catálogo): se les agrega el brillo cuando aparecen
    new MutationObserver(() => glow()).observe(document.body, { childList: true, subtree: true });
  });
})();


/* ===== Mi equipo + piezas relacionadas (lo usan la ficha del producto y las páginas de piezas) ===== */
(() => {
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const PZ = ['accesorios', 'lubricantes', 'repuestos'];
  const grupo = t => /^fumigadora/i.test(t) ? 'Fumigadora' : t;
  // tipo de máquina → etiquetas de compatibilidad del catálogo (y qué piezas suelen ir con ella)
  const MAQ = {
    Motosierra: [['motosierras', 'motores 2t'], ['Cadena', 'Aceite', 'Lima', 'Bujía', 'Protección personal (EPP)']],
    'Guadañadora': [['guadañadoras', 'motores 2t'], ['Nylon', 'Aceite', 'Arnés', 'Bujía', 'Polycut']],
    Sopladora: [['motores 2t'], ['Aceite', 'Bujía', 'Filtro']],
    Cortasetos: [['motores 2t'], ['Aceite', 'Bujía', 'Cuchilla']],
    Fumigadora: [['fumigadoras'], ['Manguera', 'Lanza', 'Pistola', 'Boquilla']],
    Generador: [['motores 4t y generadores'], ['Aceite', 'Bujía', 'Filtro']],
    Motobomba: [['bombas de agua', 'motores 4t y generadores'], ['Válvula', 'Manguera', 'Acople', 'Aceite']],
    Electrobomba: [['bombas de agua'], ['Válvula', 'Manguera', 'Acople']],
    Motoazada: [['motores 4t y generadores'], ['Aceite', 'Bujía', 'Filtro']],
    'Cortacésped': [['motores 4t y generadores'], ['Aceite', 'Bujía', 'Filtro']],
    Ahoyador: [['motores 2t'], ['Aceite', 'Bujía', 'Filtro']],
    'Cerca eléctrica': [['cercas eléctricas'], []]
  };
  const PAIRS = { 'Bujía': ['Filtro', 'Aceite'], Filtro: ['Bujía', 'Aceite'], Aceite: ['Filtro', 'Bujía'], Grasa: ['Filtro'], Cadena: ['Lima', 'Espada', 'Aceite'], Espada: ['Cadena', 'Lima'], Lima: ['Cadena', 'Aceite'], Nylon: ['Carretel', 'Polycut', 'Cuchilla'], Polycut: ['Nylon', 'Disco'], Disco: ['Polycut', 'Nylon'], Cuchilla: ['Disco', 'Lima'], Carretel: ['Nylon'], Manguera: ['Lanza', 'Pistola', 'Boquilla'], Lanza: ['Manguera', 'Boquilla'], Boquilla: ['Lanza', 'Manguera'], 'Válvula': ['Manguera', 'Acople'], Acople: ['Manguera', 'Válvula'], 'Arnés': ['Nylon', 'Protección personal (EPP)'] };
  const KEY = 'mi-equipo';
  let eq = null; try { eq = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (eq && !MAQ[eq.tipo]) eq = null;
  const emit = () => dispatchEvent(new Event('eq-change'));
  const claves = () => (eq ? MAQ[eq.tipo][0] : []);
  const es = (p, o = eq) => { const k = o && MAQ[o.tipo] ? MAQ[o.tipo][0] : []; return !!k.length && (p.compat || []).some(c => k.includes(norm(c))); };
  let gar = []; try { gar = JSON.parse(localStorage.getItem('mi-garaje')) || []; } catch (e) {}
  const pg = () => { try { localStorage.setItem('mi-garaje', JSON.stringify(gar)); } catch (e) {} emit(); };
  const igual = (a, b) => a.tipo === b.tipo && (a.marca || '') === (b.marca || '') && (a.modelo || '') === (b.modelo || '');
  window.EQ = {
    get: () => eq,
    set(o) { eq = o; try { localStorage.setItem(KEY, JSON.stringify(eq)); } catch (e) {} emit(); },
    clear() { eq = null; try { localStorage.removeItem(KEY); } catch (e) {} emit(); },
    es, grupo, PZ,
    garaje: () => gar,
    enGaraje: () => !!eq && gar.some(g => igual(g, eq)),
    guardar() { if (eq && eq.tipo && !gar.some(g => igual(g, eq))) { gar.push({ ...eq }); pg(); } },
    quitar(i) { gar.splice(i, 1); pg(); },
    activar(i) { if (gar[i]) { eq = { ...gar[i] }; try { localStorage.setItem(KEY, JSON.stringify(eq)); } catch (e) {} emit(); } },
    score: p => (es(p) ? 10 : 0) + (eq && eq.marca && eq.marca !== 'otra' && p.marca === eq.marca ? 3 : 0),
    etiqueta(o = eq) { if (!o) return ''; const m = o.modelo && CATALOGO.find(p => p.id === o.modelo); return m ? m.titulo.split(/\s+/).slice(0, 3).join(' ') : [o.tipo, o.marca && o.marca !== 'otra' ? o.marca : ''].filter(Boolean).join(' '); },
    maquinas() {   // { tipo: { marca: [productos] } } con los equipos que vende UNICORN
      const out = {};
      CATALOGO.filter(p => !PZ.includes(p.cat) && MAQ[grupo(p.tipo)]).forEach(p => { const t = grupo(p.tipo); ((out[t] = out[t] || {})[p.marca] = out[t][p.marca] || []).push(p); });
      return out;
    },
    tipos: () => Object.keys(MAQ)
  };
  // piezas que suelen comprarse junto con este producto
  window.relacionados = p => {
    const esMaq = !PZ.includes(p.cat), m = MAQ[grupo(p.tipo)];
    const ks = esMaq ? (m ? m[0] : []) : (p.compat || []).map(norm).filter(c => c !== 'uso general');
    const pares = esMaq ? (m ? m[1] : []) : (PAIRS[p.tipo] || []);
    const ord = CATALOGO.filter(q => PZ.includes(q.cat) && q.disponible && q.id !== p.id).map(q => {
      const c = (q.compat || []).map(norm), cruza = ks.some(k => c.includes(k)), libre = c.includes('uso general');
      if (ks.length && !cruza && !libre) return [0, q];
      let s = (pares.includes(q.tipo) ? 6 : 0) + (cruza ? 4 : 0) + (q.marca === p.marca && p.marca !== 'Otras marcas' ? 2 : 0) - (q.tipo === p.tipo ? 5 : 0);
      return [s, q];
    }).filter(x => x[0] >= 4).sort((a, b) => b[0] - a[0] || a[1].precio - b[1].precio).map(x => x[1]);
    const out = [], t = new Set();
    for (const q of ord) if (out.length < 3 && !t.has(q.tipo)) { out.push(q); t.add(q.tipo); }
    return out;
  };
  // consejos generales de uso (revisar antes de publicar)
  const consejo = p => {
    if (p.tipo === 'Aceite') return /2T/i.test(p.titulo) ? 'Mezcla 2T: la proporción más usada es 50:1 (unos 20 ml de aceite por litro de gasolina). Confirma la que pide el manual de tu equipo.' : /4T/i.test(p.titulo) ? 'Aceite 4T: cámbialo con la frecuencia que indica el manual de tu equipo; es lo que más alarga la vida del motor.' : '';
    if (p.tipo === 'Filtro') return 'Un filtro sucio le quita potencia al motor y aumenta el consumo. Límpialo seguido, sobre todo si trabajas con polvo.';
    if (p.tipo === 'Bujía') return 'Revisa la bujía de vez en cuando: si está negra o con depósitos, límpiala o cámbiala.';
    if (p.tipo === 'Cadena' || p.tipo === 'Lima') return 'Una cadena bien afilada y con aceite de cadena corta más rápido y cuida la espada.';
    return '';
  };
  window.sheetExtra = p => {
    let h = '';
    if (PZ.includes(p.cat) && (p.compat || []).length) {
      const ok = es(p);
      h += `<div class="sheet-compat"><b>Compatible con</b><span class="pills">${p.compat.map(c => `<a class="pill" href="${CATEGORIAS[p.cat].pagina}?compat=${encodeURIComponent(c)}">${escHTML(c)}</a>`).join('')}</span>${ok ? `<span class="pill ok">${icon('check')} Sirve para tu equipo</span>` : ''}</div>`;
    }
    const t = consejo(p); if (t) h += `<p class="consejo">${icon('wrench')}<span><b>Consejo.</b> ${escHTML(t)}</span></p>`;
    const rel = window.relacionados(p);
    if (rel.length) h += `<div class="rel-box"><b>Se compra junto con</b>${rel.map(q => `<div class="rel"><button class="rel-open" data-rel="${q.id}"><img src="${q.imagens[0]}" alt="" loading="lazy"><span><em>${escHTML(q.titulo)}</em><small>${formatoCOP(q.precio)}</small></span></button><button class="add" data-add="${q.id}" aria-label="Agregar ${escHTML(q.titulo)}">${icon('plus')}</button></div>`).join('')}</div>`;
    if (!p.disponible) h += `<form class="aviso" data-aviso="${p.id}"><b>Agotado por ahora</b><small>Déjanos tu correo o WhatsApp y te avisamos cuando vuelva.</small><div><input type="text" inputmode="email" placeholder="correo@ejemplo.com o 300 123 4567" aria-label="Correo o WhatsApp"><button class="btn btn-primary" type="submit">Avísame</button></div><small class="aviso-msg" role="status"></small></form>`;
    const wa = `https://wa.me/${window.WA_NUM}?text=${encodeURIComponent(`Hola UNICORN, ¿esta pieza me sirve? ${p.titulo}${EQ_TXT()}`)}`;
    h += `<div class="confia"><span>${icon('shield')} Garantía UNICORN</span><span>${icon('wrench')} Asesoría técnica gratis</span><a class="btn btn-ghost" href="${wa}" target="_blank" rel="noopener">${icon('chat')} ¿Me sirve esta pieza?</a></div>`;
    return h;
  };
  window.WA_NUM = window.WA_NUM || '573237881307';
  const EQ_TXT = () => (eq ? `. Mi equipo: ${window.EQ.etiqueta()}` : '');
  // "avísame cuando vuelva": por ahora solo se guarda en este navegador (prueba)
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-aviso]'); if (!f) return; e.preventDefault();
    const v = f.querySelector('input').value.trim(), msg = f.querySelector('.aviso-msg');
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || v.replace(/\D/g, '').length === 10)) { msg.textContent = 'Escribe un correo válido o un celular de 10 dígitos.'; return; }
    try { const l = JSON.parse(localStorage.getItem('avisos')) || []; l.push({ id: f.dataset.aviso, contacto: v }); localStorage.setItem('avisos', JSON.stringify(l)); } catch (er) {}
    msg.textContent = '¡Listo! Te avisaremos (prueba: todavía no se envía).'; f.querySelector('button').disabled = true;
  });
})();


/* ===== Conexión máquinas ↔ piezas: ficha de la máquina, kit de arranque, garaje en el menú ===== */
(() => {
  const EQ = window.EQ, PZ = EQ.PZ, norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const grupo = EQ.grupo, esMaq = p => !PZ.includes(p.cat);
  const CLAVES = { Motosierra: ['motosierras', 'motores 2t'], 'Guadañadora': ['guadañadoras', 'motores 2t'], Sopladora: ['motores 2t'], Cortasetos: ['motores 2t'], Ahoyador: ['motores 2t'], Fumigadora: ['fumigadoras'], Generador: ['motores 4t y generadores'], Motobomba: ['bombas de agua', 'motores 4t y generadores'], Electrobomba: ['bombas de agua'], Motoazada: ['motores 4t y generadores'], 'Cortacésped': ['motores 4t y generadores'] };
  const has = (p, k) => (p.compat || []).some(c => norm(c) === k);
  const piezasDe = p => { const k = CLAVES[grupo(p.tipo)]; return esMaq(p) && k ? CATALOGO.filter(q => PZ.includes(q.cat) && q.disponible && (q.compat || []).some(c => k.includes(norm(c)))) : []; };
  window.piezasDe = piezasDe;
  window.piezasPill = p => { const n = piezasDe(p).length; return n ? `<button type="button" class="pz-pill" data-pzs="${p.id}">${icon('gear')} ${n} piezas compatibles</button>` : ''; };
  const pick = f => CATALOGO.filter(q => PZ.includes(q.cat) && q.disponible && f(q)).sort((x, y) => x.precio - y.precio)[0];
  const A2 = q => q.tipo === 'Aceite' && /2T/i.test(q.titulo), A4 = q => q.tipo === 'Aceite' && /4T/i.test(q.titulo), BUJ = q => q.tipo === 'Bujía', FIL = k => q => q.tipo === 'Filtro' && has(q, k);
  const KIT = {
    Motosierra: [A2, BUJ, FIL('motosierras'), q => q.tipo === 'Lima' && has(q, 'motosierras')],
    'Guadañadora': [A2, BUJ, FIL('guadañadoras'), q => q.tipo === 'Nylon'],
    Sopladora: [A2, BUJ], Cortasetos: [A2, BUJ], Ahoyador: [A2, BUJ],
    Fumigadora: [q => q.tipo === 'Manguera' && has(q, 'fumigadoras'), q => q.tipo === 'Lanza', q => q.tipo === 'Pistola'],
    Generador: [A4], Motoazada: [A4], 'Cortacésped': [A4],
    Motobomba: [A4, q => q.tipo === 'Válvula', q => q.tipo === 'Manguera', q => q.tipo === 'Acople'],
    Electrobomba: [q => q.tipo === 'Válvula', q => q.tipo === 'Manguera', q => q.tipo === 'Acople']
  };
  const kitDe = p => esMaq(p) && KIT[grupo(p.tipo)] ? KIT[grupo(p.tipo)].map(pick).filter(Boolean) : [];
  window.kitDe = kitDe;
  const kw = p => { const s = (p.specs || []).map(x => x[1]).join(' '), m = s.match(/([\d.]+)\s*kW/i), h = s.match(/([\d.]+)\s*HP/i); return m ? +m[1] : h ? +h[1] * 0.746 : 0; };
  window.potenciaDe = kw;
  const TC = {}; CATALOGO.filter(q => PZ.includes(q.cat)).forEach(q => { (TC[q.tipo] = TC[q.tipo] || {})[q.cat] = (TC[q.tipo][q.cat] || 0) + 1; });
  const catDe = t => Object.entries(TC[t] || {}).sort((x, y) => y[1] - x[1])[0]?.[0] || 'repuestos';
  const CUIDADOS = {
    Motosierra: [['Antes de cada uso', 'Revisa la tensión de la cadena y el aceite de cadena.', 'Cadena'], ['Cada tanque', 'Limpia el filtro de aire.', 'Filtro'], ['De vez en cuando', 'Revisa la bujía y afila la cadena.', 'Bujía']],
    'Guadañadora': [['Antes de cada uso', 'Revisa el hilo o la cuchilla y los tornillos.', 'Nylon'], ['Cada tanque', 'Limpia el filtro de aire.', 'Filtro'], ['De vez en cuando', 'Revisa la bujía.', 'Bujía']],
    Fumigadora: [['Después de cada uso', 'Enjuaga el tanque y las mangueras con agua limpia.', 'Manguera'], ['Periódicamente', 'Revisa la lanza y los empaques.', 'Lanza']],
    Motobomba: [['Antes de cada uso', 'Revisa el nivel de aceite y el filtro de succión.', 'Aceite'], ['De vez en cuando', 'Revisa la válvula de pie, las mangueras y la bujía.', 'Válvula']],
    Electrobomba: [['Antes de usar', 'Verifica que esté cebada y que las conexiones estén secas.', ''], ['Periódicamente', 'Limpia el filtro de succión y revisa la válvula.', 'Válvula']]
  };
  const CUID_GEN = [['Antes de cada uso', 'Revisa el nivel de aceite y de combustible.', 'Aceite'], ['Cada tanque', 'Limpia el filtro de aire.', 'Filtro'], ['De vez en cuando', 'Revisa la bujía.', 'Bujía']];
  // opcional: lo que trae la caja, por id de producto. Se muestra solo si está lleno.
  window.INCLUYE = window.INCLUYE || {};
  const uso = p => {
    const g = grupo(p.tipo), pool = CATALOGO.filter(q => q.cat === p.cat && grupo(q.tipo) === g), v = q => kw(q) || q.precio;
    if (pool.length < 3) return '';
    const o = pool.map(v).sort((x, y) => x - y), i = o.indexOf(v(p)) / (o.length - 1);
    return i < 0.34 ? 'Ideal para uso ocasional' : i < 0.67 ? 'Para uso frecuente' : 'Para trabajo intensivo';
  };
  const SPI = { '⚡': 'bolt', '⚙': 'gear', '⛽': 'oil', '🔌': 'bolt', '🐎': 'bolt', '💧': 'drop', '🧪': 'oil', '🔄': 'gear', '📏': 'sliders', '📐': 'sliders', '📡': 'sliders', '🛡': 'helmet', '⚠': 'tag', '🔋': 'bolt', '✂': 'wrench', '🚜': 'gear', '⚖': 'sliders', '💨': 'spray' };
  const specIcon = e => icon(SPI[String(e).replace(/\uFE0F/g, '')] || 'check');
  window.sheetSpecs = p => {
    if (!esMaq(p)) return p.specs.length ? `<div class="chips">${p.specs.map(([, t]) => `<span class="chip">${escHTML(t)}</span>`).join('')}</div>` : '';
    const rows = [...(p.motor ? [['⛽', 'Motor ' + p.motor.toLowerCase()]] : []), ...(p.cilindraje && !(p.specs || []).some(s => /cc/.test(s[1])) ? [['⚙️', p.cilindraje + ' cc']] : []), ...(p.specs || [])];
    return rows.length ? `<div class="spec-t glass">${rows.map(([e, t], i) => `<div class="spec" style="--i:${i}"><i>${specIcon(e)}</i><span>${escHTML(t)}</span></div>`).join('')}</div>` : '';
  };
  const mini = q => `<div class="rel"><button class="rel-open" data-rel="${q.id}"><img src="${q.imagens[0]}" alt="" loading="lazy"><span><em>${escHTML(q.titulo)}</em><small>${formatoCOP(q.precio)}</small></span></button><button class="add" data-add="${q.id}" aria-label="Agregar ${escHTML(q.titulo)}">${icon('plus')}</button></div>`;
  const base = window.sheetExtra;
  window.sheetExtra = p => {
    if (esMaq(p)) {
      const g = grupo(p.tipo), ps = piezasDe(p), kit = kitDe(p), sim = CATALOGO.filter(q => q.cat === p.cat && q.id !== p.id && grupo(q.tipo) === g).sort((x, y) => Math.abs(x.precio - p.precio) - Math.abs(y.precio - p.precio)).slice(0, 3);
      const U = uso(p), inc = (window.INCLUYE[p.id] || p.incluye || []), cu = CLAVES[g] ? (CUIDADOS[g] || CUID_GEN) : null;
      let h = `<div class="maq-top">${U ? `<span class="pill uso">${icon('check')} ${U}</span>` : ''}${CLAVES[g] ? `<button class="btn btn-ghost mi-maq" data-mimaq="${p.id}">${icon('wrench')} Esta es mi máquina</button>` : ''}</div>`;
      if (ps.length) {
        const por = c => ps.filter(q => q.cat === c).sort((x, y) => (EQ.score(y) - EQ.score(x)) || x.precio - y.precio);
        const tabs = PZ.map(c => [c, por(c)]).filter(([, l]) => l.length);
        h += `<div class="ptabs" data-p="${p.id}"><b>Piezas para esta máquina <small>(${ps.length})</small></b><div class="seg" role="tablist">${tabs.map(([c, l], i) => `<button type="button" role="tab" data-ptab="${c}" aria-pressed="${i === 0}">${CATEGORIAS[c].nombre} <small>${l.length}</small></button>`).join('')}</div>${tabs.map(([c, l], i) => `<div class="ptab" data-pc="${c}" ${i ? 'hidden' : ''}>${l.slice(0, 5).map(mini).join('')}<a class="link" href="${CATEGORIAS[c].pagina}?mi=1" data-eqset="${p.id}">Ver las ${l.length} de ${CATEGORIAS[c].nombre.toLowerCase()} →</a></div>`).join('')}</div>`;
      }
      if (kit.length >= 2) h += `<div class="kit-a" data-m="${p.id}"><b>Arranca con todo</b><small>Marca lo que quieras llevar con la máquina.</small>${kit.map(q => `<label class="kit-r"><input type="checkbox" checked data-kp="${q.precio}" value="${q.id}"><img src="${q.imagens[0]}" alt=""><span>${escHTML(q.titulo)}</span><b>${formatoCOP(q.precio)}</b></label>`).join('')}<div class="kit-tot"><span>Máquina + kit <b data-kt>${formatoCOP(p.precio + kit.reduce((s, q) => s + q.precio, 0))}</b></span><button class="btn btn-primary" data-kitadd>Agregar todo ${icon('plus')}</button></div></div>`;
      if (cu) h += `<details class="cuid fold"><summary>Cuidados y mantenimiento</summary><small>Pautas generales; el manual de tu equipo manda.</small>${cu.map(([c, t, tp]) => `<div class="cuid-r"><em>${c}</em><span>${t}${tp ? ` <a class="link" href="${CATEGORIAS[catDe(tp)].pagina}?tipo=${encodeURIComponent(tp)}&mi=1" data-eqset="${p.id}">Ver ${tp.toLowerCase()}</a>` : ''}</span></div>`).join('')}</details>`;
      if (inc.length) h += `<details class="incl fold"><summary>Qué incluye</summary><ul>${inc.map(x => `<li>${icon('check')} ${escHTML(x)}</li>`).join('')}</ul></details>`;
      if (sim.length) h += `<details class="rel-box fold"><summary>Quienes vieron esto también vieron</summary>${sim.map(mini).join('')}</details>`;
      const wa = `https://wa.me/${window.WA_NUM}?text=${encodeURIComponent(`Hola UNICORN, ¿esta máquina me sirve para mi trabajo? ${p.titulo}`)}`;
      return h + `<div class="confia"><span>${icon('shield')} Garantía UNICORN</span><span>${icon('wrench')} Soporte técnico</span><span>${icon('truck')} Envío a todo el país</span><a class="btn btn-ghost" href="${wa}" target="_blank" rel="noopener">${icon('chat')} Hablar con un asesor</a></div>`;
    }
    // pieza: a qué máquinas les sirve
    const ks = (p.compat || []).map(norm).filter(c => c !== 'uso general'), seen = new Set();
    const maq = ks.length ? CATALOGO.filter(q => esMaq(q) && CLAVES[grupo(q.tipo)] && CLAVES[grupo(q.tipo)].some(c => ks.includes(c))).filter(q => !seen.has(grupo(q.tipo)) && seen.add(grupo(q.tipo))).slice(0, 4) : [];
    return (base ? base(p) : '') + (maq.length ? `<div class="rel-box"><b>Para estas máquinas</b>${maq.map(q => `<div class="rel"><button class="rel-open" data-rel="${q.id}"><img src="${q.imagens[0]}" alt="" loading="lazy"><span><em>${escHTML(q.titulo)}</em><small>${formatoCOP(q.precio)}</small></span></button></div>`).join('')}</div>` : '');
  };
  // acciones: pestañas, kit, "esta es mi máquina", píldora de la tarjeta, enlaces que fijan el equipo
  const setEq = id => { const p = CATALOGO.find(x => x.id === id); EQ.set({ tipo: grupo(p.tipo), marca: p.marca, modelo: p.id }); return p; };
  const tween = (el, to) => { const from = parseInt(el.dataset.v || el.textContent.replace(/\D/g, '')) || 0, t0 = performance.now(); el.dataset.v = to; (function f(t) { const k = Math.min(1, (t - t0) / 350); el.textContent = formatoCOP(Math.round(from + (to - from) * k)); if (k < 1) requestAnimationFrame(f); })(t0); };
  document.addEventListener('click', e => {
    const t = e.target, tab = t.closest('[data-ptab]');
    if (tab) { const box = tab.closest('.ptabs'); box.querySelectorAll('[data-ptab]').forEach(b => b.setAttribute('aria-pressed', b === tab)); box.querySelectorAll('.ptab').forEach(d => d.hidden = d.dataset.pc !== tab.dataset.ptab); return; }
    const mm = t.closest('[data-mimaq]');
    if (mm) { e.stopPropagation(); const p = setEq(mm.dataset.mimaq); EQ.guardar(); mm.classList.add('done'); mm.innerHTML = icon('check') + ' Guardada en tu garaje'; mm.disabled = true; window.volarAlGaraje && window.volarAlGaraje(document.querySelector('.sheet-media img.main')); window.toast && window.toast(`${icon('check')} ${EQ.etiqueta()} en tu garaje`); return; }
    const kb = t.closest('[data-kitadd]');
    if (kb) { e.stopPropagation(); const box = kb.closest('.kit-a'), ids = [box.dataset.m, ...[...box.querySelectorAll('input:checked')].map(i => i.value)], img = document.querySelector('.sheet-media img.main'); kb.disabled = true; ids.forEach((id, i) => setTimeout(() => window.agregar(id, img), i * 220)); setTimeout(() => { kb.disabled = false; }, ids.length * 220 + 300); return; }
    const lk = t.closest('[data-eqset]'); if (lk) { setEq(lk.dataset.eqset); return; }
    const pz = t.closest('[data-pzs]');
    if (pz) { e.stopPropagation(); e.preventDefault(); setEq(pz.dataset.pzs); location.href = 'piezas-accesorios.html#finder'; }
  }, true);
  document.addEventListener('change', e => { const c = e.target.closest('[data-kp]'); if (!c) return; const box = c.closest('.kit-a'), m = CATALOGO.find(x => x.id === box.dataset.m); tween(box.querySelector('[data-kt]'), m.precio + [...box.querySelectorAll('input:checked')].reduce((s, i) => s + +i.dataset.kp, 0)); });
  // garaje en el menú
  window.volarAlGaraje = img => {
    const b = document.querySelector('.garage-btn'); if (!b) return; b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); paintGar();
    if (!img || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = img.getBoundingClientRect(), z = b.getBoundingClientRect(), f = document.createElement('img'); f.src = img.currentSrc || img.src; f.className = 'flyer'; f.alt = '';
    Object.assign(f.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' }); document.body.appendChild(f);
    f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${z.left + z.width / 2 - a.left - a.width / 2}px,${z.top + z.height / 2 - a.top - a.height / 2}px) scale(${28 / a.width})`, opacity: .2 }], { duration: 650, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => f.remove();
  };
  function paintGar() {
    const b = document.querySelector('.garage-btn'); if (!b) return; const g = EQ.garaje();
    b.querySelector('.badge').textContent = g.length; b.querySelector('.badge').hidden = !g.length;
    const pop = document.querySelector('.garage-pop'); if (!pop) return;
    pop.innerHTML = `<b>Mi garaje</b>${g.length ? g.map((m, i) => `<div class="gp-r"><button data-gp="${i}" aria-pressed="${!!EQ.get() && EQ.etiqueta(m) === EQ.etiqueta()}">${escHTML(EQ.etiqueta(m))}</button><button data-gx="${i}" aria-label="Quitar">✕</button></div>`).join('') : '<p>Aún no guardas ninguna máquina. Abre una máquina y pulsa “Esta es mi máquina”.</p>'}<a class="btn btn-primary" href="piezas-accesorios.html#finder">Ver piezas para mi equipo</a>`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.header-actions').forEach(h => h.insertBefore(Object.assign(document.createElement('div'), { className: 'garage-wrap', innerHTML: `<button class="icon-btn garage-btn" aria-label="Mi garaje" aria-expanded="false">${icon('wrench')}<span class="badge" hidden>0</span></button>` }), h.querySelector('.fav-btn') || h.querySelector('.cart-btn')));
    paintGar();
    document.addEventListener('click', e => {
      const gb = e.target.closest('.garage-btn'), pop = document.querySelector('.garage-pop');
      if (gb) { location.href = 'garaje.html'; return; }
      const gp = e.target.closest('[data-gp]'), gx = e.target.closest('[data-gx]');
      if (gp) { EQ.activar(+gp.dataset.gp); paintGar(); window.toast && window.toast(`${icon('check')} Ahora usas tu ${EQ.etiqueta()}`); return; }
      if (gx) { EQ.quitar(+gx.dataset.gx); paintGar(); return; }
      if (pop && !pop.hidden && !e.target.closest('.garage-wrap')) pop.hidden = true;
    });
    addEventListener('eq-change', paintGar);
  });
})();
