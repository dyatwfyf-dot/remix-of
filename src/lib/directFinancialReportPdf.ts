import { jsPDF } from "jspdf";
import autoTable, { type CellHookData, type CellInput, type RowInput, type Styles } from "jspdf-autotable";
import { CAIRO_FONT_BASE64 } from "./cairo-font";

export type DirectReportPdfOptions = {
  title: string;
  html: string;
  fileName: string;
  orientation?: "portrait" | "landscape";
  pageSize?: "A4" | "A3";
  marginMm?: number;
  fontSize?: number;
  colored?: boolean;
};

type ReportRowInput = CellInput[] & { _reportRowClass?: string };

function normalizeArabic(doc: jsPDF, value: string): string {
  const processArabic = (doc as unknown as { processArabic?: (text: string) => string }).processArabic;
  return typeof processArabic === "function" ? processArabic.call(doc, value) : value;
}

function rowClass(data: CellHookData): string {
  const raw = data.row.raw as {
    nodeName?: string;
    className?: string;
    _reportRowClass?: string;
    getAttribute?: (name: string) => string | null;
  } | undefined;
  return raw?._reportRowClass ?? raw?.getAttribute?.("class") ?? raw?.className ?? "";
}

function cssColorToRgb(value: string): [number, number, number] | undefined {
  const color = value.trim();
  if (!color || color === "transparent") return undefined;

  const hex = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3
      ? hex[1].split("").map((part) => part + part).join("")
      : hex[1];
    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ];
  }

  const rgb = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!rgb) return undefined;
  if (rgb[4] !== undefined && Number(rgb[4]) === 0) return undefined;
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])].map((part) =>
    Math.max(0, Math.min(255, Math.round(part))),
  ) as [number, number, number];
}

/**
 * Convert the rendered report table into explicit AutoTable rows.
 * Passing a detached HTMLTableElement to AutoTable relies on browser style and
 * DOM parsing behaviour; explicit rows avoid empty exports on mobile WebViews
 * and preserve every cell's text and colspan/rowspan deterministically.
 */
function extractRows(
  doc: jsPDF,
  section: HTMLTableSectionElement | null,
): RowInput[] {
  if (!section) return [];

  return Array.from(section.rows).map((row) => {
    const cells = Array.from(row.cells).map((cell): CellInput => {
      const element = cell as HTMLElement;
      const renderedText = typeof element.innerText === "string"
        ? element.innerText
        : (element.textContent ?? "");
      const content = normalizeArabic(
        doc,
        renderedText
          .replace(/\u00a0/g, " ")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim(),
      );

      const styles: Partial<Styles> = {
        halign: "center",
        valign: "middle",
        lineColor: cssColorToRgb(element.style.borderColor) ?? [0, 0, 0],
      };
      const fillColor = cssColorToRgb(element.style.backgroundColor);
      const textColor = cssColorToRgb(element.style.color);
      if (fillColor) styles.fillColor = fillColor;
      if (textColor) styles.textColor = textColor;

      const weight = element.style.fontWeight.trim().toLowerCase();
      if (weight === "bold" || (Number.parseInt(weight, 10) >= 600)) {
        styles.fontStyle = "bold";
      } else if (element.style.fontStyle === "italic") {
        styles.fontStyle = "italic";
      }
      if (element.style.textAlign === "left" || element.style.textAlign === "right") {
        styles.halign = element.style.textAlign;
      }
      if (
        element.style.verticalAlign === "top" ||
        element.style.verticalAlign === "bottom"
      ) {
        styles.valign = element.style.verticalAlign;
      }

      const input: {
        content: string;
        colSpan?: number;
        rowSpan?: number;
        styles: Partial<Styles>;
      } = { content, styles };
      if (cell.colSpan > 1) input.colSpan = cell.colSpan;
      if (cell.rowSpan > 1) input.rowSpan = cell.rowSpan;
      return input;
    }) as ReportRowInput;

    cells._reportRowClass = row.className;
    return cells;
  });
}

