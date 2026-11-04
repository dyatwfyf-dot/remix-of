import { reportsCompactColumnsCss, tagReportCellsScript } from "./reportsCompactColumnsCss";
import { Capacitor } from "@capacitor/core";
import { REPORT_LETTERHEAD_SRC, reportLetterheadHtml } from "./printTableHtml";
import { downloadRenderedReportPdf } from "./reportPdf";
import { reportTableThemeCss } from "./reportTheme";
import { printReportHtmlAsync } from "./nativePrinter";

interface OpenBrowserPrintPreviewOptions {
  title: string;
  tableHtml: string;
  reportDateLabel?: string;
  contentCss?: string;
  defaultOrientation?: "portrait" | "landscape";
  paperSize?: "A4" | "A3" | "Letter";
  defaultPageSize?: "A4" | "A3" | "Letter";
  margin?: "minimal" | "normal";
  defaultMarginMm?: number;
  fitToContent?: boolean;
  autoDownloadPdf?: boolean;
  downloadFileName?: string;
}

export function openBrowserPrintPreview(options: OpenBrowserPrintPreviewOptions) {
  const {
    title,
    tableHtml,
    reportDateLabel,
    contentCss = "",
    defaultOrientation = "landscape",
  } = options;
  const fitToContent = options.fitToContent ?? false;
  const paperSize = options.defaultPageSize ?? options.paperSize ?? "A4";
  const defaultMargin = options.defaultMarginMm !== undefined
    ? `${options.defaultMarginMm}mm`
    : options.margin === "normal" ? "8mm" : "3mm";
  const hasEmbeddedLetterhead = tableHtml.includes("report-letterhead");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>معاينة الطباعة - ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style id="dynamic-page-rule">
    @page {
      /* اترك مقاس الورق واتجاهه لإعدادات نافذة طباعة المتصفح */
      margin: ${defaultMargin};
    }
  </style>
  <style>
    :root {
      --print-cell-font-size: 16px;
      --print-header-font-size: 16px;
      --print-cell-padding: 4px 5px;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Cairo, Tahoma, Arial, sans-serif !important;
      direction: rtl;
      background: #525659;
      color: #000000 !important;
      padding: 0;
      margin: 0;
      font-weight: 700;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* شريط الأدوات العلوي */
    .preview-toolbar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 16px;
      background: #323639;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      user-select: none;
    }

    .toolbar-left, .toolbar-center, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .toolbar-title {
      font-size: 14px;
      font-weight: 700;
      color: #e8eaed;
      white-space: nowrap;
    }

    .toolbar-control {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #bdc1c6;
    }

    .toolbar-control select,
    .toolbar-control input[type="date"] {
      background: #202124;
      color: #e8eaed;
      border: 1px solid #5f6368;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
    }

    .btn-action {
      background: #1a73e8;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-action:hover { background: #1557b0; }
    .btn-filter { background: #0d9488; }
    .btn-filter:hover { background: #0f766e; }
    .btn-reset { background: #6b7280; }
    .btn-reset:hover { background: #4b5563; }
    .btn-download { background: #059669; }
    .btn-download:hover { background: #047857; }
    .btn-close {
      background: transparent;
      color: #bdc1c6;
      border: 1px solid #5f6368;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-close:hover { background: #202124; color: #fff; }

    /* مساحة عرض الورقة */
    .sheet-viewport {
      display: flex;
      justify-content: center;
      padding: 16px 8px 40px;
      overflow-x: auto;
    }

    .sheet-paper {
      background: #ffffff;
      color: #000000 !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
      border-radius: 2px;
      position: relative;
      transform-origin: top center;
      box-sizing: border-box;
      transition: width 0.15s ease, min-height 0.15s ease, padding 0.15s ease;
    }

    .sheet-paper.portrait {
      width: 210mm;
      min-height: 297mm;
      padding: 3mm;
    }

    .sheet-paper.landscape {
      width: 297mm;
      min-height: 210mm;
      padding: 3mm;
    }

    /* ===== إطار الترويسة الموحّد والنصوص الرسمية ===== */
    .report-letterhead-block {
      display: block !important;
      position: relative !important;
      width: 100% !important;
      margin: 0 auto 3mm !important;
      page-break-before: avoid !important;
      page-break-after: avoid !important;
      break-before: avoid !important;
      break-after: avoid !important;
    }

    .report-letterhead-frame {
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
      color: #000000 !important;
    }

    .report-letterhead-side {
      flex: 1 1 36% !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      color: #000000 !important;
    }

    .report-letterhead-right {
      text-align: right !important;
      direction: rtl !important;
    }

    .letterhead-title-ar {
      font-family: Cairo, sans-serif !important;
      font-size: 13.5px !important;
      font-weight: 900 !important;
      line-height: 1.3 !important;
      color: #000000 !important;
    }

    .letterhead-sub-ar {
      font-family: Cairo, sans-serif !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      line-height: 1.3 !important;
      color: #000000 !important;
    }

    .letterhead-branch-ar {
      font-family: Cairo, sans-serif !important;
      font-size: 12.5px !important;
      font-weight: 900 !important;
      line-height: 1.3 !important;
      color: #000000 !important;
    }

    .report-letterhead-center {
      flex: 0 0 28% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      padding: 0 4px !important;
    }

    .letterhead-bismillah {
      font-family: Cairo, sans-serif !important;
      font-size: 14.5px !important;
      font-weight: 900 !important;
      color: #000000 !important;
      white-space: nowrap !important;
      text-align: center !important;
    }

    .letterhead-center-divider {
      width: 75px !important;
      height: 1.5px !important;
      background: #000000 !important;
      margin: 3px auto 0 !important;
    }

    .report-letterhead-left {
      text-align: left !important;
      direction: ltr !important;
    }

    .letterhead-title-en {
      font-family: Arial, Cairo, sans-serif !important;
      font-size: 12px !important;
      font-weight: 900 !important;
      line-height: 1.25 !important;
      color: #000000 !important;
    }

    .letterhead-sub-en {
      font-family: Arial, Cairo, sans-serif !important;
      font-size: 10.5px !important;
      font-weight: 800 !important;
      line-height: 1.25 !important;
      color: #000000 !important;
    }

    .letterhead-branch-en {
      font-family: Arial, Cairo, sans-serif !important;
      font-size: 11px !important;
      font-weight: 900 !important;
      line-height: 1.25 !important;
      color: #000000 !important;
    }

    table {
      width: 100% !important;
      max-width: auto;
      border-collapse: collapse;
      table-layout: auto;
      margin: 0 auto;
      color: #000000 !important;
      text-align: center !important;
    }

    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid; break-inside: avoid; }

    th, td {
      border: 1px solid #000000 !important; 
      text-align: center;
      vertical-align: middle !important;
      padding: var(--print-cell-padding);
      box-sizing: border-box;
      color: #000000 !important;
      font-weight: 800;
      font-size: 16px !important;
      line-height: 1.45 !important;
    }

    thead th {
      background: #027d11 !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      font-size: 16px !important;
      padding: 6px 4px;
      white-space: normal !important;
      word-break: keep-all;
    }

    thead th .pdf-cell-text, th .pdf-cell-text {
      color: #000 !important;
      font-weight: 900;
      white-space: normal !important;
      background: transparent !important;
    }

    thead th.desc-cell,
    thead th[data-col-key="description"] {
      background: #174258 !important;
      color: #000 !important;
      white-space: normal !important;
    min-width: 50%;

    }

    tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]) {
      white-space: normal !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
  min-width: 100px !important;
    }

    tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]) .pdf-cell-text {
      white-space: normal !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
  min-width: 100px !important;

    }

    tbody td.desc-cell,
    tbody td.details-cell,
    tbody td.description-cell,
    tbody td[data-col-key="description"],
    tbody td.desc-cell .pdf-cell-text,
    tbody td.details-cell .pdf-cell-text,
    tbody td.description-cell .pdf-cell-text,
    tbody td[data-col-key="description"] .pdf-cell-text {
      white-space: normal !important;
      word-break: break-word !important;
      overflow-wrap: normal !important;
      text-align: center !important;
      direction: rtl;
      min-width: 180px;
    }

    .num, .numeric-cell, .date-cell, .compact-cell, .ref-cell, .idx {
      direction: ltr !important;
      font-family: Cairo !important;
      font-weight: 800 !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      text-align: center !important;
    }

    .total-row td {
      background: #0437bb !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      border-top: 2px solid #000000 !important;
      white-space: nowrap !important;
    }
    .total-row td .pdf-cell-text {
      color: #ffffff !important;
    }

    /* أنماط خاصة عند تنفيذ أمر الطباعة المباشر */
    @media print {
      body:not(.fit-content-mode) .sheet-paper { width: 100% !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; transform: none !important; }
      body:not(.fit-content-mode) .preview-report-content, body:not(.fit-content-mode) .preview-report-content table { width: 100% !important; max-width: 100% !important; }
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .preview-toolbar {
        display: none !important;
      }
      .sheet-viewport {
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
      }
      .sheet-paper {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 100% !important;
        min-height: auto !important;
        padding: 0 !important;
        transform: none !important;
      }
      .report-letterhead-block {
        display: block !important;
        position: relative !important;
        width: 100% !important;
        margin: 0 auto 3mm !important;
        background: #ffffff !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead { display: table-header-group !important; }
      tfoot { display: table-footer-group !important; }
    }

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
    background: #0437bb !important; background-color: #0437bb !important; color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { color: #ffffff !important; }
  </style>
  <style>
    ${contentCss}
    /* تنسيق موحّد لرؤوس الجداول والإجماليات والتوقيعات في المعاينة والطباعة */
    #tableContainer table thead th,
    #tableContainer table thead th.desc-cell,
    #tableContainer table thead th[data-col-key="description"] {
      background: #FFD700 !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #tableContainer table thead th .pdf-cell-text,
    #tableContainer table thead th span {
      color: #000000 !important;
      background: transparent !important;
    }
    #tableContainer table .total-row td,
    #tableContainer table .report-grand-total-row td {
      background: #0437bb !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #tableContainer table .total-row td .pdf-cell-text,
    #tableContainer table .report-grand-total-row td .pdf-cell-text {
      color: #ffffff !important;
    }
    #tableContainer table .signature-spacer-row,
    #tableContainer table .signature-spacer-row > td {
      height: 28mm !important;
      min-height: 28mm !important;
      padding: 0 !important;
      border: 0 !important;
      background: #ffffff !important;
      line-height: 0 !important;
    }
    #tableContainer table .signature-block-row {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    #tableContainer table .signature-block-row > td {
      background: #ffffff !important;
      border: 1.5px solid #000000 !important;
      padding: 14px 18px !important;
      color: #000000 !important;
    }
    #tableContainer .signature-block-grid {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 6px 12px !important;
      width: 100% !important;
      min-width: 0 !important;
      direction: rtl !important;
      align-items: end !important;
    }
    #tableContainer .sig-title {
      font-family: Cairo, sans-serif !important;
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
    #tableContainer .sig-name {
      font-family: Cairo, sans-serif !important;
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
    @media print {
      #tableContainer table thead th,
      #tableContainer table thead th.desc-cell,
      #tableContainer table thead th[data-col-key="description"] {
        background: #FFD700 !important;
        color: #000000 !important;
      }
      #tableContainer table .total-row td,
      #tableContainer table .report-grand-total-row td {
        background: #0437bb !important;
        color: #ffffff !important;
      }
      #tableContainer table .signature-block-row,
      #tableContainer table .signature-block-row > td {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    /* تثبيت محاذاة ومقاس كل خلايا التقارير في المعاينة ونسخة PDF */
    .sheet-paper table th,
    .sheet-paper table td {
      display: table-cell !important;
      vertical-align: middle !important;
      text-align: center !important;
      font-size: 16px !important;
      line-height: 1.45 !important;
    }
    .sheet-paper table th > *,
    .sheet-paper table td > * {
      vertical-align: middle !important;
    }
    .sheet-paper .pdf-cell-text {
      display: inline-block !important;
      vertical-align: middle !important;
      font-size: 16px !important;
      line-height: 1.45 !important;
    }

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
    background: #0437bb !important; background-color: #0437bb !important; color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { color: #ffffff !important; }
    /* Final report sizing overrides: only numeric/date/reference cells stay nowrap. */
    #tableContainer table.reports-data-table {
      table-layout: auto !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
    #tableContainer table.reports-data-table th,
    #tableContainer table.reports-data-table td {
      width: auto !important;
      min-width: 0 !important;
    }
    #tableContainer table.reports-data-table tbody td.text-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.name-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.specialty-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.batch-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.desc-cell,
    #tableContainer table.reports-data-table tbody td.details-cell,
    #tableContainer table.reports-data-table tbody td.description-cell {
      max-width: 280px !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table.reports-data-table tbody td.text-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.name-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.specialty-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.batch-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.desc-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.details-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.description-cell .pdf-cell-text {
      display: inline-block !important;
      width: auto !important;
      max-width: 100% !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table.reports-data-table tbody td.num,
    #tableContainer table.reports-data-table tbody td.numeric-cell,
    #tableContainer table.reports-data-table tbody td.date-cell,
    #tableContainer table.reports-data-table tbody td.compact-cell,
    #tableContainer table.reports-data-table tbody td.ref-cell,
    #tableContainer table.reports-data-table tbody td.idx,
    #tableContainer table.reports-data-table tbody td.num .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.numeric-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.date-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.compact-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.ref-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.idx .pdf-cell-text {
      max-width: none !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
    }
    ${reportsCompactColumnsCss}
    ${reportTableThemeCss}
  </style>
