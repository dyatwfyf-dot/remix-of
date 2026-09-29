import { Capacitor } from "@capacitor/core";
import { registerReportWindow } from "@/lib/capacitorNavigation";
import { REPORT_LETTERHEAD_SRC } from "@/lib/printTableHtml";

const PRINT_LETTERHEAD_ALT = "ترويسة المجلس اليمني للاختصاصات الطبية";

/**
 * يضمن وجود الترويسة داخل رأس كل جدول، وليس كعنصر منفصل يظهر في الصفحة الأولى فقط.
 * وضعها داخل thead يجعل محرك الطباعة يعيدها تلقائياً عند انتقال الجدول إلى صفحة جديدة.
 */
function ensurePrintLetterhead(html: string, forceTable: boolean = true): string {
  if (!html) return html;

  const letterheadRow = (columnCount: number) =>
    `<tr class="report-letterhead-row" data-report-letterhead-injected="true"><th class="report-letterhead-cell" colspan="${Math.max(1, columnCount)}"><img class="report-letterhead-image" src="${REPORT_LETTERHEAD_SRC}" alt="${PRINT_LETTERHEAD_ALT}" /></th></tr>`;
  const standaloneLetterhead = `<div class="report-letterhead-block" data-report-letterhead-injected="true"><img class="report-letterhead-image" src="${REPORT_LETTERHEAD_SRC}" alt="${PRINT_LETTERHEAD_ALT}" /></div>`;
  const printCss = `<style data-report-letterhead-styles="true">
    thead { display: table-header-group !important; }
    .report-letterhead-row { break-inside: avoid; page-break-inside: avoid; }
    .report-letterhead-cell { border: 0 !important; background: #fff !important; padding: 0 0 2mm !important; height: 30mm !important; }
    .report-letterhead-image { display: block !important; width: 100% !important; max-width: 100% !important; height: 30mm !important; max-height: 30mm !important; object-fit: contain !important; object-position: top !important; margin: 0 auto !important; }
    .report-letterhead-block { display: flex !important; width: 100% !important; height: 30mm !important; min-height: 30mm !important; max-height: 30mm !important; align-items: stretch !important; justify-content: center !important; overflow: hidden !important; margin: 0 auto 4mm !important; page-break-before: avoid !important; page-break-after: avoid !important; }
  </style>`;

  let printableHtml = html.includes("</head>") ? html.replace("</head>", `${printCss}</head>`) : `${printCss}${html}`;

  const hasStandaloneLetterhead = /<div[^>]*class=["'][^"']*report-letterhead-block[^"']*["']/i.test(printableHtml);
  if (hasStandaloneLetterhead) {
    return printableHtml;
  }

  if (forceTable && /<table\b[^>]*>/i.test(printableHtml)) {
    return printableHtml.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (tableHtml) => {
      const hasLetterheadRow = /<tr\b[^>]*class=["'][^"']*report-letterhead-row[^"']*["']/i.test(tableHtml);
      if (hasLetterheadRow) return tableHtml;

      const theadMatch = tableHtml.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
      const firstRowHtml =
        theadMatch?.[1]?.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0] ??
        tableHtml.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0] ??
        "";
      const cells = firstRowHtml.match(/<(?:th|td)\b[^>]*>/gi) ?? [];
      const columnCount =
        cells.reduce((sum, cell) => {
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

/**
 * يضمن وجود كود تشغيل الطباعة التلقائي داخل المستند مع حماية من التكرار
 */
function ensurePrintScript(html: string): string {
  const triggerScript = `
    <script>
      (function() {
        if (window.__printTriggered) return;
        function executePrint() {
          if (window.__printTriggered) return;
          window.__printTriggered = true;
          try { window.focus(); } catch(e) {}
          setTimeout(function() {
            try { window.print(); } catch(e) {}
          }, 150);
        }
        if (document.readyState === "complete" || document.readyState === "interactive") {
          setTimeout(executePrint, 250);
        } else {
          window.addEventListener("load", executePrint);
          setTimeout(executePrint, 700);
        }
      })();
    </script>
  `;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${triggerScript}</body>`);
  }
  return `${html}${triggerScript}`;
}

export function isNativePrintingAvailable(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

async function printWithNativePrinter(name: string, html: string): Promise<void> {
  const { Printer } = await import("@capgo/capacitor-printer");
  await Printer.printHtml({ name, html });
}

/**
 * تشغيل الطباعة عبر إطار خفي (iframe) لتجاوز حظر النوافذ المنبثقة نهائياً
 */
function printViaIframe(html: string): boolean {
  if (typeof document === "undefined") return false;

  try {
    const oldFrame = document.getElementById("app-print-frame");
    if (oldFrame) {
      try {
        oldFrame.remove();
      } catch {}
    }

    const iframe = document.createElement("iframe");
    iframe.id = "app-print-frame";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc || !iframe.contentWindow) {
      iframe.remove();
      return false;
    }

    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      try {
        const win = iframe.contentWindow as any;
        if (win && !win.__printTriggered) {
          win.__printTriggered = true;
          win.focus();
          win.print();
        }
      } catch (err) {
        console.warn("[Print] iframe trigger warning:", err);
      }
      setTimeout(() => {
        try {
          iframe.remove();
        } catch {}
      }, 5000);
    };

    if (frameDoc.fonts && frameDoc.fonts.ready) {
      frameDoc.fonts.ready.then(() => setTimeout(trigger, 300)).catch(() => setTimeout(trigger, 300));
    } else {
      iframe.onload = () => setTimeout(trigger, 300);
      setTimeout(trigger, 600);
    }

    return true;
  } catch (e) {
    console.warn("[Print] printViaIframe error:", e);
    return false;
  }
}

/**
 * يفتح واجهة الطباعة في جميع المنصات (أندرويد أصلي، ويب، هواتف شاومي، ومتصفحات الجوال)
 */
export function printReportHtml(html: string, name: string): boolean {
  const printableHtml = ensurePrintScript(ensurePrintLetterhead(html));

  // 1. عند التشغيل داخل تطبيق أندرويد المثبت (APK)
  if (isNativePrintingAvailable()) {
    void printWithNativePrinter(name, printableHtml).catch((error) => {
      console.error("[Print] Native Android printing failed", error);
    });
    return true;
  }

  // 2. المحاولة عبر الإطار الخفي (تتجاوز حظر النوافذ المنبثقة Popup Blocker)
  const iframeSuccess = printViaIframe(printableHtml);
  if (iframeSuccess) {
    return true;
  }

  // 3. كحل بديل أخير في حال عدم دعم الإطار
  try {
    const reportWindow = registerReportWindow(window.open("", "_blank", "width=auto,height=auto"));
    if (!reportWindow) return false;
    reportWindow.document.open();
    reportWindow.document.write(printableHtml);
    reportWindow.document.close();
    return true;
  } catch {
    return false;
  }
}

export async function printReportHtmlAsync(html: string, name: string): Promise<boolean> {
  const printableHtml = ensurePrintScript(ensurePrintLetterhead(html));

  if (isNativePrintingAvailable()) {
    try {
      await printWithNativePrinter(name, printableHtml);
      return true;
    } catch (error) {
      console.error("[Print] Native Android printing failed", error);
      return false;
    }
  }

  return printReportHtml(printableHtml, name);
}
