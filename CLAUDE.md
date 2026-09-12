# math-apps

Hebrew-language interactive math lessons, static site (GitHub Pages, no build step). Each lesson is a single self-contained file at `topics/{line,shapes,exp}/<id>.html` (e.g. `topics/shapes/shp-04.html`), following a shared 4-step shell (מכירים/חוקרים/מתרגלים/מסכמים = Learn/Lab/Quiz/Results) via the `<step-progress>` custom element. `index.html` is the root portal.

## Mandatory rules for every lesson (new or edited)

These exist because every one of them was a real, shipped bug found on mobile. Follow them by default; don't wait to be asked.

1. **Every math expression is KaTeX, never raw text arithmetic.** No `((-2+4)/2, (-1+3)/2)` or `x/y` written with a plain slash in a step explanation, worked example, or quiz `explain` string - always a `$...$`/`$$...$$` block with a proper `\dfrac`/`\sqrt`. A raw slash or inline arithmetic string outside a math delimiter is a bug, not a style choice.

2. **Use `shared/js/math-format.js` for exact-fraction/coordinate math - don't re-derive it.** Load the script and call `makeFrac`/`fracToLatex`/`fracToStr`/`PLUS`/`MINUS`/`coefXLatex`/`eqRows`/`sqrtToLatex` instead of writing your own fraction arithmetic or string-concatenating a `+`/`-` template against a value that might be negative (that produces a glued `"+-3"`/`"--3"` artifact - a real bug, fixed everywhere by routing through these helpers). See the file's own header comment for the full API and the reasoning behind each function.

3. **Never build a long single-line "a=b=c=d=e" chained equation.** KaTeX's own `.katex-display>.katex` is `text-align:center; white-space:nowrap` - a chain wider than its container gets silently cropped on **both edges** on a phone, not scrolled (confirmed - overriding `text-align` does not fix this; CSS cannot fix it). Use `eqRows([...])` from `math-format.js` to stack it as separate rows instead - one substitution step per row. If a single row is still too wide on its own (e.g. a `\sqrt{}` combining two substitutions), split that row's content further at the call site rather than accepting the overflow (`\\` cannot be used inside an open `\sqrt{}`/`\dfrac{}` argument - the split has to happen in how you build the strings, not inside `eqRords`).

4. **Strict BiDi isolation for any Latin token in Hebrew prose.** Wrap it with `ltrToken()` from `shared/js/bidi-utils.js` - never concatenate a bare `"AB"`/`"BC"` (even a single letter) directly into an RTL string. This is doubly true when the token sits next to an already-isolated `.math-ltr`/KaTeX span - that adjacency has been confirmed to visually garble the whole line's reading order with a plain concatenation, even in cases where the same bare-token pattern looks fine elsewhere in isolation. Screenshot-verify any new inline Hebrew+Latin label rather than trusting the string logic alone.

5. **Name the specific quantity in every derivation/readout**, not a generic label - `m_{BC}=`, `d_{AB}=`, `אורך AB=`, never a bare `אורך=`/`שיפוע=`. Matches how a written solution is actually presented.

6. **Adaptive axis-tick labels on SVG grids.** Use `adaptiveTickStep()` from `shared/js/grid-utils.js` to decide which integer ticks get a number drawn next to them (grid *lines* are unaffected - only *labels* thin out): `var stepX = adaptiveTickStep(Math.abs(mx(1)-mx(0)))`, then only label when `gx % stepX === 0`. A small SVG (~260px) with a `-8..8` range has ~12-16px between ticks - not enough room for a 2-character label like `"-8"` without adjacent labels bunching together on a real phone.

7. **No parent container may blindly `overflow: hidden`/`overflow-x: hidden` over a region that can contain a formula.** `.lesson-card`'s base rule across every lesson had this removed for exactly this reason (verified via drag-stress + page-scroll audit that removing it introduces zero regressions - a descendant's own `overflow-x:auto` works correctly independently of an ancestor's `overflow-x:hidden`, so the ancestor rule was only ever a redundant risk, never a requirement).

8. **Verify at 360px, not just 375px** - it's the effective minimum across common phones. Two checks, both required, since they catch different failure modes:
   - Page-level: `document.documentElement.scrollWidth <= clientWidth` (no horizontal page scroll).
   - Element-level: `el.scrollWidth <= el.clientWidth + 2` on every `.katex`/`.katex-display` node, after exercising every interactive control (drag every point to all 4 corners of its SVG; move every slider to its min and max) - a page-level check alone is blind to an internal element that's centered-and-cropped without ever causing the page itself to scroll (rule 3 above).

## Shared infrastructure

- `shared/css/common.css` - global KaTeX/RTL/formula-overflow guardrails. Read the comments before touching `.katex`/`.katex-display`/`p:has(.katex)`/`.dist-line-wrap` rules - each one encodes a specific fixed bug.
- `shared/js/math-format.js` - exact-fraction arithmetic + KaTeX formatting (rule 2, 3 above).
- `shared/js/grid-utils.js` - adaptive SVG tick-label spacing (rule 6 above).
- `shared/js/bidi-utils.js` - `ltrToken()` for BiDi isolation (rule 4 above).
- `shared/js/score-tracker.js` - wire at `renderResults()`: `sendScoreToSheet({grade, level, mainTopic, subTopic, mode:'תרגול', ...})`.
- `shared/js/exams-config.js` - `MODULE_REGISTRY`/`seqModules()`, pools quiz questions live from each lesson's `generateQuizQuestions()` via hidden iframes.
- `shared/components/step-progress.js` - the 4-step shell.

## Conventions

- Canonical ids: `line-01`..`line-12`, `shp-01`..`shp-06`, `exp-01`..`exp-09` (`moduleId-qK` for question ids). Old `geo-m*`/`tri-m*`/`shapes-m*`/`exp-m*` ids are retired.
- `.module-id-badge` is uppercased via CSS (`text-transform`), not by the string itself.
