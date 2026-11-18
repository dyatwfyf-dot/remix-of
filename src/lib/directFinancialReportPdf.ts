import { jsPDF } from "jspdf";
import autoTable, { type CellHookData } from "jspdf-autotable";

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

let arabicFontPromise: Promise<string> | null = null;

async function loadArabicFontBase64(): Promise<string> {
  if (!arabicFontPromise) {
    arabicFontPromise = fetch("/NotoSansArabic-Regular.ttf", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("تعذر تحميل خط Noto Sans Arabic");
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const chunkSize = 0x8000;
        for (let offset = 0; offset < bytes.length; offset += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
        }
        return btoa(binary);
      })
      .catch((error) => {
        arabicFontPromise = null;
        throw error;
      });
  }
  return arabicFontPromise;
}

function normalizeArabic(doc: jsPDF, value: string): string {
  const processArabic = (doc as unknown as { processArabic?: (text: string) => string }).processArabic;
  return typeof processArabic === "function" ? processArabic.call(doc, value) : value;
}

function rowClass(data: CellHookData): string {
  const raw = data.row.raw as { nodeName?: string; getAttribute?: (name: string) => string | null } | undefined;
  return raw?.getAttribute?.("class") ?? "";
}

export async function exportFinancialReportPdf(options: DirectReportPdfOptions): Promise<void> {
  const fontBase64 = await loadArabicFontBase64();
  const doc = new jsPDF({
    orientation: options.orientation ?? "portrait",
    unit: "mm",
    format: options.pageSize ?? "A4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  doc.addFileToVFS("NotoSansArabic-Regular.ttf", fontBase64);
  doc.addFont("NotoSansArabic-Regular.ttf", "NotoArabic", "normal");
  doc.setFont("NotoArabic", "normal");
  doc.setR2L(true);

  const parsed = new DOMParser().parseFromString(options.html, "text/html");
  const table = parsed.querySelector("table.reports-data-table") ?? parsed.querySelector("table");
  if (!table) throw new Error("لم يتم العثور على جدول التقرير المطلوب تصديره");

  const margin = Math.max(3, Math.min(15, options.marginMm ?? 5));
  const fontSize = Math.max(7, Math.min(16, options.fontSize ?? 11));
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  const titleText = options.title.split("\n")[0]?.trim() || "التقرير المالي";

  doc.setFont("NotoArabic", "normal");
  doc.setFontSize(15);
  doc.setTextColor(15, 35, 55);
  doc.text(normalizeArabic(doc, titleText), pageWidth / 2, margin + 3, { align: "center", maxWidth: usableWidth });

  const subtitle = options.title.split("\n").slice(1).join(" ").trim();
  let tableStartY = margin + 10;
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(65, 75, 85);
    doc.text(normalizeArabic(doc, subtitle), pageWidth / 2, tableStartY, { align: "center", maxWidth: usableWidth });
    tableStartY += 5;
  }

  const tableOptions = {
    html: table as HTMLTableElement,
    startY: tableStartY,
    margin: { top: margin, right: margin, bottom: margin + 8, left: margin },
    tableWidth: "auto" as const,
    theme: "grid" as const,
    styles: {
      font: "NotoArabic",
      fontStyle: "normal" as const,
      fontSize,
      cellPadding: 1.7,
      halign: "center" as const,
      valign: "middle" as const,
      lineColor: [0, 0, 0] as [number, number, number],
      lineWidth: 0.18,
      overflow: "linebreak" as const,
      cellWidth: "wrap" as const,
      textColor: [15, 15, 15] as [number, number, number],
    },
    headStyles: {
      fillColor: options.colored === false ? [235, 235, 235] : [238, 197, 70],
      textColor: [0, 0, 0],
      fontStyle: "normal" as const,
      halign: "center" as const,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    showHead: "everyPage" as const,
    rowPageBreak: "avoid" as const,
    didParseCell: (data: CellHookData) => {
      const cls = rowClass(data);
      const isTotal = /(^|\\s)(total-row|report-grand-total-row)(\\s|$)/.test(cls);
      const isTitle = /reports-custody-title-row/.test(cls);
      const isDate = /reports-custody-date-row/.test(cls);
      const isSignature = /signature-block-row/.test(cls);
      const isSpacer = /signature-spacer-row/.test(cls);

      data.cell.text = data.cell.text.map((text) => normalizeArabic(doc, String(text)));
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
      }
      if (data.section === "head" && !isTitle && !isDate) {
        data.cell.styles.fillColor = options.colored === false ? [235, 235, 235] : [238, 197, 70];
        data.cell.styles.textColor = [0, 0, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("NotoArabic", "normal");
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.text(
        normalizeArabic(doc, `صفحة ${pageCount} من ${pageCount}`),
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" },
      );
    },
  };

  autoTable(doc, tableOptions);
  doc.save(options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}
