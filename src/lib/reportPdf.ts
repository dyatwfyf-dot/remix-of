import { reportsCompactColumnsCss, tagReportCells, tagSerialColumns } from "./reportsCompactColumnsCss";
import { printReportHtmlAsync } from "./nativePrinter";
import { escapeHtml, reportLetterheadHtml } from './printTableHtml';
import { reportTableThemeCss } from './reportTheme';
import { excelLikePrintTablesCss } from "./excelLikePrintTablesCss";
import { reportArabicFontFacesCss, reportArabicFontStack } from "./reportArabicFonts";

export type ReportPaperSize = 'A4' | 'A3' | 'Letter';
export type ReportOrientation = 'portrait' | 'landscape';

export const reportDocumentCss = `
  ${reportArabicFontFacesCss}
  :root { 
    --report-paper: #ffffff; 
    --report-ink: #000000; 
    --report-muted: #334155;
    --report-rule: #000000; 
    --report-stripe: #f8fafc;
    --report-total: #0437bb; 
    --report-accent: #174258; 
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { 
    margin: 0; 
    padding: 0; 
    direction: rtl; 
    background: var(--report-paper);
    color: #000000; 
    font-family: ${reportArabicFontStack} !important; 
    font-size: 16px; 
    line-height: 1.4; 
    font-weight: 800;
    width: 100% !important;
    height: auto !important;
  }
  h1, h2 { text-align: center; color: #000000; font-size: 22px; margin: 0 0 6px; font-weight: 900; white-space: pre-line; line-height: 1.4; }
  .sub, .meta { text-align: center; color: #000000; font-size: 18px; margin-bottom: 8px; font-weight: 700; }
  table {
    width: 100%; 
    max-width: auto;
    border-collapse: collapse; 
    table-layout: auto; 
    text-align: center; 
    font-weight: 800;
    border: 1px solid #000000 !important;
  }
  th, td {
    padding: 6px 7px;
    text-align: center !important;
    vertical-align: middle !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
    border: 1px solid #000000 !important;
  }
  thead th {
    background: #FFD700 !important;
    color: #000000 !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  thead th .pdf-cell-text {
  
  color: #000000 !important; 
    
  }
  .total-row td, .report-grand-total-row td {
    background: #0437bb !important;
    font-weight: 900 !important;
    border-top: 2px solid #000000 !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .total-row td .pdf-cell-text,
  .report-grand-total-row td .pdf-cell-text { 
background: #0437bb !important;
  color: #ffffff !important; }
  .doc-title-cell { border: 0 !important; background: var(--report-paper); padding: 0 0 6px; }

  /* ===== إطار الترويسة الموحّد للتقارير الرسمية ===== */
  .report-letterhead-block {
    display: block;
    width: 100%;
    margin: 0 0 3mm;
  }
  .report-letterhead-frame {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: 1.5px solid #000000;
    border-radius: 4px;
    padding: 5px 12px;
    background: #ffffff;
    box-sizing: border-box;
    color: #000000;
  }
  .report-letterhead-side {
    flex: 1 1 36%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #000000;
  }
  .report-letterhead-right {
    text-align: right;
    direction: rtl;
  }
  .letterhead-title-ar {
    font-family: ${reportArabicFontStack} !important;
    font-size: 13.5px;
    font-weight: 900;
    line-height: 1.3;
    color: #000000;
  }
  .letterhead-sub-ar {
    font-family: ${reportArabicFontStack} !important;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.3;
    color: #000000;
  }
  .letterhead-branch-ar {
    font-family: ${reportArabicFontStack} !important;
    font-size: 12.5px;
    font-weight: 900;
    line-height: 1.3;
    color: #000000;
  }
  .report-letterhead-center {
    flex: 0 0 28%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 4px;
  }
  .letterhead-bismillah {
    font-family: ${reportArabicFontStack} !important;
    font-size: 14.5px;
    font-weight: 900;
    color: #000000;
    white-space: nowrap;
  }
  .letterhead-center-divider {
    width: 75px;
    height: 1.5px;
    background: #000000;
    margin: 3px auto 0;
  }
  .report-letterhead-left {
    text-align: left;
    direction: ltr;
  }
  .letterhead-title-en {
    font-family: Arial, ${reportArabicFontStack} !important;
    font-size: 12px;
    font-weight: 900;
    line-height: 1.25;
    color: #000000;
  }
  .letterhead-sub-en {
    font-family: Arial, ${reportArabicFontStack} !important;
    font-size: 10.5px;
    font-weight: 800;
    line-height: 1.25;
    color: #000000;
  }
  .letterhead-branch-en {
    font-family: Arial, ${reportArabicFontStack} !important;
    font-size: 11px;
    font-weight: 900;
    line-height: 1.25;
    color: #000000;
  }

  .num, .numeric-cell, .date-cell, .idx { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }


/* Unified report table theme shared by the downloaded PDF renderer. */
table.reports-data-table{width:100%!important;max-width:100%!important;border-collapse:collapse!important;table-layout:auto!important;direction:rtl!important;text-align:center!important}
table.reports-data-table th,table.reports-data-table td{box-sizing:border-box!important;border:1px solid #17212b!important;text-align:center!important;vertical-align:middle!important;font-family:${reportArabicFontStack}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
table.reports-data-table thead th{background:linear-gradient(180deg,#fff8d9,#f5d978 48%,#d7a92e)!important;color:#111!important;font-weight:900!important;white-space:normal!important;overflow-wrap:anywhere!important}
table.reports-data-table tbody td{background:#fff!important;color:#111!important;font-weight:750!important}
table.reports-data-table tbody tr.total-row>td,table.reports-data-table tbody tr.report-grand-total-row>td{background:#0871ce!important;color:#fff!important;font-weight:900!important}
table.reports-data-table tbody tr.total-row>td *,table.reports-data-table tbody tr.report-grand-total-row>td *{background:transparent!important;color:#fff!important}
table.reports-data-table tbody tr.reports-trainee-total-row:not(.total-row):not(.report-grand-total-row)>td{background:#d9f0ec!important;color:#102c2a!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-trainee-summary-row:not(.total-row):not(.report-grand-total-row)>td{background:#fff4d9!important;color:#211b0c!important;font-weight:850!important}
table.reports-data-table tbody tr.reports-fee-row:not(.total-row):not(.report-grand-total-row)>td{background:#e8f1f7!important;color:#142b3d!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-period-row:not(.total-row):not(.report-grand-total-row)>td{background:#e9eef3!important;color:#17212b!important;font-weight:900!important}
`;

