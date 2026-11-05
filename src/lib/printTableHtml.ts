import { fmt } from "./format";
import { formatReportDate } from "@/lib/reportDate";
import { noteRowClass, noteRowCss } from "@/lib/notesColors";
import reportLetterheadUrl from "@/assets/report-letterhead.png";

export type TableCol = { key: string; label: string };

export const REPORT_LETTERHEAD_SRC = reportLetterheadUrl;

/**
 * توليد ترويسة التقارير الرسمية كإطار نصي موحد بدلاً من الصورة
 */
export const reportLetterheadHtml = () => `
  <div class="report-letterhead-block">
    <div class="report-letterhead-frame">
      <div class="report-letterhead-side report-letterhead-right">
        <div class="letterhead-title-ar">الجمهورية اليمنية</div>
        <div class="letterhead-sub-ar">وزارة الصحة والبيئة</div>
        <div class="letterhead-sub-ar">المجلس اليمني للاختصاصات الطبية</div>
        <div class="letterhead-branch-ar">فرع صعدة</div>
      </div>
      <div class="report-letterhead-center">
        <div class="letterhead-bismillah">بسم الله الرحمن الرحيم</div>
        <div class="letterhead-center-divider"></div>
      </div>
      <div class="report-letterhead-side report-letterhead-left">
        <div class="letterhead-title-en">Republic of Yemen</div>
        <div class="letterhead-sub-en">Ministry of Public Health &amp; Environment</div>
        <div class="letterhead-sub-en">Yemeni Council for Medical Specializations</div>
        <div class="letterhead-branch-en">Saada Branch</div>
      </div>
    </div>
  </div>
`;

export const reportLetterheadRowHtml = (columnCount: number) => `
  <tr class="report-letterhead-row">
    <th class="report-letterhead-cell" colspan="${Math.max(1, Math.floor(columnCount))}">
      ${reportLetterheadHtml()}
    </th>
  </tr>
`;

/**
 * تكرار ترويسة التقرير في أعلى كل صفحة مطبوعة
 */
export const runningLetterheadCss = `
  @media print {
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
`;

export const escapeHtml = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * استخراج اسم المدير من النص المدمج بصيغة "<العنوان> - <الاسم>"
 * بحيث يعمل مع جميع العناوين بما فيها العنوان الذي يحتوي على " - " أصلاً
 * (مثال: "رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة - محمد")
 * فيُعاد "محمد" فقط.
 */
const extractSignatureName = (val: unknown): string => {
  const text = String(val ?? "").trim();
  if (!text) return "";
  const parts = text.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : text;
};

/**
 * بناء صف كتلة التوقيعات الثلاثة (سطران: عناوين الإدارات / أسماء المدراء)
 * يدعم قراءة الأسماء من الحقول المخصصة (__signatureFinance / financeManager ...)
 * أو من قيم أعمدة الصف المدمجة بصيغة "<العنوان> - <الاسم>".
 */
const buildReportSignatureGroup = (rows: Record<string, any>[], columns: TableCol[]): string => {
  const signatureRows = rows
    .filter((row) => row && row.summaryLevel === "signature")
    .slice(0, 3);
  if (!signatureRows.length) return "";

  const titles = signatureRows.map((row) =>
    `<div class="sig-title">${escapeHtml(String(row.description || "المسمى / الإدارة"))}</div>`
  ).join("");
  const names = signatureRows.map((row) =>
    `<div class="sig-name">${escapeHtml(String(row.name || "...................."))}</div>`
  ).join("");

  return `<tr aria-hidden="true" class="signature-spacer-row"><td colspan="${columns.length + 1}"></td></tr>
  <tr class="signature-block-row report-signature-group">
    <td colspan="${columns.length + 1}" class="signature-block-cell">
      <div class="signature-block-grid">${titles}${names}</div>
    </td>
  </tr>`;
};

