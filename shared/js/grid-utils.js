/*
 * Adaptive axis-tick-label spacing for SVG coordinate grids.
 *
 * Every lesson's SVG grid renderer draws a line for every integer tick but
 * used to LABEL every one of them unconditionally. On a small SVG (the
 * ~260px Step-1 "worked example" diagrams, common across topics/shapes and
 * topics/line) with a typical -8..8 range, that's roughly 12-16px between
 * ticks - not enough room for a 2-character label like "-8" (which alone
 * needs ~14-18px at normal font size) without adjacent labels visually
 * touching or overlapping on a real phone.
 *
 * This file does NOT change how many grid LINES are drawn (the visual grid
 * density is unaffected) - it only decides which of those ticks also get a
 * number drawn next to them, thinning labels out as needed so they never
 * bunch together, while leaving every line-count/spacing/mx()/my() scale
 * function a lesson already has completely untouched.
 *
 * MANDATORY for every new lesson's grid renderer: compute your label step
 * with adaptiveTickStep() instead of labeling every integer unconditionally.
 * Minimal integration into an existing buildGridMarkup-style function:
 *
 *   var stepX = adaptiveTickStep(Math.abs(mx(1) - mx(0)));
 *   var stepY = adaptiveTickStep(Math.abs(my(1) - my(0)));
 *   for (var gx = Math.ceil(xmin); gx <= Math.floor(xmax); gx++) {
 *     markup += '<line .../>';                              // unchanged
 *     if (gx !== 0 && gx % stepX === 0) markup += '<text>' + gx + '</text>';
 *   }
 *   // same pattern for gy with stepY
 *
 * That's the only change needed - grid lines, colors, and everything else
 * about the existing renderer stay exactly as they were.
 */

/*
 * Returns the smallest step from a fixed candidate list (1,2,5,10,20,25,50,
 * 100...) such that consecutive LABELED ticks are at least minLabelSpacingPx
 * apart on screen, given pixelsPerUnit (how many screen px one grid unit
 * spans - e.g. Math.abs(mx(1) - mx(0))). Falls back to the largest candidate
 * for a pathologically tiny SVG rather than growing unbounded.
 */
function adaptiveTickStep(pixelsPerUnit, minLabelSpacingPx) {
  minLabelSpacingPx = minLabelSpacingPx || 22;
  if (!pixelsPerUnit || pixelsPerUnit <= 0) return 1;
  var candidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
  for (var i = 0; i < candidates.length; i++) {
    if (pixelsPerUnit * candidates[i] >= minLabelSpacingPx) return candidates[i];
  }
  return candidates[candidates.length - 1];
}