export const reportContainmentCss = `
  ${reportArabicFontFacesCss}
  .report-page-content { 
    width: 100%; 
    max-width: auto; 
  }
  .report-page-content th
  {
  min-width: auto !important;
padding: 6px 7px!important;
margin: 0 !important;
text-align: center !important;
vertical-align: middle !important;
font-family: ${reportArabicFontStack} !important;
font-size: 16px !important;
font-weight: 800!important;
line-height: 1.35!important;
border: 1px solid #000000 !important;
    color: #ffffff !important;
  }
  .report-page-content td {
   min-width: auto !important;
  padding: 6px 7px !important;
    margin: 0 !important;
text-align: center !important;
vertical-align: middle !important; 
font-family: ${reportArabicFontStack} !important;
font-size: 16px !important;
font-weight: 800 !important;
line-height: 1.35 !important;
border: 1px solid #000000 !important;

  }
  .report-page-content thead th {
    font-size: 16px !important;
    padding: 7px 7px !important;
    font-weight: 900 !important;
    background: #FFD700 !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-page-content thead th .pdf-cell-text {
    color: #000000 !important;
    background: transparent !important;
  }
  .report-page-content .total-row td,
  .report-page-content .report-grand-total-row td {
    background: #0437bb !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-page-content .total-row td .pdf-cell-text,
  .report-page-content .report-grand-total-row td .pdf-cell-text {
  background: #0437bb !important;
    color: #ffffff !important;
  }

  /* كتلة التوقيعات الموحدة: ثلاثة مسميات في صف وثلاثة أسماء أسفلها */
  .report-page-content .signature-spacer-row,
  .report-page-content .signature-spacer-row > td {
    height: 4mm !important;
    min-height: 4mm !important;
    padding: 0 !important;
    border: 0 !important;
    background: #ffffff !important;
    line-height: 0 !important;
  }
  .report-page-content .signature-block-row {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .report-page-content .signature-block-row > td {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    padding: 14px 18px !important;
    color: #000000 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .report-page-content .signature-block-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 6px 12px !important;
    width: 100% !important;
    min-width: 0 !important;
    direction: rtl !important;
    align-items: end !important;
  }
  .report-page-content .sig-title {
    font-family: ${reportArabicFontStack} !important;
    font-weight: 900 !important;
    font-size: 16px !important;
    color: #000000 !important;
    text-align: center !important;
    padding: 4px !important;
    line-height: 1.3 !important;
    min-width: 0 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content .sig-name {
    font-family: ${reportArabicFontStack} !important;
    font-weight: 800 !important;
    font-size: 16px !important;
    color: #000000 !important;
    text-align: center !important;
    padding: 4px !important;
    min-height: 24px !important;
    border-bottom: 1px dotted #000000 !important;
    min-width: 0 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content table {
    width: 100% !important; 
    max-width: auto !important;
    table-layout: auto !important; 
    border: 1px solid #000000 !important;

  }
  /* Shared Excel-like print layout for every report table and every PDF export. */
  .report-page-content table {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
  }
  .report-page-content table th,
  .report-page-content table td {
    box-sizing: border-box !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    vertical-align: middle !important;
    line-height: 1.3 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: normal !important;
  }
  .report-page-content table th,
  .report-page-content table td {
    padding: 3px 4px !important;
  }
  .report-page-content table td.numeric-cell,
  .report-page-content table td.num,
  .report-page-content table td.date-cell,
  .report-page-content table td.compact-cell,
  .report-page-content table td.ref-cell,
  .report-page-content table td.idx,
  .report-page-content table td.reports-numeric-cell,
  .report-page-content table td.reports-no-wrap-cell,
  .report-page-content table th.numeric-cell,
  .report-page-content table th.date-cell {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    direction: ltr !important;
    unicode-bidi: isolate !important;
    font-variant-numeric: tabular-nums !important;
  }
  .report-page-content table td.numeric-cell .pdf-cell-text,
  .report-page-content table td.num .pdf-cell-text,
  .report-page-content table td.date-cell .pdf-cell-text,
  .report-page-content table td.ref-cell .pdf-cell-text,
  .report-page-content table td.idx .pdf-cell-text {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
  }
  .report-page-content table .pdf-cell-text {
    max-width: 100% !important;
    white-space: inherit !important;
    overflow-wrap: inherit !important;
    word-break: inherit !important;
  }
  .report-page-content table tr { height: auto !important; }



  /* Universal Excel-like PDF cell behaviour: wrap descriptive text, never
     clip it; keep true numeric/date/reference values atomic on one line. */
  .report-page-content table th,
  .report-page-content table td {
    overflow: visible !important;
    text-overflow: clip !important;
    min-height: 0 !important;
    height: auto !important;
    box-sizing: border-box !important;
  }
  .report-page-content table td:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx):not(.reports-numeric-cell):not(.reports-no-wrap-cell),
  .report-page-content table td:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx):not(.reports-numeric-cell):not(.reports-no-wrap-cell) .pdf-cell-text {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: normal !important;
  }
  .report-page-content table td.num,
  .report-page-content table td.numeric-cell,
  .report-page-content table td.date-cell,
  .report-page-content table td.compact-cell,
  .report-page-content table td.ref-cell,
  .report-page-content table td.idx,
  .report-page-content table td.reports-numeric-cell,
  .report-page-content table td.reports-no-wrap-cell,
  .report-page-content table td.num .pdf-cell-text,
  .report-page-content table td.numeric-cell .pdf-cell-text,
  .report-page-content table td.date-cell .pdf-cell-text,
  .report-page-content table td.compact-cell .pdf-cell-text,
  .report-page-content table td.ref-cell .pdf-cell-text,
  .report-page-content table td.idx .pdf-cell-text,
  .report-page-content table td.reports-numeric-cell .pdf-cell-text,
  .report-page-content table td.reports-no-wrap-cell .pdf-cell-text {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
  }
  .report-page-content table .pdf-cell-text {
    border: 0 !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    text-overflow: clip !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
  }
  .report-page-content table tr.pdf-oversized-row td {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    font-size: 12px !important;
    line-height: 1.25 !important;
  }

  .report-page-content tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]),
  .report-page-content tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]) .pdf-cell-text {
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
    border: 1px solid #000000 !important;

  }
  .report-page-content tbody td.desc-cell,
  .report-page-content tbody td.details-cell,
  .report-page-content tbody td.description-cell,
  .report-page-content tbody td[data-col-key="description"],
  .report-page-content tbody td.desc-cell .pdf-cell-text,
  .report-page-content tbody td.details-cell .pdf-cell-text,
  .report-page-content tbody td.description-cell .pdf-cell-text,
  .report-page-content tbody td[data-col-key="description"] .pdf-cell-text {
  border: 1px solid #000000 !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: normal !important;
    min-width: auto !important; 
    text-align: center !important;
  }
  .report-page-content .num, .report-page-content .numeric-cell, .report-page-content .date-cell,
  .report-page-content .idx, .report-page-content .cell-number { 
    direction: ltr !important; 
    unicode-bidi: isolate;
    white-space: nowrap !important; 
    overflow-wrap: normal !important; 
    word-break: keep-all !important; 
  }
  .report-page-content .pdf-cell-text {
  border: 1px solid #000000 !important;
    font-family: ${reportArabicFontStack} !important;
    font-size: 16px !important;
    text-align: center !important;
    vertical-align: middle !important;
  }
  .report-page-content thead { display: table-header-group; }
  .report-page-content tr { break-inside: avoid; }
  .report-page-content .report-letterhead-cell { 
    background: var(--report-paper) !important; 
    border: none !important; 
    padding: 0 !important;
  }

  /* تنسيق إطار الترويسة داخل المحتوى المحول إلى PDF */
  .report-page-content .report-letterhead-block {
    display: block !important;
    width: 100% !important;
    margin: 0 auto 3mm !important;
  }
  /* Keep table cells in native table layout so column widths and row heights
     remain consistent between the report view, browser preview, and PDF render. */
  .report-page-content table th,
  .report-page-content table td {
  border: 1px solid #000000 !important;
    display: table-cell !important;
    vertical-align: middle !important;
    text-align: center !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
  }
  .report-page-content table th > *,
  .report-page-content table td > * {
    vertical-align: middle !important;
  }
  .report-page-content .pdf-cell-text {
  border: 1px solid #000000 !important;

    display: inline-block !important;
    vertical-align: middle !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
  }

  .report-page-content .report-letterhead-frame {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    border: 1.5px solid #000000 !important;
    border-radius: 4px !important;
    padding: 5px 12px !important;
    background: #ffffff !important;
    box-sizing: border-box !important;
  }

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
  border: 1px solid #000000 !important;
    background: #0437bb !important;
  color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { 
background: #0437bb !important;

  color: #ffffff !important; }

  /* Fit report columns to their values; wrap only semantic text cells. */
  .report-page-content table.reports-data-table tbody td.text-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.name-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.specialty-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.batch-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.desc-cell,
  .report-page-content table.reports-data-table tbody td.details-cell,
  .report-page-content table.reports-data-table tbody td.description-cell {
  border: 1px solid #000000 !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 280px !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content table.reports-data-table tbody td.text-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.name-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.specialty-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.batch-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.desc-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.details-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.description-cell .pdf-cell-text {
    display: flex !important;
    width: auto !important;
    max-width: auto !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
    border: 1px solid #000000 !important;
  }
  .report-page-content table.reports-data-table tbody td.num,
  .report-page-content table.reports-data-table tbody td.numeric-cell,
  .report-page-content table.reports-data-table tbody td.date-cell,
  .report-page-content table.reports-data-table tbody td.compact-cell,
  .report-page-content table.reports-data-table tbody td.ref-cell,
  .report-page-content table.reports-data-table tbody td.idx,
  .report-page-content table.reports-data-table tbody td.num .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.numeric-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.date-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.compact-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.ref-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.idx .pdf-cell-text {
border: 1px solid #000000 !important;
    max-width: auto !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }


/* Unified report table theme shared by the downloaded PDF renderer. */
table.reports-data-table{width:100%!important;max-width:100%!important;border-collapse:collapse!important;table-layout:auto!important;direction:rtl!important;text-align:center!important}
table.reports-data-table th,table.reports-data-table td{box-sizing:border-box!important;border:1px solid #17212b!important;text-align:center!important;vertical-align:middle!important;font-family:${reportArabicFontStack}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
table.reports-data-table thead th{background:linear-gradient(180deg,#fff8d9,#f5d978 48%,#d7a92e)!important;color:#111!important;font-weight:900!important;white-space:normal!important;overflow-wrap:anywhere!important}
table.reports-data-table tbody td{background:#fff!important;color:#111!important;font-weight:750!important}
table.reports-data-table tbody tr.total-row>td,table.reports-data-table tbody tr.report-grand-total-row>td{background:#0871ce!important;color:#fff!important;font-weight:900!important}
table.reports-data-table tbody tr.total-row>td *,table.reports-data-table tbody tr.report-grand-total-row>td *{background:transparent!important;color:#fff!important}
table.reports-data-table tbody tr.reports-trainee-total-row:not(.total-row):not(.report-grand-total-row)>td{background:#d9f0ec!important;color:#102c2a!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-trainee-summary-row:not(.total-row):not(.report-grand-total-row)>td{background:#fff4d9!important;color:#211b0c!important;font-weight:850!important}
table.reports-data-table tbody tr.reports-fee-row:not(.total-row):not(.report-grand-total-row)>td{background:#e8f1f7!important;color:#142b3d!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-period-row:not(.total-row):not(.report-grand-total-row)>td{background:#e9eef3!important;color:#17212b!important;font-weight:900!important}
`;
async function ready(doc: Document) {
  const fontReady = doc.fonts?.ready ?? Promise.resolve();
  await Promise.race([
    fontReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
  ]);
  await Promise.all(Array.from(doc.images).map(image => {
    if (image.complete) return Promise.resolve();
    return image.decode().catch(() => undefined);
  }));
}

