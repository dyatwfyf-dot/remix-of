// Shared compact column sizing for report tables across the screen, browser preview, printing and PDF.
// Only the semantic description column may wrap, and it is limited to two lines.
export function tagReportCells(root: ParentNode) {
  root.querySelectorAll("table.reports-data-table td, table.reports-data-table th").forEach((cell) => {
    const el = cell as HTMLElement;
    if (el.closest("tr.signature-block-row")) return;
    el.classList.remove("rc-num", "rc-desc");
    if (el.tagName === "TH") {
      el.classList.add("rc-num");
      return;
    }
    const isDescription = el.getAttribute("data-col-key") === "description" ||
      el.classList.contains("description-cell") || el.classList.contains("desc-cell");
    el.classList.add(isDescription ? "rc-desc" : "rc-num");
  });
}

/** Same logic as an inline script for the standalone preview window. */
export const tagReportCellsScript = `(${tagReportCells.toString()})(document);`;

export const reportsCompactColumnsCss = `
  table.reports-data-table {
    table-layout: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse !important;
  }
  table.reports-data-table th,
  table.reports-data-table td {
    width: 1% !important;
    min-width: 0 !important;
    padding: 1px 2px !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
  table.reports-data-table td.rc-num,
  table.reports-data-table td.rc-num * {
    width: auto !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
  table.reports-data-table td.rc-desc,
  table.reports-data-table th[data-col-key="description"] {
    width: 220px !important;
    min-width: 0 !important;
    max-width: 220px !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
  table.reports-data-table td.rc-desc > *,
  table.reports-data-table td.rc-desc .pdf-cell-text {
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    -webkit-line-clamp: 2 !important;
    line-clamp: 2 !important;
    max-height: 2.9em !important;
    overflow: hidden !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
  table.reports-data-table tr.signature-block-row td,
  table.reports-data-table tr.signature-block-row td * {
    white-space: normal !important;
    width: auto !important;
  }
`;