const buildSignatureBlockRow = (row: Record<string, any>, columns: TableCol[]): string => {
  let finance = String(row.__signatureFinance || row.financeManager || "").trim();
  let vice = String(row.__signatureVice || row.viceManager || "").trim();
  let president = String(row.__signaturePresident || row.presidentManager || "").trim();

  // استخراج القيم من أعمدة الصف إن لم تكن الحقول المخصصة موجودة
  if (!finance && !vice && !president) {
    const colValues: string[] = [];
    columns.forEach((c) => {
      const v = row[c.key];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        colValues.push(String(v).trim());
      }
    });
    if (colValues[0]) finance = extractSignatureName(colValues[0]);
    if (colValues[1]) vice = extractSignatureName(colValues[1]);
    if (colValues[2]) president = extractSignatureName(colValues[2]);
  }

  // شبكة مسطّحة بـ 6 عناصر: 3 عناوين إدارات (سطر 1) + 3 أسماء مدراء (سطر 2)
  return `<tr class="signature-block-row">
    <td colspan="${columns.length + 1}" class="signature-block-cell">
      <div class="signature-block-grid">
        <div class="sig-title">الشؤون المالية</div>
        <div class="sig-title">نائب رئيس المجلس</div>
        <div class="sig-title">رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة</div>
        <div class="sig-name">${escapeHtml(finance || "....................")}</div>
        <div class="sig-name">${escapeHtml(vice || "....................")}</div>
        <div class="sig-name">${escapeHtml(president || "....................")}</div>
      </div>
    </td>
  </tr>`;
};

/**
 * أنماط موحّدة للطباعة ومعاينة PDF وواجهة الجداول
 */
