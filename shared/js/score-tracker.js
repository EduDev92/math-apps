const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyZrxfXFhIsSvlG7_G_FD1_phfH_w3WB--n-OJxw6iflXWj1Rxh328Drokh553VPUummw/exec';

const TEACHERS_LIST = ['אופיר נוסבאום', 'אייל עזרא', 'איילת מור', 'אלה גלוזשטיין', 'אלונה גוזלן', 'אפרת צבר', 'ביבי קרפל אביטל', 'גיל מיכאל אילת', 'דני גלעד', 'הדר דמרי לב', 'הילה בן צור רונן', 'חני בהלול', 'יעל פדהצור', 'מאור קסטרו', 'מלי מלה', 'נגה גביש', 'נעמי ירום', 'סיגלית דדון', 'סמדר בכר', 'רוני דולב', 'רונית פרנקל רוכמן', 'שרון דרעי'];

function populateTeacherDatalist(datalistId) {
  var el = document.getElementById(datalistId || 'teachers-list');
  if (!el) return;
  el.innerHTML = TEACHERS_LIST.map(function (name) {
    return '<option value="' + name + '"></option>';
  }).join('');
}

function isValidTeacherName(name) {
  return TEACHERS_LIST.indexOf(name) !== -1;
}

function sendScoreToSheet(studentName, teacherName, classLevel, score, timeInSeconds) {
  try {
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        studentName: studentName,
        teacherName: teacherName,
        classLevel: classLevel,
        moduleName: document.title,
        score: score,
        time: timeInSeconds
      })
    });
  } catch (e) {
    /* fire-and-forget: tracking must never disrupt the student's certificate flow */
  }
}
