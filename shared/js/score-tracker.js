const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyZrxfXFhIsSvlG7_G_FD1_phfH_w3WB--n-OJxw6iflXWj1Rxh328Drokh553VPUummw/exec';

function sendScoreToSheet(studentName, classLevel, score, timeInSeconds) {
  try {
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        studentName: studentName,
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
