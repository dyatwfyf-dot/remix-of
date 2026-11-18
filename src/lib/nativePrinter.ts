import { Capacitor } from "@capacitor/core";
import { registerReportWindow } from "@/lib/capacitorNavigation";
import { reportLetterheadHtml } from "@/lib/printTableHtml";
import { excelLikePrintTablesCss } from "@/lib/excelLikePrintTablesCss";

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

  const letterheadRow = (columnCount: number) => `<tr class="report-letterhead-row" data-report-letterhead-injected="true"><th class="report-letterhead-cell" colspan="${Math.max(1, columnCount)}">${reportLetterheadHtml()}</th></tr>`;
  const standaloneLetterhead = `<div data-report-letterhead-injected="true">${reportLetterheadHtml()}</div>`;
  const printCss = `<style data-report-letterhead-styles="true">
    thead { display: table-header-group !important; }
    .report-letterhead-row { break-inside: avoid; page-break-inside: avoid; }
    .report-letterhead-cell { border: 0 !important; background: #fff !important; padding: 0 0 2mm !important; }
    .report-letterhead-block { display: block !important; width: 100% !important; margin: 0 auto 4mm !important; page-break-before: avoid !important; page-break-after: avoid !important; }
    ${excelLikePrintTablesCss}
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

const NATIVE_REPORT_FRAME_ID = "app-native-report-print-frame";

/**
 * Put the report in the current WebView and print that frame directly.
 * This avoids sending a very large HTML string through the Capacitor bridge
 * and creating a second WebView for long, multi-page reports.
 *
 * Keep the frame mounted after opening the print dialog: Android's print
 * adapter renders the WebView content lazily and may still need it while
 * pages are being generated.
 */
function mountNativeReportFrame(html: string): HTMLIFrameElement {
  document.getElementById(NATIVE_REPORT_FRAME_ID)?.remove();

  const frame = document.createElement("iframe");
  frame.id = NATIVE_REPORT_FRAME_ID;
  frame.title = "معاينة التقرير للطباعة";
  Object.assign(frame.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "100vw",
    height: "100vh",
    border: "0",
    pointerEvents: "none",
    background: "#fff",
  });
  document.body.appendChild(frame);

  const frameDocument = frame.contentDocument;
  if (!frameDocument) {
    frame.remove();
    throw new Error("تعذر إنشاء إطار تجهيز التقرير للطباعة");
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();
  return frame;
}

function waitForElementLoad(
  element: HTMLLinkElement | HTMLImageElement,
): Promise<void> {
  return new Promise((resolve) => {
    let finished = false;
    let timeoutId = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      element.removeEventListener("load", finish);
      element.removeEventListener("error", finish);
      resolve();
    };
    timeoutId = window.setTimeout(finish, 12000);
    element.addEventListener("load", finish, { once: true });
    element.addEventListener("error", finish, { once: true });
  });
}

async function waitForNativeReportFrame(frame: HTMLIFrameElement): Promise<void> {
  const doc = frame.contentDocument;
  if (!doc) throw new Error("تعذر قراءة محتوى التقرير");

  const resources: Promise<unknown>[] = [];
  if (doc.fonts?.ready) resources.push(doc.fonts.ready.catch(() => undefined));
  Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).forEach((link) => {
    if (!link.sheet) resources.push(waitForElementLoad(link));
  });
  Array.from(doc.images).forEach((image) => {
    if (!image.complete) resources.push(waitForElementLoad(image));
  });

  // لا نعلق الطباعة بسبب مورد خارجي لا يستجيب.
  await Promise.race([
    Promise.all(resources),
    new Promise<void>((resolve) => window.setTimeout(resolve, 20000)),
  ]);
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

async function printWithNativePrinter(name: string, html: string): Promise<void> {
  const frame = mountNativeReportFrame(html);
  await waitForNativeReportFrame(frame);

  const { Printer } = await import("@capgo/capacitor-printer");
  if (typeof Printer.printIframe === "function") {
    await Printer.printIframe({ selector: `#${NATIVE_REPORT_FRAME_ID}`, name });
  } else {
    // Compatibility fallback for an older printer plugin build.
    await Printer.printHtml({ name, html });
  }
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

  const reportWindow = registerReportWindow(window.open("", "_blank", "width=1800,height=1800"));
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
