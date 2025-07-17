export default class ToolBar extends HTMLElement {
  constructor() {
    super();
    const host = this.attachShadow({ mode: 'open' });
    host.innerHTML = `
      <style>
        :host {
          background:#333; display:flex; gap:20px; align-items:center;
          padding:0 40px; box-sizing:border-box;
        }
        button{
          font:inherit; padding:6px 28px; cursor:pointer; border-radius:3px;
        }
      </style>
      <button id="create">Создать</button>
      <button id="save">Сохранить</button>
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
