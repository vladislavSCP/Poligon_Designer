export default class ToolBar extends HTMLElement {
  constructor() {
    super();
    const host = this.attachShadow({ mode: 'open' });
    host.innerHTML = `
      <style>
        :host {
          background:#333; display:flex; gap:20px; align-items:center;
          padding:0 40px; box-sizing:border-box;z-index: 110;
        }
        button{
          font:inherit; padding:6px 28px; cursor:pointer; border-radius:6px;
          width:10vw;
          font-size:1vw;
        }
          .save-button{
          margin-left:60vw;}
      </style>
      <button id="create">Создать</button>
      <button class='save-button' id="save">Сохранить</button>
      <button id="reset">Сбросить</button>
    `;
  }
  connectedCallback() {
    const buffer   = document.querySelector('#buffer');
    const workspace= document.querySelector('#workspace');

    this.shadowRoot.getElementById('create')
        .addEventListener('click', () => buffer.generatePolygons());

    this.shadowRoot.getElementById('save')
        .addEventListener('click', () => {
          localStorage.setItem('polygons',
            JSON.stringify({
              buffer   : buffer.serialize(),
              workspace: workspace.serialize()
            }));
          alert('Сохранено!');
        });

    this.shadowRoot.getElementById('reset')
        .addEventListener('click', () => {
          localStorage.removeItem('polygons');
          buffer.clear(); workspace.clear();
        });
  }
}
customElements.define('tool-bar', ToolBar);
