/* ==========================================================
   מקלדת מתמטית משותפת לכל המשחקים (math-games)
   נפתחת בכל שדה תשובה: .inrow input, input.sb, .ansrow input (או input[data-pad]).
   במכשירי מגע המקלדת של המכשיר לא נפתחת (inputmode="none"), כדי שתמיד יהיו מינוס, שבר ונקודה.
   במחשב עם מקלדת אפשר גם להקליד כרגיל.
   מקשים בעיצוב של מחשבון מדעי: ספרות, (−), שבר (מונה מעל מכנה; בשדה נשמר ‎3/4), ◀ ▶ (סמן), נקודה, DEL, AC, "הבא" (לשדה הבא), = (בדיקה – כמו Enter).
   שבר בשדה מוצג "טבעי" – מונה מעל קו שבר ומכנה (שכבה מעל השדה; הערך עצמו לא משתנה).
   טעינה: <script src="../shared/mathpad.js"></script> לפני </body> (או בכל מקום – הקוד מחכה ל-DOM).
   data-pad="nofrac" על שדה – בלי מקש שבר ובלי תצוגת שבר (לשדות שנקראים ב-parseFloat).
   עותק זהה: math-apps/shared/js/mathpad.js – לשנות בשני המקומות.
   ========================================================== */
(function(){
  if(window.__mathpad) return; window.__mathpad=true;
  const SEL='.inrow input, input.sb, .ansrow input, input[data-pad]';
  const TOUCH=window.matchMedia&&matchMedia('(pointer: coarse)').matches;
  const css=`
#mpad{position:fixed;left:0;right:0;bottom:0;z-index:9500;direction:ltr;background:linear-gradient(180deg,#34363c,#1b1c20 40%,#141518);border-radius:18px 18px 0 0;padding:6px 10px calc(10px + env(safe-area-inset-bottom));box-shadow:0 -6px 24px rgba(0,0,0,.4);transform:translateY(105%);transition:transform .18s ease;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#mpad.on{transform:none}
#mpad .top{display:flex;justify-content:space-between;align-items:center;max-width:470px;margin:0 auto 2px;color:#9a9ca3;font:700 .78rem system-ui,Arial,sans-serif;direction:rtl}
#mpad .top .hide{background:none;border:0;color:#cfd1d6;font:700 .82rem system-ui,Arial,sans-serif;padding:4px 6px;cursor:pointer}
#mpad .g{display:grid;grid-template-columns:repeat(5,1fr);gap:2px 9px;max-width:470px;margin:0 auto}
#mpad .c{display:flex;flex-direction:column;align-items:stretch}
#mpad .cap{height:15px;font:700 .64rem/15px system-ui,Arial,sans-serif;color:#d8c26a;text-align:center;direction:rtl;white-space:nowrap;overflow:hidden}
#mpad .k{height:46px;border:0;border-radius:9px;font:600 1.5rem/1 system-ui,'Segoe UI',Arial,sans-serif;color:#fff;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;padding:0}
#mpad .k:active{transform:translateY(2px)}
#mpad .num{background:linear-gradient(180deg,#a9acb3,#80838b);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 3px 0 #45474d;text-shadow:0 1px 1px rgba(0,0,0,.35)}
#mpad .num:active{box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 1px 0 #45474d}
#mpad .fn{height:40px;margin-top:3px;background:linear-gradient(180deg,#2c2d32,#0f1012);border:1px solid #3d3f45;box-shadow:0 3px 0 #000;font-size:1.05rem;font-weight:700}
#mpad .fn:active{box-shadow:0 1px 0 #000}
#mpad .grn{background:linear-gradient(180deg,#b5e655,#86c722);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 3px 0 #4f7a12;font-size:1.25rem;font-weight:700;text-shadow:0 1px 1px rgba(0,0,0,.25)}
#mpad .arw{background:radial-gradient(circle at 50% 35%,#e3e5e9,#a7aab1);box-shadow:0 3px 0 #55575d;color:#3a3c42;font-size:1.05rem;border-radius:12px}
#mpad .frk{display:inline-flex;flex-direction:column;align-items:center;gap:1px}
#mpad .frk i{display:block;width:13px;height:10px;border:1.6px solid #fff;border-radius:1px}
#mpad .frk b{display:block;width:20px;border-top:2px solid #fff}
#mpad.nofrac .c:has([data-k="/"]){visibility:hidden}
body.mpad-on{padding-bottom:var(--mpadH,280px)!important}
body.mpad-on #dock{display:none!important}
input.mpad-cur{outline:3px solid #ffb703!important;outline-offset:1px}
.mpfw{position:relative;display:inline-flex;vertical-align:middle}
.ansrow>.mpfw{flex:1 1 70px;min-width:0}.ansrow>.mpfw>input{flex:1;min-width:0;width:100%}
.mpfo{position:absolute;inset:0;display:none;align-items:center;justify-content:center;gap:3px;pointer-events:none;direction:ltr;font:800 1.05rem/1.1 system-ui,'Segoe UI',Arial,sans-serif;color:#16305a}
input.mpf-on{color:transparent!important;caret-color:transparent!important;height:3.6em!important}
input.mpf-on+.mpfo{display:flex}
.mpfo .fr{display:inline-flex;flex-direction:column;align-items:center}
.mpfo .fr>span{min-width:1.1em;text-align:center;padding:0 3px}
.mpfo .fr>span:first-child{border-bottom:2px solid currentColor}
.mpfo .e{color:#b9c3d8}
.mpfo .c::after{content:'';display:inline-block;width:2px;height:.95em;margin-left:1px;background:#6d3fc0;vertical-align:-2px;animation:mpb 1s steps(1) infinite}
@keyframes mpb{50%{opacity:0}}`;
  function el(h){ const d=document.createElement('div'); d.innerHTML=h; return d.firstElementChild; }
  let pad, cur=null;
  function build(){
    const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    const K=(k,lab,cls,cap,span)=>`<div class="c"${span?` style="grid-column:span ${span}"`:''}><div class="cap">${cap||''}</div><button class="k ${cls}" data-k="${k}">${lab}</button></div>`;
    const FRK='<span class="frk"><i></i><b></b><i></i></span>';
    pad=el(`<div id="mpad" aria-label="מקלדת מחשבון"><div class="top"><span>מחשבון</span><button class="hide" data-k="hide">סגירה ▾</button></div><div class="g">
      ${K('/',FRK,'fn','שבר')}${K('-','(−)','fn','שלילי')}${K('left','◀','arw','')}${K('right','▶','arw','')}${K('next','הבא','fn','לשדה הבא')}
      ${K('7','7','num')}${K('8','8','num')}${K('9','9','num')}${K('del','DEL','grn','מחיקה')}${K('clr','AC','grn','ניקוי')}
      ${K('4','4','num')}${K('5','5','num')}${K('6','6','num')}${K('.','.','num','נקודה')}${K('ok','=','num','בדיקה')}
      ${K('1','1','num')}${K('2','2','num')}${K('3','3','num')}${K('0','0','num','',2)}
    </div></div>`);
    document.body.appendChild(pad);
    /* כפתורי המקלדת לא לוקחים את הפוקוס מהשדה */
    pad.addEventListener('pointerdown',e=>e.preventDefault());
    pad.addEventListener('mousedown',e=>e.preventDefault());
    pad.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; press(b.dataset.k); if(cur) render(cur); });
  }
  function fields(){ return [...document.querySelectorAll(SEL)].filter(i=>!i.disabled&&!i.readOnly&&i.offsetParent!==null); }
  function fire(i){ i.dispatchEvent(new Event('input',{bubbles:true})); }
  function insert(i,t){ const s=i.selectionStart??i.value.length, e=i.selectionEnd??i.value.length; i.value=i.value.slice(0,s)+t+i.value.slice(e); const p=s+t.length; try{ i.setSelectionRange(p,p); }catch(_){} fire(i); }
  function press(k){
    if(k==='hide'){ hide(); if(cur) cur.blur(); return; }
    const i=cur; if(!i||!document.body.contains(i)) return;
    if(k==='del'){ const s=i.selectionStart??i.value.length, e=i.selectionEnd??i.value.length; if(s!==e) i.value=i.value.slice(0,s)+i.value.slice(e); else if(s>0){ i.value=i.value.slice(0,s-1)+i.value.slice(s); try{ i.setSelectionRange(s-1,s-1); }catch(_){} } fire(i); return; }
    if(k==='clr'){ i.value=''; fire(i); return; }
    const pos=()=>i.selectionStart??i.value.length, setp=p=>{ try{ i.setSelectionRange(p,p); }catch(_){} render(i); };
    if(k==='left'){ setp(Math.max(0,pos()-1)); return; }
    if(k==='right'){ setp(Math.min(i.value.length,pos()+1)); return; }
    if(k==='/'&&i.dataset.pad==='nofrac') return;
    if(k==='/'){ const j=i.value.indexOf('/');
      if(j<0){ if(i.value.trim()===''||i.value.trim()==='-'){ i.value=i.value.trim()+'/'; setp(i.value.length-1); fire(i); } else { insert(i,'/'); render(i); } }  /* ריק: תבנית שבר, הסמן במונה ; אחרי מספר: עוברים למכנה */
      else if(pos()<=j) setp(j+1); else setp(j);                                                                          /* כבר שבר: מעבר בין מונה למכנה */
      return; }
    if(k==='next'){ const F=fields(), n=F.indexOf(i); if(n>=0&&n<F.length-1){ F[n+1].focus(); } else press('ok'); return; }
    if(k==='ok'){ i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true})); return; }
    insert(i,k);
  }
  function show(i){
    if(!pad) build();
    if(cur&&cur!==i) cur.classList.remove('mpad-cur');
    cur=i; i.classList.add('mpad-cur');
    pad.classList.toggle('nofrac',i.dataset.pad==='nofrac');   /* שדות שקוראים רק מספר עשרוני (למשל מעבדה ב-edumath) – בלי מקש שבר */
    pad.classList.add('on'); document.body.classList.add('mpad-on');
    document.body.style.setProperty('--mpadH',(pad.offsetHeight+16)+'px');
    setTimeout(()=>{ const r=i.getBoundingClientRect(), top=window.innerHeight-pad.offsetHeight; if(r.bottom>top-12||r.top<60) i.scrollIntoView({block:'center',behavior:'smooth'}); },60);
  }
  function hide(){ if(!pad) return; pad.classList.remove('on'); document.body.classList.remove('mpad-on'); if(cur) cur.classList.remove('mpad-cur'); }
  /* במגע: בלי מקלדת המכשיר. מסמנים כל שדה תשובה חדש */
  function mark(root){ (root.querySelectorAll?root:document).querySelectorAll(SEL).forEach(i=>{ if(i.dataset.pad!=='nofrac'){ wrap(i); render(i); } if(TOUCH&&i.getAttribute('inputmode')!=='none'){ i.setAttribute('inputmode','none'); i.setAttribute('autocomplete','off'); } }); }
  /* ---- שברים "טבעיים": 3/4 מוצג כמונה מעל מכנה (הערך בשדה נשאר "3/4" לבדיקה) ---- */
  const FR=/^\s*([-−]?)(\d*\.?\d*)\/(\d*\.?\d*)\s*$/;
  function wrap(i){ if(i.parentNode&&i.parentNode.classList&&i.parentNode.classList.contains('mpfw')) return; const w=document.createElement('span'); w.className='mpfw'; i.parentNode.insertBefore(w,i); w.appendChild(i); const o=document.createElement('span'); o.className='mpfo'; w.appendChild(o); }
  const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  function render(i){ if(i.dataset.pad==='nofrac') return; const w=i.parentNode; if(!w||!w.classList||!w.classList.contains('mpfw')) return; const o=w.querySelector('.mpfo'); const m=String(i.value).match(FR);
    if(!m){ if(i.classList.contains('mpf-on')){ i.classList.remove('mpf-on'); o.innerHTML=''; } return; }
    const act=document.activeElement===i, pos=i.selectionStart??i.value.length, inDen=pos>i.value.indexOf('/');
    const part=(t,on)=>`<span class="${t?'':'e'}${act&&on?' c':''}">${t?esc(t):'▢'}</span>`;
    const h=(m[1]?'<span>−</span>':'')+`<span class="fr">${part(m[2],!inDen)}${part(m[3],inDen)}</span>`;
    if(o.innerHTML!==h) o.innerHTML=h; i.classList.add('mpf-on'); }
  function renderAll(){ document.querySelectorAll(SEL).forEach(render); }

  function init(){
    mark(document);
    new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes) if(n.nodeType===1){ if(n.matches&&n.matches(SEL)) mark(n.parentNode||document); else mark(n); } }).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('focusin',e=>{ const t=e.target; if(t&&t.matches&&t.matches(SEL)){ show(t); render(t); } });
    document.addEventListener('input',e=>{ const t=e.target; if(t&&t.matches&&t.matches(SEL)) render(t); });
    document.addEventListener('selectionchange',()=>{ const a=document.activeElement; if(a&&a.matches&&a.matches(SEL)) render(a); });
    document.addEventListener('focusout',e=>{ const t=e.target; if(t&&t.matches&&t.matches(SEL)) setTimeout(()=>render(t),0); setTimeout(()=>{ const a=document.activeElement; if(!(a&&a.matches&&a.matches(SEL))) hide(); },80); });
    /* שדה שהוסתר או הוחלף (שאלה חדשה) – סוגרים */
    setInterval(()=>{ if(cur&&pad&&pad.classList.contains('on')&&(!document.body.contains(cur)||cur.disabled||cur.offsetParent===null)) hide(); renderAll(); },400);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
