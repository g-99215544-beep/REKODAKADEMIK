// ============================================
// SISTEM REKOD PRESTASI MURID
// Copy SEMUA code ni ke Apps Script
// ============================================

// Function untuk serve HTML
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Sistem Rekod Prestasi Murid')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Function untuk handle POST requests (untuk compatibility)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'getClasses':
        return jsonResponse(getClassesData());
      case 'addClass':
        return jsonResponse(addClassData(data.className));
      case 'getStudents':
        return jsonResponse(getStudentsData(data.className));
      case 'addStudent':
        return jsonResponse(addStudentData(data.className, data.studentName));
      case 'updateStudent':
        return jsonResponse(updateStudentData(data.className, data.row, data.newName));
      case 'addActivity':
        return jsonResponse(addActivityData(data.className, data.activityName));
      case 'saveScores':
        return jsonResponse(saveScoresData(data.className, data.scores));
      default:
        return jsonResponse({ success: false, error: 'Unknown action' });
    }
  } catch(error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// DATA FUNCTIONS (dipanggil dari HTML)
// ============================================

function getClassesData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const classes = sheets.map(sheet => sheet.getName());
  return { classes };
}

function addClassData(className) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.insertSheet(className);
  sheet.getRange('A1:B1').setValues([['BIL', 'NAMA MURID']]);
  sheet.getRange('A1:B1').setFontWeight('bold');
  sheet.getRange('A1:B1').setBackground('#4285f4');
  sheet.getRange('A1:B1').setFontColor('#ffffff');
  return { success: true };
}

function getStudentsData(className) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(className);
  if (!sheet) return { students: [], activities: [] };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const activities = headers.slice(2);
  
  const students = data.slice(1).map((row, idx) => ({
    row: idx + 2,
    bil: row[0] || idx + 1,
    name: row[1] || '',
    scores: row.slice(2)
  })).filter(s => s.name);
  
  return { students, activities };
}

function addStudentData(className, studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(className);
  const lastRow = sheet.getLastRow();
  const nextBil = lastRow;
  
  sheet.getRange(lastRow + 1, 1, 1, 2).setValues([[nextBil, studentName]]);
  return { success: true };
}

function updateStudentData(className, row, newName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(className);
  sheet.getRange(row, 2).setValue(newName);
  return { success: true };
}

function addActivityData(className, activityName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(className);
  const lastCol = sheet.getLastColumn();
  
  sheet.getRange(1, lastCol + 1).setValue(activityName);
  sheet.getRange(1, lastCol + 1).setFontWeight('bold');
  sheet.getRange(1, lastCol + 1).setBackground('#4285f4');
  sheet.getRange(1, lastCol + 1).setFontColor('#ffffff');
  return { success: true };
}

function saveScoresData(className, scores) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(className);
  
  for (const key in scores) {
    const [row, col] = key.split('-');
    const value = scores[key];
    sheet.getRange(parseInt(row), parseInt(col) + 3).setValue(value);
  }
  
  return { success: true };
}
