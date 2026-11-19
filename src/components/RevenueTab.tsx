import { Fragment, useCallback, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/format";
import schema from "@/data/revenueTemplate.json";
import { exportRevenueStatement } from "@/lib/exportImport";
import { revenuePdf } from "@/lib/exportPdf";
import { useReportDate } from "@/lib/reportDate";

// استيراد الأيقونات لإضفاء لمسة بصرية حديثة متناسقة مع الهوية الجديدة
import { Calendar, FileSpreadsheet, FileText, LayoutGrid, DollarSign, Printer } from "lucide-react";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import WebActionMenu from "@/components/WebActionMenu";

const MONTH_NAMES = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

type Type = { no: number; title: string };
type Item = { no: number; title: string; types: Type[] };
type Section = { no: number; title: string; items: Item[] };
type Chapter = { no: number; title: string; longTitle?: string; sections: Section[] };

const SCHEMA = schema as { title: string; office: string; chapters: Chapter[] };

// توليد مفتاح التخزين المركب: ch{c}-sec{s}-it{i}-typ{t}
export function typeKey(c: number, s: number, i: number, t: number) {
  return `${c}-${s}-${i}-${t}`;
}

export default function RevenueTab() {
  // 1. استخراج حالة الإيرادات ودالة التحديث من مخزن زوستاند (Zustand Store)
  // اشترك في حقول الإيرادات المطلوبة فقط، بدلاً من الاشتراك في المخزن بالكامل.
  // هذا يمنع إعادة حساب وعرض جدول الإيرادات عند تغيّر بيانات تبويبات أخرى.
  const revenue = useStore((state) => state.revenue);
  const setRevenue = useStore((state) => state.setRevenue);
  const clearTab = useStore((state) => state.clearTab);
  const { reportDate } = useReportDate();

  // 2. إدارة حالة التاريخ المحاسبي الحالي
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // دالة مساعدة لجلب المبالغ بأمان من المخزن وتفادي القيم غير المعرفة (Undefined)
  const get = useCallback(
    (y: number, m: number, key: string) => revenue[`${y}-${m}-${key}`] || 0,
    [revenue],
  );

  // دالة تنسيق أرقام الترقيم باللغة الإنجليزية.
  const codeNum = (n: number) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

  // 3. عمليات الحسابات التجميعية الفورية (Aggregations) المحسنة بالأداء عبر useMemo
  const data = useMemo(() => {
    // حساب مبالغ الأشهر السابقة التراكمية
    const sumPrev = (key: string) => {
      let s = 0;
      for (let m = 1; m < month; m++) s += get(year, m, key);
      return s;
    };

    const types: Record<string, { cur: number; prev: number; tot: number }> = {};
    SCHEMA.chapters.forEach((ch) =>
      ch.sections.forEach((sec) =>
        sec.items.forEach((it) =>
          it.types.forEach((t) => {
            const k = typeKey(ch.no, sec.no, it.no, t.no);
            const cur = get(year, month, k);
            const prev = sumPrev(k);
            types[k] = { cur, prev, tot: cur + prev };
          }),
        ),
      ),
    );

    const itemsAgg: Record<string, { cur: number; prev: number; tot: number }> = {};
    const sectionsAgg: Record<string, { cur: number; prev: number; tot: number }> = {};
    const chaptersAgg: Record<string, { cur: number; prev: number; tot: number }> = {};
    let grandCur = 0,
      grandPrev = 0;

    SCHEMA.chapters.forEach((ch) => {
      let cCur = 0,
        cPrev = 0;
      ch.sections.forEach((sec) => {
        let sCur = 0,
          sPrev = 0;
        sec.items.forEach((it) => {
          let iCur = 0,
            iPrev = 0;
          it.types.forEach((t) => {
            const v = types[typeKey(ch.no, sec.no, it.no, t.no)];
            iCur += v.cur;
            iPrev += v.prev;
          });
          itemsAgg[`${codeNum(ch.no)}-${codeNum(sec.no)}-${codeNum(it.no)}`] = { cur: iCur, prev: iPrev, tot: iCur + iPrev };
          sCur += iCur;
          sPrev += iPrev;
        });
        sectionsAgg[`${ch.no}-${sec.no}`] = { cur: sCur, prev: sPrev, tot: sCur + sPrev };
        cCur += sCur;
        cPrev += sPrev;
      });
      chaptersAgg[`${ch.no}`] = { cur: cCur, prev: cPrev, tot: cCur + cPrev };
      grandCur += cCur;
      grandPrev += cPrev;
    });

    return { types, itemsAgg, sectionsAgg, chaptersAgg, grandCur, grandPrev };
  }, [get, year, month]);

  // دالة تنسيق عرض الأرقام المالية مع استبدال الصفر بشرطة مقروءة محاسبياً
  const cellNum = (n: number) => (n ? fmt(n) : "-");

  const printRevenue = () => {
    const source = document.getElementById("revenue-report-content");
    if (!source) return;
    const printContent = source.cloneNode(true) as HTMLElement;
    const sourceRows = Array.from(source.querySelectorAll("tr"));
    const printRows = Array.from(printContent.querySelectorAll("tr"));
    const visualProperties = [
      "background-color", "background-image", "color", "border-top-color", "border-right-color",
      "border-bottom-color", "border-left-color", "border-top-width", "border-right-width",
      "border-bottom-width", "border-left-width", "border-top-style", "border-right-style",
      "border-bottom-style", "border-left-style", "font-family", "font-size", "font-weight",
      "font-style", "line-height", "text-align", "vertical-align", "padding-top", "padding-right",
      "padding-bottom", "padding-left", "white-space", "word-break", "overflow-wrap", "border-radius",
    ];
    const sourceElements = [source, ...Array.from(source.querySelectorAll<HTMLElement>("*"))];
    const targetElements = [printContent, ...Array.from(printContent.querySelectorAll<HTMLElement>("*"))];
    sourceElements.forEach((sourceElement, index) => {
      const targetElement = targetElements[index];
      if (!targetElement) return;
      const computed = window.getComputedStyle(sourceElement);
      visualProperties.forEach((property) => {
        const value = computed.getPropertyValue(property);
        if (value) targetElement.style.setProperty(property, value, "important");
      });
      targetElement.style.setProperty("-webkit-print-color-adjust", "exact", "important");
      targetElement.style.setProperty("print-color-adjust", "exact", "important");
    });
    const printHeading = printContent.querySelector<HTMLElement>(".revenue-report-heading");
    if (printHeading) {
      ["background", "background-image", "background-color", "border", "border-radius", "box-shadow"].forEach((property) =>
        printHeading.style.setProperty(property, "none", "important"),
      );
      printHeading.style.setProperty("display", "block", "important");
      printHeading.style.setProperty("width", "100%", "important");
      printHeading.style.setProperty("margin", "0 auto 4mm", "important");
      printHeading.style.setProperty("padding", "2mm 0", "important");
      printHeading.style.setProperty("text-align", "center", "important");
      printHeading.style.setProperty("color", "#142b3d", "important");
      printHeading.style.setProperty("page-break-after", "avoid", "important");
      printHeading.querySelectorAll<HTMLElement>("*").forEach((child) => {
        child.style.setProperty("background", "#fff", "important");
        child.style.setProperty("background-image", "none", "important");
        child.style.setProperty("color", "#334b5e", "important");
        child.style.setProperty("border", "0", "important");
        child.style.setProperty("box-shadow", "none", "important");
        child.style.setProperty("text-align", "center", "important");
      });
      const heading = printHeading.querySelector<HTMLElement>("h2");
      if (heading) {
        heading.style.setProperty("color", "#142b3d", "important");
        heading.style.setProperty("font-size", "18px", "important");
        heading.style.setProperty("font-weight", "900", "important");
      }
      printHeading.querySelectorAll<HTMLElement>('[aria-hidden="true"]').forEach((decoration) => decoration.remove());
      const headingLayout = printHeading.querySelector<HTMLElement>(".revenue-heading-layout");
      if (headingLayout) {
        headingLayout.style.setProperty("display", "flex", "important");
        headingLayout.style.setProperty("flex-wrap", "wrap", "important");
        headingLayout.style.setProperty("align-items", "center", "important");
        headingLayout.style.setProperty("justify-content", "space-between", "important");
        headingLayout.style.setProperty("gap", "3px 14px", "important");
      }
      const headingMain = printHeading.querySelector<HTMLElement>(".revenue-heading-main");
      if (headingMain) {
        headingMain.style.setProperty("display", "flex", "important");
        headingMain.style.setProperty("flex-wrap", "wrap", "important");
        headingMain.style.setProperty("align-items", "center", "important");
        headingMain.style.setProperty("gap", "3px 10px", "important");
        if (headingMain.firstElementChild) headingMain.firstElementChild.remove();
      }
      const headingCopy = printHeading.querySelector<HTMLElement>(".revenue-heading-copy");
      if (headingCopy) {
        headingCopy.style.setProperty("display", "flex", "important");
        headingCopy.style.setProperty("flex-wrap", "wrap", "important");
        headingCopy.style.setProperty("align-items", "baseline", "important");
        headingCopy.style.setProperty("gap", "2px 10px", "important");
        headingCopy.querySelectorAll<HTMLElement>("p").forEach((paragraph) => paragraph.style.setProperty("margin", "0", "important"));
      }
      const headingMeta = printHeading.querySelector<HTMLElement>(".revenue-heading-meta");
      if (headingMeta) {
        headingMeta.style.setProperty("display", "flex", "important");
        headingMeta.style.setProperty("flex-wrap", "wrap", "important");
        headingMeta.style.setProperty("align-items", "center", "important");
        headingMeta.style.setProperty("gap", "3px 8px", "important");
      }
      printHeading.querySelectorAll("svg").forEach((icon) => icon.remove());
    }
    sourceRows.forEach((sourceRow, rowIndex) => {
      const targetRow = printRows[rowIndex];
      if (!targetRow) return;
      const rowStyle = window.getComputedStyle(sourceRow);
      Array.from(sourceRow.cells).forEach((sourceCell, cellIndex) => {
        const targetCell = targetRow.cells[cellIndex];
        if (!targetCell) return;
        const cellStyle = window.getComputedStyle(sourceCell);
        if (cellStyle.backgroundColor === "rgba(0, 0, 0, 0)" && rowStyle.backgroundColor !== "rgba(0, 0, 0, 0)") {
          targetCell.style.setProperty("background-color", rowStyle.backgroundColor, "important");
        }
        targetCell.style.setProperty("font-family", "Cairo, Tahoma, Arial, sans-serif", "important");
        if (!targetCell.classList.contains("numeric-cell")) {
          targetCell.style.setProperty("white-space", "normal", "important");
          targetCell.style.setProperty("overflow-wrap", "break-word", "important");
          targetCell.style.setProperty("word-break", "normal", "important");
          targetCell.style.setProperty("line-height", "1.5", "important");
          targetCell.style.setProperty("vertical-align", "middle", "important");
        }
      });
    });
    const title = "كشف الإيرادات - " + MONTH_NAMES[month - 1] + " - " + year;
    const css = '@page { size: A4 landscape; margin: 5mm; }' +
      '* { box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }' +
      'html,body { margin:0; padding:0; direction:rtl; color:#000; font-family:Cairo,Arial,sans-serif; }' +
      '#revenue-print { width:100%; }' +
      '#revenue-print .revenue-report-heading { display:block !important; width:100% !important; margin:0 auto 3mm !important; padding:1.5mm 0 !important; border:0 !important; border-bottom:1.5px solid #334b5e !important; border-radius:0 !important; background:#fff !important; color:#142b3d !important; text-align:right !important; page-break-after:avoid !important; box-shadow:none !important; font-family:Cairo,Tahoma,Arial,sans-serif !important; }' +
      '#revenue-print .revenue-heading-layout { display:flex !important; flex-wrap:wrap !important; align-items:center !important; justify-content:space-between !important; gap:2px 12px !important; }' +
      '#revenue-print .revenue-heading-main { display:flex !important; flex-wrap:wrap !important; align-items:center !important; gap:2px 8px !important; }' +
      '#revenue-print .revenue-heading-copy { display:flex !important; flex-wrap:wrap !important; align-items:baseline !important; gap:2px 9px !important; }' +
      '#revenue-print .revenue-heading-copy p { margin:0 !important; color:#334b5e !important; font-size:11px !important; font-weight:800 !important; }' +
      '#revenue-print .revenue-report-heading h2 { margin:0 !important; color:#142b3d !important; font-size:17px !important; line-height:1.4 !important; font-weight:900 !important; }' +
      '#revenue-print .revenue-heading-meta { display:flex !important; flex-wrap:wrap !important; align-items:center !important; gap:2px 8px !important; }' +
      '#revenue-print .revenue-heading-meta > div { padding:0 !important; border:0 !important; background:#fff !important; color:#334b5e !important; box-shadow:none !important; font-size:10px !important; }' +
      '#revenue-print .revenue-report-heading svg { display:none !important; }' +
      '#revenue-print .overflow-auto,#revenue-print .overflow-x-auto { overflow:visible !important; max-height:none !important; }' +
      '#revenue-print .sticky { position:static !important; }' +
      '#revenue-print table { width:100% !important; min-width:0 !important; table-layout:fixed !important; border-collapse:collapse !important; font-family:Cairo,Tahoma,Arial,sans-serif !important; }' +
      '#revenue-print table col.revenue-resource-col { width:24% !important; }' +
      '#revenue-print table col.revenue-code-col { width:7% !important; }' +
      '#revenue-print table col.revenue-value-col { width:8% !important; }' +
      '#revenue-print table th,#revenue-print table td,#revenue-print table input { font-family:Cairo,Tahoma,Arial,sans-serif !important; }' +
      '#revenue-print table td:first-child { text-align:right !important; padding-right:6px !important; line-height:1.5 !important; }' +
      '#revenue-print th:nth-child(2),#revenue-print th:nth-child(3),#revenue-print th:nth-child(4),#revenue-print th:nth-child(5),#revenue-print td.numeric-cell { direction:ltr !important; font-variant-numeric:tabular-nums !important; }' +
      '#revenue-print td:first-child { white-space:normal !important; overflow-wrap:break-word !important; word-break:normal !important; font-weight:800 !important; }' +
      '#revenue-print th,#revenue-print td { border:1px solid #000 !important; text-align:center !important; vertical-align:middle !important; padding:4px 3px !important; font-size:10px !important; line-height:1.4 !important; }' +
      '#revenue-print th { white-space:normal !important; overflow-wrap:break-word !important; word-break:normal !important; font-weight:900 !important; }' +
      '#revenue-print td { white-space:normal !important; overflow-wrap:break-word !important; word-break:normal !important; font-weight:700 !important; }' +
      '#revenue-print td.numeric-cell { white-space:nowrap !important; overflow-wrap:normal !important; word-break:keep-all !important; }' +
      '#revenue-print .numeric-cell { direction:ltr; font-variant-numeric:tabular-nums; }' +
      '#revenue-print input { width:100% !important; min-width:0 !important; border:0 !important; background:transparent !important; color:inherit !important; font:inherit !important; text-align:center !important; }' +
      '#revenue-print .shadow,#revenue-print .shadow-sm,#revenue-print .shadow-xl { box-shadow:none !important; }' +
      '@media print { #revenue-print table { page-break-inside:auto; } #revenue-print thead { display:table-header-group; } #revenue-print tr { page-break-inside:avoid; } }';
    const html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + title + '</title><style>' + css + '</style></head><body><div id="revenue-print">' + printContent.innerHTML + '</div></body></html>';
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const opened = openBrowserPrintPreview({
      title,
      reportDateLabel: String(reportDate),
      tableHtml: parsed.body.innerHTML,
      contentCss: css,
      defaultOrientation: "landscape",
      defaultPageSize: "A4",
      defaultMarginMm: 5,
    });
    if (!opened) alert("تم منع فتح نافذة معاينة الطباعة، يرجى السماح بالنوافذ المنبثقة");
  };

  return (
    // الحاوية الخارجية: فرض الاتجاه العربي العام وضمان التباعد العمودي
    <div className="mizan-revenue-tab sheet-tabs-ui w-full space-y-3 p-1.5 text-center sm:space-y-5 sm:p-3" dir="rtl">
      <style>{`
        .mizan-revenue-tab .revenue-main-table,
        .mizan-revenue-tab .revenue-main-table th,
        .mizan-revenue-tab .revenue-main-table td,
        .mizan-revenue-tab .revenue-main-table input { font-family:Cairo,Tahoma,Arial,sans-serif !important; }
        .mizan-revenue-tab .revenue-main-table { width:100%; min-width:1120px; table-layout:fixed; }
        .mizan-revenue-tab .revenue-main-table col.revenue-resource-col { width:24%; }
        .mizan-revenue-tab .revenue-main-table col.revenue-code-col { width:7%; }
        .mizan-revenue-tab .revenue-main-table col.revenue-value-col { width:8%; }
        .mizan-revenue-tab .revenue-main-table td:first-child { text-align:right !important; white-space:normal !important; overflow-wrap:break-word !important; word-break:normal !important; line-height:1.55 !important; padding:7px 9px !important; }
        .mizan-revenue-tab .revenue-main-table .revenue-chapter-name { white-space:normal !important; line-height:1.5 !important; }
        .mizan-revenue-tab .revenue-main-table th { font-family:Cairo,Tahoma,Arial,sans-serif !important; font-weight:900 !important; line-height:1.4 !important; }
        .mizan-revenue-tab .revenue-report-heading { font-family:Cairo,Tahoma,Arial,sans-serif; }
        .mizan-revenue-tab .revenue-heading-layout { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px 18px; }
        .mizan-revenue-tab .revenue-heading-main { display:flex; flex-wrap:wrap; align-items:center; gap:8px 14px; min-width:0; }
        .mizan-revenue-tab .revenue-heading-copy { display:flex; flex-wrap:wrap; align-items:baseline; gap:3px 12px; min-width:0; }
        .mizan-revenue-tab .revenue-heading-copy p { margin:0 !important; }
        .mizan-revenue-tab .revenue-heading-meta { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
        @media (max-width:640px) {
          .mizan-revenue-tab .revenue-main-table { min-width:1120px; }
          .mizan-revenue-tab .revenue-main-table td:first-child { padding:6px 8px !important; font-size:13px !important; }
        }
      `}</style>
      {/* لوحة التحكم والتحقق: تم تغيير لون الحدود هنا أيضاً إلى أسود متناسق */}
      <div className="grid grid-cols-2 items-end gap-1.5 rounded-xl border border-black bg-white p-1.5 shadow-sm sm:flex sm:flex-wrap sm:gap-3 sm:p-4">
        {/* اختيار الشهر */}
        <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
          <label className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>الشهر المحاسبي</span>
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-3 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
          >
            {MONTH_NAMES.map((n, i) => (
              <option key={i} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* اختيار السنة */}
        <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
          <label className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>السنة المالية</span>
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || year)}
            className="w-full px-3 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-center"
          />
        </div>

        {/* مساحة مرنة دافعة للأزرار للشاشات الكبيرة */}
        <div className="hidden lg:block lg:flex-1" />

        {/* أزرار الإجراءات والتقارير: قائمة منسدلة في الويب، وأزرارها الأصلية داخل APK */}
        <div className="web-only-actions col-span-2 flex w-full justify-end lg:col-span-1 lg:w-auto">
          <WebActionMenu
            label="إجراءات الإيرادات"
            actions={[
              {
                label: "تصدير Excel السنوي",
                icon: FileSpreadsheet,
                onSelect: () => exportRevenueStatement(revenue, year, reportDate),
              },
              {
                label: "معاينة الطباعة / طباعة",
                icon: Printer,
                onSelect: printRevenue,
              },
              {
                label: "تصدير PDF",
                icon: FileText,
                onSelect: () => revenuePdf(revenue, year, month, reportDate),
              },
              {
                label: "مسح بيانات الإيرادات",
                destructive: true,
                onSelect: () => {
                  if (!confirm("هل أنت متأكد من مسح جميع بيانات الإيرادات؟ لا يمكن التراجع.")) return;
                  useStore.setState({ revenue: {} });
                },
              },
            ]}
          />
        </div>
        <div className="apk-only-actions col-span-2 grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:gap-2 lg:col-span-1">
          <button
            onClick={() => exportRevenueStatement(revenue, year, reportDate)}
            className="min-w-0 flex flex-1 items-center justify-center gap-1 px-1.5 py-1 text-sm sm:flex-initial sm:gap-1.5 sm:px-2 sm:py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-lg transition-all shadow-sm hover:border-sky-500/30 hover:text-sky-700 active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel السنوي</span>
          </button>
          <button onClick={printRevenue} className="min-w-0 flex flex-1 items-center justify-center gap-1 px-1.5 py-1 text-sm sm:flex-initial sm:gap-1.5 sm:px-2 sm:py-1 bg-gradient-to-r from-sky-700 to-sky-800 text-white font-bold rounded-lg shadow-md">
            <Printer className="w-4 h-4" /><span>معاينة / طباعة</span>
          </button>
          <button onClick={() => revenuePdf(revenue, year, month, reportDate)} className="min-w-0 flex flex-1 items-center justify-center gap-1 px-1.5 py-1 text-sm sm:flex-initial sm:gap-1.5 sm:px-2 sm:py-1 bg-white text-slate-700 border border-slate-200 font-bold rounded-lg shadow-sm">
            <FileText className="w-4 h-4" /><span>تنزيل PDF</span>
          </button>
          <button
            onClick={() => {
              if (!confirm("هل أنت متأكد من مسح جميع بيانات الإيرادات؟ لا يمكن التراجع.")) return;
              useStore.setState({ revenue: {} });
            }}
            className="min-w-0 flex flex-1 items-center justify-center gap-1 px-1.5 py-1 text-sm sm:flex-initial sm:gap-1.5 sm:px-2 sm:py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all shadow-md active:scale-[0.98]"
          >
            🗑️ <span>مسح بيانات الإيرادات</span>
          </button>
        </div>
      </div>

      {/* لوحة وعاء الجدول الكبيرة الزجاجية بحدود سوداء */}
      <div id="revenue-report-content" className="bg-white rounded-2xl shadow-xl shadow-slate-100/50 border-2 border-black overflow-hidden">
        {/* العنوان الرئيسي الاحترافي لتقرير الإيرادات */}
        <header className="revenue-report-heading relative overflow-hidden border-b-2 border-black bg-gradient-to-l from-sky-950 via-sky-800 to-cyan-800 px-3 py-3 text-white sm:px-6 sm:py-4">
          <div className="pointer-events-none absolute -left-8 -top-12 h-36 w-36 rounded-full border-[18px] border-white/5" aria-hidden="true" />
          <div className="revenue-heading-layout relative">
            <div className="revenue-heading-main min-w-0 text-right">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 shadow-inner sm:h-12 sm:w-12">
                <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="revenue-heading-copy">
                <p className="text-[11px] font-bold tracking-wide text-sky-100 sm:text-xs">التقارير المالية</p>
                <h2 className="font-cairo text-lg font-black leading-tight tracking-wide sm:text-2xl">{SCHEMA.title}</h2>
                <p className="text-xs font-semibold text-sky-100 sm:text-sm">{SCHEMA.office}</p>
              </div>
            </div>
            <div className="revenue-heading-meta">
              <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold shadow-sm sm:text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-cyan-100" />
                <span>عن شهر {MONTH_NAMES[month - 1]} {year}م</span>
              </div>
              <div className="rounded-lg border border-white/25 bg-white px-3 py-2 text-xs font-extrabold text-sky-950 shadow-sm sm:text-sm">
                تاريخ التقرير: {String(reportDate)}
              </div>
            </div>
          </div>
        </header>

        {/* صندوق الحماية من الضيق: الجدول والحدود كلها سوداء واحتواء الخلايا تلقائي */}
        <div className="w-full overflow-auto max-h-[72vh] [-ms-overflow-style:none] [scrollbar-width:thin] relative">
<table className="revenue-main-table min-w-full table-fixed text-center border-collapse text-sm sm:text-base font-bold border border-black">
<colgroup>
  <col className="revenue-resource-col" />
  <col className="revenue-code-col" />
  <col className="revenue-code-col" />
  <col className="revenue-code-col" />
  <col className="revenue-code-col" />
  {Array.from({ length: 6 }, (_, index) => <col key={`revenue-value-${index}`} className="revenue-value-col" />)}
</colgroup>
<thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-slate-100 text-slate-700 font-bold border-b-2 border-black">
<th rowSpan={2} className="border border-black text-center whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
  بيان الموارد 
                </th>
<th rowSpan={2} className="border border-black text-center whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  الباب
                </th>
                <th rowSpan={2} className="border border-black text-center whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  الفصل
                </th>
                <th rowSpan={2} className="border border-black text-center whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  البند
                </th>
                <th rowSpan={2} className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  النوع
                </th>
                <th
                  colSpan={2}
                  className="border border-black text-center bg-sky-50/50 text-sky-900 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                >
                  الشهر الجاري
                </th>
                <th
                  colSpan={2}
                  className="border border-black text-center bg-slate-50 text-slate-800 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                >
                  الأشهر السابقة
                </th>
                <th
                  colSpan={2}
                  className="border border-black text-center bg-emerald-50/50 text-emerald-900 whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                >
                  الجملــة والتراكمي
                </th>
              </tr>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b-2 border-black">
                <th className="border border-black text-center whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">ف</th>
                <th className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">ريال</th>
                <th className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">ف</th>
                <th className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">ريال</th>
                <th className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">ف</th>
                <th className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">ريال</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {/* السطر الإجمالي العلوي السريع */}
              <tr className="bg-sky-700/[0.04] font-bold text-sky-950 border-b-2 border-black">
 <td className="border border-black text-center font-cairo whitespace-normal !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
 إجمالي الموارد العامة للوحدة
                </td>
<td colSpan={4} className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-normal"></td>
                <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-normal"></td>
                <td className="border border-black numeric-cell font-mono text-center text-sky-700 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  {cellNum(data.grandCur)}
                </td>
                <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                <td className="border border-black numeric-cell font-mono text-center text-slate-600 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  {cellNum(data.grandPrev)}
                </td>
                <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                <td className="numeric-cell font-mono text-center text-emerald-700 bg-emerald-50/30 border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  {cellNum(data.grandCur + data.grandPrev)}
                </td>
              </tr>

              {SCHEMA.chapters.map((ch) =>
                ch.sections.length === 0 ? null : (
                  <Fragment key={`ch-${ch.no}`}>
                    {/* مستوى الأبواب الرئيسية */}
                    <tr className="bg-slate-100/80 font-bold text-slate-900 border-b border-black">
                      <td className="revenue-chapter-name border border-black text-center text-sky-950 font-cairo font-black whitespace-nowrap bg-gradient-to-l from-amber-100 via-yellow-50 to-sky-100 !px-2 !py-2 sm:!px-3 sm:!py-2.5 !text-base sm:!text-lg">
                        {ch.longTitle || ch.title}
                      </td>
                      <td className="border border-black text-center numeric-cell font-bold text-sky-800 bg-sky-50/20 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {ch.no}
                      </td>
                      <td colSpan={3} className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                      <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                      <td className="border border-black numeric-cell font-mono text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {cellNum(data.chaptersAgg[ch.no].cur)}
                      </td>
                      <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                      <td className="border border-black numeric-cell font-mono text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {cellNum(data.chaptersAgg[ch.no].prev)}
                      </td>
                      <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                      <td className="numeric-cell font-mono text-center bg-slate-200/40 border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {cellNum(data.chaptersAgg[ch.no].tot)}
                      </td>
                    </tr>

                    {ch.sections.map((sec) => (
                      <Fragment key={`sec-${ch.no}-${sec.no}`}>
                        {/* مستوى الفصول الفرعية */}
                        <tr className="bg-slate-50 font-semibold text-slate-800 border-b border-black">
                          <td className="border border-black text-center text-slate-800 font-bold whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {sec.title}
                          </td>
                          <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-normal"></td>
                          <td className="border border-black text-center numeric-cell text-slate-600 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {sec.no}
                          </td>
                          <td colSpan={2} className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                          <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                          <td className="border border-black numeric-cell font-mono text-center text-slate-600 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {cellNum(data.sectionsAgg[`${ch.no}-${sec.no}`].cur)}
                          </td>
                          <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                          <td className="border border-black numeric-cell font-mono text-center text-slate-500 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {cellNum(data.sectionsAgg[`${ch.no}-${sec.no}`].prev)}
                          </td>
                          <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                          <td className="numeric-cell font-mono text-center text-slate-700 border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {cellNum(data.sectionsAgg[`${ch.no}-${sec.no}`].tot)}
                          </td>
                        </tr>

                        {sec.items.map((it) => (
                          <Fragment key={`it-${ch.no}-${sec.no}-${it.no}`}>
                            {/* مستوى البنود */}
                            <tr className="bg-white text-slate-700 border-b border-black">
                              <td className="border border-black text-center text-indigo-800 font-bold whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                {it.title}
                              </td>
                              <td colSpan={2} className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                              <td className="border border-black text-center numeric-cell text-slate-500 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                {it.no}
                              </td>
                              <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                              <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                              <td className="border border-black numeric-cell font-mono text-cente text-slate-600 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                {cellNum(data.itemsAgg[`${ch.no}-${sec.no}-${it.no}`].cur)}
                              </td>
                              <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                              <td className="border border-black numeric-cell font-mono text-cente text-slate-500 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                {cellNum(data.itemsAgg[`${ch.no}-${sec.no}-${it.no}`].prev)}
                              </td>
                              <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                              <td className="numeric-cell font-mono text-cente text-slate-700 border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                {cellNum(data.itemsAgg[`${ch.no}-${sec.no}-${it.no}`].tot)}
                              </td>
                            </tr>

                            {it.types.map((t) => {
                              const k = typeKey(ch.no, sec.no, it.no, t.no);
                              const v = data.types[k];
                              return (
                                /* مستوى الأنواع القابلة للتعديل والمدخلات */
                                <tr
                                  key={k}
                                  className="bg-white hover:bg-sky-50/40 transition-colors text-slate-600 border-b border-black"
                                >
                                  <td className="border border-black text-center text-slate-500 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                    {t.title}
                                  </td>
                                  <td colSpan={3} className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                                  <td className="border border-black text-center numeric-cell text-slate-400 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                    {codeNum(t.no)}
                                  </td>
                                  <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>

                                  {/* خانة إدخال المبلغ للشهر الجاري المعدلة بصرياً بالكامل */}
                                  <td className="border border-black bg-sky-50/10 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                    <div className="relative flex items-center min-w-[100px]">
                                      <input
                                        type="number"
                                        value={v.cur || ""}
                                        onChange={(e) =>
                                          setRevenue(year, month, k, Number(e.target.value) || 0)
                                        }
                                        className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg numeric-cell font-mono text-cente font-bold text-sky-950 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm transition-all"
                                        placeholder="0"
                                      />
                                      <DollarSign className="w-3 h-3 text-slate-300 absolute cente-2" />
                                    </div>
                                  </td>

                                  <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                                  <td className="border border-black numeric-cell font-mono text-center text-slate-500 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                    {cellNum(v.prev)}
                                  </td>
                                  <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                                  <td className="numeric-cell font-mono text-center text-slate-800 font-semibold border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                                    {cellNum(v.tot)}
                                  </td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        ))}
                      </Fragment>
                    ))}
                  </Fragment>
                ),
              )}

              {/* مجاميع الأبواب النهائية الثابتة (Subtotals) */}
              <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-black border-b border-black">
                <td
                  colSpan={5}
                  className="text-center font-cairo bg-slate-200/50 text-slate-900 border-l border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                >
 ملخص  مجاميع الحسابات والأبواب
                </td>
                <td colSpan={6} className="border border-black px-0.5 py-1 sm:px-1 sm:py-1 !text-[10px] sm:!text-xs !whitespace-nowrap"></td>
              </tr>
              {SCHEMA.chapters.map((ch) => {
                const agg = data.chaptersAgg[ch.no] || { cur: 0, prev: 0, tot: 0 };
                const order = ["اﻷول", "الثاني", "الثالث", "الرابع", "الخامس"];
                return (
                  <tr
                    key={`subt-${ch.no}`}
                    className="bg-slate-50/80 font-bold text-slate-700 border-b border-black"
                  >
                    <td
                      colSpan={5}
                      className="border border-black text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    >
                      جملة ايرادات الباب {order[ch.no - 1]} : {ch.title}
                    </td>
                    <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                    <td className="border border-black numeric-cell font-mono text-center text-sky-700 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                      {cellNum(agg.cur)}
                    </td>
                    <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                    <td className="border border-black numeric-cell font-mono text-center text-slate-500 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                      {cellNum(agg.prev)}
                    </td>
                    <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                    <td className="numeric-cell font-mono text-center text-slate-900 bg-slate-200/30 border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                      {cellNum(agg.tot)}
                    </td>
                  </tr>
                );
              })}

              {/* السطر الختامي: المجموع العام للموارد */}
              <tr className="bg-gradient-to-r from-sky-50 to-sky-50 font-black text-sky-950 border-t-4 border-black">
                <td
                  colSpan={5}
                  className="border border-black text-center font-cairo tracking-wide text-sky-900 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                >
                  الإجمالي العام والنهائي لجميع موارد المجلس
                </td>
                <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                <td className="border border-black numeric-cell font-mono text-center text-sky-700 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  {cellNum(data.grandCur)}
                </td>
                <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                <td className="border border-black numeric-cell font-mono text-center text-slate-600 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  {cellNum(data.grandPrev)}
                </td>
                <td className="border border-black !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap"></td>
                <td className="numeric-cell font-mono text-center text-emerald-800 bg-emerald-50 border border-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                  {cellNum(data.grandCur + data.grandPrev)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
