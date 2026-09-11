/*
 * Shared math input platform: MathField + MathKeypad.
 *
 * MathField wraps a plain <input> (so native desktop typing, selection and
 * arrow keys work for free) plus a live KaTeX preview of its LaTeX value.
 * MathKeypad is a single on-screen toolbar (a "singleton platform component")
 * that stays docked at the bottom of the page and inserts tokens into
 * whichever MathField last had focus - clicking a key never steals focus
 * from the field (see the mousedown/preventDefault below), so desktop typing
 * and keypad clicks can be freely mixed.
 *
 * Requires KaTeX (window.katex) to already be loaded on the host page -
 * this file does not load it itself, matching how every lesson already
 * loads KaTeX/renderMathInElement on its own.
 *
 * Usage:
 *   <div id="answer1" class="math-field"></div>
 *   <script>
 *     var keypad = new MathKeypad({ preset: 'analytic_geometry' });
 *     var field1 = new MathField(document.getElementById('answer1'));
 *   </script>
 */

/* ---------- Topic preset key-builders ---------- */

function mkInsertKey(display, insert) {
  return { type: 'insert', display: display, insert: insert !== undefined ? insert : display };
}

function mkActionKey(action, display) {
  return { type: 'action', action: action, display: display };
}

/* A template key wraps an optional selection between `before` and `after`,
   with `mid` marking a second slot (e.g. the "}{" between a fraction's
   numerator and denominator). mid === null means there is only one slot. */
function mkTemplateKey(display, before, mid, after) {
  return {
    type: 'template',
    display: display,
    apply: function (selectedText) {
      var sel = selectedText || '';
      if (mid !== null) {
        if (sel) {
          var insWith = before + sel + mid + after;
          return { insert: insWith, cursorOffset: (before + sel + mid).length };
        }
        var insEmpty = before + mid + after;
        return { insert: insEmpty, cursorOffset: before.length };
      }
      var ins = before + sel + after;
      return { insert: ins, cursorOffset: sel ? ins.length : before.length };
    }
  };
}

function mkFracKey() { return mkTemplateKey('\\frac{a}{b}', '\\frac{', '}{', '}'); }
function mkSqrtKey() { return mkTemplateKey('\\sqrt{\\,}', '\\sqrt{', null, '}'); }
function mkFuncKey(name, latexName) { return mkTemplateKey(latexName + '()', latexName + '(', null, ')'); }

var CONTROL_KEYS = [
  mkActionKey('backspace', '\\text{⌫}'),
  mkActionKey('clear', '\\text{C}'),
  mkActionKey('left', '\\leftarrow'),
  mkActionKey('right', '\\rightarrow')
];

function mkDigitKeys() {
  return ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'].map(function (d) { return mkInsertKey(d); })
    .concat([mkInsertKey('.', '.')]);
}

/* ---------- Topic presets ---------- */

var MATH_KEYPAD_PRESETS = {
  /* Active / default preset for the analytic-geometry course. */
  analytic_geometry: {
    label: 'גיאומטריה אנליטית',
    groups: [
      { name: 'digits', title: 'ספרות', keys: mkDigitKeys() },
      {
        name: 'operators', title: 'פעולות וסימנים', keys: [
          mkInsertKey('+'), mkInsertKey('-'), mkInsertKey('='),
          mkFracKey(), mkSqrtKey(),
          mkInsertKey('(', '('), mkInsertKey(')', ')'), mkInsertKey(',', ',')
        ]
      },
      { name: 'variables', title: 'משתנים', keys: [mkInsertKey('x'), mkInsertKey('y'), mkInsertKey('m')] },
      { name: 'controls', title: 'פקדים', keys: CONTROL_KEYS.slice() }
    ]
  },

  /* Stub preset for a future complex-numbers module - fully wired, just not
     the default, per the roadmap this component was built ahead of. */
  complex_numbers: {
    label: 'מספרים מרוכבים',
    stub: true,
    groups: [
      { name: 'digits', title: 'ספרות', keys: mkDigitKeys() },
      {
        name: 'operators', title: 'פעולות וסימנים', keys: [
          mkInsertKey('+'), mkInsertKey('-'), mkInsertKey('='),
          mkFracKey(), mkSqrtKey()
        ]
      },
      {
        name: 'complex', title: 'מספרים מרוכבים', keys: [
          mkInsertKey('z'), mkInsertKey('i'),
          mkInsertKey('\\bar{z}'), mkInsertKey('|z|'),
          mkInsertKey('\\text{cis}', '\\text{cis}\\,'),
          mkInsertKey('\\theta'), mkInsertKey('R')
        ]
      },
      { name: 'controls', title: 'פקדים', keys: CONTROL_KEYS.slice() }
    ]
  },

  /* Stub preset for a future calculus module. */
  calculus: {
    label: 'חשבון דיפרנציאלי ואינטגרלי',
    stub: true,
    groups: [
      { name: 'digits', title: 'ספרות', keys: mkDigitKeys() },
      {
        name: 'operators', title: 'פעולות בסיסיות', keys: [
          mkInsertKey('+'), mkInsertKey('-'), mkInsertKey('='),
          mkTemplateKey('a^{b}', '^{', null, '}')
        ]
      },
      {
        name: 'functions', title: 'פונקציות', keys: [
          mkInsertKey('x'), mkInsertKey('e'),
          mkFuncKey('ln', '\\ln'), mkFuncKey('sin', '\\sin'),
          mkFuncKey('cos', '\\cos'), mkFuncKey('tan', '\\tan')
        ]
      },
      { name: 'controls', title: 'פקדים', keys: CONTROL_KEYS.slice() }
    ]
  }
};