</head>
<body>
  <div class="preview-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-title">🖨️ ${title}${reportDateLabel ? ` — ${reportDateLabel}` : ""}</span>

      <div class="toolbar-control">
        <label>الاتجاه:</label>
        <select id="selOrientation">
          <option value="landscape" ${defaultOrientation === "landscape" ? "selected" : ""}>أفقي (Landscape)</option>
          <option value="portrait" ${defaultOrientation === "portrait" ? "selected" : ""}>طولي (Portrait)</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>الحجم:</label>
        <select id="selPageSize">
          <option value="A4" ${paperSize === "A4" ? "selected" : ""}>A4</option>
          <option value="A3" ${paperSize === "A3" ? "selected" : ""}>A3</option>
          <option value="Letter" ${paperSize === "Letter" ? "selected" : ""}>Letter</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>الهامش:</label>
        <select id="selMargin">
          <option value="0mm" ${defaultMargin === "0mm" ? "selected" : ""}>بدون هامش (0 مم)</option>
          <option value="2mm">ضيق جداً (2 مم)</option>
          <option value="3mm" ${defaultMargin === "3mm" ? "selected" : ""}>ضيق (3 مم)</option>
          <option value="6mm">متوسط (6 مم)</option>
          <option value="10mm">عادي (10 مم)</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>الملاءمة:</label>
        <select id="selScale">
          <option value="1">100% (تلقائي)</option>
          <option value="0.95">95%</option>
          <option value="0.9">90%</option>
          <option value="0.85">85%</option>
          <option value="0.8">80%</option>
          <option value="0.75">75%</option>
        </select>
      </div>
    </div>

    <div class="toolbar-center">
      <div class="toolbar-control">
        <label>من:</label>
        <input type="date" id="dateFrom" />
      </div>
      <div class="toolbar-control">
        <label>إلى:</label>
        <input type="date" id="dateTo" />
      </div>
      <button type="button" class="btn-action btn-filter" id="btnFilter">
        🔍 تطبيق
      </button>
      <button type="button" class="btn-action btn-reset" id="btnResetFilter" title="إعادة تعيين الفترة">
        ↺
      </button>
    </div>

    <div class="toolbar-right">
      <button type="button" class="btn-action" id="btnPrint">
        🖨️ طباعة
      </button>

      <button type="button" class="btn-action btn-download" id="btnDownloadPdf">
        📥 تنزيل PDF
      </button>

      <button type="button" class="btn-close" id="btnClose">
        ✕
      </button>
    </div>
  </div>

  <div class="sheet-viewport">
    <div id="paperContainer" class="sheet-paper ${defaultOrientation}">
      ${hasEmbeddedLetterhead ? "" : reportLetterheadHtml()}
      <div id="tableContainer" class="preview-report-content report-page-content">
        ${tableHtml}
      </div>
    </div>
  </div>

  <script>
    try { ${tagReportCellsScript} } catch (e) {}
    (function() {
      const fitToContent = ${fitToContent ? "true" : "false"};
      if (fitToContent) document.body.classList.add('fit-content-mode');
      const autoDownloadPdf = ${options.autoDownloadPdf ? "true" : "false"};
      const selOrientation = document.getElementById('selOrientation');
      const selPageSize = document.getElementById('selPageSize');
      const selMargin = document.getElementById('selMargin');
      const selScale = document.getElementById('selScale');
      const paperContainer = document.getElementById('paperContainer');
      const dynamicRule = document.getElementById('dynamic-page-rule');
      const btnPrint = document.getElementById('btnPrint');
      const btnDownloadPdf = document.getElementById('btnDownloadPdf');
      const btnClose = document.getElementById('btnClose');
      const dateFrom = document.getElementById('dateFrom');
      const dateTo = document.getElementById('dateTo');
      const btnFilter = document.getElementById('btnFilter');
      const btnResetFilter = document.getElementById('btnResetFilter');
      const subTitleEl = document.querySelector('.sub');
      const originalSubText = subTitleEl ? subTitleEl.textContent : '';

      let printInProgress = false;

      function toLatinDigits(str) {
        if (!str) return '';
        const arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        return String(str).replace(/[٠-٩]/g, function(d) {
          return arabic.indexOf(d);
        });
      }

      function parseRowDate(raw) {
        if (!raw) return null;
        const text = toLatinDigits(raw.trim());
        
        let m = text.match(/(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})/);
        if (m) {
          return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        }

        m = text.match(/(\\d{1,2})[-\\/](\\d{1,2})[-\\/](\\d{4})/);
        if (m) {
          return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }

        const d = new Date(text);
        return isNaN(d.getTime()) ? null : d;
      }

      function findDateColumnIndex(table) {
        const ths = Array.from(table.querySelectorAll('thead th'));
        const exactPatterns = [
          /^التاريخ$/,
          /^تاريخ$/,
          /^date$/i
        ];
        for (let idx = 0; idx < ths.length; idx++) {
          const raw = ths[idx].textContent || '';
          const clean = raw.replace(/[\\u200f\\u200e\\u202a-\\u202e]/g, '').trim();
          if (exactPatterns.some(function(p) { return p.test(clean); })) {
            return idx;
          }
        }
        for (let idx = 0; idx < ths.length; idx++) {
          const clean = (ths[idx].textContent || '').replace(/\\s+/g, ' ').trim();
          if (/التاريخ|تاريخ|date/i.test(clean)) {
            return idx;
          }
        }
        const firstBodyRow = table.querySelector('tbody tr:not(.total-row)');
        if (firstBodyRow) {
          for (let idx = 0; idx < firstBodyRow.cells.length; idx++) {
            const cellText = (firstBodyRow.cells[idx].textContent || '').trim();
            if (parseRowDate(cellText)) {
              return idx;
            }
          }
        }
        return -1;
      }

      function readCellDate(cell) {
        if (!cell) return null;
        const dataAttr = cell.getAttribute('data-date') || cell.getAttribute('datetime');
        if (dataAttr) {
          const d = parseRowDate(dataAttr);
          if (d) return d;
        }
        const textEl = cell.querySelector('.pdf-cell-text') || cell;
        return parseRowDate((textEl.textContent || '').trim());
      }

      function formatNum(num) {
        return Number(num).toLocaleString('en-US');
      }

      function applyDateFilter() {
        const fromStr = dateFrom.value;
        const toStr = dateTo.value;
        const fromVal = fromStr ? new Date(fromStr + 'T00:00:00') : null;
        const toVal = toStr ? new Date(toStr + 'T23:59:59') : null;

        const table = document.querySelector('.sheet-paper table');
        if (!table) return;

        const dateColIdx = findDateColumnIndex(table);

        const numericColIndices = [];
        const totalRow = table.querySelector('.total-row');
        if (totalRow) {
          Array.from(totalRow.cells).forEach(function(cell, idx) {
            if (cell.classList.contains('numeric-cell') || cell.classList.contains('num')) {
              if (idx > 0) numericColIndices.push(idx);
            }
          });
        }

        const colTotals = {};
        numericColIndices.forEach(function(idx) { colTotals[idx] = 0; });

        const rows = Array.from(table.querySelectorAll('tbody tr')).filter(function(r) {
          return !r.classList.contains('total-row');
        });
        
        let visibleCount = 0;

        rows.forEach(function(row) {
          let rowDate = null;
          if (dateColIdx >= 0 && row.cells[dateColIdx]) {
            rowDate = readCellDate(row.cells[dateColIdx]);
          }

          let show = true;
          if (fromVal || toVal) {
            if (rowDate) {
              if (fromVal && rowDate < fromVal) show = false;
              if (toVal && rowDate > toVal) show = false;
            } else {
              show = false;
            }
          }

          row.style.display = show ? '' : 'none';
          if (show) {
            visibleCount++;
            if (row.cells[0]) {
              const idxSpan = row.cells[0].querySelector('.pdf-cell-text') || row.cells[0];
              idxSpan.textContent = visibleCount;
            }

            numericColIndices.forEach(function(colIdx) {
              if (row.cells[colIdx]) {
                const rawVal = toLatinDigits(row.cells[colIdx].textContent).replace(/[^0-9.-]/g, '');
                const num = parseFloat(rawVal) || 0;
                colTotals[colIdx] += num;
              }
            });
          }
        });

        if (totalRow) {
          numericColIndices.forEach(function(colIdx) {
            if (totalRow.cells[colIdx]) {
              const span = totalRow.cells[colIdx].querySelector('.pdf-cell-text') || totalRow.cells[colIdx];
              span.textContent = formatNum(colTotals[colIdx]);
            }
          });
        }

        if (subTitleEl) {
          if (fromVal || toVal) {
            const rangeStr = (fromVal ? 'من ' + fromStr : '') + (toVal ? ' إلى ' + toStr : '');
            subTitleEl.textContent = originalSubText + ' • الفترة المحددة: ' + rangeStr + ' (السجلات: ' + visibleCount + ')';
          } else {
            subTitleEl.textContent = originalSubText;
          }
        }
      }

      btnFilter.addEventListener('click', applyDateFilter);
      btnResetFilter.addEventListener('click', function() {
        dateFrom.value = '';
        dateTo.value = '';
        applyDateFilter();
      });

      function printOnce() {
        if (printInProgress) return;
        printInProgress = true;
        window.print();
        window.setTimeout(function() { printInProgress = false; }, 1000);
      }

      function updatePageSettings() {
        const orientation = selOrientation.value;
        const pageSize = selPageSize.value;
      const margin = selMargin.value;
      const scale = parseFloat(selScale.value) || 1;

        paperContainer.classList.remove('portrait', 'landscape');
        paperContainer.classList.add(orientation);

        if (pageSize === 'A3') {
          paperContainer.style.width = orientation === 'portrait' ? '297mm' : '420mm';
        } else if (pageSize === 'Letter') {
          paperContainer.style.width = orientation === 'portrait' ? '216mm' : '279mm';
        } else {
          paperContainer.style.width = orientation === 'portrait' ? '210mm' : '297mm';
        }

        paperContainer.style.padding = fitToContent ? '0' : margin;
        const heights = pageSize === 'A3' ? [420, 297] : pageSize === 'Letter' ? [279.4, 215.9] : [297, 210];
        paperContainer.style.minHeight = fitToContent ? '0' : heights[orientation === 'portrait' ? 0 : 1] + 'mm';
        paperContainer.style.height = fitToContent ? 'auto' : '';
        paperContainer.style.transform = 'none';

        const table = paperContainer.querySelector('table');
        const headerRow = table && table.tHead && table.tHead.rows[table.tHead.rows.length - 1];
        const columnCount = headerRow ? headerRow.cells.length : 1;
        const pageWidthMm = pageSize === 'A3'
          ? (orientation === 'portrait' ? 297 : 420)
          : pageSize === 'Letter'
            ? (orientation === 'portrait' ? 215.9 : 279.4)
            : (orientation === 'portrait' ? 210 : 297);
        // توحيد حجم خط جميع التقارير دون تصغيره حسب عدد الأعمدة.
        const fontSize = 16;
        const horizontalPadding = columnCount > 12 ? 4 : 5;

        paperContainer.style.setProperty('--print-cell-font-size', fontSize.toFixed(1) + 'px');
        paperContainer.style.setProperty('--print-header-font-size', '16px');
        paperContainer.style.setProperty('--print-cell-padding', '4px ' + horizontalPadding + 'px');

        const tableContainer = document.getElementById('tableContainer');
        tableContainer.style.zoom = String(scale);
        if (!fitToContent) {
          // لا تفرض الاتجاه في طباعة المتصفح؛ يختاره المستخدم من نافذة الطباعة.
          dynamicRule.innerHTML = '@page { margin: ' + margin + '; }';
        }

        window.requestAnimationFrame(function() {
          const table = tableContainer.querySelector('table');
          if (!table) return;
          tableContainer.style.zoom = '1';
          const availableWidth = Math.max(1, paperContainer.clientWidth -
            parseFloat(getComputedStyle(paperContainer).paddingLeft) -
            parseFloat(getComputedStyle(paperContainer).paddingRight));
          const naturalWidth = Math.max(table.scrollWidth, table.getBoundingClientRect().width);
          const fitScale = Math.max(0.9, Math.min(1, availableWidth / Math.max(1, naturalWidth)));
          tableContainer.style.zoom = String(scale * fitScale);
          if (fitToContent) {
            const heightMm = Math.max(40, Math.ceil((paperContainer.scrollHeight * 25.4 / 96) * 10) / 10);
            paperContainer.style.height = heightMm + 'mm';
            dynamicRule.innerHTML = '@page { size: ' + pageWidthMm + 'mm ' + heightMm + 'mm; margin: 0; }';
          }
        });
      }

      async function downloadDirectPdf() {
        btnDownloadPdf.disabled = true;
        btnDownloadPdf.innerText = 'جارٍ إنشاء PDF...';
        try {
          await window.downloadReportFromPreview({
            pageSize: selPageSize.value,
            orientation: selOrientation.value,
            marginMm: parseFloat(selMargin.value),
            fitToContent: fitToContent
          });
        } catch (err) {
          console.error(err);
          alert('تعذر تنزيل PDF؛ يمكنك استخدام خيار الحفظ كـ PDF من نافذة الطباعة');
        } finally {
          btnDownloadPdf.disabled = false;
          btnDownloadPdf.innerText = '📥 تنزيل PDF';
        }
      }

      selOrientation.addEventListener('change', updatePageSettings);
      selPageSize.addEventListener('change', updatePageSettings);
      selMargin.addEventListener('change', updatePageSettings);
      selScale.addEventListener('change', updatePageSettings);

      btnPrint.addEventListener('click', printOnce);
      btnDownloadPdf.addEventListener('click', downloadDirectPdf);
      btnClose.addEventListener('click', function() { window.close(); });

      if (autoDownloadPdf) {
        window.addEventListener('load', function() {
          window.setTimeout(downloadDirectPdf, 250);
        }, { once: true });
      }

      window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          printOnce();
        } else if (e.key === 'Escape') {
          window.close();
        }
      });
      updatePageSettings();
    })();
  </script>
