/* =========================================================
   MI GARAJE · tus máquinas, cómo son por dentro, sus piezas y sus cuidados
   Usa window.EQ (app.js) para guardar: la lista vive en localStorage ("mi-garaje").
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => window.escHTML(String(s ?? ''));
  const cop = n => window.formatoCOP(n);
  const EQ = window.EQ, PZ = EQ.PZ;
  const IM = { Motosierra: 'wrench', 'Guadañadora': 'leaf', Sopladora: 'spray', Cortasetos: 'hammer', Fumigadora: 'spray', Generador: 'bolt', Motobomba: 'drop', Electrobomba: 'drop', Motoazada: 'leaf', 'Cortacésped': 'leaf', Ahoyador: 'gear', 'Cerca eléctrica': 'bolt' };
  const ICN = t => window.icon(IM[t] || 'wrench');
  const R = n => [...Array(n).keys()];

  /* ---------- dibujos reutilizables (formas planas, mismo estilo del sitio) ---------- */
  const A = {
    tanque: (x, y, w = 120, h = 54) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#f59e0b"/><rect x="${x + w * 0.22}" y="${y - 14}" width="34" height="18" rx="6" fill="#1f2937"/><rect x="${x + 14}" y="${y + h * 0.28}" width="${w - 28}" height="9" rx="4.5" fill="#fcd34d" opacity=".7"/>`,
    bujia: (x, y) => `<rect x="${x}" y="${y + 14}" width="14" height="40" rx="3" fill="#e5e7eb"/><rect x="${x - 4}" y="${y + 46}" width="22" height="12" rx="3" fill="#6b7280"/><rect x="${x + 3}" y="${y}" width="8" height="18" rx="3" fill="#374151"/>`,
    filtro: (x, y, r = 38) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f4d58d"/><circle cx="${x}" cy="${y}" r="${r * 0.66}" fill="#e7bf63"/>` + [0, 45, 90, 135].map(a => `<rect x="${x - 3}" y="${y - r * 0.85}" width="6" height="${r * 1.7}" rx="3" fill="#cf9f3d" transform="rotate(${a} ${x} ${y})"/>`).join(''),
    carb: (x, y) => `<rect x="${x}" y="${y}" width="38" height="62" rx="10" fill="#9ca3af"/><rect x="${x + 8}" y="${y + 12}" width="22" height="10" rx="3" fill="#6b7280"/><rect x="${x + 8}" y="${y + 32}" width="22" height="10" rx="3" fill="#6b7280"/>`,
    motor: (x, y, w = 170, h = 130) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#c8312d"/>` + R(5).map(i => `<rect x="${x + 12}" y="${y + 13 + i * 22}" width="${w - 24}" height="10" rx="5" fill="#a4231f"/>`).join('') + `<circle cx="${x + w / 2}" cy="${y + h / 2 + 5}" r="28" fill="#1f2937"/><circle cx="${x + w / 2}" cy="${y + h / 2 + 5}" r="10" fill="#9ca3af"/>`,
    arranque: (x, y) => `<circle cx="${x}" cy="${y}" r="32" fill="#374151"/><circle cx="${x}" cy="${y}" r="19" fill="#9ca3af"/><path d="M${x - 32} ${y} q-26 0 -30 -22" stroke="#111827" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="${x - 88}" y="${y - 38}" width="28" height="12" rx="6" fill="#f57c00"/>`,
    aceite: (x, y) => `<path d="M${x} ${y + 60} h46 v-30 q0 -10 -8 -14 l-6 -3 v-12 h-18 v12 l-6 3 q-8 4 -8 14 z" fill="#16a34a"/><rect x="${x + 8}" y="${y + 30}" width="30" height="16" rx="3" fill="#dcfce7"/>`,
    gear: (x, y, r = 24) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d1d5db"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#9ca3af" stroke-width="7" stroke-dasharray="6 5"/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="#6b7280"/>`,
    volute: (x, y, r = 72) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1a12a6"/><circle cx="${x}" cy="${y}" r="${r * 0.68}" fill="#2f27c9"/><rect x="${x + r * 0.55}" y="${y - r * 0.95}" width="36" height="40" rx="7" fill="#1a12a6"/>`,
    impulsor: (x, y, r = 40) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#cfd3ff"/><circle cx="${x}" cy="${y}" r="9" fill="#6366f1"/>` + R(6).map(i => `<rect x="${x - 3.5}" y="${y - r + 4}" width="7" height="${r - 14}" rx="3.5" fill="#818cf8" transform="rotate(${i * 60} ${x} ${y})"/>`).join('')
  };

  /* ---------- qué es cada pieza: [nombre, para qué sirve, cuándo mirarla, repuesto del catálogo, desgaste 1-3] ---------- */
  const INFO = {
    tanque: ['Tanque de combustible', 'Guarda la gasolina (o la mezcla). Si se ensucia o se agrieta, el motor se ahoga o gotea.', 'Revísalo si hay olor a gasolina o impurezas en el fondo.', 'Tanque', 2],
    bujia: ['Bujía', 'Prende la mezcla de gasolina y aire. Decide si arranca a la primera.', 'Cámbiala si cuesta arrancar o el motor falla; mírala cada temporada.', 'Bujía', 3],
    filtro: ['Filtro de aire', 'Deja entrar aire limpio y frena el polvo, que desgasta el motor por dentro.', 'Límpialo seguido y cámbialo si está tapado o roto.', 'Filtro', 3],
    carb: ['Carburador', 'Mezcla aire y gasolina en la proporción correcta para que el motor corra parejo.', 'Si se apaga solo o no acelera bien, suele ser lo primero que se revisa.', 'Carburador', 2],
    motor: ['Motor y cilindro', 'Convierte la gasolina en movimiento. Todo lo demás trabaja para él.', 'Pérdida de fuerza o humo excesivo: consulta con el servicio técnico.', 'Cilindro', 1],
    arranque: ['Arranque de cuerda', 'La cuerda y el mecanismo que giran el motor para encenderlo.', 'Si la cuerda se siente floja o no engancha, cambia la cuerda o el resorte.', 'Arranque', 2],
    aceite: ['Aceite del motor', 'Lubrica y refrigera. Es lo más barato que alarga la vida de la máquina.', 'Revisa el nivel antes de cada uso y cámbialo según el manual.', 'Aceite', 3],
    espada: ['Espada', 'La guía por donde corre la cadena.', 'Cámbiala si el riel está gastado o la cadena se sale seguido.', 'Espada', 2],
    cadena: ['Cadena', 'Los dientes que cortan la madera.', 'Afílala seguido y cámbiala cuando los dientes estén gastados.', 'Cadena', 3],
    embrague: ['Embrague y piñón', 'Pasan el giro del motor a la cadena o al eje, solo cuando aceleras.', 'Si la herramienta gira en ralentí o patina, revísalo.', 'Embrague', 2],
    tubo: ['Tubo y eje', 'Lleva la fuerza del motor hasta el cabezal.', 'Revisa que no tenga holgura ni vibre de más.', 'Transmisión', 1],
    cabezal: ['Cabezal y nylon', 'Es lo que corta la maleza: el hilo de nylon (o una cuchilla).', 'Cambia el hilo cuando se acorte; revisa que el cabezal gire libre.', 'Nylon', 3],
    hoja: ['Hoja de corte', 'Dos cuchillas que se cruzan y cortan ramas y setos.', 'Límpiala, engrásala y afílala; cámbiala si está mellada.', 'Cuchilla', 3],
    turbina: ['Turbina', 'El ventilador que genera la corriente de aire.', 'Si pierde fuerza o vibra, revisa que no tenga hojas atrapadas ni aspas dañadas.', 'Impulsor', 1],
    tubo_sop: ['Tubo y boquilla', 'Dirigen el aire hacia donde lo necesitas.', 'Revisa que no esté tapado ni agrietado.', null, 1],
    barrena: ['Barrena', 'El tornillo que perfora y saca la tierra.', 'Límpiala al terminar y revisa la punta.', null, 3],
    caja: ['Caja reductora', 'Baja las revoluciones y sube la fuerza para mover la barrena o las cuchillas.', 'Revisa la grasa y escucha si hay ruidos raros.', 'Grasa', 2],
    azada: ['Cuchillas rotativas', 'Giran y rompen la tierra para dejarla suelta.', 'Quita piedras y raíces enredadas; cámbialas si se desafilan.', null, 3],
    deck: ['Plataforma de corte', 'La carcasa que protege y guía el pasto hacia la cuchilla.', 'Límpiala por debajo después de usar para que no se pegue el pasto.', null, 1],
    cuchilla: ['Cuchilla', 'Corta el pasto. Sin filo, rasga y deja el césped amarillo.', 'Afílala o cámbiala cada temporada, con la máquina apagada.', 'Cuchilla', 3],
    ruedas: ['Ruedas', 'Mueven la máquina y regulan la altura de corte.', 'Revisa que giren libres y estén a la misma altura.', null, 2],
    alternador: ['Alternador', 'Convierte el giro del motor en electricidad.', 'Si no da voltaje o hay chispas en las escobillas, requiere técnico.', 'Bobina', 1],
    panel: ['Panel de tomas', 'Donde conectas tus aparatos; trae protección contra sobrecarga.', 'Si una toma se calienta o el breaker salta seguido, desconecta y revisa la carga.', null, 2],
    avr: ['Regulador de voltaje (AVR)', 'Mantiene el voltaje estable para no dañar tus equipos.', 'Si el voltaje sube y baja, revisa este regulador.', 'Avr', 2],
    bomba: ['Cuerpo de la bomba', 'Donde gira el impulsor que empuja el agua. Define presión y caudal.', 'Si sube poca agua o hace ruido, revisa el sello y el impulsor.', 'Bomba', 1],
    impulsor: ['Impulsor', 'La “hélice” que mueve el agua dentro de la bomba.', 'Si se desgasta o se tapa con basura, baja el caudal.', 'Impulsor', 2],
    manguera: ['Manguera', 'Lleva el agua o el producto hasta donde lo necesitas.', 'Cámbiala si está reseca, aplastada o pierde en los empalmes.', 'Manguera', 3],
    motor_e: ['Motor eléctrico', 'Convierte la electricidad en giro. Es el corazón de la bomba.', 'Si zumba y no gira, o se calienta de más, déjalo de usar y consulta.', null, 1],
    condensador: ['Condensador', 'Ayuda a arrancar el motor eléctrico.', 'Si el motor zumba y no arranca, suele ser este.', null, 2],
    sello: ['Sello mecánico', 'Evita que el agua entre al motor.', 'Si gotea por el eje, hay que cambiarlo pronto.', 'Sello', 3],
    cable: ['Cable y enchufe', 'Alimentan el motor. Deben estar secos y sin cortes.', 'Revisa que no tengan cortes ni empalmes caseros.', null, 2],
    tanq_q: ['Tanque del líquido', 'Guarda el agua o el producto a aplicar.', 'Enjuágalo después de cada uso para que no se tapen las boquillas.', null, 2],
    palanca: ['Bomba de presión', 'Genera la presión para que el líquido salga en spray.', 'Si pierde presión, revisa los empaques o sellos.', 'Sello', 2],
    filtro_q: ['Filtro de entrada', 'Retiene impurezas para que no tapen la boquilla.', 'Límpialo cuando el chorro salga irregular.', 'Filtro', 2],
    lanza: ['Lanza', 'El tubo con el que diriges el chorro.', 'Revisa que no tenga fugas en los empalmes.', 'Lanza', 2],
    boquilla: ['Boquilla', 'Define la forma del chorro: abanico, cono o neblina.', 'Si el chorro sale chueco o gotea, límpiala o cámbiala.', 'Boquilla', 3],
    energizador: ['Energizador', 'Genera los pulsos eléctricos que hacen efectiva la cerca.', 'Si la luz indicadora no parpadea, revisa la conexión y la fuente.', null, 1],
    aislador: ['Aisladores', 'Sostienen el cable sin que la corriente se vaya a tierra.', 'Cámbialos si están rotos o agrietados.', 'Insulador', 3],
    hilo: ['Cable o cinta conductora', 'Lleva el pulso a lo largo de la cerca.', 'Revisa cortes o vegetación tocándolo.', null, 2],
    tierra: ['Varilla de tierra', 'Cierra el circuito para que la cerca dé el choque.', 'Si la cerca da poco choque, mejora la tierra (más húmeda o más profunda).', null, 1],
    bateria: ['Batería o fuente', 'Alimenta el energizador.', 'Revisa la carga; cámbiala si dura poco.', null, 2]
  };

  /* ---------- cada familia de máquina: qué piezas lleva, dónde se dibuja y hacia dónde se separa ---------- */
  const part = (id, art, d) => ({ id, art, d });
  const gas = (o = {}) => [
    part('tanque', A.tanque(255, 95), [0, -80]), part('bujia', A.bujia(405, 108), [30, -90]), part('filtro', A.filtro(165, 232), [-115, -10]),
    part('carb', A.carb(208, 200), [-75, 55]), part('motor', A.motor(250, 170), [0, 0]),
    ...(o.sinArranque ? [] : [part('arranque', A.arranque(335, 352), [0, 80])]), part('aceite', A.aceite(...(o.aceite || [455, 330])), [85, 70])
  ];
  const FAM = {
    Motosierra: () => [...gas(), part('embrague', A.gear(452, 229), [55, -75]),
      part('espada', `<rect x="470" y="212" width="230" height="34" rx="17" fill="#9ca3af"/><rect x="484" y="222" width="150" height="14" rx="7" fill="#6b7280"/><circle cx="486" cy="229" r="6" fill="#374151"/>`, [110, 0]),
      part('cadena', `<rect x="466" y="206" width="238" height="46" rx="23" fill="none" stroke="#374151" stroke-width="5" stroke-dasharray="6 5"/>`, [110, 62])],
    'Guadañadora': () => [...gas(), part('embrague', A.gear(445, 229, 20), [50, -75]),
      part('tubo', `<rect x="470" y="222" width="230" height="14" rx="7" fill="#9ca3af"/>`, [70, 0]),
      part('cabezal', `<circle cx="722" cy="229" r="26" fill="#374151"/><circle cx="722" cy="229" r="9" fill="#9ca3af"/><path d="M696 229h-26M748 229h26" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>`, [130, 55])],
    Cortasetos: () => [...gas(), part('hoja', `<rect x="450" y="214" width="250" height="30" rx="4" fill="#9ca3af"/>` + R(14).map(i => `<path d="M${458 + i * 17} 244 l8 14 l8 -14z" fill="#6b7280"/><path d="M${458 + i * 17} 214 l8 -14 l8 14z" fill="#6b7280"/>`).join(''), [120, 0])],
    Sopladora: () => [...gas(), part('turbina', `<circle cx="462" cy="230" r="32" fill="#93c5fd"/>` + R(6).map(i => `<rect x="459" y="204" width="6" height="26" rx="3" fill="#3b82f6" transform="rotate(${i * 60} 462 230)"/>`).join(''), [30, -100]),
      part('tubo_sop', `<path d="M500 205 h140 l60 -26 v100 l-60 -26 h-140z" fill="#3b82f6"/><path d="M500 218 h140" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/>`, [110, 20])],
    Ahoyador: () => [...gas(), part('caja', `<rect x="440" y="215" width="70" height="60" rx="10" fill="#6b7280"/><circle cx="475" cy="245" r="14" fill="#374151"/>`, [50, 0]),
      part('barrena', `<rect x="516" y="236" width="16" height="150" rx="8" fill="#9ca3af"/>` + R(4).map(i => `<path d="M492 ${280 + i * 30} q32 -16 64 0" stroke="#d97706" stroke-width="10" fill="none" stroke-linecap="round"/>`).join(''), [110, 40])],
    Motoazada: () => [...gas(), part('caja', `<rect x="440" y="225" width="84" height="84" rx="12" fill="#6b7280"/><circle cx="482" cy="267" r="18" fill="#374151"/>`, [60, 0]),
      part('azada', R(4).map(i => `<path d="M498 350 q36 -6 34 34" stroke="#9ca3af" stroke-width="9" fill="none" stroke-linecap="round" transform="rotate(${i * 90} 498 350)"/>`).join('') + `<circle cx="498" cy="350" r="12" fill="#374151"/>`, [120, 40])],
    'Cortacésped': () => [...gas({ sinArranque: true, aceite: [600, 200] }), part('deck', `<path d="M200 305 h340 q20 0 20 20 v22 q0 14 -14 14 h-352 q-14 0 -14 -14 v-22 q0 -20 20 -20z" fill="#16a34a"/><rect x="226" y="320" width="290" height="10" rx="5" fill="#15803d"/>`, [0, 30]),
      part('cuchilla', `<rect x="240" y="372" width="300" height="12" rx="6" fill="#d1d5db"/><circle cx="390" cy="378" r="10" fill="#6b7280"/>`, [0, 80]),
      part('ruedas', `<circle cx="228" cy="372" r="24" fill="#1f2937"/><circle cx="228" cy="372" r="9" fill="#9ca3af"/><circle cx="552" cy="372" r="24" fill="#1f2937"/><circle cx="552" cy="372" r="9" fill="#9ca3af"/>`, [0, 40])],
    Generador: () => [part('tanque', A.tanque(255, 95), [0, -80]), part('bujia', A.bujia(405, 108), [30, -90]), part('filtro', A.filtro(165, 232), [-115, -10]), part('carb', A.carb(208, 200), [-75, 55]), part('motor', A.motor(250, 170), [0, 0]), part('aceite', A.aceite(95, 330), [-80, 70]),
      part('alternador', `<rect x="430" y="190" width="150" height="90" rx="16" fill="#2563eb"/>` + R(5).map(i => `<rect x="${446 + i * 26}" y="200" width="10" height="70" rx="5" fill="#1d4ed8"/>`).join('') + `<circle cx="505" cy="235" r="20" fill="#1e3a8a"/>`, [125, 0]),
      part('panel', `<rect x="270" y="345" width="170" height="48" rx="10" fill="#374151"/>` + R(3).map(i => `<circle cx="${305 + i * 50}" cy="369" r="12" fill="#111827"/><circle cx="${305 + i * 50}" cy="369" r="4" fill="#fbbf24"/>`).join(''), [0, 75]),
      part('avr', `<rect x="470" y="315" width="76" height="44" rx="6" fill="#16a34a"/>` + R(4).map(i => `<rect x="${480 + i * 16}" y="325" width="9" height="24" rx="2" fill="#bbf7d0"/>`).join(''), [95, 75])],
    Motobomba: () => [...gas(), part('bomba', A.volute(540, 262), [115, 0]), part('impulsor', A.impulsor(540, 262), [150, -95]),
      part('manguera', `<path d="M612 222 C 660 205, 690 160, 730 150" fill="none" stroke="#f57c00" stroke-width="16" stroke-linecap="round"/><path d="M612 222 C 660 205, 690 160, 730 150" fill="none" stroke="#ffb35c" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 14"/>`, [120, -65])],
    Electrobomba: () => [
      part('motor_e', `<rect x="120" y="190" width="200" height="110" rx="26" fill="#2563eb"/>` + R(7).map(i => `<rect x="${140 + i * 26}" y="200" width="10" height="90" rx="5" fill="#1d4ed8"/>`).join('') + `<rect x="100" y="205" width="30" height="80" rx="10" fill="#1e40af"/>`, [-55, 0]),
      part('condensador', `<rect x="190" y="146" width="56" height="44" rx="10" fill="#9ca3af"/><rect x="204" y="136" width="28" height="12" rx="4" fill="#6b7280"/>`, [0, -75]),
      part('sello', `<circle cx="346" cy="245" r="20" fill="#fbbf24"/><circle cx="346" cy="245" r="8" fill="#92400e"/>`, [20, 70]),
      part('bomba', A.volute(450, 245, 78), [110, 0]), part('impulsor', A.impulsor(450, 245), [150, -95]),
      part('cable', `<path d="M104 262 C 50 290, 30 340, -20 330" stroke="#111827" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-38" y="316" width="34" height="28" rx="5" fill="#111827"/><rect x="-44" y="324" width="10" height="5" fill="#9ca3af"/><rect x="-44" y="333" width="10" height="5" fill="#9ca3af"/>`, [-60, 45])],
    Fumigadora: () => [
      part('tanq_q', `<path d="M250 120 q-40 0 -40 40 v150 q0 40 40 40 h110 q40 0 40 -40 v-150 q0 -40 -40 -40 h-30 v-24 h-50 v24z" fill="#16a34a"/><rect x="226" y="200" width="150" height="108" rx="20" fill="#4ade80" opacity=".55"/>`, [-70, 0]),
      part('filtro_q', `<path d="M470 250 l-26 40 h52z" fill="#fbbf24"/>`, [60, 60]),
      part('palanca', `<rect x="420" y="160" width="76" height="30" rx="8" fill="#6b7280"/><path d="M458 160 L520 120" stroke="#f57c00" stroke-width="9" stroke-linecap="round"/>`, [90, -50]),
      part('manguera', `<path d="M496 275 C 560 275, 560 330, 640 320" fill="none" stroke="#f57c00" stroke-width="12" stroke-linecap="round"/>`, [100, 20]),
      part('lanza', `<rect x="640" y="308" width="110" height="10" rx="5" fill="#9ca3af"/><rect x="650" y="318" width="14" height="34" rx="6" fill="#374151"/>`, [130, 50]),
      part('boquilla', `<circle cx="762" cy="313" r="12" fill="#f57c00"/><path d="M778 306l18-8M778 313h20M778 320l18 8" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>`, [170, 80])],
    'Cerca eléctrica': () => [
      part('energizador', `<rect x="150" y="180" width="130" height="120" rx="14" fill="#374151"/><circle cx="185" cy="215" r="9" fill="#22c55e"/><circle cx="215" cy="215" r="9" fill="#fbbf24"/><rect x="170" y="245" width="90" height="12" rx="6" fill="#6b7280"/><rect x="170" y="268" width="60" height="12" rx="6" fill="#6b7280"/>`, [-70, 0]),
      part('aislador', `<rect x="470" y="130" width="14" height="240" fill="#8a6238"/>` + R(3).map(i => `<rect x="456" y="${150 + i * 70}" width="42" height="14" rx="5" fill="#f4f4f5"/>`).join(''), [40, -40]),
      part('hilo', `<path d="M280 220 H700 M280 290 H700" stroke="#9ca3af" stroke-width="4"/>`, [70, 50]),
      part('tierra', `<rect x="220" y="300" width="8" height="90" rx="4" fill="#9ca3af"/><rect x="212" y="300" width="24" height="10" rx="3" fill="#6b7280"/>`, [-30, 80]),
      part('bateria', `<rect x="120" y="335" width="90" height="50" rx="8" fill="#16a34a"/><rect x="132" y="327" width="14" height="10" rx="2" fill="#374151"/><rect x="184" y="327" width="14" height="10" rx="2" fill="#374151"/>`, [-85, 55])]
  };

  /* ---------- cuidados por tipo de máquina ---------- */
  const CUID = {
    Motosierra: [['Antes de cada uso', 'Revisa la tensión de la cadena y el aceite de cadena.', 'Cadena'], ['Cada tanque', 'Limpia el filtro de aire.', 'Filtro'], ['De vez en cuando', 'Afila la cadena y revisa la bujía.', 'Bujía']],
    'Guadañadora': [['Antes de cada uso', 'Revisa el hilo o la cuchilla y los tornillos.', 'Nylon'], ['Cada tanque', 'Limpia el filtro de aire.', 'Filtro'], ['De vez en cuando', 'Revisa la bujía y la grasa del cabezal.', 'Bujía']],
    Cortasetos: [['Después de cada uso', 'Limpia la hoja y engrásala.', 'Cuchilla'], ['De vez en cuando', 'Revisa la bujía y el filtro.', 'Bujía']],
    Sopladora: [['Cada tanque', 'Limpia el filtro de aire.', 'Filtro'], ['De vez en cuando', 'Revisa la bujía y la turbina.', 'Bujía']],
    Ahoyador: [['Después de cada uso', 'Limpia la barrena y revisa la punta.', ''], ['De vez en cuando', 'Revisa la grasa de la caja reductora y la bujía.', 'Grasa']],
    Motoazada: [['Antes de cada uso', 'Nivel de aceite y de combustible.', 'Aceite'], ['Después de cada uso', 'Quita raíces y piedras de las cuchillas.', ''], ['De vez en cuando', 'Revisa la bujía y el filtro.', 'Bujía']],
    'Cortacésped': [['Después de cada uso', 'Limpia la plataforma por debajo (con la máquina apagada).', ''], ['Cada temporada', 'Afila o cambia la cuchilla.', 'Cuchilla'], ['De vez en cuando', 'Aceite, filtro y bujía.', 'Aceite']],
    Generador: [['Antes de cada uso', 'Nivel de aceite y de combustible.', 'Aceite'], ['Cada mes', 'Enciéndelo unos minutos aunque no lo uses.', ''], ['De vez en cuando', 'Filtro de aire y bujía.', 'Filtro']],
    Motobomba: [['Antes de cada uso', 'Nivel de aceite y filtro de succión.', 'Aceite'], ['De vez en cuando', 'Válvula de pie, mangueras y bujía.', 'Válvula']],
    Electrobomba: [['Antes de usar', 'Que esté cebada y con las conexiones secas.', ''], ['Periódicamente', 'Limpia el filtro de succión y revisa la válvula.', 'Válvula']],
    Fumigadora: [['Después de cada uso', 'Enjuaga el tanque y las mangueras con agua limpia.', 'Manguera'], ['Periódicamente', 'Revisa la lanza, la boquilla y los empaques.', 'Lanza']],
    'Cerca eléctrica': [['Cada semana', 'Quita la vegetación que toque el cable.', ''], ['Cada mes', 'Revisa aisladores, tierra y la carga de la batería.', 'Insulador']]
  };
  const CUID_GEN = [['Antes de cada uso', 'Revisa el nivel de aceite y de combustible.', 'Aceite'], ['De vez en cuando', 'Filtro de aire y bujía.', 'Filtro']];

  /* ---------- síntomas: qué piezas revisar primero ---------- */
  const SINT = [
    ['No arranca', ['bujia', 'carb', 'filtro', 'tanque', 'arranque']],
    ['Pierde fuerza', ['filtro', 'bujia', 'carb', 'embrague', 'cadena', 'cuchilla', 'hoja']],
    ['Se apaga solo', ['carb', 'tanque', 'filtro', 'bujia']],
    ['Humo o ruido raro', ['aceite', 'motor', 'embrague', 'caja']],
    ['Vibra de más', ['cadena', 'cuchilla', 'cabezal', 'impulsor', 'turbina', 'azada', 'barrena', 'tubo']],
    ['No corta bien', ['cadena', 'espada', 'hoja', 'cabezal', 'cuchilla', 'embrague']],
    ['Sube poca agua', ['impulsor', 'sello', 'manguera', 'bomba', 'condensador', 'motor_e']],
    ['Pierde presión o gotea', ['sello', 'manguera', 'lanza', 'boquilla', 'palanca', 'tanq_q', 'filtro_q']],
    ['Zumba y no gira', ['condensador', 'motor_e', 'impulsor']],
    ['No da electricidad', ['alternador', 'avr', 'panel', 'bujia', 'carb']],
    ['Choque débil', ['energizador', 'tierra', 'aislador', 'hilo', 'bateria']],
    ['Se calienta de más', ['aceite', 'filtro', 'motor', 'motor_e', 'sello', 'condensador']]
  ];
  const sintomas = ps => SINT.map(([n, ids]) => [n, ids.map(id => ps.findIndex(p => p.id === id)).filter(k => k >= 0)]).filter(([, k]) => k.length);

  /* ---------- datos y estado ---------- */
  const TC = {}; CATALOGO.filter(q => PZ.includes(q.cat)).forEach(q => { (TC[q.tipo] = TC[q.tipo] || {})[q.cat] = (TC[q.tipo][q.cat] || 0) + 1; });
  const catDe = t => Object.entries(TC[t] || {}).sort((x, y) => y[1] - x[1])[0]?.[0];
  const nPz = t => Object.values(TC[t] || {}).reduce((a, b) => a + b, 0);
  const prodDe = m => m.modelo ? CATALOGO.find(p => p.id === m.modelo) : null;
  const mkey = m => [m.tipo, m.marca || '', m.modelo || ''].join('|');
  const igual = (a, b) => !!a && !!b && mkey(a) === mkey(b);
  const nombre = m => { const p = prodDe(m); return p ? p.titulo : [m.tipo, m.marca && m.marca !== 'otra' && m.marca !== 'Otras marcas' ? m.marca : ''].filter(Boolean).join(' · '); };
  const readMant = () => { try { return JSON.parse(localStorage.getItem('mant-garaje')) || {}; } catch (e) { return {}; } };
  const writeMant = o => { try { localStorage.setItem('mant-garaje', JSON.stringify(o)); } catch (e) {} };
  const hace = ts => { const d = Math.floor((Date.now() - ts) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };
  const DIAS = { 'Cada semana': 7, 'Cada mes': 30, 'Cada tanque': 30, 'Periódicamente': 60, 'De vez en cuando': 90, 'Cada temporada': 180 };
  const lista = m => CUID[m.tipo] || CUID_GEN;
  // shortcut: sin fecha registrada cuenta 50 %; baja a 0 cuando pasa el doble del plazo. Pautas generales, no del fabricante.
  function salud(m) {
    const done = readMant()[mkey(m)] || {}, now = Date.now(), items = [];
    lista(m).forEach(([cuando, txt, rep], i) => { const d = DIAS[cuando]; if (!d) return; const t = done[i], el = t ? (now - t) / 864e5 : null; items.push({ i, txt, cuando, rep, d, t, el, v: el == null ? .5 : el <= d ? 1 : Math.max(0, 1 - (el - d) / d), vencido: el != null && el > d }); });
    return { items, pct: items.length ? Math.round(items.reduce((a, x) => a + x.v, 0) / items.length * 100) : null, venc: items.filter(x => x.vencido), sin: items.filter(x => x.t == null) };
  }
  const tono = p => p == null ? '' : p >= 75 ? 'ok' : p >= 45 ? 'med' : 'mal';
  const ring = p => `<svg class="ring ${tono(p)}" viewBox="0 0 44 44" role="img" aria-label="Salud ${p} por ciento"><circle cx="22" cy="22" r="18" class="rg-b"/><circle cx="22" cy="22" r="18" class="rg-f" style="--p:${p}"/><text x="22" y="26.5" text-anchor="middle">${p}</text></svg>`;
  const readF = () => { try { return JSON.parse(localStorage.getItem('ficha-garaje')) || {}; } catch (e) { return {}; } };
  const writeF = o => { try { localStorage.setItem('ficha-garaje', JSON.stringify(o)); } catch (e) {} };
  const fechaL = d => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  let sel = 0, tab = 'dentro', stop = null;
  const root = $('#gar');

  /* ---------- pantalla principal ---------- */
  function render() {
    stop && stop(); stop = null;
    const g = EQ.garaje(); if (sel >= g.length) sel = Math.max(0, g.length - 1);
    const st = $('#gStats');
    if (st) { const ss = g.map(salud).filter(x => x.pct != null), pm = ss.length ? Math.round(ss.reduce((a, x) => a + x.pct, 0) / ss.length) : null, vv = ss.reduce((a, x) => a + x.venc.length, 0);
      st.innerHTML = g.length ? `<div class="gst"><b>${g.length}</b><span>máquina${g.length > 1 ? 's' : ''}</span></div>${pm != null ? `<div class="gst"><b class="${tono(pm)}">${pm}%</b><span>salud promedio</span></div>` : ''}<div class="gst"><b class="${vv ? 'mal' : 'ok'}">${vv}</b><span>cuidado${vv === 1 ? '' : 's'} vencido${vv === 1 ? '' : 's'}</span></div>` : ''; }
    if (!g.length) { root.innerHTML = vacio(); wire(); return; }
    const act = EQ.get();
    root.innerHTML = `<div class="bays" role="tablist" aria-label="Mis máquinas">${g.map((m, i) => { const p = prodDe(m); return `<button type="button" class="bay${i === sel ? ' on' : ''}" role="tab" aria-selected="${i === sel}" data-bay="${i}" style="--i:${i}">
        <span class="bay-i">${p ? `<img src="${p.imagens[0]}" alt="" loading="lazy">` : `<b>${ICN(m.tipo)}</b>`}</span>
        <span class="bay-t"><b>${esc(nombre(m))}</b><small>${esc(m.tipo)}</small></span>${igual(m, act) ? '<em class="bay-use">En uso</em>' : ''}</button>`; }).join('')}
      <button type="button" class="bay bay-add" data-add><span class="bay-i"><b>${window.icon('plus')}</b></span><span class="bay-t"><b>Agregar máquina</b><small>Del catálogo UNICORN</small></span></button></div>
      <section class="shop glass" id="shop">${taller(g[sel])}</section>`;
    wire(); pintaTab();
  }
  const vacio = () => `<div class="gvac glass"><h2>Tu garaje está vacío</h2><p>Elige lo que tienes y lo guardamos aquí. Desde cada máquina verás su interior, sus repuestos y cuándo cuidarla.</p>
    <div class="gtipos">${EQ.tipos().map(t => `<button type="button" class="opt" data-pick="${esc(t)}">${ICN(t)} ${esc(t)}</button>`).join('')}</div></div>`;

  function taller(m) {
    const p = prodDe(m), act = igual(m, EQ.get()), sa = salud(m), w = sa.venc[0];
    return `<header class="shop-h"><div class="shop-t"><span class="eyebrow">${esc(m.tipo)}${m.marca && m.marca !== 'otra' ? ' · ' + esc(m.marca) : ''}</span><h2>${esc(nombre(m))}</h2></div>
      ${sa.pct != null ? `<button type="button" class="shop-s" data-tab-go="cuidados" title="Ver cuidados">${ring(sa.pct)}<span><b>Salud de la máquina</b><small>${sa.venc.length ? sa.venc.length + ' cuidado' + (sa.venc.length > 1 ? 's' : '') + ' vencido' + (sa.venc.length > 1 ? 's' : '') : sa.sin.length === sa.items.length ? 'Registra tus cuidados' : 'Al día'}</small></span></button>` : ''}
      <div class="shop-a">${p ? `<button type="button" class="btn btn-ghost" data-ficha="${p.id}">Ver ficha</button>` : ''}
      <button type="button" class="btn ${act ? 'btn-ghost' : 'btn-primary'}" data-usar="${sel}" ${act ? 'aria-pressed="true"' : ''}>${act ? 'Es la que uso para filtrar piezas' : 'Usar para filtrar piezas'}</button>
      <button type="button" class="btn btn-ghost" data-quitar="${sel}" aria-label="Quitar del garaje">Quitar</button></div></header>
      ${w ? `<div class="gwarn" role="status"><b>Cuidado pendiente:</b> ${esc(w.txt)} <span>Se recomienda cada ${w.d} días y van ${Math.floor(w.el)}.</span> <button type="button" class="link" data-tab-go="cuidados">Ver cuidados</button></div>` : ''}
      <div class="seg shop-tabs" role="tablist">${[['dentro', 'Por dentro'], ['piezas', 'Piezas'], ['cuidados', 'Cuidados'], ['ficha', 'Ficha'], ['ayuda', 'Ayuda']].map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-pressed="${k === tab}">${l}</button>`).join('')}</div>
      <div class="shop-b" id="shopB"></div>`;
  }

  function pintaTab() {
    stop && stop(); stop = null;
    const m = EQ.garaje()[sel]; if (!m) return; const B = $('#shopB');
    $$('[data-tab]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === tab));
    B.innerHTML = { dentro: tDentro, piezas: tPiezas, cuidados: tCuidados, ficha: tFicha, ayuda: tAyuda }[tab](m);
    B.classList.remove('in'); void B.offsetWidth; B.classList.add('in');
    if (tab === 'dentro') stop = animaDentro(m);
    if (tab === 'ficha') pintaFicha(m);
    window.mount && window.mount(B);
  }

  /* ---------- pestaña "Por dentro": plano interactivo ---------- */
  const piezasDeMaq = m => (FAM[m.tipo] || FAM.Generador)();
  function tDentro(m) {
    const ps = piezasDeMaq(m), sn = sintomas(ps);
    const grid = `<g class="dd-grid">${R(15).map(i => `<path d="M${-100 + i * 64} -50V450"/>`).join('')}${R(9).map(i => `<path d="M-100 ${-50 + i * 62}H860"/>`).join('')}</g>`;
    return `<div class="dd"><div class="dd-stage"><svg class="dd-svg" id="ddSvg" viewBox="-100 -50 960 500" role="img" aria-label="${esc(m.tipo)} y sus piezas principales">${grid}
        <ellipse cx="380" cy="405" rx="290" ry="12" fill="rgba(0,0,0,.14)" class="dd-sombra"/>
        ${ps.map((p, i) => `<g class="part" data-p="${i}" style="--dx:${p.d[0]};--dy:${p.d[1]}" tabindex="0" role="button" aria-label="${esc(INFO[p.id][0])}">${p.art}</g>`).join('')}</svg>
        <div class="d3" id="d3" aria-label="Vista 3D por capas: arrastra para girar"><div class="d3-sc" id="d3sc"></div><span class="d3-h">Arrastra para girar</span></div>
      <div class="dd-ctl"><label class="dd-sl"><span>Armada</span><input type="range" id="ddE" min="0" max="100" value="0" aria-label="Desarmar"><span>Desarmada</span></label>
        <div class="dd-btns"><button type="button" class="btn btn-primary" id="ddTour">Iniciar recorrido</button><button type="button" class="btn btn-ghost" id="dd3" aria-pressed="false">Vista 3D</button><button type="button" class="btn btn-ghost" id="ddBp" aria-pressed="false">Plano técnico</button></div></div></div>
      <div class="dd-side">${sn.length ? `<div class="dd-sint"><b>¿Algo falla?</b><div class="dd-chips">${sn.map(([n], i) => `<button type="button" class="opt" data-sn="${i}" aria-pressed="false">${esc(n)}</button>`).join('')}</div></div>` : ''}
        <ol class="dd-list" id="ddList">${ps.map((p, i) => `<li><button type="button" data-k="${i}"><i>${i + 1}</i><span>${esc(INFO[p.id][0])}</span><em class="wear w${INFO[p.id][4]}" title="Desgaste habitual"><s></s><s></s><s></s></em></button></li>`).join('')}</ol>
        <div class="dd-det glass" id="ddDet"></div></div></div>`;
  }
  function animaDentro(m) {
    const NS = 'http://www.w3.org/2000/svg', ps = piezasDeMaq(m), sn = sintomas(ps), svg = $('#ddSvg'), stage = $('.dd-stage'), d3 = $('#d3'), sc = $('#d3sc'), E = $('#ddE'), det = $('#ddDet'), list = $$('#ddList button');
    let act = -1, timer = 0, raf = 0, dead = false, rx = -20, ry = -30, drag = null, moved = false, auto = true, t0 = 0, sw = 0;
    $$('.part', svg).forEach((g, i) => { const b = g.getBBox(); g.insertAdjacentHTML('beforeend', `<g class="dd-badge" transform="translate(${(b.x + b.width / 2).toFixed(0)} ${(b.y + b.height / 2).toFixed(0)})"><circle r="12"/><text y="4.5">${i + 1}</text></g>`); });
    // vista 3D: cada pieza vive en su propia capa y se separa en profundidad
    const DEPTH = { motor: 9, bomba: 8, tanque: 7, tanq_q: 8, alternador: 8, motor_e: 8, energizador: 7, deck: 5, cable: 2, hilo: 2, manguera: 3, aislador: 3, tierra: 3, cadena: 3, espada: 3 };
    sc.insertAdjacentHTML('beforeend', '<div class="d3-floor"></div>');
    $$('.part', svg).forEach((g, i) => {
      const n = DEPTH[ps[i].id] || 4, w = document.createElement('div'); w.className = 'd3-g'; w.style.setProperty('--z', i);
      for (let k = 0; k < n; k++) {   // varias láminas apiladas dan volumen; las de atrás se oscurecen
        const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '-100 -50 960 500'); s.setAttribute('class', 'd3-p' + (k === n - 1 ? ' f' : '')); s.style.cssText = `--s:${k - n + 1};filter:brightness(${(0.5 + 0.5 * k / (n - 1)).toFixed(2)})`;
        const c = g.cloneNode(true); if (k < n - 1) { const bd = c.querySelector('.dd-badge'); bd && bd.remove(); c.removeAttribute('tabindex'); } s.appendChild(c); w.appendChild(s);
      }
      sc.appendChild(w);
    });
    d3.style.setProperty('--n', ps.length);
    const rot = () => { sc.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; }; rot();
    const todas = () => $$('.part', stage);
    const pon = e => { [svg, d3].forEach(x => { x.style.setProperty('--e', (e / 100).toFixed(3)); x.classList.toggle('abierto', e > 30); }); E.value = e; };
    const limpia = () => todas().forEach(g => g.classList.remove('on', 'dim', 'sus'));
    const sel1 = i => {
      act = i; limpia(); $$('[data-sn]').forEach(b => b.setAttribute('aria-pressed', 'false'));
      todas().forEach(g => { const k = +g.dataset.p; g.classList.toggle('on', k === i); g.classList.toggle('dim', i >= 0 && k !== i); }); list.forEach((b, k) => b.classList.toggle('on', k === i));
      if (i < 0) { det.innerHTML = `<h3>${esc(m.tipo)}: ${ps.length} piezas clave</h3><p>Mueve la barra para desarmarla, toca una pieza, elige un síntoma o pulsa <b>Iniciar recorrido</b>. Son pautas generales: el manual de tu equipo manda.</p>`; return; }
      const [n, que, cuando, rep, des] = INFO[ps[i].id], pg = rep && catDe(rep), c = rep ? nPz(rep) : 0;
      det.innerHTML = `<span class="dd-n">${i + 1} / ${ps.length}</span><h3>${esc(n)}</h3><p>${esc(que)}</p><p class="dd-w"><b>Cuándo mirarla:</b> ${esc(cuando)}</p><p class="dd-d">Desgaste habitual: <b>${['', 'bajo', 'medio', 'alto'][des]}</b></p>
        ${c ? `<a class="btn btn-primary" href="${CATEGORIAS[pg].pagina}?tipo=${encodeURIComponent(rep)}&mi=1" data-usa>Ver ${c} repuesto${c > 1 ? 's' : ''} ${window.icon('arrow')}</a>` : `<a class="btn btn-ghost" href="https://wa.me/${window.WA_NUM}?text=${encodeURIComponent(`Hola UNICORN, busco ${n.toLowerCase()} para mi ${nombre(m)}`)}" target="_blank" rel="noopener">Consultar con un asesor</a>`}`;
    };
    const sint = i => {
      if (i < 0 || !sn[i]) return sel1(-1);
      parar(); act = -1; limpia(); list.forEach(b => b.classList.remove('on')); $$('[data-sn]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.sn === i));
      const ks = sn[i][1]; if (+E.value < 60) mover(100, 600);
      todas().forEach(g => { const o = ks.indexOf(+g.dataset.p); g.classList.toggle('sus', o >= 0); g.classList.toggle('dim', o < 0); });
      det.innerHTML = `<h3>${esc(sn[i][0])}</h3><p>Posibles causas, de la más a la menos probable. Revísalas en este orden:</p><ol class="dd-sus">${ks.map(k => `<li><button type="button" data-k="${k}">${esc(INFO[ps[k].id][0])}</button></li>`).join('')}</ol><p class="dd-d">Si sigue igual, consulta con el servicio técnico.</p><button type="button" class="btn btn-ghost" data-sn="-1">Limpiar</button>`;
    };
    const mover = (to, ms = 900, fin) => { cancelAnimationFrame(raf); const from = +E.value, t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / ms), e = k * k * (3 - 2 * k); pon(from + (to - from) * e); if (k < 1 && !dead) raf = requestAnimationFrame(f); else fin && fin(); }; reduce ? (pon(to), fin && fin()) : (raf = requestAnimationFrame(f)); };
    function parar() { clearInterval(timer); timer = 0; $('#ddTour').textContent = 'Iniciar recorrido'; }
    const abrir = () => { if (+E.value < 60) mover(100, 500); };
    E.addEventListener('input', () => { cancelAnimationFrame(raf); pon(+E.value); });
    stage.addEventListener('click', e => { const g = e.target.closest('.part'); if (g && !moved) { parar(); abrir(); sel1(+g.dataset.p); } });
    stage.addEventListener('keydown', e => { const g = e.target.closest('.part'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); parar(); sel1(+g.dataset.p); } });
    $('.dd-side').addEventListener('click', e => { const b = e.target.closest('[data-k]'), s = e.target.closest('[data-sn]'); if (b) { parar(); abrir(); sel1(+b.dataset.k); } else if (s) { const i = +s.dataset.sn; sint(s.getAttribute('aria-pressed') === 'true' ? -1 : i); } });
    $('#ddBp').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); stage.classList.toggle('bp', on); });
    $('#dd3').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); stage.classList.toggle('m3d', on); if (on) { rx = -20; ry = -30; auto = true; t0 = performance.now(); rot(); abrir(); } });
    d3.addEventListener('pointerdown', e => { auto = false; drag = { x: e.clientX, y: e.clientY, rx, ry }; moved = false; });
    const mv = e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 5) moved = true; ry = drag.ry + dx * .45; rx = Math.max(-70, Math.min(50, drag.rx - dy * .35)); rot(); };
    const up = () => { drag = null; setTimeout(() => { moved = false; }, 0); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
    const sway = t => { if (dead) return; if (auto && !drag && !reduce && stage.classList.contains('m3d')) { ry = -30 + 18 * Math.sin((t - t0) / 1800); rot(); } sw = requestAnimationFrame(sway); }; sw = requestAnimationFrame(sway);
    $('#ddTour').addEventListener('click', () => {
      if (timer) return parar(); $('#ddTour').textContent = 'Detener recorrido';
      const paso = () => { sel1((act + 1) % ps.length); };
      mover(100, 800, () => { paso(); timer = setInterval(paso, 3400); });
    });
    pon(0); sel1(-1); setTimeout(() => !dead && +E.value === 0 && mover(100, 1300), 500);
    return () => { dead = true; clearInterval(timer); cancelAnimationFrame(raf); cancelAnimationFrame(sw); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
  }

  /* ---------- pestaña "Piezas" ---------- */
  function tPiezas(m) {
    const p0 = prodDe(m) || { tipo: m.tipo, cat: 'campo' }, ps = window.piezasDe(p0), kit = window.kitDe(p0);
    if (!ps.length) return `<p class="gnota">Para este equipo todavía no tenemos piezas marcadas como compatibles. <a class="link" href="https://wa.me/${window.WA_NUM}" target="_blank" rel="noopener">Pregúntale a un asesor</a>.</p>`;
    const cats = PZ.filter(c => ps.some(q => q.cat === c)), tot = kit.reduce((s, q) => s + q.precio, 0);
    return `${kit.length >= 2 ? `<div class="gkit glass"><div><b>Mantenimiento básico</b><small>Lo que más se gasta en tu ${esc(m.tipo.toLowerCase())}.</small></div><div class="gkit-i">${kit.map(q => `<img src="${q.imagens[0]}" alt="${esc(q.titulo)}" title="${esc(q.titulo)}">`).join('')}</div><span class="gkit-p">${cop(tot)}</span><button type="button" class="btn btn-primary" data-kit="${kit.map(q => q.id).join(',')}">Agregar todo</button></div>` : ''}
      <div class="seg gp-tabs" role="tablist">${cats.map((c, i) => `<button type="button" data-pc="${c}" aria-pressed="${i === 0}">${CATEGORIAS[c].nombre} <small>${ps.filter(q => q.cat === c).length}</small></button>`).join('')}</div>
      ${cats.map((c, i) => `<div class="grid gp-grid" data-pcb="${c}" ${i ? 'hidden' : ''}>${ps.filter(q => q.cat === c).sort((a, b) => a.precio - b.precio).slice(0, 8).map((q, k) => window.cardHTML(q, k)).join('')}</div>`).join('')}
      <a class="btn btn-ghost gp-all" href="piezas-accesorios.html#finder" data-usa>Ver las ${ps.length} piezas compatibles ${window.icon('arrow')}</a>`;
  }

  /* ---------- pestaña "Cuidados" con medidor de salud ---------- */
  function tCuidados(m) {
    const L = lista(m), done = readMant()[mkey(m)] || {}, sa = salud(m), by = Object.fromEntries(sa.items.map(x => [x.i, x]));
    return `<div class="gsal glass">${sa.pct != null ? ring(sa.pct) : ''}<div><b>${sa.pct == null ? 'Sin medidor para esta máquina' : sa.venc.length ? 'Hay cuidados vencidos' : sa.sin.length === sa.items.length ? 'Aún no hay registros' : 'Tu máquina va al día'}</b><small>La salud sube cuando marcas un cuidado como hecho y baja con los días. Son plazos generales; el manual de tu equipo manda.</small></div></div>
      <ul class="gcu">${L.map(([cuando, txt, rep], i) => { const x = by[i]; return `<li class="${x && x.vencido ? 'late' : done[i] ? 'ok' : ''}"><div><em>${esc(cuando)}</em><span>${esc(txt)}</span>${done[i] ? `<small>Último: ${hace(done[i])}${x ? ` · ${x.vencido ? 'vencido' : 'vigente'}` : ''}</small>` : x ? '<small class="sinreg">Sin registro</small>' : ''}${x ? `<i class="gcu-bar"><s style="--w:${Math.round(x.v * 100)}%"></s></i>` : ''}</div>
      <div class="gcu-b">${rep && nPz(rep) ? `<a class="link" href="${CATEGORIAS[catDe(rep)].pagina}?tipo=${encodeURIComponent(rep)}&mi=1" data-usa>Ver ${esc(rep.toLowerCase())}</a>` : ''}<button type="button" class="btn btn-ghost" data-hecho="${i}">${done[i] ? 'Hecho de nuevo' : 'Marcar hecho'}</button></div></li>`; }).join('')}</ul>`;
  }

  /* ---------- pestaña "Ficha": datos de la máquina, garantía y código QR ---------- */
  function tFicha(m) {
    const f = readF()[mkey(m)] || {};
    return `<div class="gficha"><form class="gf-f glass" id="gF" autocomplete="off" onsubmit="return false"><h3>Datos de tu máquina</h3>
      <label>Serial<input class="gf-i" name="serial" value="${esc(f.serial || '')}" placeholder="Lo ves en la placa del equipo" maxlength="40"></label>
      <label>Fecha de compra<input class="gf-i" type="date" name="compra" value="${esc(f.compra || '')}"></label>
      <label>Garantía (meses)<input class="gf-i" type="number" name="meses" min="0" max="120" value="${esc(f.meses || '')}" placeholder="Ej. 12"></label>
      <label>Notas<textarea class="gf-i" name="notas" rows="3" maxlength="300" placeholder="Dónde la guardas, quién la usa…">${esc(f.notas || '')}</textarea></label>
      <small class="gnota">Se guarda solo en este navegador.</small></form>
      <div class="gf-c glass" id="gFc"></div></div>`;
  }
  function pintaFicha(m) {
    const form = $('#gF'), out = $('#gFc'), k = mkey(m);
    const pinta = () => {
      const f = readF()[k] || {}; let g = '';
      if (f.compra && +f.meses) { const fin = new Date(f.compra + 'T12:00:00'); fin.setMonth(fin.getMonth() + +f.meses); const d = Math.ceil((fin - Date.now()) / 864e5);
        g = `<div class="gar-st ${d < 0 ? 'mal' : d < 60 ? 'med' : 'ok'}"><b>${d < 0 ? 'Garantía vencida' : 'Garantía vigente'}</b><span>${d < 0 ? `Venció el ${fechaL(fin)}` : `Vence el ${fechaL(fin)} · faltan ${d} día${d === 1 ? '' : 's'}`}</span></div>`; }
      else g = '<div class="gar-st"><b>Garantía</b><span>Agrega fecha de compra y meses para ver cuándo vence.</span></div>';
      const txt = ['UNICORN', nombre(m), f.serial && 'Serial ' + f.serial, f.compra && 'Compra ' + f.compra].filter(Boolean).join(' | ').normalize('NFD').replace(/[̀-ͯ]/g, '');
      let svg = ''; try { const q = qrcode(0, 'M'); q.addData(txt); q.make(); svg = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) {}
      out.innerHTML = `${g}<div class="gf-qr">${svg ? `<div class="qr" role="img" aria-label="Código QR con los datos de la máquina">${svg}</div>` : ''}<div><b>Código QR de tu máquina</b><small>Guarda nombre, serial y fecha de compra. Pégalo en la máquina o en tu bodega y escanéalo cuando lo necesites.</small>${svg ? '<button type="button" class="btn btn-ghost" data-qr>Descargar QR</button>' : ''}</div></div>`;
      out.dataset.svg = svg;
    };
    form.addEventListener('input', () => { const o = readF(), f = o[k] = o[k] || {}; new FormData(form).forEach((v, n) => { f[n] = String(v).trim(); }); writeF(o); pinta(); });
    out.addEventListener('click', e => { if (!e.target.closest('[data-qr]')) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out.dataset.svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')], { type: 'image/svg+xml' })); a.download = `qr-${m.tipo.toLowerCase().replace(/[^a-z]+/g, '-')}.svg`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
    pinta();
  }

  /* ---------- pestaña "Ayuda" ---------- */
  function tAyuda(m) {
    const wa = t => `https://wa.me/${window.WA_NUM}?text=${encodeURIComponent(t)}`, n = nombre(m);
    return `<div class="gayuda"><a class="gay glass" href="${wa(`Hola UNICORN, tengo una duda con mi ${n}.`)}" target="_blank" rel="noopener"><b>${window.icon('chat')} Hablar con un asesor</b><span>Cuéntanos qué le pasa a tu ${esc(m.tipo.toLowerCase())} y te orientamos.</span></a>
      <a class="gay glass" href="${wa(`Hola UNICORN, necesito un repuesto para mi ${n}. ¿Me ayudan a encontrar el correcto?`)}" target="_blank" rel="noopener"><b>${window.icon('gear')} No encuentro un repuesto</b><span>Dinos la pieza y la referencia que ves en tu equipo.</span></a>
      <a class="gay glass" href="piezas-accesorios.html#finder" data-usa><b>${window.icon('wrench')} Buscar piezas compatibles</b><span>El buscador ya sabrá cuál es tu equipo.</span></a></div>`;
  }

  /* ---------- agregar máquina ---------- */
  function agregar(tipo) {
    let m = $('#gmodal'); if (!m) { m = document.createElement('div'); m.id = 'gmodal'; m.className = 'cmp-modal gmodal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Agregar máquina'); document.body.appendChild(m); }
    const cerrar = () => { m.hidden = true; document.body.style.overflow = ''; };
    const paso1 = () => { m.innerHTML = `<div class="cmp-box glass gbox"><button class="icon-btn cmp-x" data-x aria-label="Cerrar">${window.icon('x')}</button><h3>¿Qué máquina quieres guardar?</h3><div class="gtipos">${EQ.tipos().map(t => `<button type="button" class="opt" data-t="${esc(t)}">${ICN(t)} ${esc(t)}</button>`).join('')}</div></div>`; };
    const paso2 = t => {
      const L = CATALOGO.filter(p => !PZ.includes(p.cat) && EQ.grupo(p.tipo) === t).sort((a, b) => a.titulo.localeCompare(b.titulo));
      m.innerHTML = `<div class="cmp-box glass gbox"><button class="icon-btn cmp-x" data-x aria-label="Cerrar">${window.icon('x')}</button><h3>${ICN(t)} ${esc(t)}: ¿cuál es la tuya?</h3>
        <input class="select gfind" id="gq" type="search" placeholder="Buscar por marca o modelo" aria-label="Buscar"><div class="glist" id="gl">${L.map(p => `<button type="button" class="gop" data-p="${p.id}" data-s="${esc((p.titulo + ' ' + p.marca).toLowerCase())}"><img src="${p.imagens[0]}" alt="" loading="lazy"><span>${esc(p.titulo)}</span></button>`).join('')}</div>
        <button type="button" class="btn btn-ghost" data-otra="${esc(t)}">No encuentro la mía: guardar solo “${esc(t)}”</button><button type="button" class="btn btn-ghost" data-back>Cambiar tipo</button></div>`;
      $('#gq').addEventListener('input', e => { const q = e.target.value.toLowerCase().trim(); $$('#gl .gop').forEach(b => b.hidden = !!q && !b.dataset.s.includes(q)); });
    };
    const guardar = o => { EQ.set(o); EQ.guardar(); sel = Math.max(0, EQ.garaje().findIndex(g => igual(g, o))); tab = 'dentro'; cerrar(); window.toast && window.toast(`${window.icon('check')} Guardado en tu garaje`); };
    m.onclick = e => {
      if (e.target === m || e.target.closest('[data-x]')) return cerrar();
      const t = e.target.closest('[data-t]'), p = e.target.closest('[data-p]'), o = e.target.closest('[data-otra]');
      if (t) return paso2(t.dataset.t);
      if (e.target.closest('[data-back]')) return paso1();
      if (p) { const pr = CATALOGO.find(q => q.id === p.dataset.p); return guardar({ tipo: EQ.grupo(pr.tipo), marca: pr.marca, modelo: pr.id }); }
      if (o) guardar({ tipo: o.dataset.otra, marca: 'otra', modelo: '' });
    };
    tipo ? paso2(tipo) : paso1(); m.hidden = false; document.body.style.overflow = 'hidden'; window.mount && window.mount(m);
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', k); } });
  }

  /* ---------- eventos de la pantalla ---------- */
  function wire() {
    root.onclick = e => {
      const t = e.target;
      const bay = t.closest('[data-bay]'); if (bay) { sel = +bay.dataset.bay; tab = 'dentro'; render(); return; }
      if (t.closest('[data-add]')) return agregar();
      const pk = t.closest('[data-pick]'); if (pk) return agregar(pk.dataset.pick);
      const tg = t.closest('[data-tab-go]'); if (tg) { tab = tg.dataset.tabGo; render(); return; }
      const tb = t.closest('[data-tab]'); if (tb) { tab = tb.dataset.tab; pintaTab(); return; }
      const us = t.closest('[data-usar]'); if (us) { EQ.activar(+us.dataset.usar); window.toast && window.toast(`${window.icon('check')} Ahora usas tu ${EQ.etiqueta()}`); return; }
      const qu = t.closest('[data-quitar]'); if (qu) { EQ.quitar(+qu.dataset.quitar); render(); return; }
      const fi = t.closest('[data-ficha]'); if (fi) return window.abrirProducto(fi.dataset.ficha);
      const pc = t.closest('[data-pc]'); if (pc) { $$('[data-pc]').forEach(b => b.setAttribute('aria-pressed', b === pc)); $$('[data-pcb]').forEach(d => d.hidden = d.dataset.pcb !== pc.dataset.pc); return; }
      const kt = t.closest('[data-kit]'); if (kt) { const img = $('.gkit-i img'); kt.disabled = true; kt.dataset.kit.split(',').forEach((id, i) => setTimeout(() => window.agregar(id, img), i * 200)); setTimeout(() => { kt.disabled = false; }, 1400); return; }
      const hc = t.closest('[data-hecho]'); if (hc) { const o = readMant(), m = EQ.garaje()[sel], k = mkey(m); (o[k] = o[k] || {})[hc.dataset.hecho] = Date.now(); writeMant(o); render(); return; }
      const es = t.closest("[data-usa]"); if (es) EQ.activar(sel);   // el enlace sigue su camino con tu equipo activo
    };
  }

  // la puerta del garaje se abre al entrar; también se abre y se cierra al tocarla
  const puerta = $('#gdoor');
  if (puerta) {
    let vista = false; try { vista = sessionStorage.getItem('puerta-garaje') === '1'; sessionStorage.setItem('puerta-garaje', '1'); } catch (e) {}
    if (vista || reduce) puerta.classList.add('ya', 'open'); else setTimeout(() => puerta.classList.add('open'), 700);
    const alt = () => { puerta.classList.remove('ya'); puerta.classList.toggle('open'); };
    puerta.addEventListener('click', alt); puerta.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alt(); } });
  }
  document.addEventListener('DOMContentLoaded', () => { render(); });
  let ult = ''; addEventListener('eq-change', () => { const s = JSON.stringify([EQ.garaje(), EQ.get()]); if (s !== ult) { ult = s; if (root.children.length) render(); } });
})();
