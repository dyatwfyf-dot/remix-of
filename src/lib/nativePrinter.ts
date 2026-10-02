import { Capacitor } from "@capacitor/core";
import { registerReportWindow } from "@/lib/capacitorNavigation";
import { REPORT_LETTERHEAD_SRC } from "@/lib/printTableHtml";

const PRINT_LETTERHEAD_ALT = "ترويسة المجلس اليمني للاختصاصات الطبية";

/**
 * يضمن وجود الترويسة داخل رأس كل جدول، وليس كعنصر منفصل يظهر في الصفحة الأولى فقط.
 * وضعها داخل thead يجعل محرك الطباعة يعيدها تلقائياً عند انتقال الجدول إلى صفحة جديدة.
 *
 * إذا كانت الصفحة تحتوي بالفعل على شعار مستقل (report-letterhead-block) — كما يحدث
 * عندما يُبنى المستند عبر letterheadPlacement: "top" (مثل كشف حساب متدرب فردي) —
 * لا نحذفه ولا نقحم نسخة إضافية داخل الجدول؛ نترك الصفحة كما بُنيت أصلاً.
 */
function ensurePrintLetterhead(html: string, forceTable: boolean = true): string {
  if (!html) return html;

  const letterheadRow = (columnCount: number) => `<tr class="report-letterhead-row" data-report-letterhead-injected="true"><th class="report-letterhead-cell" colspan="${Math.max(1, columnCount)}"><img class="report-letterhead-image" src="${REPORT_LETTERHEAD_SRC}" alt="${PRINT_LETTERHEAD_ALT}" /></th></tr>`;
  const standaloneLetterhead = `<div class="report-letterhead-block" data-report-letterhead-injected="true"><img class="report-letterhead-image" src="${REPORT_LETTERHEAD_SRC}" alt="${PRINT_LETTERHEAD_ALT}" /></div>`;
  const printCss = `<style data-report-letterhead-styles="true">
    thead { display: table-header-group !important; }
    .report-letterhead-row { break-inside: avoid; page-break-inside: avoid; }
    .report-letterhead-cell { border: 0 !important; background: #fff !important; padding: 0 0 2mm !important; height: 30mm !important; }
    .report-letterhead-image { display: block !important; width: 100% !important; max-width:100% !important; height: 30mm !important; max-height: 30mm !important; object-fit: content !important; 
object-position: top!important; margin: 0 auto !important; }
    .report-letterhead-block { display: flex !important; width: 100% !important; height: 30mm !important; min-height: 30mm !important; max-height: 30mm !important; align-items: stretch !important; justify-content: center !important; overflow: hidden !important; margin: 0 auto 4mm !important; page-break-before: avoid !important; page-break-after: avoid !important; }
  </style>`;

  let printableHtml = html.includes("</head>") ? html.replace("</head>", `${printCss}</head>`) : `${printCss}${html}`;

  // إذا كان الشعار المستقل موجودًا بالفعل (letterheadPlacement: "top")، لا نحذفه
  // ولا نقحم نسخة إضافية داخل الجدول — نتركه كما بُني في الصفحة الأصلية.
  const hasStandaloneLetterhead = /<div[^>]*class=["'][^"']*report-letterhead-block[^"']*["']/i.test(printableHtml);
  if (hasStandaloneLetterhead) {
    return printableHtml;
  }

  if (forceTable && /<table\b[^>]*>/i.test(printableHtml)) {
    return printableHtml.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (tableHtml) => {
      const hasLetterheadRow = /<tr\b[^>]*class=["'][^"']*report-letterhead-row[^"']*["']/i.test(tableHtml);
      if (hasLetterheadRow) return tableHtml;

      const theadMatch = tableHtml.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
      const firstRowHtml = theadMatch?.[1]?.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0]
        ?? tableHtml.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0]
        ?? "";
      const cells = firstRowHtml.match(/<(?:th|td)\b[^>]*>/gi) ?? [];
      const columnCount = cells.reduce((sum, cell) => {
        const span = Number(cell.match(/\bcolspan\s*=\s*["']?(\d+)/i)?.[1] ?? 1);
        return sum + (Number.isFinite(span) && span > 0 ? span : 1);
      }, 0) || 1;
      const row = letterheadRow(columnCount);

      if (theadMatch) return tableHtml.replace(/(<thead\b[^>]*>)/i, `$1${row}`);
      return tableHtml.replace(/(<table\b[^>]*>)/i, `$1<thead>${row}</thead>`);
    });
  }

  return printableHtml.replace(/<body\b([^>]*)>/i, `<body$1>${standaloneLetterhead}`);
}

export function isNativePrintingAvailable(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

async function printWithNativePrinter(name: string, html: string): Promise<void> {
  const { Printer } = await import("@capgo/capacitor-printer");
  await Printer.printHtml({ name, html });
}

/** يحذف سكربتات الطباعة التلقائية المضمنة لمنع الطباعة المزدوجة */
function stripAutoPrintScripts(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (s) => (/print\s*\(/.test(s) ? "" : s));
}

/** طباعة عبر إطار مخفي داخل الصفحة لتفادي حظر النوافذ المنبثقة */
function printViaIframe(html: string): boolean {
  try {
    document.getElementById("app-print-frame")?.remove();
    const iframe = document.createElement("iframe");
    iframe.id = "app-print-frame";
    Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0", visibility: "hidden" });
    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc) return false;
    doc.open();
    doc.write(stripAutoPrintScripts(html));
    doc.close();

    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      try {
        win.focus();
        win.print();
      } catch (err) {
        console.error("[Print] iframe print error:", err);
      }
    };
    const imgs = Array.from(doc.images).map((img) =>
      img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = img.onerror = () => r(); }),
    );
    const fontsReady = (doc as any).fonts?.ready ?? Promise.resolve();
    Promise.race([
      Promise.all([fontsReady, ...imgs]),
      new Promise((r) => setTimeout(r, 2500)),
    ]).then(() => setTimeout(trigger, 200));
    return true;
  } catch (err) {
    console.error("[Print] Failed via iframe:", err);
    return false;
  }
}

/**
 * يفتح واجهة الطباعة الأصلية في Android عند التشغيل داخل APK،
 * وفي الويب يطبع مباشرة عبر إطار مخفي.
 */
export function printReportHtml(html: string, name: string): boolean {
  const printableHtml = ensurePrintLetterhead(html);
  if (isNativePrintingAvailable()) {
    void printWithNativePrinter(name, stripAutoPrintScripts(printableHtml)).catch((error) => {
      console.error("[Print] Native Android printing failed", error);
    });
    return true;
  }
  if (printViaIframe(printableHtml)) return true;

  const reportWindow = registerReportWindow(window.open("", "_blank", "width=1200,height=800"));
  if (!reportWindow) return false;
  reportWindow.document.open();
  reportWindow.document.write(printableHtml);
  reportWindow.document.close();
  return true;
}

export async function printReportHtmlAsync(html: string, name: string): Promise<boolean> {
  if (isNativePrintingAvailable()) {
    try {
      await printWithNativePrinter(name, stripAutoPrintScripts(ensurePrintLetterhead(html)));
      return true;
    } catch (error) {
      console.error("[Print] Native Android printing failed", error);
      return false;
    }
  }
  return printReportHtml(html, name);
}