</body>
</html>`;

  if (Capacitor.isNativePlatform() && !options.autoDownloadPdf) {
    try {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      parsed.querySelector(".preview-toolbar")?.remove();
      parsed.querySelectorAll("script").forEach((script) => script.remove());
      const printOverrides = parsed.createElement("style");
      printOverrides.textContent = `
        @page { size: ${paperSize} ${defaultOrientation}; margin: ${defaultMargin}; }
        html, body { width: 100% !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
        .sheet-viewport { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
        .sheet-paper { width: 100% !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; margin: 0 !important; padding: 0 !important; transform: none !important; box-shadow: none !important; border-radius: 0 !important; }
        .preview-report-content { width: 100% !important; zoom: 1 !important; }
        table { max-width: 100% !important; }
        @media print { html, body { background: #fff !important; } }
      `;
      parsed.head.appendChild(printOverrides);
      void printReportHtmlAsync(`<!DOCTYPE html>${parsed.documentElement.outerHTML}`, title).then((printed) => {
        if (!printed) window.alert("تعذر فتح خدمة الطباعة في Android. تحقق من تثبيت خدمة الطباعة ثم أعد المحاولة.");
      }).catch((error) => {
        console.error("[Print] Android printing failed", error);
        window.alert("تعذر فتح خدمة الطباعة في Android. أعد المحاولة بعد التحقق من إعدادات الطباعة.");
      });
      return true;
    } catch (error) {
      console.error("[Print] Unable to prepare Android report", error);
      window.alert("تعذر تجهيز التقرير للطباعة على Android.");
      return false;
    }
  }

  const newWin = window.open("", "_blank");
  if (!newWin) {
    alert("يرجى السماح بالنوافذ المنبثقة لمعاينة الطباعة");
    return false;
  }

  (newWin as any).downloadReportFromPreview = async (settings: any) => {
    const paper = newWin.document.getElementById("paperContainer");
    if (!paper) throw new Error("تعذر تحديد الورقة");
    await downloadRenderedReportPdf(paper, {
      ...settings,
      fileName: options.downloadFileName || `${title.replace(/[\\/:*?"<>|]/g, "-")}.pdf`,
    });
  };
  newWin.document.open();
  newWin.document.write(html);
  newWin.document.close();
  return true;
}
