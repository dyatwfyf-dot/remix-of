import{a as e,n as t,r as n}from"./capacitor-BGs8GKJp.js";import{o as r}from"./vendor-capacitor-CGjsZc7I.js";import{i,l as a,n as o,o as s,r as c,s as l,u}from"./browserPrintPreview-Bn6IQjSD.js";var d=`
  ${a}
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
    font-family: ${u} !important; 
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
    font-family: ${u} !important;
    font-size: 13.5px;
    font-weight: 900;
    line-height: 1.3;
    color: #000000;
  }
  .letterhead-sub-ar {
    font-family: ${u} !important;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.3;
    color: #000000;
  }
  .letterhead-branch-ar {
    font-family: ${u} !important;
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
    font-family: ${u} !important;
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
    font-family: Arial, ${u} !important;
    font-size: 12px;
    font-weight: 900;
    line-height: 1.25;
    color: #000000;
  }
  .letterhead-sub-en {
    font-family: Arial, ${u} !important;
    font-size: 10.5px;
    font-weight: 800;
    line-height: 1.25;
    color: #000000;
  }
  .letterhead-branch-en {
    font-family: Arial, ${u} !important;
    font-size: 11px;
    font-weight: 900;
    line-height: 1.25;
    color: #000000;
  }

  .num, .numeric-cell, .date-cell, .idx { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }


/* Unified report table theme shared by the downloaded PDF renderer. */
table.reports-data-table{width:100%!important;max-width:100%!important;border-collapse:collapse!important;table-layout:auto!important;direction:rtl!important;text-align:center!important}
table.reports-data-table th,table.reports-data-table td{box-sizing:border-box!important;border:1px solid #17212b!important;text-align:center!important;vertical-align:middle!important;font-family:${u}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
table.reports-data-table thead th{background:linear-gradient(180deg,#fff8d9,#f5d978 48%,#d7a92e)!important;color:#111!important;font-weight:900!important;white-space:normal!important;overflow-wrap:anywhere!important}
table.reports-data-table tbody td{background:#fff!important;color:#111!important;font-weight:750!important}
table.reports-data-table tbody tr.total-row>td,table.reports-data-table tbody tr.report-grand-total-row>td{background:#0871ce!important;color:#fff!important;font-weight:900!important}
table.reports-data-table tbody tr.total-row>td *,table.reports-data-table tbody tr.report-grand-total-row>td *{background:transparent!important;color:#fff!important}
table.reports-data-table tbody tr.reports-trainee-total-row:not(.total-row):not(.report-grand-total-row)>td{background:#d9f0ec!important;color:#102c2a!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-trainee-summary-row:not(.total-row):not(.report-grand-total-row)>td{background:#fff4d9!important;color:#211b0c!important;font-weight:850!important}
table.reports-data-table tbody tr.reports-fee-row:not(.total-row):not(.report-grand-total-row)>td{background:#e8f1f7!important;color:#142b3d!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-period-row:not(.total-row):not(.report-grand-total-row)>td{background:#e9eef3!important;color:#17212b!important;font-weight:900!important}
`,f=`
  ${a}
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
font-family: ${u} !important;
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
font-family: ${u} !important;
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
    font-family: ${u} !important;
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
    font-family: ${u} !important;
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
    font-family: ${u} !important;
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
table.reports-data-table th,table.reports-data-table td{box-sizing:border-box!important;border:1px solid #17212b!important;text-align:center!important;vertical-align:middle!important;font-family:${u}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
table.reports-data-table thead th{background:linear-gradient(180deg,#fff8d9,#f5d978 48%,#d7a92e)!important;color:#111!important;font-weight:900!important;white-space:normal!important;overflow-wrap:anywhere!important}
table.reports-data-table tbody td{background:#fff!important;color:#111!important;font-weight:750!important}
table.reports-data-table tbody tr.total-row>td,table.reports-data-table tbody tr.report-grand-total-row>td{background:#0871ce!important;color:#fff!important;font-weight:900!important}
table.reports-data-table tbody tr.total-row>td *,table.reports-data-table tbody tr.report-grand-total-row>td *{background:transparent!important;color:#fff!important}
table.reports-data-table tbody tr.reports-trainee-total-row:not(.total-row):not(.report-grand-total-row)>td{background:#d9f0ec!important;color:#102c2a!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-trainee-summary-row:not(.total-row):not(.report-grand-total-row)>td{background:#fff4d9!important;color:#211b0c!important;font-weight:850!important}
table.reports-data-table tbody tr.reports-fee-row:not(.total-row):not(.report-grand-total-row)>td{background:#e8f1f7!important;color:#142b3d!important;font-weight:900!important}
table.reports-data-table tbody tr.reports-period-row:not(.total-row):not(.report-grand-total-row)>td{background:#e9eef3!important;color:#17212b!important;font-weight:900!important}
`;async function p(e){let t=[];e.fonts?.ready&&t.push(e.fonts.ready.catch(()=>void 0)),Array.from(e.querySelectorAll(`link[rel="stylesheet"]`)).forEach(e=>{e.sheet||t.push(new Promise(t=>{let n=!1,r=0,i=()=>{n||(n=!0,window.clearTimeout(r),e.removeEventListener(`load`,i),e.removeEventListener(`error`,i),t())};r=window.setTimeout(i,12e3),e.addEventListener(`load`,i,{once:!0}),e.addEventListener(`error`,i,{once:!0})}))}),Array.from(e.images).forEach(e=>{(!e.complete||e.decode&&e.naturalWidth!==0)&&t.push((async()=>{e.complete||await new Promise(t=>{let n=!1,r=0,i=()=>{n||(n=!0,window.clearTimeout(r),e.removeEventListener(`load`,i),e.removeEventListener(`error`,i),t())};r=window.setTimeout(i,12e3),e.addEventListener(`load`,i,{once:!0}),e.addEventListener(`error`,i,{once:!0})}),e.decode&&await e.decode().catch(()=>void 0)})())}),await Promise.race([Promise.all(t),new Promise(e=>window.setTimeout(e,2e4))])}async function m(t,i){let{fileName:a,pageSize:o=`A4`,orientation:l=`portrait`,marginMm:d=3,fitToContent:f=!1}=i,m=t.ownerDocument;n(t),e(t);let h=RegExp(`^[\\s\\u200e\\u200f]*[+-]?(?:(?:[0-9٠-٩۰-۹]+)(?:[,.٬٫][0-9٠-٩۰-۹]+)*|[0-9٠-٩۰-۹]{1,4}[-/.][0-9٠-٩۰-۹]{1,2}[-/.][0-9٠-٩۰-۹]{1,4})(?:\\s*(?:ر\\.?\\s*ي|ريال|ر\\.?\\s*س))?[\\s\\u200e\\u200f]*$`);t.querySelectorAll(`table th, table td`).forEach(e=>{h.test((e.textContent||``).trim())&&e.classList.add(`numeric-cell`)}),await p(m);let g=Array.from(m.querySelectorAll(`style`)).map(e=>e.textContent||``).filter(Boolean).join(`
`),_=Array.from(m.querySelectorAll(`link[rel="stylesheet"]`)).map(e=>e.outerHTML).join(`
`),v=Number.isFinite(d)?Math.max(0,Math.min(30,d)):3,y=f?Math.min(v,3):v,b=a.replace(/\.pdf$/i,``).replace(/[\\\\/:*?"<>|]/g,`-`),x=`
    @page {
      size: ${o} ${l};
      margin: ${y}mm;
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
        font-family: ${u} !important;
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
  `,S=`<!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${s(b)}</title>
        ${_}
        <style>${g}\n${x}</style>
      </head>
      <body>${t.outerHTML}</body>
    </html>`;if(!await c(S,b))throw Error(`تعذر فتح محرك تصدير PDF. تحقق من إعدادات الطباعة ثم أعد المحاولة.`);r.isNativePlatform()||await new Promise(e=>window.setTimeout(e,2800))}async function h(e){let n=document.createElement(`iframe`);n.setAttribute(`aria-hidden`,`true`),n.style.cssText=`position:fixed;left:-20000px;top:20000px;width:2800px;height:2800px;border:0;pointer-events:none;font-family:"IBM Plex Sans Arabic","Noto Sans Arabic","Noto Naskh Arabic",Cairo,Tahoma,Arial,sans-serif`,document.body.append(n);try{let r=n.contentDocument;if(!r)throw Error(`تعذر تجهيز التقرير`);r.open(),r.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${s(e.title)}</title>
      <style>${d}
      ${f}
      ${e.css||``}
      ${t}
      ${o}
      ${i}</style></head><body><div id="report-source" class="report-page-content">
      ${e.body.includes(`report-letterhead`)?``:l()}${e.body}</div></body></html>`),r.close();let a=r.getElementById(`report-source`);if(!a)throw Error(`تعذر تحديد محتوى التقرير`);await new Promise(e=>window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>e()))),await m(a,e)}finally{n.remove()}}async function g(e,t,n=`portrait`){let r=new DOMParser().parseFromString(e,`text/html`);r.querySelectorAll(`script`).forEach(e=>e.remove());let i=Array.from(r.querySelectorAll(`style`)).map(e=>e.textContent||``).join(`
`);await h({title:t,body:r.body.innerHTML,css:i,orientation:n,fileName:`${t.replace(/[\\/:*?"<>|]/g,`-`)}.pdf`})}export{h as n,d as r,g as t};