export async function exportFinancialReportPdf(options: DirectReportPdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: options.orientation ?? "portrait",
    unit: "mm",
    format: options.pageSize ?? "A4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Embed the repository's locally bundled Cairo subset directly in the PDF.
  // This keeps the generated document independent of network font requests.
  doc.addFileToVFS("CairoSubset.ttf", CAIRO_FONT_BASE64);
  doc.addFont("CairoSubset.ttf", "CairoSubset", "normal");
  doc.addFont("CairoSubset.ttf", "CairoSubset", "bold");
  doc.setFont("CairoSubset", "normal");
  doc.setR2L(true);

  const parsed = new DOMParser().parseFromString(options.html, "text/html");
  const table = (parsed.querySelector("table.reports-data-table") ?? parsed.querySelector("table")) as HTMLTableElement | null;
  if (!table) throw new Error("لم يتم العثور على جدول التقرير المطلوب تصديره");

  const headRows = extractRows(doc, table.tHead);
  const bodyRows = Array.from(table.tBodies).flatMap((section) => extractRows(doc, section));
  const footRows = extractRows(doc, table.tFoot);
  const sourceBodyRows = Array.from(table.tBodies).flatMap((section) => Array.from(section.rows));
  const hasBodyContent = sourceBodyRows.some((row) => Boolean(row.textContent?.trim()));
  if (bodyRows.length === 0 || !hasBodyContent) {
    throw new Error("لم يعثر محرك PDF على صفوف بيانات التقرير؛ أُوقف إنشاء ملف فارغ.");
  }

  const margin = Math.max(3, Math.min(15, options.marginMm ?? 5));
  const fontSize = Math.max(7, Math.min(16, options.fontSize ?? 11));
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  const titleText = options.title.split("\n")[0]?.trim() || "التقرير المالي";

  doc.setFont("CairoSubset", "normal");
  doc.setFontSize(15);
  doc.setTextColor(15, 35, 55);
  doc.text(normalizeArabic(doc, titleText), pageWidth / 2, margin + 3, {
    align: "center",
    maxWidth: usableWidth,
  });

  const subtitle = options.title.split("\n").slice(1).join(" ").trim();
  let tableStartY = margin + 10;
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(65, 75, 85);
    doc.text(normalizeArabic(doc, subtitle), pageWidth / 2, tableStartY, {
      align: "center",
      maxWidth: usableWidth,
    });
    tableStartY += 5;
  }

  autoTable(doc, {
    head: headRows,
    body: bodyRows,
    foot: footRows,
    startY: tableStartY,
    margin: { top: margin, right: margin, bottom: margin + 8, left: margin },
    tableWidth: "auto",
    theme: "grid",
    styles: {
      font: "CairoSubset",
      fontStyle: "normal",
      fontSize,
      cellPadding: 1.7,
      halign: "center",
      valign: "middle",
      lineColor: [0, 0, 0],
      lineWidth: 0.18,
      overflow: "linebreak",
      cellWidth: "wrap",
      textColor: [15, 15, 15],
    },
    headStyles: {
      fillColor: options.colored === false ? [235, 235, 235] : [238, 197, 70],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    showHead: "everyPage",
    rowPageBreak: "avoid",
    didParseCell: (data: CellHookData) => {
      const classes = new Set(rowClass(data).split(/\s+/).filter(Boolean));
      const isTotal = classes.has("total-row") || classes.has("report-grand-total-row");
      const isTitle = classes.has("reports-custody-title-row");
      const isDate = classes.has("reports-custody-date-row");
      const isSignature = classes.has("signature-block-row");
      const isSpacer = classes.has("signature-spacer-row");

      if (isTotal) {
        data.cell.styles.fillColor = options.colored === false ? [225, 225, 225] : [8, 113, 206];
        data.cell.styles.textColor = options.colored === false ? [0, 0, 0] : [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
      } else if (isTitle) {
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.lineWidth = 0;
        data.cell.styles.fontSize = fontSize + 2;
        data.cell.styles.fontStyle = "bold";
      } else if (isDate) {
        data.cell.styles.fillColor = options.colored === false ? [245, 245, 245] : [255, 244, 204];
        data.cell.styles.textColor = [65, 48, 10];
        data.cell.styles.fontStyle = "bold";
      } else if (isSignature) {
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.lineWidth = 0;
        data.cell.styles.minCellHeight = 17;
      } else if (isSpacer) {
        data.cell.text = [""];
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.lineWidth = 0;
        data.cell.styles.minCellHeight = 3;
      } else if (data.section === "head") {
        data.cell.styles.fillColor = options.colored === false ? [235, 235, 235] : [238, 197, 70];
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const lastTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  if (!lastTable || !Number.isFinite(lastTable.finalY) || (lastTable.finalY ?? 0) <= tableStartY) {
    throw new Error("لم يرسم محرك PDF جدول التقرير؛ أُوقف حفظ ملف فارغ.");
  }

  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("CairoSubset", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(
      normalizeArabic(doc, `صفحة ${page} من ${totalPages}`),
      pageWidth / 2,
      pageHeight - 4,
      { align: "center" },
    );
  }

  doc.save(options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}
