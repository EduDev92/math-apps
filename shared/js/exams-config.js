const MODULE_REGISTRY = {
  'grade10-level4': {
    grade: "י'",
    level: '4 יח"ל',
    mainTopic: 'גיאומטריה אנליטית',
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
    title: 'מבדק אמצע: גיאומטריה אנליטית',
    course: 'grade10-level4',
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
  var modulePaths = cfg.sourceModules.map(function (n) {
    return course.basePath + course.modules[n - 1] + '/index.html';
  });
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
