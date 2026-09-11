/* Builds a module list for a course whose canonical ids follow the new
   "<prefix>-01", "<prefix>-02", ... scheme (position-based, zero-padded to 2
   digits). A `null` slug means that position's lesson isn't built yet - it
   still gets a real id so a future lesson can fill the slot in place without
   shifting every id after it. */
function seqModules(prefix, slugs) {
  return slugs.map(function (slug, i) {
    var n = i + 1;
    var padded = n < 10 ? '0' + n : String(n);
    return { id: prefix + '-' + padded, slug: slug };
  });
}

const MODULE_REGISTRY = {
  'grade10-level4-line': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית - הקו הישר',
    basePath: 'grade10/level4/topics/',
    /* line-01..line-12, one per topics/NN-* folder in curriculum order (same
       order the folders are already numbered in, so id position == folder
       number here). */
    modules: seqModules('line', [
      '01-coordinate-system',
      '02-parallel-distance',
      '03-distance-formula',
      '04-midpoint',
      '05-endpoint',
      '06-slope-concept',
      '07-slope-calculation',
      '08-line-equation-point-slope',
      '09-line-equation-two-points',
      '10-parallel-lines',
      '11-perpendicular-lines',
      '12-intersecting-lines'
    ])
  },
  'grade10-level4-shapes': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית - צורות גיאומטריות',
    basePath: 'grade10/level4/topics/',
    /* shp-01..shp-05 - full planned 5-lesson roadmap, positions fixed so ids
       stay stable as content is built. A `null` slug is a lesson that
       doesn't exist yet; resolveExamConfig() refuses to resolve any
       sourceModules entry that lands on one.
       shp-01: משולש ישר זווית (זיהוי קודקוד הזווית הישרה לפי מכפלת שיפועים) -
          existing lesson ("02-triangle-types" - folder numbered by
          shapes-topic build order, not curriculum position; its own
          question ids use the "shp-01" prefix too, e.g. shp-01-qK; 5
          questions per quiz, not 10, each rendering its own dynamic
          triangle SVG). Prior to this file's id-standardization pass this
          module's question ids used a separate "tri-m1" prefix - now unified
          with its module id.
       shp-02: משולש שווה-שוקיים ושווה-צלעות (סיווג לפי אורכי צלעות, נוסחת
          המרחק) - existing lesson ("03-isosceles-equilateral"; question ids
          now "shp-02-qK", previously "tri-m2-qK"). This position previously
          held a placeholder for "תיכונים וגבהים במשולש" in planning notes;
          the user redirected this lesson to isosceles/equilateral
          classification instead, so medians/altitudes isn't currently
          scheduled at any position in this roadmap.
       shp-03: שטחים והיקפים של משולשים במערכת הצירים - not yet built.
       shp-04: לומדת סיכום: תכונות מרובעים - existing lesson (folder kept as
          "01-quadrilaterals", its original build-order name, to avoid
          breaking any existing links; question ids now "shp-04-qK",
          previously "shapes-m4-qK").
       shp-05: מרובעים במערכת הצירים (הוכחה וחישובים אנליטיים) - not yet
          built; this cluster may grow past a single lesson once scoped. */
    modules: seqModules('shp', [
      '02-triangle-types',
      '03-isosceles-equilateral',
      null,
      '01-quadrilaterals',
      null
    ])
  },
  'grade12-level5': {
    grade: "יב'",
    level: '5 יח"ל (שאלון 572)',
    mainTopic: 'הפונקציה המעריכית',
    basePath: 'grade12/level5/topics/',
    /* Not in scope for the line/shp id-standardization - ids stay "exp-mN"
       (unlike line/shp, kept as-is rather than renamed), just wrapped in the
       same {id, slug} shape so resolveExamConfig() can treat every course
       uniformly. */
    modules: [
      { id: 'exp-m1', slug: '01-exponential-basic' },
      { id: 'exp-m2', slug: '02-exponential-e' },
      { id: 'exp-m3', slug: '03-exponential-transformations' },
      { id: 'exp-m4', slug: '04-exponential-equations' },
      { id: 'exp-m5', slug: '05-exponential-inequalities' },
      { id: 'exp-m6', slug: '06-exponential-domain-intersections' },
      { id: 'exp-m7', slug: '07-exponential-parity-positivity' },
      { id: 'exp-m8', slug: '08-exponential-asymptotes' },
      { id: 'exp-m9', slug: '09-exponential-graph-matching' }
    ]
  }
};

const EXAMS_CONFIG = {
  'GEO-101': {
    title: 'מבדק אמצע: גיאומטריה אנליטית - הקו הישר',
    course: 'grade10-level4-line',
    sourceModules: ['line-01', 'line-02', 'line-03', 'line-04', 'line-05', 'line-06'],
    questionsCount: 10
  }
};

function isValidExamCode(code) {
  return Object.prototype.hasOwnProperty.call(EXAMS_CONFIG, code);
}

function findModuleById(course, id) {
  for (var i = 0; i < course.modules.length; i++) {
    if (course.modules[i].id === id) return course.modules[i];
  }
  return null;
}

function resolveExamConfig(code) {
  var cfg = EXAMS_CONFIG[code];
  if (!cfg) return null;
  var course = MODULE_REGISTRY[cfg.course];
  if (!course) return null;
  var modulePaths = [];
  for (var i = 0; i < cfg.sourceModules.length; i++) {
    var mod = findModuleById(course, cfg.sourceModules[i]);
    if (!mod || !mod.slug) return null; /* unknown id, or referenced module isn't built yet */
    modulePaths.push(course.basePath + mod.slug + '/index.html');
  }
  return {
    code: code,
    title: cfg.title,
    questionsCount: cfg.questionsCount,
    grade: course.grade,
    level: course.level,
    mainTopic: course.mainTopic,
    modulePaths: modulePaths
  };
}