/* ---------- MathField: a plain <input> + live KaTeX preview ---------- */

class MathField {
  constructor(container, opts) {
    opts = opts || {};
    this.container = container;
    this.container.classList.add('math-field');

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'math-field-input';
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;
    this.input.setAttribute('dir', 'ltr');
    if (opts.placeholder) this.input.placeholder = opts.placeholder;
    if (opts.value) this.input.value = opts.value;

    this.preview = document.createElement('div');
    this.preview.className = 'math-field-preview';

    this.container.appendChild(this.input);
    this.container.appendChild(this.preview);

    this._selStart = this.input.value.length;
    this._selEnd = this.input.value.length;
    this.onChange = typeof opts.onChange === 'function' ? opts.onChange : null;

    this.input.addEventListener('input', () => this._onChange());
    this.input.addEventListener('keyup', () => this._syncSelection());
    this.input.addEventListener('click', () => this._syncSelection());
    this.input.addEventListener('focus', () => {
      this._syncSelection();
      this.container.classList.add('math-field-focused');
      if (MathKeypad.active) MathKeypad.active.attachField(this);
    });
    this.input.addEventListener('blur', () => {
      this.container.classList.remove('math-field-focused');
    });

    this.render();
  }

  _syncSelection() {
    this._selStart = this.input.selectionStart;
    this._selEnd = this.input.selectionEnd;
  }

  _onChange() {
    this._syncSelection();
    this.render();
    if (this.onChange) this.onChange(this.getLatex());
  }

  getLatex() { return this.input.value; }

  setLatex(value) {
    this.input.value = value || '';
    this._selStart = this._selEnd = this.input.value.length;
    this.render();
  }

  render() {
    var latex = this.input.value;
    if (!latex) {
      this.preview.innerHTML = '<span class="math-field-placeholder">…</span>';
      return;
    }
    if (window.katex) {
      try {
        window.katex.render(latex, this.preview, { throwOnError: false, displayMode: false });
        return;
      } catch (e) { /* fall through to plain text */ }
    }
    this.preview.textContent = latex;
  }

  /* `textOrTemplateFn` is either a literal string to insert, or a function
     (selectedText) => {insert, cursorOffset}, as produced by mkTemplateKey. */
  insertAtCursor(textOrTemplateFn) {
    var val = this.input.value;
    var start = this._selStart, end = this._selEnd;
    var selected = val.slice(start, end);
    var result = (typeof textOrTemplateFn === 'function')
      ? textOrTemplateFn(selected)
      : { insert: textOrTemplateFn, cursorOffset: textOrTemplateFn.length };

    var newVal = val.slice(0, start) + result.insert + val.slice(end);
    var newCursor = start + result.cursorOffset;
    this.input.value = newVal;
    this.input.setSelectionRange(newCursor, newCursor);
    this._selStart = this._selEnd = newCursor;
    this.render();
    this.input.focus();
    if (this.onChange) this.onChange(this.getLatex());
  }

  backspace() {
    var val = this.input.value;
    var start = this._selStart, end = this._selEnd;
    var newVal, newCursor;
    if (start !== end) {
      newVal = val.slice(0, start) + val.slice(end);
      newCursor = start;
    } else if (start > 0) {
      newVal = val.slice(0, start - 1) + val.slice(start);
      newCursor = start - 1;
    } else {
      newVal = val;
      newCursor = 0;
    }
    this.input.value = newVal;
    this.input.setSelectionRange(newCursor, newCursor);
    this._selStart = this._selEnd = newCursor;
    this.render();
    this.input.focus();
    if (this.onChange) this.onChange(this.getLatex());
  }

