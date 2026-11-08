/**
 * Shared visual theme for every generated report PDF and browser print preview.
 * Keep this file limited to table colors and borders so report-specific layouts,
 * column sizing, signatures, and data formatting remain owned by their callers.
 */
export const reportTableThemeCss = `
  :root {
    --report-table-header-start: #fff4a3;
    --report-table-header-mid: #ffd700;
    --report-table-header-end: #d99b00;
    --report-table-body: #ffffff;
    --report-table-ink: #1e293b;
    --report-table-grid: #000000;
    --report-table-total-start: #39a2ff;
    --report-table-total-mid: #087bff;
    --report-table-total-end: #0052cc;
  }

  .report-page-content table,
  #tableContainer table,
  body > table {
    border-collapse: collapse !important;
    border-color: var(--report-table-grid) !important;
  }

  .report-page-content table th,
  .report-page-content table td,
  #tableContainer table th,
  #tableContainer table td,
  body > table th,
  body > table td {
    border: 1px solid var(--report-table-grid) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-page-content table thead th,
  #tableContainer table thead th,
  body > table thead th {
    background: linear-gradient(
      180deg,
      var(--report-table-header-start) 0%,
      var(--report-table-header-mid) 48%,
      var(--report-table-header-end) 100%
    ) !important;
    background-color: var(--report-table-header-mid) !important;
    color: #3b2600 !important;
    font-weight: 900 !important;
  }

  .report-page-content table thead th .pdf-cell-text,
  #tableContainer table thead th .pdf-cell-text,
  body > table thead th .pdf-cell-text {
    background: transparent !important;
    color: #3b2600 !important;
  }

  .report-page-content table tbody > tr:not(.report-grand-total-row):not(.total-row):not(.signature-block-row):not(.signature-spacer-row):not(.installments-statement-row):not(.reports-fee-row) > td,
  #tableContainer table tbody > tr:not(.report-grand-total-row):not(.total-row):not(.signature-block-row):not(.signature-spacer-row):not(.installments-statement-row):not(.reports-fee-row) > td,
  body > table tbody > tr:not(.report-grand-total-row):not(.total-row):not(.signature-block-row):not(.signature-spacer-row):not(.installments-statement-row):not(.reports-fee-row) > td {
    background: var(--report-table-body) !important;
    background-color: var(--report-table-body) !important;
    color: var(--report-table-ink) !important;
  }

  .report-page-content table tbody > tr.report-grand-total-row > td,
  .report-page-content table tbody > tr.total-row > td,
  #tableContainer table tbody > tr.report-grand-total-row > td,
  #tableContainer table tbody > tr.total-row > td,
  body > table tbody > tr.report-grand-total-row > td,
  body > table tbody > tr.total-row > td {
    background: linear-gradient(
      180deg,
      var(--report-table-total-start) 0%,
      var(--report-table-total-mid) 52%,
      var(--report-table-total-end) 100%
    ) !important;
    background-color: var(--report-table-total-mid) !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-page-content table tbody > tr.report-grand-total-row > td *,
  .report-page-content table tbody > tr.total-row > td *,
  #tableContainer table tbody > tr.report-grand-total-row > td *,
  #tableContainer table tbody > tr.total-row > td *,
  body > table tbody > tr.report-grand-total-row > td *,
  body > table tbody > tr.total-row > td * {
    background: transparent !important;
    color: #ffffff !important;
  }

  .report-page-content table tbody > tr.signature-block-row > td,
  #tableContainer table tbody > tr.signature-block-row > td,
  body > table tbody > tr.signature-block-row > td,
  .report-page-content table tbody > tr.signature-spacer-row > td,
  #tableContainer table tbody > tr.signature-spacer-row > td,
  body > table tbody > tr.signature-spacer-row > td {
    background: #ffffff !important;
    color: #000000 !important;
  }
`;
