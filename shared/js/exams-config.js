const MODULE_REGISTRY = {
  'grade10-level4-line': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית - הקו הישר',
    basePath: 'grade10/level4/topics/',
    modules: [
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
    ]
  },
  'grade10-level4-shapes': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית - צורות גיאומטריות',
    basePath: 'grade10/level4/topics/',
    /* Full planned sequence for this topic - positions are fixed so lesson numbering stays stable
       as content is built. A `null` slot is a lesson that doesn't exist yet; resolveExamConfig()
       refuses to resolve any sourceModules entry that lands on one.
       1: משולש ישר זווית (זיהוי קודקוד הזווית הישרה לפי מכפלת שיפועים) - existing lesson
          ("02-triangle-types" - folder numbered by shapes-topic build order, not curriculum
          position; its question ids use the "tri" prefix, e.g. tri-m1-qK, not "shapes"; 5
          questions per quiz, not 10, each rendering its own dynamic triangle SVG)
       2: תיכונים וגבהים במשולש במערכת הצירים - not yet built
       3: שטחים והיקפים של משולשים במערכת הצירים - not yet built
       4: לומדת סיכום: תכונות מרובעים - existing lesson (folder kept as "01-quadrilaterals",
          its original build-order name, to avoid breaking any existing links)
       5: מרובעים במערכת הצירים (הוכחה וחישובים אנליטיים) - not yet built; this cluster may grow
          past a single lesson once scoped */
    modules: [
      '02-triangle-types',
      null,
      null,
      '01-quadrilaterals',
      null
    ]
  },
  'grade12-level5': {
    grade: "יב'",
    level: '5 יח"ל (שאלון 572)',
    mainTopic: 'הפונקציה המעריכית',
    basePath: 'grade12/level5/topics/',
    modules: [
      '01-exponential-basic',
      '02-exponential-e',
      '03-exponential-transformations',
      '04-exponential-equations',
      '05-exponential-inequalities',
      '06-exponential-domain-intersections',
      '07-exponential-parity-positivity',
      '08-exponential-asymptotes',
      '09-exponential-graph-matching'
    ]
  }
};

const EXAMS_CONFIG = {
  'GEO-101': {
    title: 'מבדק אמצע: גיאומטריה אנליטית - הקו הישר',
    course: 'grade10-level4-line',
    sourceModules: [1, 2, 3, 4, 5, 6],
    questionsCount: 10
  }
};

function isValidExamCode(code) {
  return Object.prototype.hasOwnProperty.call(EXAMS_CONFIG, code);
}

function resolveExamConfig(code) {
  var cfg = EXAMS_CONFIG[code];
  if (!cfg) return null;
  var course = MODULE_REGISTRY[cfg.course];
  if (!course) return null;
  var modulePaths = [];
  for (var i = 0; i < cfg.sourceModules.length; i++) {
    var slug = course.modules[cfg.sourceModules[i] - 1];
    if (!slug) return null; /* referenced module isn't built yet */
    modulePaths.push(course.basePath + slug + '/index.html');
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
