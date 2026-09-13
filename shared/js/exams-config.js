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
  },
  /* Single-module refresher exam - all 10 questions come from shp-06's own
     generateQuizQuestions() (4 from COMBO_BANK + all 3 of CLASSIC_BANK + 3
     from TF_BANK = 10 every call), pooled via the same iframe mechanism as
     any multi-module exam so formatting/KaTeX/BiDi are identical to the
     lesson itself - no separate question authoring here. */
  'ELA-100': {
    title: 'מבדק רענון: תכונות המרובעים',
    description: 'מבדק המבוסס על שאלות לומדת תכונות המרובעים (shp-06)',
    course: 'grade10-level4-shapes',
    sourceModules: ['shp-06'],
    questionsCount: 10,
    timeLimit: 15
  },
  /* Unlike GEO-101/ELA-100 (which pool-and-randomly-sample live from each
     module's generateQuizQuestions() via hidden iframes - a different
     subset of questions, and even different numbers within a question,
     every session), this is a hand-curated FIXED set: exactly one
     representative question sourced from each of exp-01..exp-08's own
     quiz bank, plus two from exp-09 (only 9 lessons exist for a 10-question
     exam - the 2nd exp-09 question was a deliberate choice, exp-09 being
     the cumulative graph-matching/synthesis lesson). Every student sees the
     same 10 questions every session; only question order and each
     question's option order are reshuffled (see fixedQuestions handling in
     exam.html's loadExamQuestions()). Each entry's promptText/promptLatex/
     options/explain is copied verbatim from that lesson's own bank (see
     sourceModule) - not re-derived - to avoid drifting from the lesson's
     own verified wording/math. */
  'EXP-100': {
    title: 'מבדק פונקציה מעריכית',
    description: 'מבדק מרוכז - שאלה אחת נבחרת מכל לומדה בנושא הפונקציה המעריכית (exp-01 עד exp-09)',
    course: 'grade12-level5',
    questionsCount: 10,
    timeLimit: 20,
    fixedQuestions: [
      {
        id: 'exp-100-q1', sourceModule: 'exp-01', kind: 'choice',
        promptText: 'האם הפונקציה הבאה עולה או יורדת?',
        promptLatex: 'f(x) = \\left(\\tfrac{1}{3}\\right)^x',
        options: ['עולה', 'יורדת'],
        correctIndex: 1,
        explain: 'מכיוון שהבסיס נמצא בין 0 ל-1, הפונקציה יורדת לאורך כל תחום ההגדרה שלה.'
      },
      {
        id: 'exp-100-q2', sourceModule: 'exp-02', kind: 'choice',
        promptText: 'לאיזה מספר שואף הביטוי הבא כאשר ' + ltrToken('n') + ' שואף לאינסוף?',
        promptLatex: '\\left(1+\\tfrac{1}{n}\\right)^n',
        options: ['$e$', '$1$', '$\\infty$', '$2$'],
        correctIndex: 0,
        explain: 'זו בדיוק ההגדרה הגבולית של המספר $e$: $\\displaystyle\\lim_{n\\to\\infty}\\left(1+\\tfrac1n\\right)^n = e$.'
      },
      {
        id: 'exp-100-q3', sourceModule: 'exp-03', kind: 'choice',
        promptText: 'אילו טרנספורמציות בוצעו כדי לקבל את הפונקציה הבאה מתוך $f(x)=e^x$?',
        promptLatex: 'g(x) = e^{x-2}+3',
        options: ['הזזה ימינה ב-2, והזזה מעלה ב-3', 'הזזה שמאלה ב-2, והזזה מעלה ב-3', 'הזזה ימינה ב-2, והזזה מטה ב-3'],
        correctIndex: 0,
        explain: 'הביטוי $x-2$ בתוך המעריך מבצע הזזה ימינה ב-2 יחידות, וההוספה של $+3$ מבצעת הזזה מעלה ב-3 יחידות.'
      },
      {
        id: 'exp-100-q4', sourceModule: 'exp-04', kind: 'choice',
        promptText: 'כמה פתרונות תקפים (עבור ' + ltrToken('x') + ') יש למשוואה הבאה?',
        promptLatex: '4^{2x} - 4^x - 12 = 0',
        options: ['$0$', '$1$', '$2$'],
        correctIndex: 1,
        explain: 'מציבים $t=4^x$: $t^2-t-12=0 \\Rightarrow (t-4)(t+3)=0 \\Rightarrow t=4$ או $t=-3$. פוסלים $t=-3$, ומקבלים פתרון יחיד: $x=1$.'
      },
      {
        id: 'exp-100-q5', sourceModule: 'exp-05', kind: 'choice',
        promptText: 'פתרו את אי-השוויון הבא (שימו לב לבסיס!):',
        promptLatex: '\\left(\\tfrac12\\right)^x < \\tfrac14',
        options: ['$x>2$', '$x<2$', '$x\\ge2$'],
        correctIndex: 0,
        explain: 'הבסיס $\\tfrac12<1$ — הכיוון מתהפך: $\\left(\\tfrac12\\right)^x<\\left(\\tfrac12\\right)^2 \\Rightarrow x>2$.'
      },
      {
        id: 'exp-100-q6', sourceModule: 'exp-06', kind: 'choice',
        promptText: 'מהו תחום ההגדרה של הפונקציה הבאה?',
        promptLatex: 'f(x) = \\dfrac{x}{2^x-2^{3x}}',
        options: ['$x\\neq0$', '$x\\neq1$', '$כל x$'],
        correctIndex: 0,
        explain: 'מוציאים גורם משותף: $2^x-2^{3x}=2^x(1-2^{2x})$. מכיוון ש-$2^x\\neq0$ תמיד, המכנה מתאפס רק כאשר $2^{2x}=1 \\Rightarrow x=0$.'
      },
      {
        id: 'exp-100-q7', sourceModule: 'exp-07', kind: 'choice',
        promptText: 'קבעו האם הפונקציה הבאה זוגית, אי-זוגית, או לא זוגית ולא אי-זוגית:',
        promptLatex: 'f(x)=x\\cdot e^{x^2}',
        options: ['זוגית', 'אי-זוגית', 'לא זוגית ולא אי-זוגית'],
        correctIndex: 1,
        explain: '$f(-x)=(-x)e^{(-x)^2}=-x\\cdot e^{x^2}=-f(x)$ — לכן הפונקציה אי-זוגית.'
      },
      {
        id: 'exp-100-q8', sourceModule: 'exp-08', kind: 'choice',
        promptText: 'קבעו: האם בנקודה שבה המכנה מתאפס יש אסימפטוטה אנכית או "חור" בגרף?',
        promptLatex: 'f(x) = \\dfrac{e^x-1}{e^{2x}-e^{x}}',
        options: ['אסימפטוטה אנכית', '"חור" בגרף'],
        correctIndex: 1,
        explain: 'ב-$x=0$: גם המונה $e^x-1$ וגם המכנה $e^{2x}-e^x=e^x(e^x-1)$ מתאפסים. לאחר פישוט: $\\dfrac{e^x-1}{e^x(e^x-1)}=\\dfrac{1}{e^x}$ עבור $x\\neq0$ — כלומר יש "חור" בנקודה $x=0$, לא אסימפטוטה.'
      },
      {
        id: 'exp-100-q9', sourceModule: 'exp-09', kind: 'choice',
        promptText: 'לפני שבודקים אסימפטוטות, יש לבדוק תחילה את תחום ההגדרה של הפונקציה.',
        promptLatex: null,
        options: ['נכון', 'לא נכון'],
        correctIndex: 0,
        explain: 'תחום ההגדרה קובע איפה הפונקציה בכלל קיימת — בלעדיו לא ניתן לדעת אילו ערכי x רלוונטיים לבדיקת אסימפטוטות.'
      },
      {
        id: 'exp-100-q10', sourceModule: 'exp-09', kind: 'choice',
        promptText: 'הסדר המקובל לחקירת פונקציה הוא: אסימפטוטות ← זוגיות ← תחום הגדרה ← חיתוך עם הצירים.',
        promptLatex: null,
        options: ['נכון', 'לא נכון'],
        correctIndex: 1,
        explain: 'הסדר הנכון הוא: תחום הגדרה ← זוגיות/סימן ← נקודות חיתוך ← אסימפטוטות — קודם קובעים איפה הפונקציה קיימת, ורק בסוף בודקים התנהגות קצה.'
      }
    ]
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

  /* sourceModules (live pool-and-sample, e.g. GEO-101) and fixedQuestions
     (a hand-curated fixed set, e.g. EXP-100) are mutually exclusive ways of
     supplying an exam's questions - only build modulePaths when the config
     actually asks for module pooling. */
  var modulePaths = null;
  if (cfg.sourceModules) {
    modulePaths = [];
    for (var i = 0; i < cfg.sourceModules.length; i++) {
      var mod = findModuleById(course, cfg.sourceModules[i]);
      if (!mod || !mod.slug) return null; /* unknown id, or referenced module isn't built yet */
      modulePaths.push(course.basePath + mod.slug + '.html');
    }
  }

  return {
    code: code,
    title: cfg.title,
    description: cfg.description || null,
    timeLimit: cfg.timeLimit || null,
    questionsCount: cfg.questionsCount,
    grade: course.grade,
    level: course.level,
    mainTopic: course.mainTopic,
    modulePaths: modulePaths,
    fixedQuestions: cfg.fixedQuestions || null
  };
}
