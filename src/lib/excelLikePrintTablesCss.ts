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
  #tableContainer table,
  .preview-report-content table,
  body > table {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    direction: rtl !important;
  }

  .report-page-content table col,
  #tableContainer table col,
  .preview-report-content table col,
  body > table col {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }

  .report-page-content table th,
  .report-page-content table td,
  #tableContainer table th,
  #tableContainer table td,
  .preview-report-content table th,
  .preview-report-content table td,
  body > table th,
  body > table td {
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
  .report-page-content table th[data-col-key*="no" i],
  .report-page-content table td[data-col-key*="no" i],
  .report-page-content table th[data-col-key*="number" i],
  .report-page-content table td[data-col-key*="number" i],
  #tableContainer table th[data-col-key*="date" i],
  #tableContainer table td[data-col-key*="date" i],
  #tableContainer table th[data-col-key*="no" i],
  #tableContainer table td[data-col-key*="no" i],
  #tableContainer table th[data-col-key*="number" i],
  #tableContainer table td[data-col-key*="number" i],
  .preview-report-content table th[data-col-key*="date" i],
  .preview-report-content table td[data-col-key*="date" i],
  .preview-report-content table th[data-col-key*="no" i],
  .preview-report-content table td[data-col-key*="no" i],
  .preview-report-content table th[data-col-key*="number" i],
  .preview-report-content table td[data-col-key*="number" i] {
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

  @media print {
    .report-page-content table,
    #tableContainer table,
    .preview-report-content table,
    body > table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: auto !important;
    }
  }
`;
