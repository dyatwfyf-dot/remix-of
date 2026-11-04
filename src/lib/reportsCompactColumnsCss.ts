// Shared compact column sizing for report tables (screen print preview, print, PDF).
// All cells fit their content on one line; only the description column wraps to max 2 lines.
const desc = `[data-col-key="description"], [data-col-name*="البيان"], .desc-cell, .description-cell`;

export const reportsCompactColumnsCss = `
  table.reports-data-table { table-layout: auto !important; }
  table.reports-data-table th, table.reports-data-table td {
    padding: 1px 3px !important;
    white-space: nowrap !important;
    width: 1% !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
  table.reports-data-table th:is(${desc}), table.reports-data-table td:is(${desc}) {
    width: auto !important;
    max-width: 70mm !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
  table.reports-data-table td:is(${desc}) > *, table.reports-data-table td:is(${desc}) .pdf-cell-text {
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    -webkit-line-clamp: 2 !important;
    line-clamp: 2 !important;
    overflow: hidden !important;
    white-space: normal !important;
    max-width: 70mm !important;
  }
  table.reports-data-table tr.signature-block-row td,
  table.reports-data-table tr.signature-block-row td * { white-space: normal !important; width: auto !important; }
`;
