/*
 * Wrap any Latin/LTR token - a coordinate, a formula, or even a single bare
 * vertex letter like "A" - before embedding it inside flowing Hebrew (RTL)
 * prose. Use this instead of hand-writing '<span class="coord-ltr">...' or
 * concatenating a bare letter/word directly into a Hebrew sentence string.
 *
 * Why a helper instead of just the .math-ltr CSS class: isolating the run
 * (unicode-bidi: isolate) is necessary but NOT sufficient. A confirmed
 * Chromium bidi-resolution quirk can still visually misplace an isolated LTR
 * run relative to its neighboring RTL words - most reproducibly when the run
 * is the LAST content in its containing block, with no following text to
 * anchor it (e.g. "...ובסיסו הצלע BC!" rendered so "BC!" is read BEFORE
 * "ובסיסו הצלע" instead of after it, even though the DOM/logical order was
 * always correct and .math-ltr/.coord-ltr WAS applied). Appending an
 * invisible right-to-left mark (U+200F) immediately after the isolated run
 * fixes this - confirmed both for a run sandwiched mid-sentence and for one
 * at the very end of a sentence, with no observed downside either way - so
 * it's applied unconditionally rather than only when the run is detected as
 * trailing (that detection would be fragile and easy to get wrong; the
 * anchor is a no-op when it isn't needed).
 *
 * This is also why a bare single-letter token ("A", "BC") is NOT safe to
 * leave unwrapped in Hebrew prose just because it's short - short tokens are
 * exactly as vulnerable as long ones. Wrap every one.
 */
function ltrToken(text, extraAttrs) {
  return '<span class="math-ltr"' + (extraAttrs ? ' ' + extraAttrs : '') + '>' + text + '</span>‏';
}
