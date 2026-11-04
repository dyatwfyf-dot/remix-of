// Shared compact column sizing for report tables (screen, print preview, print, PDF).
// Cells holding numbers/dates never wrap; cells holding text wrap to max 2 lines.

/** Classifies each cell of report tables under `root` as numeric (no wrap) or text (wrap). */
export function tagReportCells(root: ParentNode) {
  const numRe = /^[\s\-+()]*[\d\u0660-\u0669\u06F0-\u06F9][\d\u0660-\u0669\u06F0-\u06F9\s.,٫٬،%\-/:+()]*$/;
  root.querySelectorAll("table.reports-data-table td, table.reports-data-table th").forEach((cell) => {
    const el = cell as HTMLElement;
    if (el.closest("tr.signature-block-row")) return;
    const text = (el.textContent || "").trim();
    el.classList.remove("rc-num", "rc-text");
    if (el.tagName === "TH") { el.classList.add("rc-num"); return; }
    el.classList.add(!text || numRe.test(text) ? "rc-num" : "rc-text");
  });
}

/** Same logic as an inline script for the standalone preview window. */
export const tagReportCellsScript = `(${tagReportCells.toString()})(document);`;

export const reportsCompactColumnsCss = `
  table.reports-data-table { table-layout: auto !important; width: 100% !important; }
  table.reports-data-table th, table.reports-data-table td {
    padding: 1px 3px !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
  table.reports-data-table td.rc-num, table.reports-data-table td.rc-num * {
    white-space: nowrap !important;
    width: 1% !important;
  }
  table.reports-data-table td.rc-text {
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    max-width: 70mm !important;
    min-width: 25mm !important;
  }
  table.reports-data-table td.rc-text > *, table.reports-data-table td.rc-text .pdf-cell-text {
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    -webkit-line-clamp: 2 !important;
    line-clamp: 2 !important;
    overflow: hidden !important;
    white-space: normal !important;
  }
  table.reports-data-table tr.signature-block-row td,
  table.reports-data-table tr.signature-block-row td * { white-space: normal !important; width: auto !important; }
`;
