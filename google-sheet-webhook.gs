function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Waitlist");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Waitlist");
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Email", "Source"]);
    }

    var payload = JSON.parse(e.postData.contents || "{}");
    var name = String(payload.name || "").trim();
    var email = String(payload.email || "").trim();
    var source = String(payload.source || "luma-site").trim();

    if (!name || !email) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Missing name or email" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([new Date(), name, email, source]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
