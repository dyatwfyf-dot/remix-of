import { useState } from "react";
import {
  addReportHeader,
  appendRows,
  createExcelWorkbook,
  downloadWorkbook,
  formatWorksheet,
  getExcelPalette,
  loadReportLetterhead,
} from "@/lib/excelExport";
import { Printer, FileSpreadsheet, Trash2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useReportDate } from "@/lib/reportDate";
import { buildTableHtml } from "@/lib/printTableHtml";
import { reportDocumentCss } from "@/lib/reportPdf";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import WebActionMenu, { type WebActionItem } from "@/components/WebActionMenu";

export type TabCol = { key: string;label: string };

export const greenPrintHeaderCss = `
  #tableContainer table thead th,
  #tableContainer table thead th.desc-cell,
  #tableContainer table thead th[data-col-key="description"] {
    background: #14532d !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #tableContainer table thead th .pdf-cell-text {
    color: #ffffff !important;
    background: transparent !important;
  }
`;

type Props = {
  title: string;
  rows: Record < string,
  any > [];
  columns: TabCol[];
  /** أعمدة مخصصة للطباعة وPDF فقط مع إبقاء أعمدة Excel كما هي */
  printColumns?: TabCol[];
  fileName: string;
  onClear ? : () => void;
  numericKeys ? : string[];
  className ? : string;
  printLabel ? : string;
  pdfLayout ? : "default" | "wide-centered";
  pdfOrientation ? : string;
  pdfMarginMm ? : number;
  pdfCss ? : string;
  includeTotalRow?: boolean;
  additionalWebActions ? : WebActionItem[];
  webClassName ? : string;
};

