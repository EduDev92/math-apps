(function () {
  if (window.customElements && window.customElements.get('math-input-pad')) return;

  let mathLiveLoaded = null;
  function loadMathLive() {
    if (!mathLiveLoaded) {
      mathLiveLoaded = import('https://cdn.jsdelivr.net/npm/mathlive/+esm').catch(err => {
        mathLiveLoaded = null;
        throw err;
      });
    }
    return mathLiveLoaded;
  }

  class MathInputPad extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._field = null;
    }

    connectedCallback() {
      this.render();
      loadMathLive().then(() => {
        const mathField = this.shadowRoot.querySelector('math-field');
        if (mathField) {
          mathField.smartFence = true;
          mathField.smartSuperscript = true;
          mathField.mathVirtualKeyboardPolicy = 'manual';
          this._field = mathField;
          mathField.addEventListener('input', () => {
            this.dispatchEvent(new CustomEvent('change', { detail: { value: mathField.value } }));
          });
        }
      });
    }

    get value() {
      return this._field ? this._field.value : '';
    }

    set value(val) {
      if (this._field) this._field.value = val;
    }

    insert(cmd) {
      if (!this._field) return;
      this._field.focus();
      this._field.insert(cmd, { selectionMode: 'placeholder' });
    }

    execute(cmd) {
      if (!this._field) return;
      this._field.focus();
      this._field.executeCommand(cmd);
    }

    clear() {
      if (!this._field) return;
      this._field.value = '';
      this._field.focus();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          .pad-wrap {
            display: flex;
            flex-direction: column;
            gap: 12px;
            direction: ltr;
          }
          .input-box {
            background: #ffffff;
            border: 2px solid #cbd5e3;
            border-radius: 12px;
            padding: 10px 14px;
            transition: border-color 0.2s;
          }
          .input-box:focus-within {
            border-color: #2e5fa3;
            box-shadow: 0 0 0 3px rgba(46, 95, 163, 0.1);
          }
          math-field {
            width: 100%;
            min-height: 2.2em;
            font-size: 1.25rem;
            border: none;
            outline: none;
          }
          .toolbar {
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #dbe3ee;
            border-radius: 14px;
            padding: 10px;
          }
          .tools-row {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 6px;
          }
          .numpad-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }
          button {
            height: 44px;
            border: 1px solid #dbe3ee;
            border-radius: 8px;
            background: #ffffff;
            color: #1f2a3d;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            touch-action: manipulation;
            user-select: none;
            transition: background 0.15s;
          }
          button:hover {
            background: #eef2f9;
          }
          button:active {
            background: #dce7f7;
            transform: scale(0.98);
          }
          .btn-action {
            background: #f1f5f9;
            color: #2e5fa3;
          }
        </style>
        <div class="pad-wrap">
          <div class="input-box">
            <math-field placeholder="הקלידו ביטוי..."></math-field>
          </div>
          <div class="toolbar">
            <div class="tools-row">
              <button type="button" class="btn-action" data-ins="^{\\placeholder{}}">xⁿ</button>
              <button type="button" class="btn-action" data-ins="\\frac{\\placeholder{}}{\\placeholder{}}">a/b</button>
              <button type="button" class="btn-action" data-ins="\\sqrt{\\placeholder{}}">√</button>
              <button type="button" class="btn-action" data-ins="(\\placeholder{})">( )</button>
              <button type="button" class="btn-action" data-ins="x">x</button>
              <button type="button" class="btn-action" data-ins="e">e</button>
            </div>
            <div class="numpad-row">
              <button type="button" data-ins="7">7</button>
              <button type="button" data-ins="8">8</button>
              <button type="button" data-ins="9">9</button>
              <button type="button" class="btn-action" data-ins="+">+</button>

              <button type="button" data-ins="4">4</button>
              <button type="button" data-ins="5">5</button>
              <button type="button" data-ins="6">6</button>
              <button type="button" class="btn-action" data-ins="-">−</button>

              <button type="button" data-ins="1">1</button>
              <button type="button" data-ins="2">2</button>
              <button type="button" data-ins="3">3</button>
              <button type="button" class="btn-action" data-ins="\\times ">×</button>

              <button type="button" data-ins="0">0</button>
              <button type="button" data-ins=".">.</button>
              <button type="button" class="btn-action" data-cmd="deleteBackward">⌫</button>
              <button type="button" class="btn-action" data-act="clear">C</button>
            </div>
          </div>
        </div>
      `;

      this.shadowRoot.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (btn.dataset.ins) this.insert(btn.dataset.ins);
          else if (btn.dataset.cmd) this.execute(btn.dataset.cmd);
          else if (btn.dataset.act === 'clear') this.clear();
        });
      });
    }
  }

  customElements.define('math-input-pad', MathInputPad);
})();