export const tablePrintStyles = `
  @page {
    size: A4;
    margin: 3mm;
  }
  
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Cairo !important;
    padding: 3mm 4mm;
    color: #000000 !important;
    direction: rtl;
    width: 100%;
    font-weight: 700;
    background: #ffffff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  h1 {
    text-align: center;
    color: #000000 !important;
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 900;
    white-space: pre-line;
    line-height: 1.4;
  }

  .custody-date-row td {
    padding: 5px 8px !important;
    border: 1px solid #b77900 !important;
    background: linear-gradient(180deg, #fff8c9 0%, #ffe36a 55%, #f5b900 100%) !important;
    color: #513900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .custody-date-line {
    text-align: center;
    font-size: 15px;
    line-height: 1.4;
    font-weight: 900;
    color: #513900 !important;
  }

  .sub {
    text-align: center;
    color: #000000 !important;
    margin-bottom: 6px;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1.5px solid #0f283a;
    padding-bottom: 4px;
  }
  
  /* جدول باحتواء تلقائي متكيف مع أبعاد A4 */
  table {
    width: auto !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
    font-size: 16px !important;
    margin-bottom: 6px !important;
  }

  /* الرؤوس والتذييلات تتكرر تلقائياً على كل ورقة */
  thead {
    display: table-header-group !important;
  }
  tfoot {
    display: table-footer-group !important;
  }

  /* منع كسر الصف الواحد عبر الصفحات */
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  th, td {
    border: 1px solid #000000 !important;
    padding: 4px 3px !important;
    text-align: center !important;
    vertical-align: middle !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
    font-family: Cairo, sans-serif !important;
    height: auto !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }
  td.num, td.numeric-cell, td.date-cell, td.ref-cell, td.compact-cell, td.idx,
  th.num, th.numeric-cell, th.date-cell, th.ref-cell, th.compact-cell, th.idx {
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
  .pdf-cell-text {
    max-width: 100% !important;
    white-space: inherit !important;
    overflow-wrap: inherit !important;
  }

  thead th {
    background: linear-gradient(180deg, #fff4a3 0%, #ffd700 48%, #d99b00 100%) !important;
    background-color: #ffd700 !important;
    color: #3b2600 !important;
    font-weight: 900 !important;
    font-size: 16px !important;
    padding: 5px 3px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* لون موحد لخلفية ترويسة التقارير في كل التبويبات */
  #tableContainer table thead th,
  #tableContainer table thead th.desc-cell,
  #tableContainer table thead th[data-col-key="description"] {
    background: linear-gradient(180deg, #fff4a3 0%, #ffd700 48%, #d99b00 100%) !important;
    background-color: #ffd700 !important;
    color: #3b2600 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #tableContainer table thead th .pdf-cell-text {
    color: #000000 !important;
    background: transparent !important;
  }

  thead th .pdf-cell-text {
    color: #000000 !important;
  }

  tbody td {
    color: #000000 !important;
    font-weight: 800 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* تمييز خافت لأعمدة المبالغ مع الحفاظ على لون صف الإجمالي */
  th.financial-amount-cell,
  td.financial-amount-cell {
    background: #f2f7fb !important;
    background-color: #f2f7fb !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-row-striped td {
    background: #f8fafc !important;
  }

  /* تمييز نوع السجل في كشف مدفوعات المتدربين على كامل الصف */
  tbody tr.trainee-detail-row > td {
    background: #E7F2FF !important;
    background-color: #E7F2FF !important;
    color: #17324D !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  tbody tr.trainee-summary-row > td {
    background: #FFF1D6 !important;
    background-color: #FFF1D6 !important;
    color: #68420A !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* إجمالي مدفوعات كل متدرب في السنة: استعادة اللون المميز المستخدم سابقاً */
  tbody tr.report-trainee-name-total-row > td,
  tbody tr.report-trainee-name-total-row > td .pdf-cell-text {
    background: #2C666E !important;
    background-color: #2C666E !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* الإجمالي الكلي الموحد */
  .report-grand-total-row td,
  .total-row td {
    background: linear-gradient(180deg, #39a2ff 0%, #087bff 52%, #0052cc 100%) !important;
    background-color: #087bff !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    font-size: 18px !important;
    border-top: 2px solid #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-grand-total-row td .pdf-cell-text,
  .total-row td .pdf-cell-text {
background: transparent !important;
    color: #ffffff !important;
  }

  /* الأعمدة تتكيف مع محتواها، والنصوص الطويلة تلتف داخل حدود الخلية */
  th, tbody td {
    max-width: auto !important;
    min-width: 0 !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }

  .text-cell, .name-cell, .specialty-cell, .batch-cell, .desc-cell,
  td.details-cell, td.description-cell {
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
    min-width: 0 !important;
    max-width: auto !important;
  }

  /* الأرقام والتواريخ والأكواد تبقى في سطر واحد لسهولة قراءتها */
  .num, .numeric-cell, .date-cell, .compact-cell, .ref-cell, .idx {
    direction: ltr !important;
    font-family: Cairo !important;
    font-weight: 800 !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
    text-align: center !important;
    width: auto !important;
    max-width: none !important;
  }

  /* الأعمدة النصية بما فيها البيان والتفاصيل تلتف عند زيادة طول المحتوى */
  td.desc-cell,
  td.details-cell,
  td.description-cell,
  td[data-col-key="description"],
  td[data-col-name*="البيان"],
  td[data-col-name*="بيان"],
  td[data-col-name*="التفاصيل"],
  td[data-col-name*="تفاصيل"],
  td[data-col-name*="الوصف"] {
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
    text-align: center !important;
    direction: rtl !important;
    min-width: 0 !important;
    max-width: auto !important;
  }

  /* بطاقات ملخص العهدة الملونة */
  .summary-spacer-row td {
    border: none !important;
    background: transparent !important;
    height: 12px !important;
    padding: 0 !important;
  }
  .summary-card-row td {
    text-align: center !important;
    vertical-align: middle !important;
    font-weight: 900 !important;
    font-size: 16px !important;
    padding: 6px 5px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    white-space: nowrap !important;
  }
  .summary-card-row .summary-label-cell {
    background: #51c4ec !important;
    text-align: center !important;
    font-weight: 900 !important;
  }
  .summary-card-row .summary-value-cell {
    background: #51c4ec !important;
    text-align: center !important;
    font-family: Cairo !important;
    font-weight: 900 !important;
    direction: ltr !important;
  }
  .summary-card-0 td {
    background: #ffdd66 !important;
    color: #000 !important;
    border: 1px solid #d97706 !important;
  }
  .summary-card-1 td {
    background: #ff5252 !important;
    color: #7f1d1d !important;
    border: 1px solid #dc2626 !important;
  }
  .summary-card-2 td {
    background: #a7f3d0 !important;
    color: #064e3b !important;
    border: 1px solid #059669 !important;
  }

  /* كتلة التوقيعات الثلاثة لتقارير العهد (سطران متحاذيان) */
  .signature-spacer-row td {
    height: 20mm !important;
    padding: 0 !important;
    border: 0 !important;
    background: #ffffff !important;
    line-height: 0 !important;
  }
  .signature-block-row td {
    background: #ffffff !important;
    padding: 14px 18px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .signature-block-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 6px 12px !important;
    width: 100% !important;
    min-width: 0 !important;
    direction: rtl !important;
    align-items: end !important;
  }
  .sig-title {
    font-family: Cairo, sans-serif !important;
    font-weight: 900 !important;
    font-size: 16px !important;
    color: #000000 !important;
    text-align: center !important;
    padding: 4px !important;
    align-self: end !important;
    line-height: 1.8 !important;
    min-width: 0 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }
  .sig-name {
    font-family: Cairo, sans-serif !important;
    font-weight: 800 !important;
    font-size: 16px !important;
    color: #000000 !important;
    text-align: center !important;
    padding: 4px !important;
    align-self: start !important;
    min-height: 30px !important;
    border-bottom: 1px dotted #000000 !important;
    min-width: 0 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }

  ${noteRowCss}
  ${runningLetterheadCss}

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
    background: linear-gradient(180deg, #39a2ff 0%, #087bff 52%, #0052cc 100%) !important; background-color: #087bff !important; color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { color: #ffffff !important; }
`;

