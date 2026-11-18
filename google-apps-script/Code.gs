/**
 * Little Moments – Gift Baskets
 * Google Apps Script Web App for saving customer inquiries to Google Sheets.
 *
 * Columns:
 *   1. Submission Date
 *   2. Full Name
 *   3. Phone Number
 *   4. Selected Language
 */

var SHEET_NAME = 'Submissions';
var HEADERS = [
  'Submission Date',
  'Full Name',
  'Phone Number',
  'Selected Language'
];

/**
 * Health check endpoint so you can verify the Web App deployment in a browser.
 */
function doGet() {
  return createJsonResponse({
    ok: true,
    service: 'Little Moments – Gift Baskets',
    message: 'Google Sheets Web App is active.'
  });
}

/**
 * Handles POST requests from the Little Moments website form.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return createJsonResponse({
      ok: false,
      error: 'Server is busy. Please try again.'
    });
  }

  try {
    var payload = parseRequestPayload(e);

    var fullName = String(payload.fullName || '').trim();
    var phoneNumber = String(payload.phoneNumber || '').trim();
    var selectedLanguage = normalizeLanguage(payload.selectedLanguage || payload.language || 'en');
    var submissionId = String(payload.submissionId || '').trim();

    // Server-side input validation
    if (fullName.length < 2 || fullName.length > 120) {
      return createJsonResponse({
        ok: false,
        error: 'Invalid full name.'
      });
    }

    var phonePattern = /^[+0-9()\-\s.]{5,32}$/;
    var digitCount = phoneNumber.replace(/\D/g, '').length;
    if (!phonePattern.test(phoneNumber) || digitCount < 6) {
      return createJsonResponse({
        ok: false,
        error: 'Invalid phone number.'
      });
    }

    // Prevent duplicate submissions from repeated clicks or retries
    if (submissionId) {
      var cache = CacheService.getScriptCache();
      var cacheKey = 'lm_sub_' + submissionId;
      if (cache.get(cacheKey)) {
        return createJsonResponse({
          ok: true,
          duplicate: true,
          message: 'Submission already recorded.'
        });
      }
      cache.put(cacheKey, '1', 600); // Remember ID for 10 minutes
    }

    var sheet = getOrCreateSubmissionsSheet();
    var submissionDate = new Date();
    var nextRow = sheet.getLastRow() + 1;

    sheet.appendRow([
      submissionDate,
      fullName,
      phoneNumber,
      selectedLanguage
    ]);

    // Format the newly added date cell cleanly and keep phone number as plain text
    sheet.getRange(nextRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(nextRow, 3).setNumberFormat('@');

    return createJsonResponse({
      ok: true,
      duplicate: false,
      row: nextRow
    });
  } catch (err) {
    return createJsonResponse({
      ok: false,
      error: err && err.message ? err.message : 'Unexpected Apps Script error.'
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Parses either JSON (text/plain or application/json) or form-encoded payloads.
 */
function parseRequestPayload(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      // Fall back to URL parameters if not JSON
    }
  }
  return (e && e.parameter) ? e.parameter : {};
}

/**
 * Normalizes language codes to readable spreadsheet labels.
 */
function normalizeLanguage(lang) {
  var value = String(lang).trim().toLowerCase();
  if (value === 'fr' || value === 'français' || value === 'francais') {
    return 'Français';
  }
  if (value === 'he' || value === 'עברית' || value === 'hebrew') {
    return 'עברית';
  }
  if (value === 'en' || value === 'english') {
    return 'English';
  }
  return String(lang).trim();
}

/**
 * Finds or creates the Submissions sheet and sets up the 4 required header columns.
 */
function getOrCreateSubmissionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange
      .setFontWeight('bold')
      .setFontColor('#34485B')
      .setBackground('#E8F0F6')
      .setHorizontalAlignment('left');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 185);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 160);
  }

  return sheet;
}

/**
 * Builds a JSON HTTP response.
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
