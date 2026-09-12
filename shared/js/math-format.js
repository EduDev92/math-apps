/*
 * Canonical exact-fraction arithmetic + KaTeX-formatting helpers for lesson
 * pages. This consolidates code that used to be copy-pasted (and drift
 * independently) across shp-01/02/03/04/05 and line-07 - several real bugs
 * were found and fixed in those per-file copies this way (a "glued sign"
 * bug from raw string concatenation, an infinite-loop distractor bug, a
 * decimal leaking through where an exact fraction was available, a
 * duplicate "=sqrt(10)=sqrt(10)" line, and a mobile-clipping bug from
 * building one long "a=b=c=d" chain instead of a stacked derivation).
 *
 * MANDATORY for every new lesson that does exact-fraction/coordinate math:
 * load this file and use these functions instead of re-deriving your own
 * copy. See CLAUDE.md and the memory entries linked there for the reasoning
 * behind each rule this file encodes.
 *
 * A Frac is always a plain object { num, den } with den > 0 and
 * gcd(|num|, den) === 1 (see makeFrac) - never construct one by hand except
 * through the helpers below, or the "always reduced, sign always on the
 * numerator" invariant every other function here relies on will break.
 */

/* ---------- Exact-fraction arithmetic ---------- */

function gcdInt(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { var t = b; b = a % b; a = t; }
  return a || 1;
}

function makeFrac(num, den) {
  if (den < 0) { num = -num; den = -den; }
  var g = gcdInt(num, den);
  return { num: num / g, den: den / g };
}

function intFrac(n) { return { num: n, den: 1 }; }
function fracNeg(a) { return { num: -a.num, den: a.den }; }
function fracAdd(a, b) { return makeFrac(a.num * b.den + b.num * a.den, a.den * b.den); }
function fracSub(a, b) { return makeFrac(a.num * b.den - b.num * a.den, a.den * b.den); }
function fracMul(a, b) { return makeFrac(a.num * b.num, a.den * b.den); }
function fracDiv(a, b) { return makeFrac(a.num * b.den, a.den * b.num); }

/* Plain "a/b" or "a" string - for quiz OPTION BUTTON text, never for a $...$
   math context (there, use fracToLatex instead - a raw "/" is exactly the
   "unformatted inline arithmetic" this file exists to prevent). */
function fracToStr(a) { return a.den === 1 ? String(a.num) : (a.num + '/' + a.den); }

/* Self-contained signed LaTeX string for a $...$/$$...$$ block, e.g.
   "-\dfrac{2}{3}" or "5". Never produces a bare "/" - use this, not
   fracToStr, for anything that ends up inside a math delimiter. */
function fracToLatex(a) {
  if (a.den === 1) return String(a.num);
  var sign = a.num < 0 ? '-' : '';
  return sign + '\\dfrac{' + Math.abs(a.num) + '}{' + a.den + '}';
}

/* ---------- Signed-term LaTeX helpers ----------
   Concatenating a hardcoded template operator directly against a value that
   might itself be negative produces a glued "+-3" or "--3" artifact (a real,
   previously-shipped bug - see bug entries in memory). These helpers always
   compute the single correctly-signed term instead of raw string-gluing. */

function fracMagLatex(f) {
  var mag = Math.abs(f.num);
  return f.den === 1 ? String(mag) : ('\\dfrac{' + mag + '}{' + f.den + '}');
}

function PLUS(f) {
  /* "+f" or "-f" as a trailing additive term; omitted entirely when f=0,
     since a final simplified equation shouldn't show a "+0". */
  if (f.num === 0) return '';
  return (f.num < 0 ? '-' : '+') + fracMagLatex(f);
}

function MINUS(f) {
  /* "-f" (or "-(-f)" when f is itself negative, to avoid a glued "--") for a
     raw, not-yet-simplified substitution step like "y - y_1" - always
     shown, even for f=0, matching how a substitution step is normally
     written before it gets simplified away. */
  return f.num < 0 ? ('-\\left(-' + fracMagLatex(f) + '\\right)') : ('-' + fracMagLatex(f));
}

function coefXLatex(f) {
  /* The "mx" term - collapses the coefficient to a bare "x"/"-x" when
     m=1/-1 instead of the forbidden "1x"/"-1x". */
  if (f.den === 1 && f.num === 1) return 'x';
  if (f.den === 1 && f.num === -1) return '-x';
  return fracToLatex(f) + 'x';
}

/* ---------- Square-root simplification ---------- */

function simplifySqrt(n) {
  var coeff = 1, rad = n;
  for (var i = 2; i * i <= rad; i++) {
    while (rad % (i * i) === 0) { rad = rad / (i * i); coeff *= i; }
  }
  return { coeff: coeff, rad: rad };
}

function sqrtToLatex(n) {
  var s = simplifySqrt(n);
  if (s.rad === 1) return String(s.coeff);
  if (s.coeff === 1) return '\\sqrt{' + s.rad + '}';
  return s.coeff + '\\sqrt{' + s.rad + '}';
}

/* ---------- Multi-row derivations ----------
   THE fix for the "chained equation clips on both edges on mobile" bug
   (see bug_katex_centered_overflow_crop.md in memory): KaTeX's own
   .katex-display>.katex is text-align:center + white-space:nowrap, so ANY
   single-line "a=b=c=d=e" chain that's wider than its container gets
   silently cropped on BOTH sides instead of becoming scrollable - CSS
   cannot fix this (confirmed - overriding text-align on that element does
   not change the crop). The only reliable fix is to never build that
   single-line chain in the first place: stack it as separate rows.

   Usage - each row already includes its own leading term or a leading "&=":
     eqRows([
       'm_{BC}&=\\dfrac{y_C-y_B}{x_C-x_B}',
       '&=\\dfrac{0-3}{2-(-4)}',
       '&=-\\dfrac{1}{2}'
     ])
   NEVER concatenate more than one "=" worth of substitution onto a single
   row when the row contains a \dfrac/\sqrt term - if a substitution step
   itself is too wide for one row (e.g. sqrt((x2-x1)^2+(y2-y1)^2) with both
   coordinate substitutions inline), break IT into two rows too (e.g. show
   (x2-x1)^2 and (y2-y1)^2 as their own short rows) rather than accepting
   the overflow - a row's content can never itself contain a "\\" row-break
   (that's invalid inside a \sqrt{}/\dfrac{}'s argument), so the split has
   to happen at the string-building call site, not inside eqRows. */
function eqRows(rows) {
  return '$$\\begin{aligned}' + rows.join('\\\\') + '\\end{aligned}$$';
}
