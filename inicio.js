/* =========================================================
   INICIO · interacciones de la portada y de las secciones nuevas
   (todo respeta prefers-reduced-motion y funciona sin librerías)
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
  const isDark = () => document.documentElement.classList.contains('dark-mode');
  const esc = s => (window.escHTML ? window.escHTML(s) : String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const cop = n => window.formatoCOP ? window.formatoCOP(n) : '$ ' + n;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- colores del cielo según la hora (los usan la portada y "el día") ---------- */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const B = hex(b); return '#' + hex(a).map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
  const STOPS = [[0, '#0b1030', '#1b2150'], [5, '#1b1f4b', '#ff9a5a'], [7, '#6fb7ff', '#ffe2b0'], [12, '#3a8dff', '#bfe3ff'], [16, '#4f94ec', '#ffe7bd'], [18.5, '#2b3a86', '#ff8a4c'], [20, '#0b1030', '#2a2f6b'], [24, '#0b1030', '#1b2150']];
  const sky = h => {
    h = clamp(h, 0, 24); let i = STOPS.findIndex(s => s[0] > h); if (i < 1) i = STOPS.length - 1;
    const a = STOPS[i - 1], b = STOPS[i], t = (h - a[0]) / (b[0] - a[0]);
    return [mix(a[1], b[1], t), mix(a[2], b[2], t)];
  };

  /* =========================================================
     1 · 3 · 4 · 20 — PORTADA: capas, cielo por hora, linterna, día/noche
     ========================================================= */
  function portada() {
    const hp = $('#hp'); if (!hp) return;
    const img = $('#hpImg'), lamp = $('#hpLamp');
    lamp.style.backgroundImage = `url("${img.currentSrc || img.src}")`;

    // 3 + 20 · el cielo sigue la hora real en modo claro; en modo oscuro es de noche
    const paintSky = () => {
      const d = isDark(), H = new Date(), h = H.getHours() + H.getMinutes() / 60, hh = d ? 22 : clamp(h, 5, 19.5);
      const [t, b] = sky(hh);
      hp.style.setProperty('--sk1', t); hp.style.setProperty('--sk2', b);
      hp.style.setProperty('--sk-a', d ? '.62' : (0.14 + 0.34 * clamp(Math.abs(hh - 12) / 6.5)).toFixed(2));
      hp.classList.toggle('night', d);
    };
    paintSky();
    new MutationObserver(paintSky).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // motas de polen de día · luciérnagas de noche
    $('#hpMotes').innerHTML = Array.from({ length: 18 }, () => `<i style="left:${rnd(2, 98).toFixed(1)}%;bottom:${rnd(-4, 40).toFixed(1)}%;--s:${rnd(3, 8).toFixed(1)}px;--t:${rnd(7, 15).toFixed(1)}s;--d:${(-rnd(0, 12)).toFixed(1)}s;--w:${rnd(-40, 40).toFixed(0)}px"></i>`).join('');
    $('.hp-stars').innerHTML = Array.from({ length: 46 }, () => `<i style="left:${rnd(0, 100).toFixed(1)}%;top:${rnd(0, 62).toFixed(1)}%;--s:${rnd(1, 2.6).toFixed(1)}px;--d:${rnd(0, 4).toFixed(1)}s"></i>`).join('');

    // 4 · linterna: sigue al cursor y revela la foto más viva
    let mx = 0, my = 0;
    const lampPos = () => { hp.style.setProperty('--lmx', mx.toFixed(0) + 'px'); hp.style.setProperty('--lmy', (my - Math.min(scrollY, 900) * 0.28).toFixed(0) + 'px'); };
    hp.addEventListener('pointermove', e => { const r = hp.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; hp.classList.add('lit'); lampPos(); });
    hp.addEventListener('pointerleave', () => hp.classList.remove('lit'));
    let seen = true; if ('IntersectionObserver' in window) new IntersectionObserver(e => seen = e[0].isIntersecting).observe(hp);
    addEventListener('scroll', () => { if (!seen || reduce) return; hp.style.setProperty('--sy0', Math.min(scrollY, 900) * 0.28 + 'px'); lampPos(); }, { passive: true });
  }

  /* ---------- 20 · cambio de tema como amanecer/anochecer (View Transitions) ---------- */
  function ciclo() {
    let pasar = false;
    document.addEventListener('click', e => {
      const b = e.target.closest('.theme-btn'); if (!b || pasar) return;
      if (!document.startViewTransition || reduce) return;           // sin soporte: el cambio normal de app.js
      e.stopImmediatePropagation(); e.preventDefault();
      const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
            document.documentElement.classList.add('cambiando');
      const t = document.startViewTransition(() => { pasar = true; b.click(); pasar = false; });
      t.ready.then(() => {
        document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 1000, easing: 'cubic-bezier(.5,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
      t.finished.finally(() => document.documentElement.classList.remove('cambiando'));
    }, true);
  }

  /* =========================================================
     6 · MUNDOS: cada categoría suelta sus propias partículas
     ========================================================= */
  function mundos() {
    $$('#bento .tile').forEach(t => {
      const n = { agua: 16, energia: 12, campo: 14, fumigacion: 10, ferreteria: 14, piezas: 12 }[t.dataset.amb] || 10;
      t.insertAdjacentHTML('beforeend', `<span class="fx" aria-hidden="true">${Array.from({ length: n }, () => `<i style="--x:${rnd(4, 96).toFixed(0)}%;--s:${rnd(0.6, 1.5).toFixed(2)};--d:${(-rnd(0, 3)).toFixed(2)}s;--t:${rnd(1.2, 2.6).toFixed(2)}s;--r:${rnd(-70, 70).toFixed(0)}deg"></i>`).join('')}</span>`);
    });
    if (!fine && 'IntersectionObserver' in window) {     // en celular no hay "hover": se activan al estar a la vista
      const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('fxon', e.intersectionRatio > 0.6)), { threshold: [0, 0.6] });
      $$('#bento .tile').forEach(t => io.observe(t));
    }
  }

  /* =========================================================
     7 · IMANES: los botones se inclinan hacia el cursor
     ========================================================= */
  function imanes() {
    if (!fine || reduce) return;
    const els = $$('.hp .btn, .fab, #prev, #next, #bento .go, .sedes-act .btn').map(el => (el.classList.add('mag-t'), el));
    let pend = false, ex, ey;
    addEventListener('pointermove', e => {
      ex = e.clientX; ey = e.clientY; if (pend) return; pend = true;
      requestAnimationFrame(() => {
        pend = false;
        els.forEach(el => {
          const r = el.getBoundingClientRect(); if (r.bottom < -120 || r.top > innerHeight + 120) return;
          const dx = ex - (r.left + r.width / 2), dy = ey - (r.top + r.height / 2), d = Math.hypot(dx, dy), R = 90 + Math.max(r.width, r.height) / 2;
          if (d < R) { el.style.translate = `${(dx * 0.28).toFixed(1)}px ${(dy * 0.28).toFixed(1)}px`; el._m = 1; }
          else if (el._m) { el.style.translate = ''; el._m = 0; }
        });
      });
    }, { passive: true });
  }


  /* =========================================================
     9 · ENCUENTRA TU EQUIPO — finca, casa, negocio u obra
     ========================================================= */
  const LUGARES = {
    finca: { n: 'Finca o cultivo', e: 'leaf', tam: ['Menos de 1 ha', '1 a 5 ha', 'Más de 5 ha'], jobs: [
      ['Cortar maleza', '^Guadañadora$', 'leaf'], ['Talar y podar', '^Motosierra$', 'wrench'], ['Regar o subir agua', 'bomba', 'drop'],
      ['Fumigar', '^Fumigadora', 'spray'], ['Tener energía', '^Generador$', 'bolt'], ['Preparar la tierra', '^(Motoazada|Ahoyador)$', 'leaf']] },
    casa: { n: 'Casa y jardín', e: 'home', tam: ['Menos de 100 m²', '100 a 500 m²', 'Más de 500 m²'], jobs: [
      ['Cortar el césped', '^Cortacésped$', 'leaf'], ['Podar setos y plantas', '^(Cortasetos|Podadora)$', 'sliders'], ['Soplar hojas', '^Sopladora$', 'leaf'],
      ['Lavar patio y fachada', '^Hidrolavadora$', 'drop'], ['Subir agua al tanque', '^(Electrobomba|Motobomba)$', 'drop'], ['Respaldo si se va la luz', '^Generador$', 'bolt']] },
    negocio: { n: 'Negocio o local', e: 'tag', tam: ['Local pequeño', 'Local mediano', 'Bodega o local grande'], jobs: [
      ['Respaldo de energía', '^Generador$', 'bolt'], ['Lavar fachada y andenes', '^Hidrolavadora$', 'drop'], ['Jardín y zonas verdes', '^(Cortacésped|Cortasetos)$', 'leaf'],
      ['Agua para la cisterna', '^(Electrobomba|Motobomba)$', 'drop'], ['Herramienta de taller', '^(Esmeril|Gato|Llave|Martillo)$', 'wrench']] },
    obra: { n: 'Obra o taller', e: 'hammer', tam: ['Obra pequeña', 'Obra mediana', 'Obra grande'], jobs: [
      ['Energía en la obra', '^Generador$', 'bolt'], ['Achicar agua', '^Motobomba$', 'drop'], ['Limpieza a presión', '^Hidrolavadora$', 'drop'],
      ['Herramienta de mano', '^(Martillo|Serrucho|Esmeril|Gato|Alicate / Pinza|Flexómetro)$', 'wrench']] }
  };
  const ESCALA = [0.56, 0.78, 1];

  function escena(lugar, tam, emoji, k0) {
    const k = ESCALA[tam], W = 560, H = 300, lx = 80, ly = 90, lw = 400, lh = 150;
    let dentro = '';
    if (lugar === 'finca') { const n = 4 + tam * 3; for (let i = 0; i < n; i++) { const y = ly + 12 + i * ((lh - 24) / (n - 1)); dentro += `<line x1="${lx + 12}" x2="${lx + lw - 12}" y1="${y}" y2="${y}" stroke="#5c8a2e" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round"/>`; } }
    if (lugar === 'casa') dentro = `<rect x="${lx + 24}" y="${ly + 22}" width="150" height="100" rx="6" fill="#f4e3c8"/><polygon points="${lx + 14},${ly + 26} ${lx + 99},${ly - 22} ${lx + 184},${ly + 26}" fill="#c0563b"/><rect x="${lx + 84}" y="${ly + 70}" width="30" height="52" rx="3" fill="#7a4b2a"/><circle cx="${lx + 300}" cy="${ly + 70}" r="34" fill="#4f9a3f"/><rect x="${lx + 296}" y="${ly + 96}" width="8" height="30" fill="#6b4a2b"/>`;
    if (lugar === 'negocio') dentro = `<rect x="${lx + 40}" y="${ly + 10}" width="320" height="112" rx="6" fill="#e7ecf5"/><rect x="${lx + 40}" y="${ly + 10}" width="320" height="26" fill="#f57c00"/><rect x="${lx + 70}" y="${ly + 52}" width="110" height="70" fill="#a8c8ee"/><rect x="${lx + 210}" y="${ly + 52}" width="40" height="70" fill="#7a4b2a"/><rect x="${lx + 280}" y="${ly + 52}" width="55" height="45" fill="#a8c8ee"/>`;
    if (lugar === 'obra') dentro = `<rect x="${lx + 30}" y="${ly + 100}" width="340" height="22" fill="#9aa0ab"/>${[0, 1, 2, 3].map(i => `<rect x="${lx + 50 + i * 100}" y="${ly + 10}" width="10" height="92" fill="#b7bcc6"/>`).join('')}<rect x="${lx + 46}" y="${ly + 10}" width="318" height="10" fill="#b7bcc6"/><rect x="${lx + 46}" y="${ly + 54}" width="214" height="10" fill="#b7bcc6"/><path d="M${lx + 330} ${ly + 10} V${ly - 60} H${lx + 220}" stroke="#f57c00" stroke-width="6" fill="none"/>`;
    const filas = 2 + tam, ruta = Array.from({ length: filas * 2 }, (_, i) => { const f = Math.floor(i / 2), x = (i % 2 ? lx + lw - 24 : lx + 24), y = ly + 16 + f * ((lh - 32) / Math.max(1, filas - 1)); return (i ? 'L' : 'M') + x + ' ' + y; }).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dibujo del lugar a trabajar" class="esc"><rect width="${W}" height="${H}" rx="22" fill="url(#cielo)"/><defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ff"/><stop offset="1" stop-color="#f7efe0"/></linearGradient></defs><circle cx="470" cy="46" r="22" fill="#ffd166" opacity=".9"/><rect y="236" width="${W}" height="64" fill="#9bc36b" opacity=".55"/>
      <g class="lote" style="transform-origin:${lx + lw / 2}px ${ly + lh}px;transform:scale(${k0 == null ? k : k0})" data-k="${k}"><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="14" fill="#cfe3a6" stroke="#fff" stroke-width="4"/>${dentro}
      <path d="${ruta}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2" stroke-dasharray="4 6"/>
      <g class="obrero"><circle r="19" fill="#fff" stroke="#f57c00" stroke-width="3"/>${icon(emoji).replace("<svg ", '<svg x="-11" y="-11" width="22" height="22" style="color:#c8312d" ')}<animateMotion dur="${(5 + tam * 2)}s" repeatCount="indefinite" path="${ruta}" rotate="0"/></g></g></svg>`;
  }

  function recomendar(lugar, trabajo, tam) {
    const [, re] = LUGARES[lugar].jobs[trabajo], R = new RegExp(re, 'i');
    const pz = ['accesorios', 'lubricantes', 'repuestos'], v = q => (window.potenciaDe && window.potenciaDe(q)) || q.precio;
    const pool = CATALOGO.filter(q => !pz.includes(q.cat) && q.disponible && R.test(q.tipo)).sort((a, b) => v(a) - v(b));
    if (pool.length <= 3) return pool.map((q, i) => [q, i]);
    const c = clamp(Math.round(tam / 2 * (pool.length - 1)), 1, pool.length - 2);
    return [c - 1, c, c + 1].map((i, k) => [pool[i], k]);
  }

  function buscador() {
    const box = $('#finder'); if (!box) return;
    let L = 'casa', J = 0, T = 1;
    const pintar = (soloEscena) => {
      const lg = LUGARES[L], job = lg.jobs[J];
      if (!soloEscena) {
        $('#fdPlace').innerHTML = Object.entries(LUGARES).map(([k, v]) => `<button type="button" class="opt fd-place" data-l="${k}" aria-pressed="${k === L}"><span class="fd-ic">${icon(v.e)}</span><b>${v.n}</b></button>`).join('');
        $('#fdJob').innerHTML = lg.jobs.map((j, i) => `<button type="button" class="opt" data-j="${i}" aria-pressed="${i === J}">${icon(j[2])} ${j[0]}</button>`).join('');
      }
      $('#fdTamL').textContent = lg.tam[T];
      const antes = $('#fdStage .lote'), k0 = antes ? parseFloat(antes.style.transform.replace(/[^\d.]/g, '')) : null;
      $('#fdStage').innerHTML = escena(L, T, job[2], k0);
      const lo = $('#fdStage .lote'); if (lo && k0 != null) requestAnimationFrame(() => requestAnimationFrame(() => { lo.style.transform = `scale(${lo.dataset.k})`; }));
      const rec = recomendar(L, J, T), nom = ['Para empezar', 'Recomendado', 'Más potencia'], kws = rec.map(([q]) => (window.potenciaDe && window.potenciaDe(q)) || 0), kmax = Math.max(...kws, 0);
      $('#fdSum').innerHTML = `<span class="fd-ic">${icon(job[2])}</span><span>Para <b>${esc(job[0].toLowerCase())}</b> en <b>${esc(lg.n.toLowerCase())}</b> (${esc(lg.tam[T].toLowerCase())}) te sugerimos:</span>`;
      $('#fdStage').dataset.job = job[2]; $('#fdChip').innerHTML = `${icon(lg.e)} ${esc(lg.tam[T])}`;
      $('#fdOut').innerHTML = rec.length ? rec.map(([q, k]) => `<article class="fd-c${rec.length > 1 && k === 1 ? ' top' : ''}" style="--i:${k}">${rec.length > 1 ? `<span class="fd-tag">${nom[k]}</span>` : ''}<img src="${q.imagens[0]}" alt="" loading="lazy"><div><h3>${esc(q.titulo)}</h3><b>${cop(q.precio)}</b>${kmax ? `<span class="fd-pw" title="Potencia"><i style="--w:${Math.round((kws[k] / kmax) * 100)}%"></i><small>${kws[k] ? kws[k].toFixed(1) + ' kW' : 'sin dato'}</small></span>` : ''}<div class="fd-b"><button class="btn btn-ghost" data-ver="${q.id}">Ver</button><button class="btn btn-primary" data-add="${q.id}">${icon('cart')} Agregar</button></div></div></article>`).join('')
        : '<p class="fd-none">Para esto todavía no tenemos equipos en el catálogo. Escríbenos y te asesoramos.</p>';
      const wa = `https://wa.me/${window.WA_NUM || ''}?text=${encodeURIComponent(`Hola UNICORN, necesito ${job[0].toLowerCase()} (${lg.n.toLowerCase()}, ${lg.tam[T].toLowerCase()}). ¿Qué me recomiendan?`)}`;
      $('#fdWa').href = wa;
    };
    box.innerHTML = `<div class="fd-q"><div><b><i class="fd-n">1</i>¿Dónde lo vas a usar?</b><div class="fd-pills" id="fdPlace"></div></div><div><b><i class="fd-n">2</i>¿Qué necesitas hacer?</b><div class="fd-pills" id="fdJob"></div></div>
      <div><b><i class="fd-n">3</i>¿De qué tamaño? <em id="fdTamL"></em></b><input type="range" id="fdTam" min="0" max="2" step="1" value="1" aria-label="Tamaño"><div class="fd-ticks"><span>Pequeño</span><span>Mediano</span><span>Grande</span></div></div></div>
      <div class="fd-stagew"><div class="fd-stage" id="fdStage"></div><span class="fd-chip" id="fdChip"></span><i class="fd-cloud c1"></i><i class="fd-cloud c2"></i></div><div class="fd-res"><p class="fd-sum" id="fdSum" aria-live="polite"></p><div class="fd-out" id="fdOut" aria-live="polite"></div><p class="fd-note">Es una guía orientativa. <a class="link" id="fdWa" href="#" target="_blank" rel="noopener">Pregúntale a un asesor</a> y confirma la mejor opción para ti.</p></div>`;
    pintar();
    box.addEventListener('click', e => {
      const l = e.target.closest('[data-l]'), j = e.target.closest('[data-j]'), v = e.target.closest('[data-ver]');
      if (l) { L = l.dataset.l; J = 0; pintar(); mount(box); }
      if (j) { J = +j.dataset.j; pintar(); mount(box); }
      if (v) window.abrirProducto(v.dataset.ver);
    });
    $('#fdTam').addEventListener('input', e => { T = +e.target.value; pintar(true); mount(box); });
    mount(box);
  }

  /* =========================================================
     12 · 13 — DESTACADOS: profundidad al deslizar + tarjeta que se voltea
     ========================================================= */
  function destacados() {
    const rail = $('#rail'); if (!rail) return;
    rail.classList.add('depth');
    $$('.card', rail).forEach(c => {
      const p = CATALOGO.find(q => q.id === c.dataset.id); if (!p) return;
      const piezas = window.piezasDe ? window.piezasDe(p).length : 0;
      c.querySelector('.card-media').insertAdjacentHTML('beforeend', `<button type="button" class="flip-btn" data-flip aria-label="Ver datos clave de ${esc(p.titulo)}">Datos</button>`);
      c.insertAdjacentHTML('beforeend', `<div class="card-back"><b class="cb-t">${esc(p.titulo)}</b><p class="cb-d">${esc(p.descripcion || '')}</p>${window.sheetSpecs ? window.sheetSpecs(p) : ''}<p class="cb-x">${piezas ? `${piezas} piezas compatibles · ` : ''}Garantía y soporte UNICORN</p><div class="cb-b"><button type="button" class="btn btn-primary" data-ficha="${p.id}">Ver ficha completa</button><button type="button" class="btn btn-ghost" data-flip>Volver</button></div></div>`);
    });
    const flip = c => {
      const toggle = () => c.classList.toggle('flipped');
      if (reduce) return toggle();
      c.animate([{ rotate: '0 1 0 0deg' }, { rotate: '0 1 0 90deg' }], { duration: 170, easing: 'ease-in' }).onfinish = () => {
        toggle(); c.animate([{ rotate: '0 1 0 -90deg' }, { rotate: '0 1 0 0deg' }], { duration: 230, easing: 'ease-out' });
      };
    };
    rail.addEventListener('click', e => {
      const f = e.target.closest('[data-flip]'), v = e.target.closest('[data-ficha]');
      if (f) { e.stopPropagation(); e.preventDefault(); flip(f.closest('.card')); }
      else if (v) { e.stopPropagation(); window.abrirProducto(v.dataset.ficha); }
    });
    // profundidad: la tarjeta "en foco" va de frente y las demás se inclinan; el foco viaja del primer al último producto
    let tick = false;
    const paint = () => {
      tick = false; const rc = rail.getBoundingClientRect(), cs = $$('.card', rail); if (!cs.length) return;
      const w = cs[0].offsetWidth, prog = clamp(rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth));
      const foco = rc.left + w / 2 + (rc.width - w) * prog;
      cs.forEach(c => {
        const r = c.getBoundingClientRect(), d = clamp((r.left + r.width / 2 - foco) / (rc.width / 2), -1.3, 1.3), a = Math.min(1, Math.abs(d));
        c.style.scale = (1 - 0.07 * a).toFixed(3);
        if (!c.classList.contains('flipped')) c.style.rotate = `0 1 0 ${(-d * 12).toFixed(1)}deg`;
      });
    };
    const q = () => { if (!tick) { tick = true; requestAnimationFrame(paint); } };
    if (!reduce) { rail.addEventListener('scroll', q, { passive: true }); addEventListener('resize', q); paint(); setTimeout(paint, 400); }
  }

  /* =========================================================
     14 · MARCAS: la marca apuntada se ilumina y dice con qué trabajamos
     ========================================================= */
  function marcas() {
    const wrap = $('#marcas'); if (!wrap) return; const box = wrap.parentElement, cap = $('#brandCap');
    // shortcut: los nombres siguen el orden de los logos del HTML; si cambias un logo, cambia su nombre aquí
    const NOMBRES = ['Husqvarna', 'Stihl', 'Shindaiwa', 'Barnes', 'Honda', 'Echo', 'Pedrollo', 'DeWalt', 'Tramontina', 'Bellota', 'Royal Condor', 'El Cebú'];
    const base = cap.innerHTML;
    const info = n => {
      const ps = CATALOGO.filter(p => p.marca === n); if (!ps.length) return `<b>${esc(n)}</b> · marca aliada`;
      const por = {}; ps.forEach(p => por[p.cat] = (por[p.cat] || 0) + 1); const cat = Object.keys(por).sort((a, b) => por[b] - por[a])[0];
      return `<b>${esc(n)}</b> · ${ps.length} producto${ps.length > 1 ? 's' : ''} en el catálogo · <a class="link" href="${CATEGORIAS[cat].pagina}?search=${encodeURIComponent(n)}">Verlos</a>`;
    };
    const poner = i => {
      $$('img', wrap).forEach(im => im.classList.toggle('on', i != null && im.dataset.b === String(i)));
      box.classList.toggle('hot', i != null); cap.classList.toggle('on', i != null);
      cap.innerHTML = i != null && NOMBRES[i] ? info(NOMBRES[i]) : base;
    };
    box.addEventListener('pointerover', e => { const im = e.target.closest('img[data-b]'); if (im) poner(+im.dataset.b); });
    box.addEventListener('pointerleave', () => poner(null));
    box.addEventListener('click', e => { const im = e.target.closest('img[data-b]'); if (im) poner(+im.dataset.b); });
  }

  /* =========================================================
     16 · SURCO: un tractorcito avanza y va sembrando mientras bajas
     ========================================================= */

  /* =========================================================
     18 · SEDES + MAPA (el mapa de siempre; ahora conversa con la lista)
     ========================================================= */
  // shortcut: sedes de relleno hasta tener los datos reales. Por sede: n (nombre), dir, q (búsqueda para "Cómo llegar") y, si se conocen, ll: [lat, lng] y z (zoom) para mover el mapa.
  const SEDES = [
    { n: 'Sede Bogotá', dir: 'Cl. 12B #27-16, Bogotá', q: '4.6114534,-74.0901192', ll: [4.6114534, -74.0901192], z: 16, tel: '+573174010595', h: { 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17], 6: [8, 14] } },
    { n: 'Sede Villavicencio', dir: 'Cl. 36 #29-17, Centro, Villavicencio', q: '4.1501585,-73.6350655', ll: [4.1501585, -73.6350655], z: 16, h: { 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17], 6: [8, 14] } },
    { n: 'Sede Espinal', dir: 'Cra. 4 #10-27, El Espinal, Tolima', q: '4.1522845,-74.8861317', ll: [4.1522845, -74.8861317], z: 16, tel: '+5782390990', h: { 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [8, 12.5] } }
  ];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const h12 = h => `${((Math.floor(h) + 11) % 12) + 1}:${h % 1 ? '30' : '00'} ${h < 12 ? 'am' : 'pm'}`;
  function estado(s) {
    const HORARIO = s.h; if (!HORARIO) return { ok: false, txt: 'Horario por confirmar · escríbenos por WhatsApp' };
    const b = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })), d = b.getDay(), h = b.getHours() + b.getMinutes() / 60, hoy = HORARIO[d];
    if (hoy && h >= hoy[0] && h < hoy[1]) return { ok: true, txt: `Abierto ahora · cierra a las ${h12(hoy[1])}` };
    for (let i = 0; i <= 7; i++) { const k = (d + i) % 7, hr = HORARIO[k]; if (hr && (i > 0 || h < hr[0])) return { ok: false, txt: `Cerrado · abre ${i === 0 ? 'hoy' : i === 1 ? 'mañana' : 'el ' + DIAS[k]} a las ${h12(hr[0])}` }; }
    return { ok: false, txt: 'Cerrado' };
  }
  function sedes() {
    const info = $('#sedesInfo'); if (!info) return; const ifr = $('#mapBox iframe'), box = $('#mapBox'); const base = ifr.getAttribute('src');
    let cur = 0, z = SEDES[0].z || 14, movido = false;
    const mover = () => { const s = SEDES[cur]; if (!s.ll) return; box.classList.add('cambia'); ifr.src = `${base}&ll=${s.ll[0]},${s.ll[1]}&z=${z}`; movido = true; ifr.onload = () => box.classList.remove('cambia'); };
    const pintar = () => {
      const s = SEDES[cur], e = estado(s);
      info.innerHTML = `<span class="eyebrow">Nuestras sedes</span>
        <div class="sedes-list">${SEDES.map((x, i) => `<button type="button" class="sede${i === cur ? ' on' : ''}" data-s="${i}" aria-pressed="${i === cur}"><svg class="sede-pin" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31C12 31 2 19 2 11a10 10 0 0 1 20 0c0 8-10 20-10 20z" fill="var(--accent)"/><circle cx="12" cy="11" r="4" fill="#fff"/></svg><span><b>${esc(x.n)}</b><small>${esc(x.dir)}</small></span></button>`).join('')}</div>
        <span class="estado ${e.ok ? 'ok' : ''}"><i></i>${e.txt}</span>
        <div class="sedes-act"><a class="btn btn-primary" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.q)}" target="_blank" rel="noopener">Cómo llegar ${icon('arrow')}</a>${s.tel ? `<a class="btn btn-ghost" href="tel:${s.tel}">Llamar</a>` : ''}<a class="btn btn-ghost" href="https://wa.me/${window.WA_NUM || ''}?text=${encodeURIComponent('Hola UNICORN, quiero visitarlos. ¿Cuál es el horario y la dirección?')}" target="_blank" rel="noopener">${icon('chat')} Escribir por WhatsApp</a></div>
        ${s.ll ? `<div class="sedes-zoom"><span>Mapa:</span><button type="button" data-z="1">Acercar</button><button type="button" data-z="-1">Alejar</button><button type="button" data-z="0">Ver todo</button></div>` : ''}
        <small class="sedes-nota">Horarios y direcciones tomados de Google Maps.</small>`;
      mount(info);
    };
    pintar();
    info.addEventListener('click', e => {
      const s = e.target.closest('[data-s]'), zz = e.target.closest('[data-z]');
      if (s) { cur = +s.dataset.s; z = SEDES[cur].z || 14; pintar(); mover(); }
      if (zz) { const d = +zz.dataset.z; if (!d) { z = SEDES[cur].z || 14; ifr.src = base; movido = false; box.classList.add('cambia'); ifr.onload = () => box.classList.remove('cambia'); } else { z = clamp(z + d * 2, 4, 19); mover(); } }
    });
    setInterval(() => { if (!document.hidden) { const e = estado(SEDES[cur]), el = $('.estado', info); if (el) { el.classList.toggle('ok', e.ok); el.lastChild.textContent = e.txt; } } }, 60000);
    if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { $('#sedes').classList.add('visto'); o.disconnect(); } }, { threshold: 0.3 }).observe($('#sedes'));
  }

  window.__inicio = { $, $$, reduce, fine, clamp, lerp, isDark, esc, cop, rnd, sky };
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  ready(() => { portada(); ciclo(); mundos(); imanes(); buscador(); destacados(); marcas(); sedes(); });
})();
