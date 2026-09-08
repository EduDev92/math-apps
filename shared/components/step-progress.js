class StepProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['current-step'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const current = parseInt(this.getAttribute('current-step') || '1', 10);
    const steps = [
      { num: 1, label: 'מכירים' },
      { num: 2, label: 'חוקרים' },
      { num: 3, label: 'מתרגלים' },
      { num: 4, label: 'מסכמים' }
    ];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          margin-bottom: 24px;
        }
        .progress-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          direction: rtl;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 1;
          flex: 1;
        }
        .step-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          background: #ffffff;
          border: 2px solid #cbd5e3;
          color: #5b6b82;
          transition: all 0.2s ease;
        }
        .step-item.active .step-circle {
          background: #2e5fa3;
          border-color: #2e5fa3;
          color: #ffffff;
          box-shadow: 0 0 0 4px rgba(46, 95, 163, 0.15);
        }
        .step-item.completed .step-circle {
          background: #dce7f7;
          border-color: #2e5fa3;
          color: #2e5fa3;
        }
        .step-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #5b6b82;
        }
        .step-item.active .step-label {
          color: #1b3a6b;
          font-weight: 800;
        }
      </style>
      <div class="progress-bar">
        ${steps.map(s => {
          let statusClass = '';
          if (s.num === current) statusClass = 'active';
          else if (s.num < current) statusClass = 'completed';
          return `
            <div class="step-item ${statusClass}">
              <div class="step-circle">${s.num < current ? '✓' : s.num}</div>
              <div class="step-label">${s.label}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

customElements.define('step-progress', StepProgress);
