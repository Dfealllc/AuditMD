/**
 * AuditMD — IT Governance Assessment Response Sheet Setup
 * ─────────────────────────────────────────────────────────
 * HOW TO RUN:
 *   1. Go to https://sheets.google.com and create a NEW blank spreadsheet.
 *   2. Name it: DFL — IT Governance Assessment (Responses)
 *   3. Click Extensions → Apps Script.
 *   4. Delete the default code, paste this entire script, click Save (💾).
 *   5. Click Run → Run function → "setupGovernanceSheet".
 *   6. Approve the permissions prompt (allow access to Sheets).
 *   7. Return to the spreadsheet — the headers and formatting are now applied.
 *   8. Copy the spreadsheet URL and paste it into Zap F3b (Step 2) in Zapier.
 * ─────────────────────────────────────────────────────────
 */

function setupGovernanceSheet() {

  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // ── Rename the sheet tab ──────────────────────────────────────────────────
  sheet.setName('Form Responses 1');
  ss.rename('DFL — IT Governance Assessment (Responses)');

  // ── Column definitions ────────────────────────────────────────────────────
  // Each entry: [Header Label, Webhook Field Name, Column Width px]
  // The "Webhook Field Name" row (row 2) is hidden but used by Zapier mapping.
  var columns = [
    ['Timestamp',                          'timestamp',             160],
    ['Email Address',                      'email',                 220],
    ['Organization Name',                  'organization_name',     220],
    ['IT Governance Committee',            'has_it_governance',     260],
    ['Existing Policies',                  'existing_policies',     300],
    ['AI Governance Policy',               'ai_governance_policy',  260],
    ['Vendor / Third-Party Inventory',     'vendor_inventory',      240],
    ['AI Bias Accountability Owner',       'ai_bias_owner',         240],
    ['AI Model Evaluation Process',        'ai_eval_process',       240],
    ['BAA Management',                     'baa_management',        220],
    ['Governance Gaps Identified',         'governance_gaps',       260],
    ['Security Policies in Place',         'has_security_policies', 240],
    ['IT Decision-Making Process',         'it_decision_process',   240],
    ['IT Executive / Owner',               'it_exec_owner',         220],
    ['Policy Last Review Date',            'policy_last_review',    200],
    ['Service',                            'service',               160],
    ['Source',                             'source',                160],
  ];

  var numCols = columns.length;

  // ── Apply column widths ───────────────────────────────────────────────────
  for (var i = 0; i < numCols; i++) {
    sheet.setColumnWidth(i + 1, columns[i][2]);
  }

  // ── Row 1: Human-readable headers ─────────────────────────────────────────
  var headerLabels = columns.map(function(c) { return c[0]; });
  var headerRange  = sheet.getRange(1, 1, 1, numCols);
  headerRange.setValues([headerLabels]);
  headerRange
    .setBackground('#0D2B55')          // AuditMD navy
    .setFontColor('#FFFFFF')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 48);

  // ── Row 2: Webhook field names (reference row — hidden) ───────────────────
  var fieldNames  = columns.map(function(c) { return c[1]; });
  var fieldRange  = sheet.getRange(2, 1, 1, numCols);
  fieldRange.setValues([fieldNames]);
  fieldRange
    .setBackground('#F2F4F7')
    .setFontColor('#667085')
    .setFontFamily('Arial')
    .setFontSize(9)
    .setFontStyle('italic')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 32);

  // Add a note to A2 explaining the row
  sheet.getRange('A2').setNote(
    'Row 2 shows the Zapier webhook field names.\n' +
    'Map these names in the Zap F3b "Create Spreadsheet Row" step.\n' +
    'This row is for reference only — actual data starts at row 3.'
  );

  // ── Freeze the header rows ────────────────────────────────────────────────
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(3);  // Freeze Timestamp, Email, Org Name

  // ── Alternating row colours for data rows (3 onward, pre-applied) ────────
  // Apply a banded range so new rows inherit zebra striping
  var dataRange = sheet.getRange(3, 1, 200, numCols);
  var banding   = dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  banding.setHeaderRowColor(null);
  banding.setFirstRowColor('#FFFFFF');
  banding.setSecondRowColor('#F9FAFB');

  // ── Column-specific formatting ────────────────────────────────────────────
  // Column A (Timestamp): date-time format
  sheet.getRange(3, 1, 200, 1)
    .setNumberFormat('dd/mm/yyyy hh:mm:ss')
    .setHorizontalAlignment('center');

  // Columns B–C (Email, Org): left-align, slightly smaller
  sheet.getRange(3, 2, 200, 2)
    .setFontSize(9)
    .setHorizontalAlignment('left');

  // Columns D onward: wrap text, left-align
  sheet.getRange(3, 4, 200, numCols - 3)
    .setWrap(true)
    .setFontSize(9)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('top');

  // ── Gold accent divider under header ──────────────────────────────────────
  // Apply a bottom border to row 1 in gold
  var goldBorder = sheet.getRange(1, 1, 1, numCols);
  goldBorder.setBorder(
    null, null, true, null, null, null,
    '#C5A028',
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );

  // ── Named range for Zapier lookup ─────────────────────────────────────────
  // Zapier will look up rows from column B (email) — name it for reference
  ss.setNamedRange(
    'GovernanceResponses',
    sheet.getRange(1, 1, 1000, numCols)
  );

  // ── Sheet protection note ─────────────────────────────────────────────────
  // Protect header rows from accidental edits (warning only — doesn't block)
  var protection = sheet.getRange(1, 1, 2, numCols).protect();
  protection.setDescription('AuditMD header rows — do not edit');
  protection.setWarningOnly(true);

  // ── Add a "Legend" sheet explaining the columns ───────────────────────────
  var legend = ss.insertSheet('Legend');
  legend.setTabColor('#C5A028');  // gold tab

  var legendHeaders = [['Column', 'Header Label', 'Zapier Field Name', 'Description']];
  legend.getRange(1, 1, 1, 4).setValues(legendHeaders)
    .setBackground('#0D2B55')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontFamily('Arial')
    .setFontSize(10);
  legend.setColumnWidth(1, 80);
  legend.setColumnWidth(2, 240);
  legend.setColumnWidth(3, 240);
  legend.setColumnWidth(4, 440);

  var legendData = [
    ['A', 'Timestamp',                       'timestamp',            'Auto-set by Zapier when row is created'],
    ['B', 'Email Address',                   'email',                'Respondent email from URL param ?email='],
    ['C', 'Organization Name',               'organization_name',    'Client org from URL param ?org=, passed by Zap 6'],
    ['D', 'IT Governance Committee',         'has_it_governance',    'Does the org have a formal IT Governance committee?'],
    ['E', 'Existing Policies',               'existing_policies',    'Semicolon-separated list of checked policies'],
    ['F', 'AI Governance Policy',            'ai_governance_policy', 'Formal AI governance policy status'],
    ['G', 'Vendor / Third-Party Inventory',  'vendor_inventory',     'Whether a formal vendor inventory exists'],
    ['H', 'AI Bias Accountability Owner',    'ai_bias_owner',        'Who owns AI bias accountability in the org'],
    ['I', 'AI Model Evaluation Process',     'ai_eval_process',      'Whether a formal AI model evaluation process exists'],
    ['J', 'BAA Management',                  'baa_management',       'Business Associate Agreement management status'],
    ['K', 'Governance Gaps Identified',      'governance_gaps',      'Free-text: governance gaps the respondent identifies'],
    ['L', 'Security Policies in Place',      'has_security_policies','Whether security policies are formally documented'],
    ['M', 'IT Decision-Making Process',      'it_decision_process',  'How IT decisions are made in the organisation'],
    ['N', 'IT Executive / Owner',            'it_exec_owner',        'Name/title of the IT executive or governance owner'],
    ['O', 'Policy Last Review Date',         'policy_last_review',   'When policies were last formally reviewed'],
    ['P', 'Service',                         'service',              'Always "Governance Assessment" — set by form JS'],
    ['Q', 'Source',                          'source',               'Always "AuditMD Governance Assessment Form"'],
  ];
  legend.getRange(2, 1, legendData.length, 4).setValues(legendData)
    .setFontFamily('Arial')
    .setFontSize(9)
    .setWrap(true)
    .setVerticalAlignment('top');
  legend.setRowHeights(2, legendData.length, 40);

  // Banding on legend
  legend.getRange(2, 1, legendData.length, 4)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  legend.setFrozenRows(1);

  // ── Switch back to the main sheet ────────────────────────────────────────
  ss.setActiveSheet(sheet);

  // ── Done ──────────────────────────────────────────────────────────────────
  SpreadsheetApp.getUi().alert(
    'Setup complete!\n\n' +
    'Sheet: "Form Responses 1" is ready.\n' +
    'Row 1 = column labels (navy header)\n' +
    'Row 2 = webhook field names (reference, greyed out)\n' +
    'Data starts at row 3.\n\n' +
    'Next step: Copy this spreadsheet URL and paste it into\n' +
    'Zap F3b → Step 2 (Google Sheets: Create Spreadsheet Row).\n' +
    'In Zapier, map each field name from Row 2 to the matching\n' +
    'webhook field of the same name.'
  );
}


