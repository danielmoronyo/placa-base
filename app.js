/* Identifique los componentes de 5 tarjetas madre BIOSTAR
 * Conversión a tecnologías web (HTML + CSS + SVG + JavaScript) de la aplicación Flash
 * "P2c_biostar.swf" (Repare su PC). La lógica reproduce el ActionScript original:
 *  - 5 pantallas de tarjeta madre con 17/18 etiquetas arrastrables cada una;
 *  - al soltar, la etiqueta se "imanta" a la casilla bajo el puntero (zona de 70 × 20 px);
 *  - al pulsar «Siguiente» se cuenta cuántas etiquetas solapan su casilla correcta;
 *  - nota por tarjeta = aciertos * 100 / nº de etiquetas; promedio de las cinco.
 * Las coordenadas están en píxeles del escenario original (640 × 480).
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ datos */
  // Cada tarjeta: casillas (X, Y, texto) tal y como están en los fotogramas 3-7 del SWF.
  // sx/sy = escala de las casillas en ese fotograma; listX = columna donde se apilan las etiquetas.
  const BOARDS = [
    { name: 'P4TSG PRO', svg: 'board1.svg', sx: 1.1592407, sy: 0.7371216, listX: 10, total: 18,
      title: { t: 'BIOSTAR P4TSG PRO', x: 101.95, y: 36.6, size: 28, cls: 'sans' },
      X: [105,190,305,420,370,340,170,385,250,270,225,466,400,580,330,530,510,110],
      Y: [130,160,175,340,125,410,375,195,345,280,260,68,80,65,65,410,170,420],
      T: ['CNR','PCI','AGP','DDRAM','Voltaje ATX','IDE','RAID','Chipset-MCH','Chipset-ICH','Bateria','BIOS','LPT1','USB','PS/2 y Teclado','Sonido','Conector Floppy','Socket 478','Conector Panel Frontal'] },
    { name: 'M7VKF', svg: 'board2.svg', sx: 1.1592407, sy: 0.7371216, listX: 10, total: 18,
      title: { t: 'BIOSTAR M7VKF', x: 101.95, y: 42.5, size: 35, cls: 'serif' },
      X: [350,565,250,400,165,330,430,175,130,470,280,385,250,450,410,510,585,585],
      Y: [180,400,380,205,100,425,385,350,230,75,315,75,180,130,315,235,75,110],
      T: ['AGP','Bateria','BIOS','Chipset','CNR','Conector Floppy','Conector IDE','Conector Panel Frontal','ISA','LPT1','ICH','MIDI','PCI','Reg. De Voltaje','SDRAM','Socket A o 462','PS/2 y Teclado','Voltaje ATX'] },
    { name: 'M6TSU', svg: 'board3.svg', sx: 1.2999878, sy: 0.8226776, listX: 5, total: 18,
      title: { t: 'BIOSTAR M6TSU', x: 102.1, y: 43.45, size: 36, cls: 'serif' },
      X: [85,165,320,370,470,579,395,395,520,435,579,300,425,155,110,85,235,475],
      Y: [130,200,220,80,80,80,175,245,220,315,385,395,360,370,415,305,365,400],
      T: ['AMR','PCI','AGP','MIDI','LPT1','PS/2 y Teclado','BIOS','Chipset','Socket 370','SDRAM','Conector ATX','IDE','Conector Floppy','RAID','Bateria','Conector Panel Frontal','ICH','Clear CMOS'] },
    // En el SWF esta tarjeta usa total = 17: la 18.ª casilla definida (PS/2 y Teclado) nunca se crea.
    { name: 'M7TDR', svg: 'board4.svg', sx: 1.3688965, sy: 0.86634827, listX: 10, total: 17,
      title: { t: 'BIOSTAR M7TDR', x: 101.95, y: 42.5, size: 35, cls: 'serif' },
      X: [340,100,525,110,395,400,355,190,115,275,275,465,380,225,500,455,505,580],
      Y: [185,110,415,270,225,410,130,340,345,290,345,65,65,170,115,345,210,80],
      T: ['AGP','AMR','Bateria','BIOS','Chipset','Conector ATX','Con. ATX12V','Conector Floppy','Conector Panel Frontal','ICH','IDE','LPT1','MIDI','PCI','Reg. De Voltaje','SDRAM','Socket 423','PS/2 y Teclado'] },
    { name: 'P4TSE PRO', svg: 'board5.svg', sx: 1.3570862, sy: 0.85816956, listX: 10, total: 18,
      title: { t: 'BIOSTAR P4TSE PRO', x: 101.95, y: 42, size: 35, cls: 'serif' },
      X: [105,190,305,420,370,340,110,385,250,270,225,466,400,580,330,530,510,110],
      Y: [130,160,175,340,125,410,60,195,345,280,260,68,80,65,65,410,170,420],
      T: ['CNR','PCI','AGP','DDRAM','Voltaje ATX','IDE','Wireless LAN','Chipset-MCH','Chipset-ICH','Bateria','BIOS','LPT1','USB','PS/2 y Teclado','Sonido','Conector Floppy','Socket 478','Conector Panel Frontal'] },
  ];

  const LABEL_W = 79.45, LABEL_H = 23.15;          // tamaño del clip «boton»
  const SNAP_W = 70, SNAP_H = 20;                  // zona de imantado (px) de cada casilla
  const LIST_Y = 20;                               // y de la primera etiqueta
  // límites del clip «objeto» respecto a su origen (antes de escalar)
  const MK = { l: -2.35, r: 46.8, t: -2.7, b: 25.45, w: 49.15, h: 28.15 };

  const ASSETS = ['bg.svg','logo.svg','btn.svg','marker.svg','intro-panel.svg','results-panel.svg',
                  ...BOARDS.map(b => b.svg)].map(f => '' + f);

  /* ------------------------------------------------------------------ utilidades */
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), screen = $('#screen');
  const NS = 'http://www.w3.org/2000/svg';
  let k = 1;                                       // escala escenario → pantalla

  function el(tag, props = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [a, v] of Object.entries(props)) {
      if (a === 'style') Object.assign(e.style, v);
      else if (a === 'class') e.className = v;
      else if (a.startsWith('on')) e.addEventListener(a.slice(2), v);
      else e.setAttribute(a, v);
    }
    e.append(...kids);
    return e;
  }
  const px = o => Object.fromEntries(Object.entries(o).map(([a, v]) => [a, typeof v === 'number' ? v + 'px' : v]));

  function img(src, x, y, w, h) {
    return el('img', { src: '' + src, alt: '', draggable: 'false', style: px({ left: x, top: y, width: w, height: h }) });
  }

  // capa SVG a pantalla completa con textos posicionados por línea base
  function textLayer(items) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'layer');
    svg.setAttribute('viewBox', '0 0 640 480');
    svg.setAttribute('aria-hidden', 'false');
    svg.style.pointerEvents = 'none';
    for (const it of items) {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', it.x); t.setAttribute('y', it.y);
      t.setAttribute('font-size', it.size); t.setAttribute('fill', it.fill);
      t.setAttribute('class', it.cls || 'sans');
      if (it.anchor) t.setAttribute('text-anchor', it.anchor);
      t.textContent = it.t;
      svg.append(t);
    }
    return svg;
  }

  function nextButton(text, scale, cx, onClick) {
    const w = 205.9 * scale, h = 40 * scale;
    const b = el('button', { class: 'nbtn', type: 'button', style: px({ left: 485, top: 440, width: 200 * scale, height: h }), onclick: onClick },
      el('img', { src: 'btn.svg', alt: '', draggable: 'false', style: px({ width: w, height: h }) }),
      el('span', { style: px({ left: cx - 485 - 60, width: 120, top: 3.5, lineHeight: '19px' }) }, text));
    return b;
  }

  const ding = new Audio('ding.mp3');
  ding.preload = 'auto';
  let flashTimer = 0;
  function acierto() {
    try { ding.currentTime = 0; const p = ding.play(); if (p) p.catch(() => {}); } catch (_) {}
    const f = $('#flash'); f.hidden = false;
    clearTimeout(flashTimer); flashTimer = setTimeout(() => { f.hidden = true; }, 333);
  }

  /* ------------------------------------------------------------------ estado */
  const state = { name: '', scores: [], boardIdx: 0 };

  function chrome(showLogo) {
    $('#logo').hidden = !showLogo;
    $('#logolink').hidden = !showLogo;
    $('#flash').hidden = true;
  }

  /* ------------------------------------------------------------------ pantallas */
  function showLoader(progress) {
    chrome(false);
    const done = progress ?? 0;
    const bar = el('div', { class: 'bar' });
    const fill = Math.max(0, Math.min(1, done)) * 118;
    bar.innerHTML = `<svg width="121" height="17" viewBox="-.5 -.5 121 17"><rect x="0" y="0" width="120" height="16" fill="#0066cc" stroke="#990000"/><rect x="1" y="1" width="${fill}" height="15" fill="#003366" stroke="#ffcc00"/></svg>`;
    screen.replaceChildren(
      textLayer([{ t: 'Cargando por Favor Espere...', x: 45.2, y: 82.8 + 21, size: 25, fill: '#000066', cls: 'verd' }]),
      bar);
    bar.firstChild.style.overflow = 'visible';
  }

  function showIntro() {
    chrome(true);
    const lines = ['Identifique los componentes', 'de 5 tarjetas madre', 'BIOSTAR:'];
    const pitch = 55.2, asc = 43.4;
    const items = [];
    lines.forEach((t, i) => items.push({ t, x: 15.55, y: 98.05 + asc + i * pitch, size: 48, fill: '#cccccc' }));
    lines.forEach((t, i) => items.push({ t, x: 13.55, y: 97.05 + asc + i * pitch, size: 48, fill: '#00006b' }));
    items.push({ t: 'Participante:', x: 29.05, y: 277.3 + 22.6, size: 25, fill: '#00006b' });

    const input = el('input', { id: 'pname', type: 'text', autocomplete: 'name', autocapitalize: 'words',
      spellcheck: 'false', 'aria-label': 'Participante', value: state.name });
    const go = () => { state.name = input.value; state.scores = []; showBoard(0); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });

    screen.replaceChildren(
      img('intro-panel.svg', 0, 0, 640, 480),
      textLayer(items),
      input,
      nextButton('Siguiente', 0.75, 562, go));
    // enfocar sin provocar saltos de escala en móviles
    setTimeout(() => input.focus({ preventScroll: true }), 0);
  }

  function showBoard(idx) {
    chrome(true);
    state.boardIdx = idx;
    const B = BOARDS[idx], n = B.total;
    const sx = B.sx, sy = B.sy;

    const layer = el('div', { class: 'layer', style: { overflow: 'hidden' } });
    layer.append(img(B.svg, 0, 0, 640, 480));

    // casillas (clip «objeto» duplicado n veces)
    const boxes = [];
    for (let i = 0; i < n; i++) {
      const X = B.X[i], Y = B.Y[i];
      boxes.push({ l: X + MK.l * sx, r: X + MK.r * sx, t: Y + MK.t * sy, b: Y + MK.b * sy });
      const m = img('marker.svg', X + MK.l * sx, Y + MK.t * sy, MK.w * sx, MK.h * sy);
      m.className = 'marker';
      layer.append(m);
    }

    layer.append(textLayer([{ t: B.title.t, x: B.title.x, y: B.title.y, size: B.title.size, fill: '#00006b', cls: B.title.cls }]));

    // etiquetas (clip «boton» duplicado n veces)
    let zTop = 10;
    const pos = [];                                  // posición actual de cada etiqueta
    const labels = [];
    for (let i = 0; i < n; i++) {
      pos[i] = { x: B.listX, y: LIST_Y + i * LABEL_H };
      const lab = el('div', { class: 'label', 'data-i': i, role: 'button', 'aria-label': 'Etiqueta ' + B.T[i], style: px({ left: pos[i].x, top: pos[i].y }) },
        el('img', { src: 'btn.svg', alt: '', draggable: 'false' }),
        el('b', {}, B.T[i].replace(/\s+/g, ' ')));
      labels.push(lab);
      layer.append(lab);
      attachDrag(lab, i);
    }

    const labelBox = i => ({ l: pos[i].x, r: pos[i].x + LABEL_W, t: pos[i].y, b: pos[i].y + LABEL_H });
    const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
    const acierta = i => overlap(labelBox(i), boxes[i]);
    const setPos = (i, x, y) => { pos[i] = { x, y }; labels[i].style.left = x + 'px'; labels[i].style.top = y + 'px'; };

    function attachDrag(lab, i) {
      let drag = null;
      lab.addEventListener('pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        lab.setPointerCapture(e.pointerId);
        const p = toStage(e);
        drag = { dx: p.x - pos[i].x, dy: p.y - pos[i].y, ox: pos[i].x, oy: pos[i].y, id: e.pointerId };
        lab.classList.add('drag');
        lab.style.zIndex = ++zTop;                   // traer al frente (sin mover el nodo: perdería la captura)
      });
      lab.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const p = toStage(e);
        setPos(i, p.x - drag.dx, p.y - drag.dy);
      });
      const end = (e, cancel) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag; drag = null;
        lab.classList.remove('drag');
        if (cancel) { setPos(i, d.ox, d.oy); return; }
        const p = toStage(e);                        // se usa la posición del ratón, como el original
        let hit = -1;
        for (let j = 0; j < n; j++) {
          if (p.x >= B.X[j] && p.x <= B.X[j] + SNAP_W && p.y >= B.Y[j] && p.y <= B.Y[j] + SNAP_H) { hit = j; break; }
        }
        if (hit >= 0) setPos(i, B.X[hit], B.Y[hit] - 3);
        else setPos(i, d.ox, d.oy);
        if (acierta(i)) acierto();
      };
      lab.addEventListener('pointerup', e => end(e, false));
      lab.addEventListener('pointercancel', e => end(e, true));
    }

    const isLast = idx === BOARDS.length - 1;
    const next = nextButton('Siguiente', 0.7265, 562, () => {
      let conteo = 0;
      for (let i = 0; i < n; i++) if (acierta(i)) conteo++;
      state.scores[idx] = conteo * 100 / n;
      if (isLast) showResults(); else showBoard(idx + 1);
    });
    screen.replaceChildren(layer, next);
    if (window.__biostar) window.__biostar.board = { B, pos, boxes, setPos, acierta };
  }

  function showResults() {
    chrome(true);
    const r = state.scores.map(Math.round);
    const avg = Math.round(state.scores.reduce((a, b) => a + b, 0) / 5);
    const names = BOARDS.map(b => b.name).concat('Promedio');
    const base = [136.55, 177.55, 218.55, 258.55, 299.55, 381.55];
    const items = names.map((t, i) => ({ t, x: 134.1, y: base[i], size: 35, fill: '#00ff00', cls: 'serif' }));
    // campos de nota (alineados a la derecha), posiciones de los campos de texto del SWF
    const right = [496.6, 495.65, 495.6, 493.6, 492.6], ty = [99.9, 144.05, 184.05, 225.05, 268.05];
    r.forEach((v, i) => items.push({ t: String(v), x: right[i], y: ty[i] + 31.2, size: 35, fill: '#00ff00', cls: 'serif', anchor: 'end' }));
    items.push({ t: String(avg), x: 411.55, y: 341.75 + 35.6, size: 40, fill: '#00ff00', cls: 'serif', anchor: 'middle' });

    const hello = el('div', { style: px({ left: 39.15, top: 19.2, width: 590, font: '25px/28.75px var(--sans)', color: '#000066' }) },
      '¡Felicidades ' + state.name + ' !');
    screen.replaceChildren(
      img('results-panel.svg', 0, 0, 640, 480),
      textLayer(items),
      hello,
      nextButton('Reiniciar', 0.7265, 559.6, () => { state.name = ''; showIntro(); }));
  }

  /* ------------------------------------------------------------------ escala y arranque */
  function toStage(e) {
    const r = stage.getBoundingClientRect();
    return { x: (e.clientX - r.left) * 640 / r.width, y: (e.clientY - r.top) * 480 / r.height };
  }

  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    k = Math.min(vw / 640, vh / 480);
    stage.style.transform = `translate(${(vw - 640 * k) / 2}px, ${(vh - 480 * k) / 2}px) scale(${k})`;
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  $('#fs').addEventListener('click', () => {
    const d = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (d.requestFullscreen) d.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => { document.body.classList.toggle('is-fs', !!document.fullscreenElement); fit(); });
  if (!document.documentElement.requestFullscreen) $('#fs').hidden = true;

  // evitar el menú contextual / gestos de arrastre del navegador sobre el escenario
  stage.addEventListener('contextmenu', e => { if (!(e.target instanceof HTMLInputElement)) e.preventDefault(); });
  stage.addEventListener('dragstart', e => e.preventDefault());

  // precarga (equivale al «preloader» del fotograma 1)
  function preload() {
    let done = 0;
    showLoader(0);
    const tick = () => { done++; showLoader(done / ASSETS.length); };
    return Promise.all(ASSETS.map(src => new Promise(res => {
      const i = new Image();
      i.onload = i.onerror = () => { tick(); res(); };
      i.src = src;
    })));
  }

  window.__biostar = { state, BOARDS, showBoard, showIntro, showResults };
  preload().then(showIntro);
})();
