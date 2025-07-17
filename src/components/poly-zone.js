import SvgPolygon from './svg-polygon.js';

export default class PolyZone extends HTMLElement {
  constructor() { super(); }
  connectedCallback(){
    this.addEventListener('dragstart', this.onDragStart);
    this.addEventListener('dragover',  e => e.preventDefault());
    this.addEventListener('drop',      this.onDrop);
    // восстановление сохранённых данных
    if(this.id && localStorage.getItem('polygons')){
      const list = JSON.parse(localStorage.getItem('polygons'))[this.id] || [];
      list.forEach(data => this.appendChild(SvgPolygon.fromData(data)));
    }
    // если это workspace — создаём сетку
    if(this.getAttribute('type')==='workspace') this.initGrid();
  }
  /* Буферная зона: генерация случайных N полигонов */
  generatePolygons() {
    if(this.getAttribute('type')!=='buffer') return;
    this.clear();
    const N = 5 + Math.floor(Math.random()*16);
    for(let i=0;i<N;i++) this.appendChild(new SvgPolygon());
  }
  /* drag & drop */
  onDragStart(e){
    e.dataTransfer.setData('text/plain', 'polygon');
    e.dataTransfer.setDragImage(e.target, 0, 0);
    PolyZone.dragged = e.target;
  }
  onDrop(e){
    if(PolyZone.dragged) this.appendChild(PolyZone.dragged); 
  }
  /* сериализация и очистка */
  serialize(){
    return [...this.children].map(p => ({
      points:p.dataset.points,
      color :p.dataset.color
    }));
  }
  clear(){ this.innerHTML=''; }

  /* workspace: сетка, зум и панорамирование */
  initGrid(){
    let scale = 1, offsetX = 0, offsetY = 0;
    const applyTransform = () => {
      this.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${scale})`;
      this.style.transformOrigin = '0 0';
      this.style.backgroundSize = `${50*scale}px ${50*scale}px`;
    };
    /* фон‑сетка через css‑gradient */
    this.style.backgroundImage =
      `linear-gradient(#444 1px, transparent 1px),
       linear-gradient(90deg,#444 1px, transparent 1px)`;
    this.style.backgroundSize = '50px 50px';
    applyTransform();

    /* zoom — колесо мыши */
    this.addEventListener('wheel', e=>{
      e.preventDefault();
      const delta = e.deltaY>0 ? .9 : 1.1;
      scale = Math.max(.2, Math.min(5, scale*delta));
      applyTransform();
    });

    /* панорамирование ЛКМ */
    let isDown=false,startX=0,startY=0;
    this.addEventListener('mousedown',e=>{
      if(e.buttons!==1) return;
      isDown=true; startX=e.clientX; startY=e.clientY;
    });
    window.addEventListener('mousemove',e=>{
      if(!isDown) return;
      offsetX += e.clientX - startX;
      offsetY += e.clientY - startY;
      startX = e.clientX; startY = e.clientY;
      applyTransform();
    });
    window.addEventListener('mouseup', ()=> isDown=false);
  }
}
customElements.define('poly-zone', PolyZone);