/**
 * يصدر محتوى HTML عبر محرك الطباعة الأصلي للمتصفح/Android.
 *
 * بخلاف محرك html2canvas السابق، يبقى النص نصاً حقيقياً قابلاً للتحديد والبحث،
 * وتُرسم الحدود والألوان كعناصر متجهية. ويقوم محرك الطباعة بتقسيم الصفحات
 * مع تكرار رؤوس الجداول واحترام قواعد منع شطر الصفوف.
 *
 * في Chrome اختر "حفظ كملف PDF"، وفي Android اختر "Save as PDF" من واجهة
 * الطباعة الأصلية. واجهة الويب لا تملك API قياسياً يسمح بتنزيل PDF متجهي
 * مباشرةً دون تشغيل محرك طباعة أو خدمة تحويل على الخادم.
 */
export async function downloadRenderedReportPdf(source: HTMLElement, options: {
  fileName: string; pageSize?: ReportPaperSize; orientation?: ReportOrientation; marginMm?: number;
  fitToContent?: boolean;
}) {
  const {
    fileName,
    pageSize = "A4",
    orientation = "portrait",
    marginMm = 3,
    fitToContent = false,
  } = options;

  const doc = source.ownerDocument;
  tagReportCells(source);
  tagSerialColumns(source);

  // Preserve numbers, dates and reference identifiers as atomic values.
  const numericOrDate = /^[\\s\\u200e\\u200f]*[+-]?(?:(?:[0-9٠-٩۰-۹]+)(?:[,.٬٫][0-9٠-٩۰-۹]+)*|[0-9٠-٩۰-۹]{1,4}[-/.][0-9٠-٩۰-۹]{1,2}[-/.][0-9٠-٩۰-۹]{1,4})(?:\\s*(?:ر\\.?\\s*ي|ريال|ر\\.?\\s*س))?[\\s\\u200e\\u200f]*$/;
  source.querySelectorAll("table th, table td").forEach((cell) => {
    if (numericOrDate.test((cell.textContent || "").trim())) {
      cell.classList.add("numeric-cell");
    }
  });

  await ready(doc);

  // الاحتفاظ بجميع الأنماط التي كوّنت نسخة المعاينة، بما فيها خطوط Cairo
  // وقواعد الألوان الخاصة بكل تقرير، بدلاً من إعادة بناء الجدول برمجياً.
  const styles = Array.from(doc.querySelectorAll("style"))
    .map((style) => style.textContent || "")
    .filter(Boolean)
    .join("\n");
  const linkedStyles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    .map((link) => (link as HTMLLinkElement).outerHTML)
    .join("\n");

  const safeMargin = Number.isFinite(marginMm)
    ? Math.max(0, Math.min(30, marginMm))
    : 3;
  // fitToContent يحتفظ بهامش المستخدم المختار، لكنه لا ينشئ صفحة طويلة
  // غير قياسية؛ يظل الملف على ورق A4/A3/Letter مع ترقيم وتجزئة طبيعيين.
  const pageMargin = fitToContent ? Math.min(safeMargin, 3) : safeMargin;
  const title = fileName.replace(/\.pdf$/i, "").replace(/[\\\\/:*?"<>|]/g, "-");

  const vectorPrintCss = `
    @page {
      size: ${pageSize} ${orientation};
      margin: ${pageMargin}mm;
    }
    @media print {
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      html, body {
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
      }
      body {
        direction: rtl !important;
        color: #000 !important;
        font-family: ${reportArabicFontStack} !important;
      }
      #report-source, .report-page-content, #paperContainer, .sheet-paper,
      .sheet-viewport, #tableContainer, .preview-report-content {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        overflow: visible !important;
        transform: none !important;
        zoom: 1 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      table, table.reports-data-table {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        border-collapse: collapse !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
      }
      thead { display: table-header-group !important; }
      tfoot { display: table-footer-group !important; }
      tr, .signature-block-row, .signature-spacer-row {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      th, td {
        height: auto !important;
        vertical-align: middle !important;
      }
      img, svg, canvas {
        max-width: 100% !important;
      }
      .no-print, .preview-toolbar, .btn-close {
        display: none !important;
      }
    }
  `;

  const printableHtml = `<!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        ${linkedStyles}
        <style>${styles}\n${vectorPrintCss}</style>
      </head>
      <body>${source.outerHTML}</body>
    </html>`;

  const opened = await printReportHtmlAsync(printableHtml, title);
  if (!opened) {
    throw new Error("تعذر فتح محرك تصدير PDF. تحقق من إعدادات الطباعة ثم أعد المحاولة.");
  }
}

export async function downloadReportPdf(options: {
  title: string; body: string; css?: string; fileName: string;
  pageSize?: ReportPaperSize; orientation?: ReportOrientation; marginMm?: number;
  fitToContent?: boolean;
}) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-20000px;top:20000px;width:2800px;height:2800px;border:0;pointer-events:none;font-family:"IBM Plex Sans Arabic","Noto Sans Arabic","Noto Naskh Arabic",Cairo,Tahoma,Arial,sans-serif';
  document.body.append(frame);
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('تعذر تجهيز التقرير');
    doc.open();
    doc.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(options.title)}</title>
      <style>${reportDocumentCss}
      ${reportContainmentCss}
      ${options.css || ''}
      ${reportsCompactColumnsCss}
      ${reportTableThemeCss}
      ${excelLikePrintTablesCss}</style></head><body><div id="report-source" class="report-page-content">
      ${options.body.includes('report-letterhead') ? '' : reportLetterheadHtml()}${options.body}</div></body></html>`);
    doc.close();
    const source = doc.getElementById('report-source');
    if (!source) throw new Error('تعذر تحديد محتوى التقرير');
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
    await downloadRenderedReportPdf(source, options);
  } finally {
    frame.remove();
  }
}

export async function downloadReportDocumentPdf(html: string, title: string, orientation: ReportOrientation = 'portrait') {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script').forEach(script => script.remove());
  const css = Array.from(parsed.querySelectorAll('style')).map(style => style.textContent || '').join('\n');
  await downloadReportPdf({
    title,
    body: parsed.body.innerHTML,
    css,
    orientation,
    fileName: `${title.replace(/[\\/:*?"<>|]/g, '-')}.pdf`
  });
}