/** يبني ترويسة + جدول التبويب (المستخدم في الطباعة وتنزيل PDF) */
export function buildTableHtml(opts: {
  title: string;
  columns: TableCol[];
  rows: Record<string, any>[];
  numericKeys?: string[];
  subtitle?: string;
  reportDate?: string;
  includeTotalRow?: boolean;
  tableClassName?: string;
}) {
  const { title, columns, rows, numericKeys = [], subtitle, reportDate, includeTotalRow = true, tableClassName = "" } = opts;

  const isDescriptionColumn = (c: TableCol) =>
    c.key === "description" || /^(البيان|بيان|تفاصيل|وصف|الشرح)$/i.test(c.label.trim());

  const isNameColumn = (c: TableCol) =>
    c.key === "name" || /^(الاسم|اسم المتدرب|اسم العميل)$/i.test(c.label.trim());

  const isDateColumn = (c: TableCol) =>
    /(date|year|period|month|تاريخ|السنة|الشهر)/i.test(`${c.key} ${c.label}`);

  const isRefOrCodeColumn = (c: TableCol) =>
    /(ref|reference|number|code|key|id|check|notify|hafiza|doc|settlement|no$)/i.test(c.key) ||
    /^(رقم|رمز|كود|شيك|إشعار|اشعار|حافظة|دفعة|الدفعة|مرجع|المرجع)/i.test(c.label.trim());

  const isSpecialtyColumn = (c: TableCol) =>
    c.key === "specialty" || /^(التخصص|المساق)$/i.test(c.label.trim());

  const isBatchColumn = (c: TableCol) =>
    c.key === "batch" || /^(الدفعة)$/i.test(c.label.trim());

  const getCellClass = (c: TableCol, val?: any) => {
    if (isDescriptionColumn(c)) {
      return "desc-cell";
    }
    if (isNameColumn(c)) {
      return "name-cell text-cell";
    }
    if (isSpecialtyColumn(c)) {
      return "specialty-cell text-cell";
    }
    if (isBatchColumn(c)) {
      return "batch-cell text-cell";
    }

    const isNumeric = numericKeys.includes(c.key) || typeof val === "number";
    const isDate = isDateColumn(c);
    const isRef = isRefOrCodeColumn(c);

    return [
      isNumeric ? "num numeric-cell amount-cell financial-amount-cell" : "",
      isDate ? "date-cell" : "",
      isRef ? "ref-cell compact-cell" : "",
      !isNumeric && !isDate && !isRef ? "text-cell" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getReportRowClass = (row: any, index: number) => {
    const level = row?.summaryLevel;
    // إجمالي المتدرب السنوي له لون مميز خاص، ولا ينبغي أن تطغى عليه ألوان الملاحظات.
    if (level === "trainee-name-total") return "report-trainee-name-total-row";
    const noteClass = noteRowClass(row?.notes);
    if (noteClass) return noteClass;

    return [
      level === "opening" ? "report-opening-row" : "",
      level === "period" ? "report-period-row" : "",
      level === "fee" ? "report-fee-row" : "",
      level === "trainee-name-total" ? "report-trainee-name-total-row" : "",
      level === "month-total" ? "report-subtotal-row" : "",
      level === "year-total" ? "report-subtotal-row" : "",
      level === "total" || (row?.total === "نعم" && String(row?.description ?? row?.category ?? row?.item ?? "").includes("الإجمالي الكلي")) || row?.description === "الإجمالي الكلي" ? "report-grand-total-row" : "",
      row?.displayType === "تفصيلي" ? "trainee-detail-row" : "",
      row?.displayType && row?.displayType !== "تفصيلي" ? "trainee-summary-row" : "",
      index % 2 === 1 ? "report-row-striped" : "report-row-plain",
    ].filter(Boolean).join(" ");
  };

  const formatCellContent = (value: any, isNumeric: boolean) => {
    if (value === undefined || value === null || value === "") return "—";
    return isNumeric ? escapeHtml(fmt(Number(value) || 0)) : escapeHtml(value);
  };

  const buildReportDataRow = (row: Record<string, any>, index: number) => {
    const grandTotalLabel = String(row?.description ?? row?.category ?? row?.item ?? "").trim();
    const isGrandTotal = (row?.summaryLevel === "total" || row?.total === "نعم") && grandTotalLabel.includes("الإجمالي الكلي");
    const amountIndex = columns.findIndex((column) => column.key === "amount");

    if (isGrandTotal && amountIndex >= 0) {
      const amountColumn = columns[amountIndex];
      const trailingColSpan = columns.length - amountIndex - 1;
      const amountCellClass = getCellClass(amountColumn, row.amount);
      const rowClass = [
        getReportRowClass(row, index),
        tableClassName.includes("reports-custody-table") ? "reports-custody-grand-total-row" : "",
      ].filter(Boolean).join(" ");
      return `<tr class="${rowClass}">
        <td class="idx numeric-cell custody-grand-total-label-cell" data-col-key="description" colspan="${amountIndex + 1}">
          <span class="pdf-cell-text">${escapeHtml(grandTotalLabel)}</span>
        </td>
        <td class="${amountCellClass} custody-grand-total-amount-cell" data-col-key="amount" data-col-name="${escapeHtml(amountColumn.label)}">
          <span class="pdf-cell-text">${formatCellContent(row.amount, true)}</span>
        </td>
        ${trailingColSpan > 0 ? `<td class="custody-grand-total-spacer-cell" data-col-key="grand-total-spacer" colspan="${trailingColSpan}"><span class="pdf-cell-text"></span></td>` : ""}
      </tr>`;
    }

    return `<tr class="${getReportRowClass(row, index)}"><td class="idx numeric-cell" data-col-key="idx"><span class="pdf-cell-text">${
      row.summaryLevel === "opening" ? "—" : row.summaryLevel === "total" || row.total === "نعم" ? "★" : index + 1
    }</span></td>${columns
      .map((column) => {
        const value = row[column.key];
        const isNumeric = numericKeys.includes(column.key) || typeof value === "number";
        const classes = getCellClass(column, value);
        return `<td class="${classes}" data-col-key="${escapeHtml(column.key)}" data-col-name="${escapeHtml(
          column.label
        )}"><span class="pdf-cell-text">${formatCellContent(value, isNumeric)}</span></td>`;
      })
      .join("")}</tr>`;
  };

  const reportDateLabel =
    formatReportDate(reportDate) || new Date().toLocaleDateString("ar-EG-u-nu-latn");

  // تقارير العهد تعرض نطاق التاريخ ضمن العنوان؛ لا نكرر السطر المؤسسي أسفله.
  const isCustodyReport = /^مسير إخلاء\s*[-–—]\s*عهدة\s*[-–—]/.test(String(title || "").trim());
  const sub =
    subtitle ??
    `المجلس اليمني للاختصاصات الطبية - صعدة • تاريخ التقرير: ${reportDateLabel} • عدد السجلات: ${rows.length}`;

  const titleLines = String(title || "").split(/\r?\n/);
  const reportHeading = titleLines.shift() || "";
  const custodyDateLine = titleLines.join(" ").trim();
  const titleRow = `<tr class="doc-title-row"><td colspan="${columns.length + 1}" class="doc-title-cell">
    <h1>${escapeHtml(reportHeading)}</h1>
    ${isCustodyReport ? "" : `<div class="sub">${escapeHtml(sub)}</div>`}
  </td></tr>${isCustodyReport && custodyDateLine ? `<tr class="custody-date-row"><td colspan="${columns.length + 1}"><div class="custody-date-line">${escapeHtml(custodyDateLine)}</div></td></tr>` : ""}`;

  // بناء صف الرؤوس
  const head = `${titleRow}<tr><th class="idx numeric-cell" data-col-key="idx" data-col-name="م">م</th>${columns
    .map(
      (c) =>
        `<th class="${getCellClass(c)}" data-col-key="${escapeHtml(c.key)}" data-col-name="${escapeHtml(
          c.label
        )}"><span class="pdf-cell-text">${escapeHtml(c.label)}</span></th>`
    )
    .join("")}</tr>`;

  // احتساب الإجماليات
  const hasDetailRows = rows.some((r) => r?.summaryLevel === "detail");
  const hasFeeSummaryRows = rows.some((r) => r?.summaryLevel === "fee");
  const hasPeriodSummaryRows = rows.some((r) => r?.summaryLevel === "period");
  // في كشف المتدربين لا نجمع التفاصيل مع إجماليات الفترات والرسوم معاً.
  const dataRowsForTotals = rows.filter((r) => {
    if (!r || r.__summaryCard || r.summaryLevel === "summary-card") return false;
    if (
      r.summaryLevel === "total" ||
      r.summaryLevel === "opening" ||
      r.summaryLevel === "signature" ||
      r.total === "نعم"
    ) return false;
    if (hasDetailRows) return r.summaryLevel === "detail";
    if (hasFeeSummaryRows) return r.summaryLevel === "fee";
    if (hasPeriodSummaryRows) return r.summaryLevel === "period";
    return true;
  });
  const totals: Record<string, number> = {};
  columns.forEach((c) => {
    if (numericKeys.includes(c.key)) {
      totals[c.key] = dataRowsForTotals.reduce((sum, r) => sum + (Number(r[c.key]) || 0), 0);
    }
  });

  const totalRow = includeTotalRow ? `<tr class="total-row"><td class="idx numeric-cell">الإجمالي</td>${columns
    .map((c) =>
      numericKeys.includes(c.key)
        ? `<td class="num numeric-cell amount-cell" data-col-key="${escapeHtml(c.key)}"><span class="pdf-cell-text">${escapeHtml(
            fmt(totals[c.key] || 0)
          )}</span></td>`
        : `<td class="${isDateColumn(c) ? "date-cell" : ""}" data-col-key="${escapeHtml(c.key)}"><span class="pdf-cell-text"></span></td>`
    )
    .join("")}</tr>` : "";

  // بناء صفوف البيانات مع تجميع توقيعات تقريري العهد في كتلة واحدة
  const firstSignatureIndex = rows.findIndex((row) => row && row.summaryLevel === "signature");
  const body = rows
    .map((r, i) => {
      if (r && r.summaryLevel === "signature") {
        return i === firstSignatureIndex ? buildReportSignatureGroup(rows, columns) : "";
      }
      if (r && r.signature) {
        return buildSignatureBlockRow(r, columns);
      }

      if (r && (r.__summaryCard || r.summaryLevel === "summary-card")) {
        const cardIndex = Number(r.__summaryCard?.index ?? r.summaryCardIndex ?? 0) || 0;
        const label = String(r.__summaryCard?.label ?? r.description ?? "");
        const value = Number(r.__summaryCard?.value ?? r.credit ?? 0) || 0;
        const colorClass = `summary-card-${cardIndex % 3}`;

        const labelSpan = Math.max(1, columns.length - 1);
        const valueSpan = 2;

        return `<tr class="summary-card-row ${colorClass}">
          <td class="summary-label-cell" colspan="${labelSpan}">
            <span class="pdf-cell-text">${escapeHtml(label)}</span>
          </td>
          <td class="summary-value-cell" colspan="${Math.max(1, valueSpan)}">
            <span class="pdf-cell-text">${escapeHtml(fmt(value))}</span>
          </td>
        </tr>`;
      }

      return buildReportDataRow(r, i);
    })
    .join("");

  // إدراج فاصل قبل صفوف الملخص إن وُجدت
  const bodyWithSpacer = (() => {
    const hasSummary = rows.some((r) => r && (r.__summaryCard || r.summaryLevel === "summary-card"));
    if (!hasSummary) return body;

    const summaryIndex = rows.findIndex((r) => r && (r.__summaryCard || r.summaryLevel === "summary-card"));
    if (summaryIndex <= 0) return body;

    const spacerHtml = `<tr class="summary-spacer-row"><td colspan="${columns.length + 1}"></td></tr>`;
    const beforeRows = rows.slice(0, summaryIndex);
    const afterRows = rows.slice(summaryIndex);

    const buildRows = (arr: Record<string, any>[], startIndex: number) =>
      arr.map((r, i) => {
        const globalIndex = startIndex + i;

        if (r && r.summaryLevel === "signature") {
          return globalIndex === firstSignatureIndex ? buildReportSignatureGroup(rows, columns) : "";
        }
        if (r && r.signature) {
          return buildSignatureBlockRow(r, columns);
        }

        if (r && (r.__summaryCard || r.summaryLevel === "summary-card")) {
          const cardIndex = Number(r.__summaryCard?.index ?? r.summaryCardIndex ?? 0) || 0;
          const label = String(r.__summaryCard?.label ?? r.description ?? "");
          const value = Number(r.__summaryCard?.value ?? r.credit ?? 0) || 0;
          const colorClass = `summary-card-${cardIndex % 3}`;
          const labelSpan = Math.max(1, columns.length - 1);
          const valueSpan = 2;

          return `<tr class="summary-card-row ${colorClass}">
            <td class="summary-label-cell" colspan="${labelSpan}">
              <span class="pdf-cell-text">${escapeHtml(label)}</span>
            </td>
            <td class="summary-value-cell" colspan="${Math.max(1, valueSpan)}">
              <span class="pdf-cell-text">${escapeHtml(fmt(value))}</span>
            </td>
          </tr>`;
        }

        return buildReportDataRow(r, globalIndex);
      }).join("");

    return buildRows(beforeRows, 0) + spacerHtml + buildRows(afterRows, summaryIndex);
  })();

  // ضع الإجمالي بعد آخر حركة وقبل كتلة التوقيعات، وليس بعدها.
  const bodyWithTotal = includeTotalRow
    ? (bodyWithSpacer.includes('<tr class="signature-block-row')
        ? bodyWithSpacer.replace(/(?=<tr class="signature-block-row)/, totalRow)
        : bodyWithSpacer + totalRow)
    : bodyWithSpacer;

  return `<table class="reports-data-table ${escapeHtml(tableClassName)}"><thead>${head}</thead><tbody>${bodyWithTotal}</tbody></table>`;
}