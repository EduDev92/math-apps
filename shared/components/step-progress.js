class StepProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['current-step', 'labels'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const current = parseInt(this.getAttribute('current-step') || '1', 10);
    const labelsAttr = this.getAttribute('labels');
    const labelList = labelsAttr ? labelsAttr.split(',') : ['מכירים', 'חוקרים', 'מתרגלים', 'מסכמים'];
    const steps = labelList.map((label, i) => ({ num: i + 1, label: label }));

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

/* ---------- Global site footer (copyright + WhatsApp feedback) ----------
   Injected here because this file is already loaded on every lesson page
   and on exam.html - a single place to add/change the footer instead of
   touching 27+ lesson files. index.html (the only page that doesn't use
   <step-progress>) loads this same script just to get this behavior. */
function buildFooterWaLink() {
  var fileCode = (window.location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  if (!fileCode || fileCode === 'index') fileCode = 'דף ראשי';
  var pageTitle = document.title.split('|')[0].trim() || document.title;
  var stepEl = document.querySelector('.step-panel:not([hidden]) .step-heading') ||
    document.querySelector('.step-title, h2.active, .progress-header');
  var stepText = (stepEl && stepEl.textContent) ? stepEl.textContent.trim() : '';
  var qEl = document.querySelector('.quiz-id-tag') ||
    document.querySelector('.question-counter, .quiz-progress, .q-number, [id*="-q"]');
  var questionText = (qEl && qEl.textContent) ? qEl.textContent.trim() : '';

  var details = 'שלום אופיר, יש לי הערה/משוב לגבי הלומדה:\nכותרת: ' + pageTitle + ' (' + fileCode + ')';
  if (stepText) details += '\nמיקום: ' + stepText;
  if (questionText) details += ' (' + questionText + ')';
  details += '\nקישור: ' + window.location.href;
  return 'https://wa.me/972547841730?text=' + encodeURIComponent(details);
}

function initSiteFooter() {
  if (document.querySelector('.site-footer')) return;
  var footer = document.createElement('div');
  footer.className = 'site-footer';
  footer.innerHTML =
    '<p class="site-footer-copyright">כל הזכויות שמורות לאופיר נוסבאום ©</p>' +
    '<a href="#" id="footer-wa-btn" class="footer-wa-btn" target="_blank" rel="noopener">דיווח על טעות / הצעות בוואטסאפ</a>';
  document.body.appendChild(footer);
  document.getElementById('footer-wa-btn').addEventListener('click', function () {
    this.href = buildFooterWaLink();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteFooter);
} else {
  initSiteFooter();
}