/**
 * ── OPTIONAL: Add a sample test row ────────────────────────────────────────
 * Run this after setupGovernanceSheet() to verify the layout looks correct.
 * Delete the test row before going live.
 */
function addTestRow() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Form Responses 1');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Run setupGovernanceSheet() first.');
    return;
  }

  var testRow = [
    new Date(),                                          // A Timestamp
    'it.lead@acmehealth.org',                            // B email
    'Acme Health System',                                // C organization_name
    'Yes — active and meets regularly',                  // D has_it_governance
    'Acceptable Use Policy; Incident Response Plan; Access Control Policy', // E existing_policies
    'Yes — board-approved',                              // F ai_governance_policy
    'Yes — fully documented and current',                // G vendor_inventory
    'Chief Information Officer',                         // H ai_bias_owner
    'Yes — formal evaluation before any AI deployment',  // I ai_eval_process
    'Yes — all active BAAs are current and documented',  // J baa_management
    'No documented escalation path for AI incidents',    // K governance_gaps
    'Yes — formally documented and enforced',            // L has_security_policies
    'Steering committee with quarterly review cycle',    // M it_decision_process
    'Dr. Jane Smith, CIO',                               // N it_exec_owner
    'Q1 2025',                                           // O policy_last_review
    'Governance Assessment',                             // P service
    'AuditMD Governance Assessment Form',                // Q source
  ];

  sheet.appendRow(testRow);
  SpreadsheetApp.getUi().alert('Test row added at row 3. Delete it before going live.');
}
