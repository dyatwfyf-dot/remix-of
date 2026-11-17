/**
 * Shared Excel-like sizing for all tables in browser print preview, physical
 * printing, and generated PDFs.
 *
 * Native table auto-layout measures cell contents first, then distributes the
 * remaining printable width. Numeric values, dates and identifiers stay on a
 * single line; descriptive text wraps inside its own cell.
 */
export const excelLikePrintTablesCss = `
  .report-page-content table,
  .report-page-content table[class],
  #tableContainer table,
  #tableContainer table[class],
  .preview-report-content table,
  .preview-report-content table[class],
  body > table,
  body > table[class] {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    direction: rtl !important;
  }

  .report-page-content table col,
  .report-page-content table[class] col,
  #tableContainer table col,
  #tableContainer table[class] col,
  .preview-report-content table col,
  .preview-report-content table[class] col,
  body > table col,
  body > table[class] col {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }

  .report-page-content table th,
  .report-page-content table td,
  .report-page-content table[class] th,
  .report-page-content table[class] td,
  #tableContainer table th,
  #tableContainer table td,
  #tableContainer table[class] th,
  #tableContainer table[class] td,
  .preview-report-content table th,
  .preview-report-content table td,
  .preview-report-content table[class] th,
  .preview-report-content table[class] td,
  body > table th,
  body > table td,
  body > table[class] th,
  body > table[class] td {
    box-sizing: border-box !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    padding: 3px 5px !important;
    margin: 0 !important;
    text-align: center !important;
    vertical-align: middle !important;
    line-height: 1.35 !important;
    white-space: normal !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    hyphens: none !important;
    overflow: visible !important;
  }

  .report-page-content table thead,
  #tableContainer table thead,
  .preview-report-content table thead,
  body > table thead {
    display: table-header-group !important;
  }
  .report-page-content table tfoot,
  #tableContainer table tfoot,
  .preview-report-content table tfoot,
  body > table tfoot {
    display: table-footer-group !important;
  }

  /* Amounts, counts, dates, reference numbers and identifiers never wrap. */
  .report-page-content table th.numeric-cell,
  .report-page-content table td.numeric-cell,
  .report-page-content table th.num,
  .report-page-content table td.num,
  .report-page-content table th.date-cell,
  .report-page-content table td.date-cell,
  .report-page-content table th.compact-cell,
  .report-page-content table td.compact-cell,
  .report-page-content table th.ref-cell,
  .report-page-content table td.ref-cell,
  .report-page-content table th.idx,
  .report-page-content table td.idx,
  #tableContainer table th.numeric-cell,
  #tableContainer table td.numeric-cell,
  #tableContainer table th.num,
  #tableContainer table td.num,
  #tableContainer table th.date-cell,
  #tableContainer table td.date-cell,
  #tableContainer table th.compact-cell,
  #tableContainer table td.compact-cell,
  #tableContainer table th.ref-cell,
  #tableContainer table td.ref-cell,
  #tableContainer table th.idx,
  #tableContainer table td.idx,
  .preview-report-content table th.numeric-cell,
  .preview-report-content table td.numeric-cell,
  .preview-report-content table th.num,
  .preview-report-content table td.num,
  .preview-report-content table th.date-cell,
  .preview-report-content table td.date-cell,
  .preview-report-content table th.compact-cell,
  .preview-report-content table td.compact-cell,
  .preview-report-content table th.ref-cell,
  .preview-report-content table td.ref-cell,
  .preview-report-content table th.idx,
  .preview-report-content table td.idx {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    direction: ltr !important;
    unicode-bidi: isolate !important;
    font-variant-numeric: tabular-nums !important;
  }

  /* Semantic fields that are expected to contain words can wrap naturally. */
  .report-page-content table td.text-cell,
  .report-page-content table td.name-cell,
  .report-page-content table td.specialty-cell,
  .report-page-content table td.batch-cell,
  .report-page-content table td.desc-cell,
  .report-page-content table td.details-cell,
  .report-page-content table td.description-cell,
  #tableContainer table td.text-cell,
  #tableContainer table td.name-cell,
  #tableContainer table td.specialty-cell,
  #tableContainer table td.batch-cell,
  #tableContainer table td.desc-cell,
  #tableContainer table td.details-cell,
  #tableContainer table td.description-cell,
  .preview-report-content table td.text-cell,
  .preview-report-content table td.name-cell,
  .preview-report-content table td.specialty-cell,
  .preview-report-content table td.batch-cell,
  .preview-report-content table td.desc-cell,
  .preview-report-content table td.details-cell,
  .preview-report-content table td.description-cell {
    white-space: normal !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    direction: rtl !important;
  }

  /* Data-key fallback for tables whose values arrive as strings rather than numbers. */
  .report-page-content table th[data-col-key*="date" i],
  .report-page-content table td[data-col-key*="date" i],
  .report-page-content table th[data-col-key$="no" i],
  .report-page-content table td[data-col-key$="no" i],
  .report-page-content table th[data-col-key*="number" i],
  .report-page-content table td[data-col-key*="number" i],
  .report-page-content table th[data-col-key*="code" i],
  .report-page-content table td[data-col-key*="code" i],
  .report-page-content table th[data-col-key*="reference" i],
  .report-page-content table td[data-col-key*="reference" i],
  #tableContainer table th[data-col-key*="date" i],
  #tableContainer table td[data-col-key*="date" i],
  #tableContainer table th[data-col-key$="no" i],
  #tableContainer table td[data-col-key$="no" i],
  #tableContainer table th[data-col-key*="number" i],
  #tableContainer table td[data-col-key*="number" i],
  #tableContainer table th[data-col-key*="code" i],
  #tableContainer table td[data-col-key*="code" i],
  #tableContainer table th[data-col-key*="reference" i],
  #tableContainer table td[data-col-key*="reference" i],
  .preview-report-content table th[data-col-key*="date" i],
  .preview-report-content table td[data-col-key*="date" i],
  .preview-report-content table th[data-col-key$="no" i],
  .preview-report-content table td[data-col-key$="no" i],
  .preview-report-content table th[data-col-key*="number" i],
  .preview-report-content table td[data-col-key*="number" i],
  .preview-report-content table th[data-col-key*="code" i],
  .preview-report-content table td[data-col-key*="code" i],
  .preview-report-content table th[data-col-key*="reference" i],
  .preview-report-content table td[data-col-key*="reference" i],
  .report-page-content table th[data-col-key*="amount" i],
  .report-page-content table td[data-col-key*="amount" i],
  .report-page-content table th[data-col-key*="fee" i],
  .report-page-content table td[data-col-key*="fee" i],
  .report-page-content table th[data-col-key*="total" i],
  .report-page-content table td[data-col-key*="total" i],
  .report-page-content table th[data-col-key*="balance" i],
  .report-page-content table td[data-col-key*="balance" i],
  #tableContainer table th[data-col-key*="amount" i],
  #tableContainer table td[data-col-key*="amount" i],
  #tableContainer table th[data-col-key*="fee" i],
  #tableContainer table td[data-col-key*="fee" i],
  #tableContainer table th[data-col-key*="total" i],
  #tableContainer table td[data-col-key*="total" i],
  #tableContainer table th[data-col-key*="balance" i],
  #tableContainer table td[data-col-key*="balance" i],
  .preview-report-content table th[data-col-key*="amount" i],
  .preview-report-content table td[data-col-key*="amount" i],
  .preview-report-content table th[data-col-key*="fee" i],
  .preview-report-content table td[data-col-key*="fee" i],
  .preview-report-content table th[data-col-key*="total" i],
  .preview-report-content table td[data-col-key*="total" i],
  .preview-report-content table th[data-col-key*="balance" i],
  .preview-report-content table td[data-col-key*="balance" i] {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    direction: ltr !important;
    unicode-bidi: isolate !important;
    font-variant-numeric: tabular-nums !important;
  }

  .report-page-content table td .pdf-cell-text,
  #tableContainer table td .pdf-cell-text,
  .preview-report-content table td .pdf-cell-text {
    display: inline-block !important;
    max-width: 100% !important;
    white-space: inherit !important;
    overflow-wrap: inherit !important;
    word-break: inherit !important;
    vertical-align: middle !important;
  }

  .report-page-content table tr,
  #tableContainer table tr,
  .preview-report-content table tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }


  /* Screen/print/PDF palette parity for the 2026 installments reports. */
  #tableContainer table.installments-summary-2026 thead th,
  #report-source table.installments-summary-2026 thead th {
    background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important;
    color: #000 !important; border: 1px solid #000000 !important; border-color: #000000 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  #tableContainer table.installments-summary-2026 thead th[data-col-key="idx"],
  #tableContainer table.installments-summary-2026 thead th[data-col-key="name"],
  #report-source table.installments-summary-2026 thead th[data-col-key="idx"],
  #report-source table.installments-summary-2026 thead th[data-col-key="name"] { color: #fff !important; }

  #tableContainer table.installments-screen-parity thead th,
  #report-source table.installments-screen-parity thead th {
    background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important;
    color: #000 !important; border: 1px solid #000000 !important; border-color: #000000 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  #tableContainer table.installments-screen-parity thead th[data-col-key="idx"],
  #tableContainer table.installments-screen-parity thead th[data-col-key="name"],
  #report-source table.installments-screen-parity thead th[data-col-key="idx"],
  #report-source table.installments-screen-parity thead th[data-col-key="name"] { color: #fff !important; }

  #tableContainer table.installments-summary-2026 tbody td,
  #tableContainer table.installments-screen-parity tbody td,
  #report-source table.installments-summary-2026 tbody td,
  #report-source table.installments-screen-parity tbody td {
    border: 1px solid #000000 !important;
    border-color: #000000 !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="name"],
  #tableContainer table.installments-screen-parity tbody td.screen-name-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="name"],
  #report-source table.installments-screen-parity tbody td.screen-name-cell { background: #fdf4ff !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="batch"],
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="specialty"],
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="fees"],
  #tableContainer table.installments-screen-parity tbody td.screen-batch-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-specialty-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-fees-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="batch"],
  #report-source table.installments-summary-2026 tbody td[data-col-key="specialty"],
  #report-source table.installments-summary-2026 tbody td[data-col-key="fees"],
  #report-source table.installments-screen-parity tbody td.screen-batch-cell,
  #report-source table.installments-screen-parity tbody td.screen-specialty-cell,
  #report-source table.installments-screen-parity tbody td.screen-fees-cell { background: #f0f9ff !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="prevDue"],
  #tableContainer table.installments-screen-parity tbody td.screen-prevdue-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="prevDue"],
  #report-source table.installments-screen-parity tbody td.screen-prevdue-cell { background: #f8fcff !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="totalPaid"],
  #tableContainer table.installments-screen-parity tbody td.screen-totalpaid-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="totalPaid"],
  #report-source table.installments-screen-parity tbody td.screen-totalpaid-cell { background: #ecfdf5 !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="remaining"],
  #tableContainer table.installments-screen-parity tbody td.screen-remaining-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="remaining"],
  #report-source table.installments-screen-parity tbody td.screen-remaining-cell { background: #fff1f2 !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="notes"],
  #tableContainer table.installments-screen-parity tbody td.screen-notes-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="notes"],
  #report-source table.installments-screen-parity tbody td.screen-notes-cell { background: #fffbeb !important; }
  #tableContainer table.installments-screen-parity tbody td.screen-month-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-extra-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-status-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-idx-cell,
  #report-source table.installments-screen-parity tbody td.screen-month-cell,
  #report-source table.installments-screen-parity tbody td.screen-extra-cell,
  #report-source table.installments-screen-parity tbody td.screen-status-cell,
  #report-source table.installments-screen-parity tbody td.screen-idx-cell { background: #fff !important; }
  #tableContainer table.installments-summary-2026 tbody tr.total-row > td,
  #tableContainer table.installments-screen-parity tbody tr.total-row > td,
  #report-source table.installments-summary-2026 tbody tr.total-row > td,
  #report-source table.installments-screen-parity tbody tr.total-row > td {
    background: #e0f2fe !important;
    color: #000000 !important;
    border: 1px solid #000000 !important;
    border-color: #000000 !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Keep 2026 installment total-row text and cell outlines black after shared themes. */
  #tableContainer table.installments-summary-2026 tbody tr.total-row > td,
  #tableContainer table.installments-screen-parity tbody tr.total-row > td,
  #report-source table.installments-summary-2026 tbody tr.total-row > td,
  #report-source table.installments-screen-parity tbody tr.total-row > td,
  #tableContainer table.installments-summary-2026 tbody tr.total-row > td *,
  #tableContainer table.installments-screen-parity tbody tr.total-row > td *,
  #report-source table.installments-summary-2026 tbody tr.total-row > td *,
  #report-source table.installments-screen-parity tbody tr.total-row > td * {
    color: #000000 !important;
    border: 1px solid #000000 !important;
    border-color: #000000 !important;
    font-weight: 900 !important;
  }

  /* Preserve all semantic row highlighting after shared white-cell themes. */
  .report-page-content table tbody tr.note-red > td,
  #tableContainer table tbody tr.note-red > td,
  .preview-report-content table tbody tr.note-red > td,
  body > table tbody tr.note-red > td { background: #fecaca !important; }
  .report-page-content table tbody tr.note-amber > td,
  #tableContainer table tbody tr.note-amber > td,
  .preview-report-content table tbody tr.note-amber > td,
  body > table tbody tr.note-amber > td { background: #fef08a !important; }
  .report-page-content table tbody tr.note-green > td,
  #tableContainer table tbody tr.note-green > td,
  .preview-report-content table tbody tr.note-green > td,
  body > table tbody tr.note-green > td { background: #bbf7d0 !important; }
  .report-page-content table tbody tr.note-blue > td,
  #tableContainer table tbody tr.note-blue > td,
  .preview-report-content table tbody tr.note-blue > td,
  body > table tbody tr.note-blue > td { background: #bfdbfe !important; }
  .report-page-content table tbody tr.note-violet > td,
  #tableContainer table tbody tr.note-violet > td,
  .preview-report-content table tbody tr.note-violet > td,
  body > table tbody tr.note-violet > td { background: #e9d5ff !important; }
  .report-page-content table tbody tr.note-gray > td,
  #tableContainer table tbody tr.note-gray > td,
  .preview-report-content table tbody tr.note-gray > td,
  body > table tbody tr.note-gray > td { background: #e5e7eb !important; }

  .report-page-content table tbody tr.notes-status-red > td,
  #tableContainer table tbody tr.notes-status-red > td,
  .preview-report-content table tbody tr.notes-status-red > td,
  .report-page-content table tbody tr.notes-status-yellow > td,
  #tableContainer table tbody tr.notes-status-yellow > td,
  .preview-report-content table tbody tr.notes-status-yellow > td,
  .report-page-content table tbody tr.notes-status-green > td,
  #tableContainer table tbody tr.notes-status-green > td,
  .preview-report-content table tbody tr.notes-status-green > td,
  .report-page-content table tbody tr.notes-status-orange > td,
  #tableContainer table tbody tr.notes-status-orange > td,
  .preview-report-content table tbody tr.notes-status-orange > td,
  .report-page-content table tbody tr.notes-status-blue > td,
  #tableContainer table tbody tr.notes-status-blue > td,
  .preview-report-content table tbody tr.notes-status-blue > td,
  .report-page-content table tbody tr.notes-status-emerald > td,
  #tableContainer table tbody tr.notes-status-emerald > td,
  .preview-report-content table tbody tr.notes-status-emerald > td {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-page-content table tbody tr.notes-status-red > td,
  #tableContainer table tbody tr.notes-status-red > td,
  .preview-report-content table tbody tr.notes-status-red > td { background: #fecaca !important; }
  .report-page-content table tbody tr.notes-status-yellow > td,
  #tableContainer table tbody tr.notes-status-yellow > td,
  .preview-report-content table tbody tr.notes-status-yellow > td { background: #fef08a !important; }
  .report-page-content table tbody tr.notes-status-green > td,
  #tableContainer table tbody tr.notes-status-green > td,
  .preview-report-content table tbody tr.notes-status-green > td { background: #bbf7d0 !important; }
  .report-page-content table tbody tr.notes-status-orange > td,
  #tableContainer table tbody tr.notes-status-orange > td,
  .preview-report-content table tbody tr.notes-status-orange > td { background: #fed7aa !important; }
  .report-page-content table tbody tr.notes-status-blue > td,
  #tableContainer table tbody tr.notes-status-blue > td,
  .preview-report-content table tbody tr.notes-status-blue > td { background: #e0f2fe !important; }
  .report-page-content table tbody tr.notes-status-emerald > td,
  #tableContainer table tbody tr.notes-status-emerald > td,
  .preview-report-content table tbody tr.notes-status-emerald > td { background: #ecfdf5 !important; }

  .report-page-content table tbody tr.note-row > td,
  #tableContainer table tbody tr.note-row > td,
  .preview-report-content table tbody tr.note-row > td,
  .report-page-content table tbody tr.notes-status-red > td,
  #tableContainer table tbody tr.notes-status-red > td,
  .preview-report-content table tbody tr.notes-status-red > td,
  .report-page-content table tbody tr.notes-status-yellow > td,
  #tableContainer table tbody tr.notes-status-yellow > td,
  .preview-report-content table tbody tr.notes-status-yellow > td,
  .report-page-content table tbody tr.notes-status-green > td,
  #tableContainer table tbody tr.notes-status-green > td,
  .preview-report-content table tbody tr.notes-status-green > td,
  .report-page-content table tbody tr.notes-status-orange > td,
  #tableContainer table tbody tr.notes-status-orange > td,
  .preview-report-content table tbody tr.notes-status-orange > td,
  .report-page-content table tbody tr.notes-status-blue > td,
  #tableContainer table tbody tr.notes-status-blue > td,
  .preview-report-content table tbody tr.notes-status-blue > td,
  .report-page-content table tbody tr.notes-status-emerald > td,
  #tableContainer table tbody tr.notes-status-emerald > td,
  .preview-report-content table tbody tr.notes-status-emerald > td {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @media print {
    .report-page-content table,
    .report-page-content table[class],
    #tableContainer table,
    #tableContainer table[class],
    .preview-report-content table,
    .preview-report-content table[class],
    body > table,
    body > table[class] {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: auto !important;
    }
  }
`;
