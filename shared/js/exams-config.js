/* Builds a module list for a course whose canonical ids follow the
   "<prefix>-01", "<prefix>-02", ... scheme (position-based, zero-padded to 2
   digits). Since the flattening pass (each lesson is now a standalone file
   named exactly "<id>.html" directly inside its topic folder), `slug` is
   just `id` again for a built lesson - kept as a separate field (rather than
   collapsing to a single string) so an unbuilt position can still hold a
   real, permanent id with `slug: null`, letting resolveExamConfig() refuse
   to resolve it instead of producing a broken path. `unbuiltPositions` is a
   1-based list of positions that don't have a real lesson yet. */
function seqModules(prefix, count, unbuiltPositions) {
  unbuiltPositions = unbuiltPositions || [];
  var out = [];
  for (var i = 1; i <= count; i++) {
    var n = i < 10 ? '0' + i : String(i);
    var id = prefix + '-' + n;
    out.push({ id: id, slug: unbuiltPositions.indexOf(i) !== -1 ? null : id });
  }
  return out;
}

const MODULE_REGISTRY = {
  'grade10-level4-line': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית - הקו הישר',
    basePath: 'topics/line/',
    modules: seqModules('line', 12)
  },
  'grade10-level4-shapes': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית - צורות גיאומטריות',
    basePath: 'topics/shapes/',
    /* shp-01..shp-06 - full 6-lesson roadmap, all built. Positions fixed so
       ids stay stable if content is ever reordered.
       shp-01: משולש ישר זווית (זיהוי קודקוד הזווית הישרה לפי מכפלת שיפועים).
       shp-02: משולש שווה-שוקיים ושווה-צלעות (סיווג לפי אורכי צלעות, נוסחת המרחק).
       shp-03: תיכון במשולש ומציאת משוואתו.
       shp-04: גובה במשולש ומציאת משוואתו.
       shp-05: היקפים ושטחים של משולשים.
       shp-06: לומדת סיכום: תכונות מרובעים (was shp-04 before this cluster's
          topics 3-5 were split out into their own focused median/altitude/
          perimeter-area lessons). */
    modules: seqModules('shp', 6, [])
  },
  'grade12-level5': {
    grade: "יב'",
    level: '5 יח"ל (שאלון 572)',
    mainTopic: 'הפונקציה המעריכית',
    basePath: 'topics/exp/',
    modules: seqModules('exp', 9)
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
    modulePaths.push(course.basePath + mod.slug + '.html');
  }
  return {
    code: code,
    title: cfg.title,
    timeLimit: cfg.timeLimit || null,
    questionsCount: cfg.questionsCount,
    grade: course.grade,
    level: course.level,
    mainTopic: course.mainTopic,
    modulePaths: modulePaths
  };
}
