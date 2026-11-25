// Shared compact column sizing for report tables (screen, print preview, print, PDF).
// Numeric/date cells stay on one line; long text wraps without truncation.

const taggedSerialTables = new WeakMap<HTMLTableElement, number>();

/** Mark serial-number columns (م, #, مسلسل) and keep their cells sized to their contents. */
export function tagSerialColumns(root: ParentNode) {
  const serialHeader = /^(?:م|#|المسلسل|مسلسل|التسلسل|تسلسل|م\.?|no\.?|s\.?no\.?)$/i;
  root.querySelectorAll("table").forEach((table) => {
    const rowCount = table.rows.length;
    if (taggedSerialTables.get(table) === rowCount) return;
    taggedSerialTables.set(table, rowCount);
    const headers = Array.from(table.querySelectorAll("thead tr:first-child th, thead tr:first-child td, tr:first-child th, tr:first-child td"));
    const index = headers.findIndex((cell) => serialHeader.test((cell.textContent || "").replace(/[\s.]/g, "").trim()));
    if (index < 0) return;
    table.querySelectorAll("tr").forEach((row) => {
      const cell = row.children.item(index) as HTMLElement | null;
      if (cell) cell.classList.add("serial-number-column");
    });
  });
}

/** Same logic as an inline script for the standalone preview window. */
export const tagSerialColumnsScript = `((root)=>{const serialHeader=/^(?:م|#|المسلسل|مسلسل|التسلسل|تسلسل|م\\.?|no\\.?|s\\.?no\\.?)$/i;root.querySelectorAll("table").forEach((table)=>{const headers=Array.from(table.querySelectorAll("thead tr:first-child th, thead tr:first-child td, tr:first-child th, tr:first-child td"));const index=headers.findIndex((cell)=>serialHeader.test((cell.textContent||"").replace(/[\\s.]/g,"").trim()));if(index<0)return;table.querySelectorAll("tr").forEach((row)=>{const cell=row.children.item(index);if(cell)cell.classList.add("serial-number-column");});});})(document);`;

/** Classifies each cell of report tables under `root` as numeric (no wrap) or text (wrap). */
export function tagReportCells(root: ParentNode) {
  const numRe = /^[\s\-+()]*[\d\u0660-\u0669\u06F0-\u06F9][\d\u0660-\u0669\u06F0-\u06F9\s.,٫٬،%\-/:+()]*$/;
  root.querySelectorAll("table.reports-data-table td, table.reports-data-table th").forEach((cell) => {
    const el = cell as HTMLElement;
    if (el.closest("tr.signature-block-row")) return;
    const text = (el.textContent || "").trim();
    el.classList.remove("rc-num", "rc-text");
    if (el.tagName === "TH") { el.classList.add(text.length > 12 ? "rc-text" : "rc-num"); return; }
    el.classList.add(!text || numRe.test(text) ? "rc-num" : "rc-text");
  });
}

/** Same logic as an inline script for the standalone preview window. */
export const tagReportCellsScript = `(${tagReportCells.toString()})(document);`;

export const reportsCompactColumnsCss = `
  table.reports-data-table {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
  }
  table.reports-data-table th,
  table.reports-data-table td {
    padding: 4px 4px !important;
    vertical-align: middle !important;
    line-height: 1.4 !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
  table.reports-data-table th.serial-number-column,
  table.reports-data-table td.serial-number-column,
  table th.serial-number-column,
  table td.serial-number-column {
    width: 1% !important;
    min-width: 2.2rem !important;
    max-width: 4.5rem !important;
    padding-inline: 3px !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    font-variant-numeric: tabular-nums !important;
  }
  table.reports-data-table th.rc-num,
  table.reports-data-table td.rc-num {
    width: 1% !important;
    min-width: 0 !important;
    white-space: nowrap !important;
  }
  table.reports-data-table th.rc-text,
  table.reports-data-table td.rc-text {
    width: auto !important;
    min-width: 0 !important;
    max-width: 58mm !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }
  table.reports-data-table td.rc-text > *,
  table.reports-data-table td.rc-text .pdf-cell-text {
    display: inline-block !important;
    width: auto !important;
    max-width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
  }
  table.reports-data-table tr.signature-block-row td,
  table.reports-data-table tr.signature-block-row td * {
    white-space: normal !important;
    width: auto !important;
  }
  @media print {
    table.reports-data-table { width: 100% !important; min-width: 0 !important; }
    table.reports-data-table th,
    table.reports-data-table td { padding: 4px 3px !important; }
  }
`;