export default function TabActions({
  title,
  rows,
  columns,
  printColumns = columns,
  fileName,
  onClear,
  numericKeys = [],
  className = "",
  printLabel = "طباعة",
  pdfOrientation,
  pdfMarginMm,
  pdfCss,
  includeTotalRow = true,
  additionalWebActions = [],
  webClassName = "",
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const { reportDate, reportDateLabel } = useReportDate();
  
  // توليد كود الـ HTML الخاص بالجدول
  const tableHtml = () => buildTableHtml({ title, columns: printColumns, rows, numericKeys, reportDate, includeTotalRow });
  
  const handlePrint = () => {
    if (!rows.length) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }
    
    // تحديد الاتجاه الافتراضي بناءً على عدد الأعمدة أو خيار التبويب
    const defaultOrientation: "portrait" | "landscape" =
      pdfOrientation === "portrait" ? "portrait" : pdfOrientation === "landscape" || printColumns.length > 7 ? "landscape" : "portrait";
    
    const opened = openBrowserPrintPreview({
      title,
      reportDateLabel,
      tableHtml: tableHtml(),
      contentCss: pdfCss ? `${reportDocumentCss}\n${pdfCss}` : reportDocumentCss,
      defaultOrientation,
      defaultPageSize: "A4",
      ...(pdfMarginMm === undefined ? {} : { defaultMarginMm: pdfMarginMm }),
    });
    
    if (!opened) {
      toast.error("تم منع فتح نافذة المتصفح، يرجى السماح بالنوافذ المنبثقة (Popups) في كروم");
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!rows.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const orientation: "portrait" | "landscape" =
        pdfOrientation === "portrait" ? "portrait" : pdfOrientation === "landscape" || printColumns.length > 7 ? "landscape" : "portrait";
      const opened = openBrowserPrintPreview({
        title,
        reportDateLabel,
        tableHtml: tableHtml(),
        contentCss: pdfCss ? `${reportDocumentCss}\n${pdfCss}` : reportDocumentCss,
        defaultOrientation: orientation,
        defaultPageSize: "A4",
        ...(pdfMarginMm === undefined ? {} : { defaultMarginMm: pdfMarginMm }),
        autoDownloadPdf: true,
        downloadFileName: `${fileName}-${reportDate || new Date().toISOString().slice(0, 10)}.pdf`,
      });
      if (!opened) {
        toast.error("تعذر فتح معاينة التقرير؛ اسمح بالنوافذ المنبثقة ثم أعد المحاولة");
        return;
      }
      toast.success("تم فتح المعاينة ويجري تنزيل PDF بالإعدادات نفسها");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("تعذّر تنزيل ملف PDF، حاول مرة أخرى");
    } finally {
      setPdfBusy(false);
    }
  };
  
  const handleExcel = async () => {
    const excelRows = rows.filter((r) => r?.summaryLevel !== "summary-card");
    if (!excelRows.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    
    try {
      const headers = ["م", ...columns.map((c) => c.label)];
      const dataRows = excelRows.map((r, i) => [
        i + 1,
        ...columns.map((c) => {
          const v = r[c.key];
          return numericKeys.includes(c.key) || typeof v === "number" ? Number(v) || 0 : v ?? "";
        }),
      ]);
      const totalRow = [
        "الإجمالي",
        ...columns.map((c) =>
          numericKeys.includes(c.key) ?
          excelRows.reduce((sum, r) => sum + (Number(r[c.key]) || 0), 0) :
          "",
        ),
      ];
      
      const workbook = await createExcelWorkbook();
      const worksheet = workbook.addWorksheet(title.slice(0, 31) || "Sheet1");
      const imageId = await loadReportLetterhead(workbook);
      const dataStartRow = addReportHeader(
        workbook,
        worksheet,
        {
          title,
          reportDateLabel,
          recordCount: excelRows.length,
          totalColumns: headers.length,
          palette: getExcelPalette(title),
        },
        imageId
      );
      
      appendRows(worksheet, [headers, ...dataRows, totalRow], dataStartRow);
      formatWorksheet(worksheet, {
        headerRow: dataStartRow,
        totalRows: [dataStartRow + dataRows.length + 1],
        palette: getExcelPalette(title),
      });
      await downloadWorkbook(workbook, `${fileName}-${reportDate}.xlsx`);
      toast.success("تم تصدير الملف بنجاح");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("تعذّر تصدير ملف Excel، حاول مرة أخرى");
    }
  };
  
  const handleClear = () => {
    if (!onClear) return;
    if (!confirm(`هل أنت متأكد من مسح جميع بيانات: ${title}؟ لا يمكن التراجع.`)) return;
    onClear();
    toast.success("تم مسح البيانات");
  };
  
  const webActions: WebActionItem[] = [
    ...additionalWebActions,
    { label: printLabel, icon: Printer, onSelect: handlePrint },
    {
      label: pdfBusy ? "جارٍ التحضير…" : "تنزيل PDF",
      icon: pdfBusy ? Loader2 : Download,
      onSelect: handleDownloadPdf,
      disabled: pdfBusy,
    },
    { label: "تصدير Excel", icon: FileSpreadsheet, onSelect: handleExcel },
    ...(onClear ? [{ label: "مسح البيانات", icon: Trash2, onSelect: handleClear, destructive: true }] : []),
  ];
  
  return (
    <>
      <div className={`web-only-actions ${webClassName}`}>
        <WebActionMenu label={`إجراءات ${title}`} actions={webActions} className="w-full sm:w-auto" />
      </div>

      <div className={`apk-only-actions flex flex-wrap gap-2 ${className}`}>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#10528e] border border-[#10528e]/30 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
          title="معاينة وطباعة هذا التبويب في نافذة كروم"
        >
          <Printer className="w-4 h-4" /> {printLabel}
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={pdfBusy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10528e] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[#0d4272] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          title="تنزيل PDF بنفس تنسيق الطباعة"
        >
          {pdfBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحضير…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> تنزيل PDF
            </>
          )}
        </button>

        <button
          onClick={handleExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
          title="تصدير إلى Excel"
        >
          <FileSpreadsheet className="w-4 h-4" /> تصدير Excel
        </button>

        {onClear && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
            title="مسح بيانات هذا التبويب"
          >
            <Trash2 className="w-4 h-4" /> مسح البيانات
          </button>
        )}
      </div>
    </>
  );
}