  clear() {
    this.input.value = '';
    this._selStart = this._selEnd = 0;
    this.render();
    this.input.focus();
    if (this.onChange) this.onChange('');
  }

  moveCursor(dir) {
    var pos;
    if (this._selStart !== this._selEnd) {
      pos = dir < 0 ? this._selStart : this._selEnd;
    } else {
      pos = Math.max(0, Math.min(this.input.value.length, this._selStart + dir));
    }
    this.input.setSelectionRange(pos, pos);
    this._selStart = this._selEnd = pos;
    this.input.focus();
  }

  focus() { this.input.focus(); }
}

/* ---------- MathKeypad: the shared singleton on-screen toolbar ---------- */

class MathKeypad {
  constructor(opts) {
    opts = opts || {};
    // Singleton: constructing a new one replaces any previous instance's DOM.
    if (MathKeypad.active && MathKeypad.active.el && MathKeypad.active.el.parentNode) {
      MathKeypad.active.el.parentNode.removeChild(MathKeypad.active.el);
    }
    this.field = null;
    this._build();
    this.setPreset(opts.preset || 'analytic_geometry');
    MathKeypad.active = this;
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'math-keypad';
    this.el.innerHTML =
      '<div class="math-keypad-status" data-role="status"></div>' +
      '<div class="math-keypad-groups" data-role="groups"></div>';
    document.body.appendChild(this.el);
    this.statusEl = this.el.querySelector('[data-role="status"]');
    this.groupsEl = this.el.querySelector('[data-role="groups"]');
    this._updateStatus();
  }

  setPreset(name) {
    var preset = MathKeypad.PRESETS[name];
    if (!preset) {
      console.warn('MathKeypad: unknown preset "' + name + '", falling back to analytic_geometry');
      name = 'analytic_geometry';
      preset = MathKeypad.PRESETS[name];
    }
    this.preset = name;
    this._renderGroups(preset);
  }

  _renderGroups(preset) {
    var html = '';
    preset.groups.forEach(function (group) {
      html += '<div class="math-keypad-group math-keypad-group-' + group.name + '">';
      if (group.title) html += '<div class="math-keypad-group-title">' + group.title + '</div>';
      html += '<div class="math-keypad-keys">';
      group.keys.forEach(function (key, idx) {
        html += '<button type="button" class="math-keypad-key" data-group="' + group.name + '" data-index="' + idx + '" aria-label="' + key.display.replace(/"/g, '&quot;') + '"><span class="math-keypad-key-face"></span></button>';
      });
      html += '</div></div>';
    });
    this.groupsEl.innerHTML = html;

    var self = this;
    this.groupsEl.querySelectorAll('.math-keypad-key').forEach(function (btn) {
      var groupName = btn.getAttribute('data-group');
      var idx = parseInt(btn.getAttribute('data-index'), 10);
      var group = preset.groups.filter(function (g) { return g.name === groupName; })[0];
      var keyDef = group.keys[idx];
      var faceEl = btn.querySelector('.math-keypad-key-face');
      if (window.katex) {
        try { window.katex.render(keyDef.display, faceEl, { throwOnError: false, displayMode: false }); }
        catch (e) { faceEl.textContent = keyDef.display; }
      } else {
        faceEl.textContent = keyDef.display;
      }
      // mousedown (not click) + preventDefault keeps focus - and the caret
      // position - on the active MathField's <input> while the key is used.
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
      btn.addEventListener('click', function () { self._handleKey(keyDef); });
    });
  }

  _handleKey(keyDef) {
    if (!this.field) return;
    if (keyDef.type === 'insert') {
      this.field.insertAtCursor(keyDef.insert);
    } else if (keyDef.type === 'template') {
      this.field.insertAtCursor(keyDef.apply);
    } else if (keyDef.type === 'action') {
      if (keyDef.action === 'backspace') this.field.backspace();
      else if (keyDef.action === 'clear') this.field.clear();
      else if (keyDef.action === 'left') this.field.moveCursor(-1);
      else if (keyDef.action === 'right') this.field.moveCursor(1);
    }
  }

  attachField(field) {
    this.field = field;
    this._updateStatus();
    this.show();
  }

  _updateStatus() {
    this.statusEl.textContent = this.field ? '' : 'הקלידו בשדה תשובה כדי להשתמש במקלדת';
    this.el.classList.toggle('math-keypad-idle', !this.field);
  }

  show() { this.el.classList.add('math-keypad-visible'); }
  hide() { this.el.classList.remove('math-keypad-visible'); }
}

MathKeypad.active = null;
MathKeypad.PRESETS = MATH_KEYPAD_PRESETS;

if (typeof window !== 'undefined') {
  window.MathField = MathField;
  window.MathKeypad = MathKeypad;
}
