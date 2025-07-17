/**********************************************************************
 *  PolyZone  —  buffer / workspace с сеткой, zoom‑панорамой и линейками
 *********************************************************************/

import SvgPolygon from './svg-polygon.js';

export default class PolyZone extends HTMLElement {
  constructor() { super(); }

  /* ------------------------------------------------------------------
     Подключён к DOM
  ------------------------------------------------------------------ */
  connectedCallback() {
    /* drag&drop */
    this.addEventListener('dragstart', this.#onDragStart.bind(this));
    this.addEventListener('dragover',  e => e.preventDefault());
    this.addEventListener('drop',      this.#onDrop.bind(this));

    /* восстановление сохранённых данных */
    if (this.id && localStorage.getItem('polygons')) {
      JSON.parse(localStorage.getItem('polygons'))[this.id]
       ?.forEach(d => {
          const p = SvgPolygon.fromData(d);
          p.style.position = 'absolute';
          p.style.left = d.left;  p.style.top = d.top;
          this.appendChild(p);
       });
    }

    const type = this.getAttribute('type');
    if (type === 'buffer')     this.generatePolygons();
    if (type === 'workspace')  this.#initGrid();
  }

  /* ================================================================
     Публичный API  (исп-ся toolbar.js)
  ================================================================ */
  generatePolygons() {
    if (this.getAttribute('type') !== 'buffer') return;
    this.clear();
    const n = 5 + Math.floor(Math.random() * 16);
    for (let i = 0; i < n; i++) this.appendChild(new SvgPolygon());
  }

  serialize() {
    return [...this.querySelectorAll('svg-polygon')].map(p => ({
      points : p.dataset.points,
      color  : p.dataset.color,
      left   : p.style.left,
      top    : p.style.top
    }));
  }

  clear() { this.querySelectorAll('svg-polygon').forEach(p => p.remove()); }

  /* ================================================================
     Drag & Drop
  ================================================================ */
  #onDragStart(e) {
    e.dataTransfer.setData('text/plain', 'polygon');
    e.dataTransfer.setDragImage(e.target, 0, 0);
    PolyZone.#dragged = e.target;
  }
  #onDrop(e) {
    if (!PolyZone.#dragged) return;
    if (this.getAttribute('type') === 'workspace') {
      const r = this.getBoundingClientRect();
      const mx = (e.clientX - r.left - this._offsetX) / this._scale;
      const my = (e.clientY - r.top  - this._offsetY) / this._scale;
      const snap = v => Math.round(v / this._cell) * this._cell;
      Object.assign(PolyZone.#dragged.style, {
        position : 'absolute',
        left     : snap(mx) + 'px',
        top      : snap(my) + 'px'
      });
    }
    this.appendChild(PolyZone.#dragged);
  }
  static #dragged = null;

  /* ================================================================
     WORKSPACE: сетка, линейки, zoom, pan
  ================================================================ */
  #initGrid() {
    /* мировая клетка */
    this._cell    = 50;
    this._scale   = 1;
    this._offsetX = 0;
    this._offsetY = 0;

    /* канвасы‑рулеры */
    const wrapper = this.parentElement;
    const rulerX  = wrapper.querySelector('.ruler-x');
    const rulerY  = wrapper.querySelector('.ruler-y');

    /* Retina‑фиксер */
    const fixDPI = cvs => {
      const dpr = window.devicePixelRatio || 1;
      cvs.width  = cvs.clientWidth  * dpr;
      cvs.height = cvs.clientHeight * dpr;
      cvs.getContext('2d').scale(dpr, dpr);
    };
    fixDPI(rulerX); fixDPI(rulerY);

    /* ---------- утилиты ---------- */
    const stepPx = () => this._cell * this._scale; // видимая клетка

    const clampOffsets = () => {
      const W = this.clientWidth, H = this.clientHeight;
      const minX = W - W * this._scale, minY = H - H * this._scale;
      this._offsetX = Math.max(minX, Math.min(0, this._offsetX));
      this._offsetY = Math.max(minY, Math.min(0, this._offsetY));
    };

    /* рисуем горизонтальную линейку */
    const drawHoriz = () => {
      const ctx = rulerX.getContext('2d'), W = rulerX.clientWidth;
      ctx.clearRect(0,0,W,20);

      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ccc'; ctx.strokeStyle = '#888';

      const step = stepPx();
      let x = (step - (this._offsetX % step)) % step;  // первая риска
      let i = Math.floor((this._offsetX) / -step);     // её индекс

      for (; x < W; x += step, i++) {
        ctx.beginPath(); ctx.moveTo(x+0.5,0); ctx.lineTo(x+0.5,6); ctx.stroke();
        ctx.fillText(i * this._cell, x, 16);
      }
    };

    /* рисуем вертикальную линейку */
    const drawVert = () => {
      const ctx = rulerY.getContext('2d'), H = rulerY.clientHeight;
      ctx.clearRect(0,0,40,H);

      ctx.font = '10px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ccc'; ctx.strokeStyle = '#888';

      const step = stepPx();
      let y = (step - (this._offsetY % step)) % step;
      let i = Math.floor((this._offsetY) / -step);

      for (; y < H; y += step, i++) {
        ctx.beginPath(); ctx.moveTo(34,y+0.5); ctx.lineTo(40,y+0.5); ctx.stroke();
        ctx.save(); ctx.translate(30,y); ctx.rotate(-Math.PI/2);
        ctx.fillText(i * this._cell, 0, 0); ctx.restore();
      }
    };

    const updateRulers   = () => { drawHoriz(); drawVert(); };
    const applyTransform = () => {
      clampOffsets();
      this.style.transform =
        `translate(${this._offsetX}px,${this._offsetY}px) scale(${this._scale})`;
      this.style.transformOrigin = '0 0';
      /* фон не умножаем на scale, чтобы клетка = _cell*scale визуально */
      this.style.backgroundSize  = `${this._cell}px ${this._cell}px`;
      updateRulers();
    };

    /* оформление сетки */
    this.style.backgroundImage =
      `linear-gradient(#444 1px,transparent 1px),
       linear-gradient(90deg,#444 1px,transparent 1px)`;
    this.style.backgroundSize = `${this._cell}px ${this._cell}px`;
    this.style.position = this.style.position || 'relative';
    applyTransform();

    /* zoom */
    this.addEventListener('wheel', e => {
      e.preventDefault();
      const k = e.deltaY > 0 ? 0.9 : 1.1;
      const prev = this._scale;
      this._scale = Math.max(1, Math.min(3, this._scale * k));

      if (this._scale === 1) { this._offsetX = this._offsetY = 0; }
      else {
        const r = this.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        this._offsetX = mx - (mx - this._offsetX) * (this._scale / prev);
        this._offsetY = my - (my - this._offsetY) * (this._scale / prev);
      }
      applyTransform();
    });

    /* pan */
    let down = false, sx = 0, sy = 0;
    this.addEventListener('mousedown', e => {
      if (e.buttons !== 1 || this._scale === 1) return;
      down = true; sx = e.clientX; sy = e.clientY;
    });
    window.addEventListener('mousemove', e => {
      if (!down) return;
      this._offsetX += e.clientX - sx;
      this._offsetY += e.clientY - sy;
      sx = e.clientX; sy = e.clientY;
      applyTransform();
    });
    window.addEventListener('mouseup', () => (down = false));
  }
}

customElements.define('poly-zone', PolyZone);
