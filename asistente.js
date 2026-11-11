/* =========================================================
   ASISTENTE UNICORN 2.0
   Se carga en todas las páginas después de app.js. Usa catalogo.js y las funciones globales
   de app.js: icon, agregar, abrirProducto, toast, AMB.
   ========================================================= */
(() => {
  // Número de WhatsApp de la empresa (sin + ni espacios). Cámbialo por el real.
  const WHATSAPP = '573237881307';

  const $ = (s, r = document) => r.querySelector(s);
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 4. Sinónimos y errores de escritura ---------- */
  const SINONIMOS = [
    [/\b(guadanas?|desbrozadoras?|guadanadoras?|orilladoras?)\b/g, 'guadanadora'],
    [/\b(motocierras?|moto sierras?|motosierras?)\b/g, 'motosierra'],
    [/\b(plantas? electricas?|plantas? de luz|plantas?|generadores?)\b/g, 'generador'],
    [/\b(bombas? de agua|bombas?|motobombas?)\b/g, 'motobomba'],
    [/\b(fumigador(as|es)?|aspersoras?|bombas? de espalda)\b/g, 'fumigadora'],
    [/\b(podadoras? de setos|cortacercos?|cortasetos?)\b/g, 'cortasetos'],
    [/\b(cortadoras? de cesped|podadoras? de cesped|cortacesped(es)?)\b/g, 'cortacesped'],
    [/\b(hoyadoras?|ahoyadoras?|ahoyadores?)\b/g, 'ahoyador'],
    [/\b(sopladores?|sopladoras?)\b/g, 'sopladora'],
    [/\b(cercas?|cercos? electricos?|pastores? electricos?)\b/g, 'cerca'],
    [/\b(aceites?)\b/g, 'aceite'], [/\b(bujias?)\b/g, 'bujia'], [/\b(filtros?)\b/g, 'filtro']
  ];
  const STOP = new Set('quiero necesito busco buscar tienen tiene tienes para como cuanto cuanta vale valen precio precios una unas unos uno los las del de la el por favor me muestrame mostrar ver hay algo algun alguna que cual cuales con sin mas muy bueno buena barato barata economico economica'.split(' '));
  const VOCAB = [...new Set(CATALOGO.flatMap(p => norm(`${p.titulo} ${p.marca} ${p.tipo}`).split(/[^a-z0-9]+/)).filter(w => w.length >= 4))];
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const corregir = w => {
    if (w.length < 5 || VOCAB.includes(w)) return w;
    let best = w, bd = w.length > 7 ? 2 : 1;
    for (const v of VOCAB) { const d = lev(w, v); if (d <= bd) { bd = d; best = v; if (!d) break; } }
    return best;
  };
  const limpiar = text => { let t = norm(text); SINONIMOS.forEach(([rx, r]) => t = t.replace(rx, r)); return t; };
  const palabras = t => t.split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !STOP.has(w)).map(corregir).map(w => w.replace(/(es|s)$/, '') || w);
  const hay = p => norm(`${p.titulo} ${p.marca} ${p.tipo} ${CATEGORIAS[p.cat].nombre}`);

  function buscar(text) {
    const ws = palabras(limpiar(text));
    if (!ws.length) return [];
    const todas = CATALOGO.filter(p => ws.every(w => hay(p).includes(w)));
    if (todas.length) return todas;
    // si ninguna tiene todas las palabras, las que tengan más coincidencias
    return CATALOGO.map(p => [ws.filter(w => hay(p).includes(w)).length, p]).filter(x => x[0]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  }

  /* ---------- 5. Memoria de la conversación ---------- */
  const S = { last: null, wiz: null, manos: false };
  let ajustes = { voz: true, vel: 1.05 };
  try { Object.assign(ajustes, JSON.parse(localStorage.getItem('asistente-voz')) || {}); } catch (e) {}
  const guardarAjustes = () => { try { localStorage.setItem('asistente-voz', JSON.stringify(ajustes)); } catch (e) {} };

  /* ---------- 13. Contexto de la página ---------- */
  const PAGINA = window.CAT_FIJA ? 'cat' : /carrito\.html$/.test(location.pathname) ? 'carrito' : /(productos|piezas-accesorios)\.html$/.test(location.pathname) ? 'hub' : 'inicio';
  const CAT = window.CAT_FIJA;
  const PZ = ['accesorios', 'lubricantes', 'repuestos'];
  const SALUDO = {
    inicio: '¡Hola! Soy el asistente de Agro UNICORN. Te ayudo a elegir un equipo, encontrar repuestos para tu máquina o calcular el envío. También puedes hablarme con el micrófono.',
    hub: '¡Hola! ¿Buscas una categoría en especial? Dime qué trabajo vas a hacer y te llevo a lo que necesitas.',
    carrito: '¿Te ayudo con tu compra? Puedo decirte qué tienes en el carrito o calcular el envío a tu ciudad.',
    cat: CAT && (PZ.includes(CAT) ? `¿Buscas ${CATEGORIAS[CAT].nombre.toLowerCase()}? Dime el modelo de tu máquina y te muestro lo compatible.` : `¿Buscas algo de ${CATEGORIAS[CAT].nombre}? Te ayudo a elegir o te muestro lo más económico.`)
  };
  const BURBUJA = { inicio: '¿Te ayudo a elegir tu equipo?', hub: '¿No sabes qué categoría es? Pregúntame', carrito: '¿Te calculo el envío?', cat: CAT && (PZ.includes(CAT) ? '¿Qué máquina tienes? Te digo qué le sirve' : `¿Te ayudo a elegir en ${CATEGORIAS[CAT].nombre}?`) };
  const RAPIDAS = () => S.wiz ? ['Cancelar'] :
    PAGINA === 'carrito' ? ['¿Qué tengo en el carrito?', 'Envío a Villavicencio', 'Métodos de pago', 'Hablar con un asesor'] :
    PAGINA === 'cat' ? (PZ.includes(CAT) ? ['Repuestos para B45', 'Lo más económico', 'Hablar con un asesor'] : ['Ayúdame a elegir', 'Lo más económico', 'Repuestos para mi máquina', 'Hablar con un asesor']) :
    ['Ayúdame a elegir', 'Repuestos para mi máquina', 'Envíos', 'Hablar con un asesor'];

  /* ---------- 14. Tarjetas de producto en el chat ---------- */
  const spec = (p, ic) => (p.specs.find(s => s[0] === ic) || [])[1] || '—';
  function tarjeta(p) {
    const et = etiquetaDe(p);
    return `
      <div class="ac-card" data-ver="${p.id}">
        <div class="ac-img">${et ? `<span class="tag ${et.clase}">${et.texto}</span>` : ''}<img src="${p.imagens[0]}" alt=""></div>
        <div class="ac-info">
          <small>${escHTML(CATEGORIAS[p.cat].nombre)}${p.marca && p.marca !== 'Otras marcas' ? ' · ' + escHTML(p.marca) : ''}</small>
          <b>${escHTML(p.titulo)}</b>
          ${p.specs.length ? `<span class="ac-chips">${p.specs.slice(0, 2).map(([i, t]) => `<span>${i} ${escHTML(t)}</span>`).join('')}</span>` : ''}
          <span class="ac-price">${p.precioAntes > p.precio ? `<del>${formatoCOP(p.precioAntes)}</del>` : ''}${formatoCOP(p.precio)}</span>
        </div>
        <button class="add" data-chat-add="${p.id}" ${p.disponible ? '' : 'disabled'} aria-label="${p.disponible ? 'Agregar ' + escHTML(p.titulo) + ' al carrito' : 'Agotado'}">${icon(p.disponible ? 'plus' : 'x')}</button>
      </div>`;
  }
  const lista = (list, n = 3) => list.slice(0, n).map(tarjeta).join('');
  const boton = (txt, attr) => `<button type="button" class="ac-opt" ${attr}>${txt}</button>`;
  const opciones = items => `<div class="ac-opts">${items.join('')}</div>`;

  function mostrar(list, titulo, intro) {
    S.last = { list, shown: Math.min(3, list.length), titulo };
    const extra = [];
    if (list.length > 3) extra.push(boton(`Ver más (${list.length - 3})`, 'data-say="Ver más"'));
    if (list.length >= 2) extra.push(boton('Comparar los dos primeros', `data-cmp="${list[0].id},${list[1].id}"`));
    if (list.length > 1) extra.push(boton('El más económico', 'data-say="¿Y el más económico?"'));
    const cats = [...new Set(list.map(p => p.cat))];
    if (cats.length === 1) extra.push(boton(`Ver en ${CATEGORIAS[cats[0]].nombre}`, `data-go="${urlCat(cats[0], titulo)}"`));
    return `${intro}${lista(list)}${extra.length ? opciones(extra) : ''}`;
  }
  const urlCat = (cat, q) => `${CATEGORIAS[cat].pagina}${q ? '?search=' + encodeURIComponent(q) : ''}`;

  /* ---------- 2. Comparar ---------- */
  function comparar(a, b) {
    const filas = [
      ['Precio', p => formatoCOP(p.precio)],
      ['Marca', p => escHTML(p.marca)],
      ['Motor', p => escHTML(p.motor || '—')],
      ['Cilindraje', p => p.cilindraje ? p.cilindraje + ' cc' : '—'],
      ['Potencia', p => { const k = spec(p, '⚡'), h = spec(p, '🐎'); return k !== '—' ? k : h; }],
      ['Garantía', p => spec(p, '🛡️').replace('Garantía de ', '')],
      ['Estado', p => { const e = etiquetaDe(p); return e ? e.texto : 'Disponible'; }]
    ];
    const barata = a.precio <= b.precio ? a : b;
    return `Así se comparan:
      <table class="ac-cmp"><thead><tr><th></th><th>${escHTML(a.titulo)}</th><th>${escHTML(b.titulo)}</th></tr></thead>
      <tbody>${filas.map(([n, f]) => `<tr><th>${n}</th><td>${f(a)}</td><td>${f(b)}</td></tr>`).join('')}</tbody></table>
      <p>La más económica es <b>${escHTML(barata.titulo)}</b>, por ${formatoCOP(Math.abs(a.precio - b.precio))} menos.</p>
      ${opciones([boton('Ver ' + escHTML(a.titulo.split(' ').slice(0, 2).join(' ')), `data-ver="${a.id}"`), boton('Ver ' + escHTML(b.titulo.split(' ').slice(0, 2).join(' ')), `data-ver="${b.id}"`)])}`;
  }

  /* ---------- 1. Recomendador por preguntas ---------- */
  const TAREAS = {
    pasto: ['Cortar pasto o maleza', p => ['Guadañadora', 'Cortacésped'].includes(p.tipo)],
    arboles: ['Cortar árboles o leña', p => p.tipo === 'Motosierra'],
    setos: ['Podar setos', p => p.tipo === 'Cortasetos'],
    fumigar: ['Fumigar cultivos', p => p.tipo.startsWith('Fumigadora') && p.cat === 'fumigacion'],
    agua: ['Sacar o mover agua', p => ['Motobomba', 'Electrobomba', 'Equipo de presión'].includes(p.tipo)],
    energia: ['Tener energía eléctrica', p => p.tipo === 'Generador'],
    tierra: ['Preparar la tierra', p => ['Motoazada', 'Picador triturador'].includes(p.tipo)],
    ganado: ['Cercar ganado', p => p.tipo === 'Cerca eléctrica'],
    huecos: ['Abrir huecos', p => p.tipo === 'Ahoyador']
  };
  const TAM = { peq: 'Casa o jardín pequeño', med: 'Finca mediana', gra: 'Terreno o cultivo grande' };
  const PRESU = { a: ['Hasta $ 1.000.000', 0, 1e6], b: ['Hasta $ 3.000.000', 0, 3e6], c: ['Más de $ 3.000.000', 3e6, Infinity], n: ['No importa', 0, Infinity] };
  function wizard(paso, val) {
    if (paso === 'inicio') {
      S.wiz = {};
      return '¡Claro! Respóndeme tres preguntas. <b>¿Qué trabajo vas a hacer?</b>' + opciones(Object.entries(TAREAS).map(([k, [t]]) => boton(t, `data-wiz="tarea:${k}"`)));
    }
    S.wiz[paso] = val;
    if (paso === 'tarea') return '<b>¿Qué tan grande es el terreno?</b>' + opciones(Object.entries(TAM).map(([k, t]) => boton(t, `data-wiz="tam:${k}"`)));
    if (paso === 'tam') return '<b>¿Cuánto quieres invertir?</b>' + opciones(Object.entries(PRESU).map(([k, [t]]) => boton(t, `data-wiz="presu:${k}"`)));
    // resultado
    const { tarea, tam, presu } = S.wiz; S.wiz = null;
    let cand = CATALOGO.filter(p => p.disponible && TAREAS[tarea][1](p)).sort((a, b) => a.precio - b.precio);
    const [, min, max] = PRESU[presu];
    let nota = '';
    const enRango = cand.filter(p => p.precio >= min && p.precio <= max);
    if (enRango.length) cand = enRango; else nota = ' No encontré opciones en ese presupuesto, así que te muestro las más cercanas.';
    const pick = tam === 'peq' ? cand.slice(0, 3) : tam === 'gra' ? cand.slice(-3).reverse() : cand.slice(Math.max(0, Math.floor(cand.length / 2) - 1)).slice(0, 3);
    if (!pick.length) return 'Por ahora no tengo equipos para ese trabajo en el catálogo. ¿Quieres hablar con un asesor?' + opciones([boton('Hablar con un asesor', 'data-say="Hablar con un asesor"')]);
    const motivo = { peq: 'livianos y económicos', med: 'con buen equilibrio entre potencia y precio', gra: 'los de más capacidad' }[tam];
    return mostrar(pick, TAREAS[tarea][0], `Para <b>${TAREAS[tarea][0].toLowerCase()}</b> en un(a) ${TAM[tam].toLowerCase()} te recomiendo estos, ${motivo}.${nota}`);
  }

  /* ---------- 8. Carrito y envío ---------- */
  const leerCarrito = () => { try { return JSON.parse(localStorage.getItem('carrito')) || []; } catch (e) { return []; } };
  const num = s => Number(String(s).replace(/[^\d]/g, '')) || 0;
  function envio(t) {
    const zonas = [[/villavicencio|meta\b/, 'Villavicencio / Meta', 5000], [/piedemonte|llanero/, 'Piedemonte llanero', 8000], [/tienda|recog/, 'Recogida en tienda', 0]];
    const z = zonas.find(([rx]) => rx.test(t)) || [null, 'Envío nacional', 15000];
    const c = leerCarrito(), sub = c.reduce((s, p) => s + num(p.precio) * (p.cantidad || 1), 0);
    if (!c.length) return `El envío cuesta: Villavicencio / Meta $ 5.000, Piedemonte llanero $ 8.000, resto del país $ 15.000, y recoger en tienda es gratis. Desde $ 1.500.000 en compras el envío es gratis.`;
    const gratis = sub >= 1500000 && z[2] > 0;
    const costo = gratis ? 0 : z[2];
    return `Con lo que tienes en el carrito (${formatoCOP(sub)}), el envío a <b>${z[1]}</b> ${costo ? `cuesta <b>${formatoCOP(costo)}</b>` : '<b>es gratis</b>'}. Total: <b>${formatoCOP(sub + costo)}</b>.` +
      (!gratis && z[2] ? ` Te faltan ${formatoCOP(1500000 - sub)} para el envío gratis.` : '') +
      opciones([boton('Ir a pagar', 'data-go="carrito.html"')]);
  }
  function carrito() {
    const c = leerCarrito();
    if (!c.length) return 'Tu carrito está vacío. ¿Te ayudo a elegir algo?' + opciones([boton('Ayúdame a elegir', 'data-say="Ayúdame a elegir"')]);
    const sub = c.reduce((s, p) => s + num(p.precio) * (p.cantidad || 1), 0);
    return `Tienes <b>${c.reduce((s, p) => s + p.cantidad, 0)} producto(s)</b>:<ul class="ac-ul">${c.map(p => `<li>${p.cantidad} × ${escHTML(p.titulo)} — ${formatoCOP(num(p.precio) * p.cantidad)}</li>`).join('')}</ul>Subtotal: <b>${formatoCOP(sub)}</b>.` +
      opciones([boton('Calcular envío', 'data-say="¿Cuánto es el envío nacional?"'), boton('Ir a pagar', 'data-go="carrito.html"')]);
  }

  /* ---------- 9. WhatsApp con el contexto ---------- */
  function whatsapp() {
    const c = leerCarrito();
    const visto = S.last ? S.last.list.slice(0, 3).map(p => p.titulo) : [];
    const partes = ['Hola UNICORN, quiero hablar con un asesor.'];
    if (c.length) partes.push('Tengo en el carrito: ' + c.map(p => `${p.cantidad} × ${p.titulo}`).join(', ') + '.');
    else if (visto.length) partes.push('Estoy mirando: ' + visto.join(', ') + '.');
    if (CAT) partes.push(`Estoy en la sección ${CATEGORIAS[CAT].nombre}.`);
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(partes.join(' '))}`;
    return `Con gusto. Te paso con un asesor por WhatsApp; ya le dejé escrito lo que estabas viendo.<a class="btn btn-primary ac-wa" href="${url}" target="_blank" rel="noopener">${icon('chat')} Abrir WhatsApp</a>`;
  }

  /* ---------- 3. Repuestos para tu máquina ---------- */
  const modelo = t => (t.match(/\b([a-z]{0,4}\d{2,4}[a-z]{0,4})\b/i) || [])[1];
  function repuestos(t) {
    const m = modelo(t);
    if (!m) return '¿Qué máquina tienes? Escríbeme la marca y el modelo, por ejemplo: <i>"repuestos para Shindaiwa B45"</i> o <i>"tengo una Husqvarna 143RII"</i>.' + opciones(['B45', '143RII', 'GX160', 'FST768', '390XP'].map(x => boton(x, `data-say="Repuestos para ${x}"`)));
    const M = norm(m);
    const list = CATALOGO.filter(p => PZ.includes(p.cat) && norm(p.titulo).replace(/\s/g, '').includes(M));
    if (!list.length) return `No encontré repuestos que digan <b>${escHTML(m.toUpperCase())}</b>. Un asesor puede confirmarte cuál le sirve.` + opciones([boton('Hablar con un asesor', 'data-say="Hablar con un asesor"')]);
    return mostrar(list, m, `Para tu <b>${escHTML(m.toUpperCase())}</b> tengo ${list.length} repuesto(s) y accesorio(s) compatibles:`);
  }

  /* ---------- 7. Llevarte a la categoría ---------- */
  const CAT_PALABRAS = [[/generador|energia/, 'energia'], [/fumig/, 'fumigacion'], [/motobomba|electrobomba|agua|riego/, 'agua'], [/guadanadora|motosierra|cortasetos|cortacesped|campo|jardin|sopladora/, 'campo'], [/ferreteria|herramienta/, 'ferreteria'], [/construccion/, 'construccion'], [/accesorio|proteccion|casco|guante/, 'accesorios'], [/lubricante|aceite|grasa/, 'lubricantes'], [/repuesto/, 'repuestos']];
  const catDe = t => (CAT_PALABRAS.find(([rx]) => rx.test(t)) || [])[1];

  /* =========================================================
     RESPUESTA
     ========================================================= */
  function responder(raw) {
    const t = limpiar(raw);
    const has = (...w) => w.some(x => t.includes(x));
    if (S.wiz && /cancel/.test(t)) { S.wiz = null; return 'Listo, cancelé las preguntas. ¿En qué más te ayudo?'; }
    if (/^(hola|buen|saludos|que tal)/.test(t) && t.length < 25) return '¡Hola! Qué gusto saludarte. ¿Qué equipo o repuesto estás buscando?';
    if (has('gracias', 'muy amable')) return '¡Con todo el gusto! Aquí estaré si necesitas algo más.';
    if (has('carrito') && !has('envio')) return carrito();
    if (has('envio', 'domicilio', 'despacho', 'llegan', 'flete')) return envio(t);
    if (has('pago', 'pagar', 'tarjeta', 'efectivo', 'pse', 'nequi', 'daviplata')) return '<b>Métodos de pago:</b> tarjeta crédito o débito, PSE, Nequi / Daviplata y contra entrega (según zona). El pago con tarjeta se hace en una pasarela segura.';
    if (has('garantia', 'dano', 'respaldo')) return '<b>Garantía:</b> todos los equipos tienen respaldo directo de la marca (de 3 meses a 2 años según el equipo) y acceso a nuestra red técnica.';
    if (has('asesor', 'whatsapp', 'humano', 'persona', 'llamar', 'contacto')) return whatsapp();
    if (has('ubicacion', 'direccion', 'donde estan', 'sede', 'local')) return 'Tenemos sede física en Bogotá. En la página de inicio, en "Ubícanos", está el mapa con nuestras sucursales.' + opciones([boton('Ver el mapa', 'data-go="UNICORN.html#mapa"')]);

    // 2. comparar: "compara A con B" / "A vs B"
    const cmp = t.match(/compar\w*\s+(.+?)\s+(?:con|vs|y|contra)\s+(.+)/) || t.match(/(.+?)\s+vs\.?\s+(.+)/);
    if (cmp) {
      const a = buscar(cmp[1])[0], b = buscar(cmp[2]).find(p => p !== a);
      if (a && b) return comparar(a, b);
      return 'No encontré esos dos productos. Escríbelos así: <i>"compara Stihl FS160 con Husqvarna 143RS"</i>.';
    }
    // 1. recomendador
    if (has('ayudame a elegir', 'recomiend', 'no se cual', 'cual me sirve', 'que me sirve', 'cual compro', 'elegir')) return wizard('inicio');

    if (/^lo mas (economic|barat)/.test(t) && CAT) { const list = CATALOGO.filter(p => p.cat === CAT && p.disponible).sort((a, b) => a.precio - b.precio); return list.length ? mostrar(list, '', `Lo más económico en ${CATEGORIAS[CAT].nombre}:`) : 'Esta categoría todavía no tiene productos.'; }
    // 5. seguir sobre los resultados anteriores
    if (S.last && has('mas barat', 'mas economic', 'menor precio')) { const p = [...S.last.list].sort((a, b) => a.precio - b.precio)[0]; return `El más económico de lo que estábamos viendo es:` + tarjeta(p); }
    if (S.last && has('mas car', 'mayor precio')) { const p = [...S.last.list].sort((a, b) => b.precio - a.precio)[0]; return 'El de mayor precio es:' + tarjeta(p); }
    if (S.last && has('mas potente', 'mas fuerte', 'mas grande')) { const p = [...S.last.list].sort((a, b) => (+b.cilindraje || 0) - (+a.cilindraje || 0))[0]; return 'El de más potencia (por cilindraje) es:' + tarjeta(p); }
    if (S.last && /^(ver mas|mas|otras?|otros|mas opciones|siguientes?)\b/.test(t)) {
      const { list, shown } = S.last; const next = list.slice(shown, shown + 3); S.last.shown += next.length;
      if (!next.length) return 'Ya te mostré todas las opciones.';
      return 'Aquí tienes más:' + lista(next) + (list.length > S.last.shown ? opciones([boton(`Ver más (${list.length - S.last.shown})`, 'data-say="Ver más"')]) : '');
    }

    // 3. repuestos
    if (has('repuesto', 'tengo una', 'tengo un', 'para mi maquina', 'compatible', 'le sirve')) return repuestos(t);

    // 7. llevar a la categoría
    if (/^(llevame|ir a|abre|abrir|vamos a)\b/.test(t)) {
      const c = catDe(t);
      if (c) { setTimeout(() => location.href = CATEGORIAS[c].pagina, 1400); return `Te llevo a <b>${CATEGORIAS[c].nombre}</b>…`; }
    }

    // búsqueda en el catálogo (con modelo de máquina primero)
    const m = modelo(t);
    if (m && CATALOGO.some(p => PZ.includes(p.cat) && norm(p.titulo).replace(/\s/g, '').includes(norm(m))) && !buscar(t).some(p => !PZ.includes(p.cat))) return repuestos(t);
    const hits = buscar(raw);
    if (hits.length) return mostrar(hits, palabras(t).join(' '), hits.length === 1 ? 'Encontré esto:' : `Encontré ${hits.length} opciones. Estas son las primeras:`);
    if (has('precio', 'costo', 'vale')) return 'Dime qué equipo buscas (por ejemplo "motobomba" o "guadañadora") y te muestro los precios.';
    return 'No encontré algo con ese nombre. Prueba con "motosierra", "fumigadora", "filtro para B45" o pregúntame por envíos y pagos.' + opciones([boton('Ayúdame a elegir', 'data-say="Ayúdame a elegir"')]);
  }

  /* =========================================================
     INTERFAZ
     ========================================================= */
  let box, msgs, input, micBtn, wave, rec, escuchando = false;
  function construir() {
    box = document.createElement('section');
    box.className = 'chat glass ac'; box.setAttribute('aria-label', 'Asistente UNICORN');
    box.innerHTML = `
      <div class="chat-head">
        <span class="av">${icon('chat')}</span>
        <div><b>Asistente UNICORN</b><small id="acEstado">En línea</small></div>
        <button class="icon-btn" id="acVoz" aria-pressed="${ajustes.voz}" aria-label="Respuestas habladas"></button>
        <button class="icon-btn" id="acAjustes" aria-expanded="false" aria-label="Ajustes de voz"><i data-i="sliders"></i></button>
        <button class="icon-btn" id="acCerrar" aria-label="Cerrar chat"><i data-i="x"></i></button>
      </div>
      <div class="ac-settings" id="acPanel" hidden>
        <label class="ac-switch"><input type="checkbox" id="acManos"> <span>Manos libres: después de responder vuelve a escucharte</span></label>
        <div class="ac-row"><span>Velocidad de la voz</span><div class="ac-seg">${[['Lenta', 0.85], ['Normal', 1.05], ['Rápida', 1.3]].map(([n, v]) => `<button type="button" data-vel="${v}" aria-pressed="${ajustes.vel === v}">${n}</button>`).join('')}</div></div>
      </div>
      <div class="chat-msgs" aria-live="polite"></div>
      <div class="chat-quick" id="acRapidas"></div>
      <form class="chat-form">
        <label class="sr-only" for="acIn">Escribe tu mensaje</label>
        <input id="acIn" placeholder="Escribe o toca el micrófono…" autocomplete="off">
        <div class="ac-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <button type="button" class="icon-btn mic" id="acMic" aria-label="Hablar por micrófono"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
        <button class="icon-btn send" aria-label="Enviar">${icon('arrow')}</button>
      </form>`;
    document.body.appendChild(box);
    box.querySelectorAll('i[data-i]').forEach(el => el.outerHTML = icon(el.dataset.i));
    msgs = $('.chat-msgs', box); input = $('#acIn', box); micBtn = $('#acMic', box); wave = $('.ac-wave', box);
    pintarVoz(); rapidas();

    $('.chat-form', box).onsubmit = e => { e.preventDefault(); enviar(input.value); input.value = ''; };
    $('#acCerrar', box).onclick = () => abrir(false);
    $('#acVoz', box).onclick = () => { ajustes.voz = !ajustes.voz; guardarAjustes(); pintarVoz(); if (!ajustes.voz) speechSynthesis?.cancel(); };
    $('#acAjustes', box).onclick = e => { const p = $('#acPanel', box); p.hidden = !p.hidden; e.currentTarget.setAttribute('aria-expanded', !p.hidden); };
    $('#acManos', box).onchange = e => { S.manos = e.target.checked; if (S.manos) { ajustes.voz = true; guardarAjustes(); pintarVoz(); escuchar(); } };
    box.querySelectorAll('[data-vel]').forEach(b => b.onclick = () => { ajustes.vel = +b.dataset.vel; guardarAjustes(); box.querySelectorAll('[data-vel]').forEach(x => x.setAttribute('aria-pressed', x === b)); hablar('Así suena mi voz.'); });
    $('#acRapidas', box).onclick = e => { const b = e.target.closest('button'); if (b) enviar(b.textContent); };
    micBtn.onclick = () => escuchando ? parar() : escuchar();

    // clics dentro de los mensajes
    msgs.addEventListener('click', e => {
      const add = e.target.closest('[data-chat-add]');
      if (add) { e.stopPropagation(); window.agregar(add.dataset.chatAdd, add.closest('.ac-card')?.querySelector('img')); add.classList.add('done'); add.innerHTML = icon('check'); return; }
      const o = e.target.closest('[data-wiz]');
      if (o) { const [k, v] = o.dataset.wiz.split(':'); o.closest('.ac-opts').remove(); burbuja(o.textContent, 'user'); responderCon(() => wizard(k, v)); return; }
      const c = e.target.closest('[data-cmp]');
      if (c) { const [a, b] = c.dataset.cmp.split(',').map(id => CATALOGO.find(p => p.id === id)); burbuja('Compara los dos primeros', 'user'); responderCon(() => comparar(a, b)); return; }
      const s = e.target.closest('[data-say]');
      if (s) { enviar(s.dataset.say); return; }
      const g = e.target.closest('[data-go]');
      if (g) { location.href = g.dataset.go; return; }
      const v = e.target.closest('[data-ver]');
      if (v && !e.target.closest('a')) window.abrirProducto(v.dataset.ver);
    });
    // Escape cierra primero el detalle, el carrito o el buscador; el chat solo si no hay nada encima
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('open') && !document.querySelector('.sheet.open, .drawer.open, .spot.open')) abrir(false); }, true);
  }
  function pintarVoz() {
    const b = $('#acVoz', box);
    b.setAttribute('aria-pressed', ajustes.voz);
    b.innerHTML = ajustes.voz
      ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
      : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Z"/><path d="m17 9 5 5M22 9l-5 5"/></svg>';
  }
  function rapidas() { $('#acRapidas', box).innerHTML = RAPIDAS().map(q => `<button type="button">${q}</button>`).join(''); }
  function burbuja(html, who) {
    const m = document.createElement('div'); m.className = 'msg ' + who;
    if (who === 'user') m.textContent = html; else m.innerHTML = html;
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
    return m;
  }
  function responderCon(fn) {
    const t = burbuja('<span class="typing"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(() => { const r = fn(); t.innerHTML = r; msgs.scrollTop = msgs.scrollHeight; rapidas(); hablar(r, () => S.manos && escuchar()); }, 650);
  }
  function enviar(text) {
    text = String(text).trim(); if (!text) return;
    burbuja(text, 'user');
    responderCon(() => responder(text));
  }

  /* ---------- 11. Voz que habla (con ajustes) ---------- */
  function hablar(html, luego) {
    if (!ajustes.voz || !('speechSynthesis' in window)) { luego && luego(); return; }
    speechSynthesis.cancel();
    const d = document.createElement('div'); d.innerHTML = html;
    d.querySelectorAll('table, .ac-opts, .ac-chips, del, .tag').forEach(x => x.remove());
    // en las tarjetas, solo nombre y precio
    d.querySelectorAll('.ac-card').forEach(c => { c.textContent = ' ' + (c.querySelector('b')?.textContent || '') + ', ' + (c.querySelector('.ac-price')?.textContent || '') + '. '; });
    const u = new SpeechSynthesisUtterance(d.textContent.replace(/UNICORN/g, 'Iunicorn').replace(/\$\s?/g, '').replace(/\s+/g, ' ').trim());
    u.lang = 'es-CO'; u.rate = ajustes.vel;
    u.onend = () => luego && luego();
    speechSynthesis.speak(u);
  }

  /* ---------- 10 y 12. Escuchar (manos libres + onda que se mueve con la voz) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let audio;
  async function ondaReal() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = ctx.createAnalyser(); an.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(an);
      const data = new Uint8Array(an.frequencyBinCount), bars = [...wave.children];
      audio = { stream, ctx };
      wave.classList.add('real');
      const loop = () => {
        if (!audio) return;
        an.getByteFrequencyData(data);
        bars.forEach((b, i) => { const v = data[2 + i * 3] / 255; b.style.transform = `scaleY(${0.15 + v * 1.1})`; });
        requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { /* sin permiso: la onda queda con su animación simple */ }
  }
  function cerrarAudio() { if (audio) { audio.stream.getTracks().forEach(t => t.stop()); audio.ctx.close(); audio = null; } wave.classList.remove('real'); [...wave.children].forEach(b => b.style.transform = ''); }
  const ERR = {
    'not-allowed': 'El navegador bloqueó el micrófono. Toca el candado junto a la dirección y permite el micrófono.',
    'service-not-allowed': 'Este navegador no deja usar el reconocimiento de voz aquí. Prueba en Chrome o Edge.',
    'audio-capture': 'No encontré un micrófono conectado.',
    'network': 'El reconocimiento de voz necesita internet. Revisa tu conexión.'
  };
  function escuchar() {
    if (!SR) { burbuja('Tu navegador no tiene reconocimiento de voz. Prueba en Chrome o Edge.', 'bot'); return; }
    if (location.protocol === 'file:') { burbuja('El micrófono solo funciona con la página publicada o abierta con un servidor (por ejemplo, Live Server en VS Code). Abierta como archivo, el navegador lo bloquea.', 'bot'); S.manos = false; $('#acManos', box).checked = false; return; }
    if (escuchando) return;
    speechSynthesis?.cancel();
    rec = new SR(); rec.lang = 'es-CO'; rec.interimResults = true;
    rec.onstart = () => { if (escuchando) return; escuchando = true; box.classList.add('listening'); micBtn.classList.add('on'); $('#acEstado', box).textContent = 'Escuchando…'; if (!reduce) ondaReal(); };
    rec.onend = () => { escuchando = false; box.classList.remove('listening'); micBtn.classList.remove('on'); $('#acEstado', box).textContent = S.manos ? 'Manos libres' : 'En línea'; cerrarAudio(); };
    rec.onerror = e => { if (e.error === 'no-speech') { if (!S.manos) burbuja('No te escuché. Toca el micrófono e intenta de nuevo.', 'bot'); return; } if (e.error !== 'aborted') { burbuja(ERR[e.error] || 'No pude usar el micrófono. Intenta de nuevo.', 'bot'); S.manos = false; $('#acManos', box).checked = false; } };
    rec.onresult = e => { const r = e.results[e.results.length - 1]; input.value = r[0].transcript; if (r.isFinal) { const v = input.value; input.value = ''; enviar(v); } };
    try { rec.start(); rec.onstart(); } catch (e) { /* ya estaba escuchando */ }   // se muestra de una vez que está escuchando
  }
  function parar() { S.manos = false; const m = $('#acManos', box); if (m) m.checked = false; rec && rec.stop(); }

  /* ---------- Abrir / cerrar ---------- */
  let saludado = false;
  function abrir(on) {
    if (!box) construir();
    on = on ?? !box.classList.contains('open');
    box.classList.toggle('open', on);
    quitarBurbuja();
    if (!on) { speechSynthesis?.cancel(); parar(); return; }
    if (!saludado) { saludado = true; burbuja(SALUDO[PAGINA], 'bot'); hablar(SALUDO[PAGINA]); }
    setTimeout(() => input.focus(), 100);
  }
  window.toggleChat = abrir;                 // el botón del chat de app.js abre este asistente
  window.asistente = { enviar: t => { abrir(true); enviar(t); }, responder };

  /* ---------- 15. Burbuja de bienvenida (una vez por visita) ---------- */
  let globo;
  function quitarBurbuja() { if (globo) { globo.classList.remove('show'); setTimeout(() => globo && globo.remove(), 300); globo = null; } }
  setTimeout(() => {
    try { if (sessionStorage.getItem('asistente-burbuja')) return; sessionStorage.setItem('asistente-burbuja', '1'); } catch (e) {}
    if (box && box.classList.contains('open')) return;
    globo = document.createElement('div');
    globo.className = 'ac-bubble glass';
    globo.innerHTML = `<button type="button" class="ac-bubble-txt">${BURBUJA[PAGINA]}</button><button type="button" class="icon-btn" aria-label="Cerrar">${icon('x')}</button>`;
    document.body.appendChild(globo);
    requestAnimationFrame(() => globo.classList.add('show'));
    globo.querySelector('.ac-bubble-txt').onclick = () => abrir(true);
    globo.querySelector('.icon-btn').onclick = quitarBurbuja;
  }, 6000);
})();
