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

export interface NativePrintProgress {
  phase: "preparing" | "resources" | "layout" | "opening" | "ready" | "error";
  progress: number;
  message: string;
  completedResources: number;
  totalResources: number;
  estimatedPages: number;
  elapsedMs: number;
}

type NativePrintProgressHandler = (progress: NativePrintProgress) => void;

function reportNativePrintProgress(
  handler: NativePrintProgressHandler | undefined,
  startedAt: number,
  update: Omit<NativePrintProgress, "elapsedMs">,
): void {
  if (!handler) return;
  try {
    handler({ ...update, elapsedMs: Date.now() - startedAt });
  } catch (error) {
    console.warn("[Print] Progress listener failed:", error);
  }
}

function estimateNativePrintPages(doc: Document): number {
  const styleText = Array.from(doc.querySelectorAll("style"))
    .map((style) => style.textContent || "")
    .join("\\n");
  const pageRule = styleText.match(/@page\\s*\\{([^}]*)\\}/i)?.[1] || "";
  const sizeMatch = pageRule.match(/\\bsize\\s*:\\s*(A4|A3|Letter)(?:\\s+(portrait|landscape))?/i);
  const pageSize = sizeMatch?.[1]?.toLowerCase() || "a4";
  const orientation = sizeMatch?.[2]?.toLowerCase() || "portrait";
  const margin = Number(pageRule.match(/\\bmargin\\s*:\\s*([0-9.]+)mm/i)?.[1] || 0);
  const pageHeightMm = pageSize === "a3"
    ? (orientation === "landscape" ? 297 : 420)
    : pageSize === "letter"
      ? (orientation === "landscape" ? 215.9 : 279.4)
      : (orientation === "landscape" ? 210 : 297);
  const usablePageHeightMm = Math.max(40, pageHeightMm - margin * 2);
  const contentHeightPx = Math.max(
    doc.body?.scrollHeight || 0,
    doc.documentElement?.scrollHeight || 0,
    doc.body?.offsetHeight || 0,
  );
  const contentHeightMm = contentHeightPx * 25.4 / 96;
  const measuredPages = Math.ceil(contentHeightMm / usablePageHeightMm);
  const rowCount = doc.querySelectorAll("table tbody tr").length;
  const rowEstimate = Math.ceil(rowCount / 32);
  return Math.max(1, measuredPages || rowEstimate || 1);
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

async function waitForNativeReportFrame(
  frame: HTMLIFrameElement,
  onProgress: NativePrintProgressHandler | undefined,
  startedAt: number,
): Promise<number> {
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

  let completedResources = 0;
  let listening = true;
  const totalResources = resources.length;
  reportNativePrintProgress(onProgress, startedAt, {
    phase: "resources",
    progress: totalResources ? 8 : 70,
    message: totalResources
      ? `تحميل الخطوط والصور وملفات التنسيق (0 من ${totalResources})`
      : "لا توجد ملفات إضافية؛ يجري تجهيز تخطيط الصفحات",
    completedResources: 0,
    totalResources,
    estimatedPages: 0,
  });

  const trackedResources = resources.map((resource) =>
    Promise.resolve(resource).catch(() => undefined).then(() => {
      completedResources += 1;
      if (!listening) return;
      reportNativePrintProgress(onProgress, startedAt, {
        phase: "resources",
        progress: totalResources
          ? 8 + Math.round((completedResources / totalResources) * 62)
          : 70,
        message: `تحميل موارد التقرير (${completedResources} من ${totalResources})`,
        completedResources,
        totalResources,
        estimatedPages: 0,
      });
    }),
  );

  // A bounded wait prevents a missing external asset from blocking printing forever.
  await Promise.race([
    Promise.all(trackedResources),
    new Promise<void>((resolve) => window.setTimeout(resolve, 20000)),
  ]);
  listening = false;

  const estimatedPagesBeforePaint = estimateNativePrintPages(doc);
  reportNativePrintProgress(onProgress, startedAt, {
    phase: "layout",
    progress: 82,
    message: "حساب عدد الصفحات وتجهيز تخطيط الطباعة",
    completedResources,
    totalResources,
    estimatedPages: estimatedPagesBeforePaint,
  });

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });

  const estimatedPages = estimateNativePrintPages(doc);
  reportNativePrintProgress(onProgress, startedAt, {
    phase: "layout",
    progress: 90,
    message: `اكتمل تجهيز التخطيط؛ عدد الصفحات المتوقع ${estimatedPages}`,
    completedResources,
    totalResources,
    estimatedPages,
  });
  return estimatedPages;
}

async function printWithNativePrinter(
  name: string,
  html: string,
  onProgress?: NativePrintProgressHandler,
): Promise<void> {
  const startedAt = Date.now();
  reportNativePrintProgress(onProgress, startedAt, {
    phase: "preparing",
    progress: 3,
    message: "إنشاء نسخة الطباعة وتجهيز التقرير",
    completedResources: 0,
    totalResources: 0,
    estimatedPages: 0,
  });

  const frame = mountNativeReportFrame(html);
  const estimatedPages = await waitForNativeReportFrame(frame, onProgress, startedAt);

  const { Printer } = await import("@capgo/capacitor-printer");
  reportNativePrintProgress(onProgress, startedAt, {
    phase: "opening",
    progress: 95,
    message: "إرسال التقرير إلى خدمة الطباعة في Android",
    completedResources: 0,
    totalResources: 0,
    estimatedPages,
  });

  if (typeof Printer.printIframe === "function") {
    await Printer.printIframe({
      selector: `#${NATIVE_REPORT_FRAME_ID}`,
      name,
    });
  } else {
    // Compatibility fallback for an older printer plugin build.
    await Printer.printHtml({ name, html });
  }

  reportNativePrintProgress(onProgress, startedAt, {
    phase: "ready",
    progress: 100,
    message: "تم تجهيز التقرير وفتح واجهة الطباعة؛ أكمل الحفظ من النظام",
    completedResources: 0,
    totalResources: 0,
    estimatedPages,
  });
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

export async function printReportHtmlAsync(
  html: string,
  name: string,
  onProgress?: NativePrintProgressHandler,
): Promise<boolean> {
  if (isNativePrintingAvailable()) {
    try {
      await printWithNativePrinter(name, stripAutoPrintScripts(ensurePrintLetterhead(html)), onProgress);
      return true;
    } catch (error) {
      console.error("[Print] Native Android printing failed", error);
      reportNativePrintProgress(onProgress, Date.now(), {
        phase: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "تعذر تجهيز التقرير للطباعة",
        completedResources: 0,
        totalResources: 0,
        estimatedPages: 0,
      });
      return false;
    }
  }
  return printReportHtml(html, name);
}
