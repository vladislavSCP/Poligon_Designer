function randomPolygonPoints(n = 6, size = 50) {
  const points = [];
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = size * (.5 + Math.random() * .5);
    const x = 100 + radius * Math.cos(angle);
    const y = 100 + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export default class SvgPolygon extends HTMLElement {
  constructor({ points = randomPolygonPoints(), color = 'var(--accent)'} = {}) {
    super();
    this.attachShadow({mode:'open'}).innerHTML = `
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
        <polygon fill="${color}" points="${points}"></polygon>
      </svg>
    `;
    this.dataset.points = points;           // для сериализации
    this.dataset.color  = color;
    this.draggable = true;
  }
  static fromData(obj) { return new SvgPolygon(obj); }
}
customElements.define('svg-polygon', SvgPolygon);
