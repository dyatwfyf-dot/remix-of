import { escapeHtml, REPORT_LETTERHEAD_SRC } from "@/lib/printTableHtml";

export interface BrowserPreviewOptions {
  title: string;
  reportDateLabel?: string;
  tableHtml: string;
  /** أنماط التقرير الأصلية، مثل تنسيق كشف حساب المتدرب. */
  contentCss?: string;
  defaultOrientation?: "portrait" | "landscape";
  defaultPageSize?: "A4" | "A3" | "Letter";
}

/**
 * يفتح نافذة متصفح كروم مستقلة لمعاينة التقرير مع أدوات تحكم كاملة
 * في أبعاد الورقة واتجاهها وهوامشها واحتواء تلقائي داخل حدود A4.
 */
export function openBrowserPrintPreview({
  title,
  reportDateLabel = "",
  tableHtml,
  contentCss = "",
  defaultOrientation = "portrait",
  defaultPageSize = "A4",
}: BrowserPreviewOptions): boolean {
  const newWin = window.open("", "_blank");
  if (!newWin) {
    return false;
  }

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>معاينة طباعة: ${escapeHtml(title)} - ${escapeHtml(reportDateLabel)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    /* أنماط شريط الأدوات العلوي في متصفح كروم */
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      direction: rtl;
    }

    .preview-toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f283a;
      color: #fff;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      border-bottom: 2px solid #1f5f7a;
    }

    .preview-toolbar .title-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #e0f2fe;
    }

    .preview-toolbar .controls-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .preview-toolbar select, .preview-toolbar button {
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #336d88;
      background: #173b50;
      color: #fff;
      cursor: pointer;
      outline: none;
      transition: all 0.15s ease;
    }

    .preview-toolbar select:hover, .preview-toolbar button:hover {
      background: #1e4b65;
      border-color: #38bdf8;
    }

    .preview-toolbar button.btn-print {
      background: #059669;
      border-color: #10b981;
      padding: 7px 16px;
      font-size: 13px;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(5, 150, 105, 0.4);
    }

    .preview-toolbar button.btn-print:hover {
      background: #10b981;
    }

    .preview-toolbar button.btn-close {
      background: #dc2626;
      border-color: #ef4444;
    }

    .preview-toolbar button.btn-close:hover {
      background: #ef4444;
    }

    /* مساحة عرض الورقة داخل نافذة المتصفح */
    .sheet-viewport {
      display: flex;
      justify-content: center;
      padding: 20px 10px 40px;
      overflow-x: auto;
    }

    .sheet-paper {
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border: 1px solid #cbd5e1;
      border-radius: 2px;
      box-sizing: border-box;
      transition: all 0.2s ease;
      transform-origin: top center;
    }

    /* أبعاد الورقة حسب الاتجاه مع إمكانية التمدد */
    .sheet-paper.portrait {
      width: 210mm;
      min-height: 297mm;
      padding: 6mm;
    }

    .sheet-paper.landscape {
      width: 297mm;
      min-height: 210mm;
      padding: 6mm;
    }

    /* ترويسة الصفحة */
    .report-letterhead-block {
      display: flex;
      width: 100%;
      height: 28mm;
      max-height: 28mm;
      align-items: stretch;
      justify-content: center;
      margin: 0 auto 3mm;
    }

    .report-letterhead-image {
      width: 100%;
      max-width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: top;
    }

    /* احتواء الجدول والخلايا التلقائي لضمان عدم خروج أي نص أو عمود */
    table {
      width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse !important;
      table-layout: auto !important;
      font-size: 13px !important;
      margin: 0 auto !important;
      word-break: keep-all;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-footer-group;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      border: 1px solid #000000 !important;
      text-align: center !important;
      vertical-align: middle !important;
      padding: 4px 5px !important;
      color: #000000 !important;
      box-sizing: border-box;
    }

    /* رؤوس الأعمدة */
    th {
      background: #f1f5f9 !important;
      font-weight: 900 !important;
      font-size: 13px !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
      line-height: 1.25 !important;
    }

    /* خلايا النصوص والبيان: احتواء تلقائي والتفاف في سطرين أو أكثر لمنع خروج الجدول */
    tbody td {
      font-weight: 700 !important;
      font-size: 12.5px !important;
      line-height: 1.3 !important;
      white-space: normal !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
    }

    /* منع التفاف الأرقام والتواريخ والرموز مع ضغط حشوتها */
    .num, .numeric-cell, .date-cell, .idx, [data-numeric="true"] {
      white-space: nowrap !important;
      word-break: keep-all !important;
      font-family: 'Times New Roman', serif !important;
      direction: ltr !important;
      font-weight: 800 !important;
      padding: 3px 4px !important;
      width: max-content !important;
    }

    tbody tr:nth-child(even) td {
      background: #fafafa !important;
    }

    .total-row td {
      background: #f1f5f9 !important;
      font-weight: 900 !important;
      font-size: 13px !important;
      border-top: 1.5pt solid #000 !important;
    }

    /* الأنماط الخاصة بالتقرير المعروض */
    ${contentCss}

    /* قواعد أمان نهائية لإبقاء المحتوى داخل الورقة المختارة */
    .sheet-paper, .sheet-paper * {
      max-width: 100%;
    }
    .sheet-paper table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: auto !important;
    }
    .sheet-paper th, .sheet-paper td {
      min-width: 0 !important;
      max-width: 100% !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
    }
    .sheet-paper .num,
    .sheet-paper .numeric-cell,
    .sheet-paper .date-cell,
    .sheet-paper .idx,
    .sheet-paper [data-numeric="true"] {
      white-space: nowrap !important;
      overflow-wrap: normal !important;
      word-break: keep-all !important;
      width: auto !important;
    }

    /* أنماط أمر الطباعة الحقيقي عبر متصفح كروم */
    @media print {
      .preview-toolbar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .sheet-viewport {
        padding: 0 !important;
        overflow: visible !important;
      }
      .sheet-paper {
        border: none !important;
        box-shadow: none !important;
        width: 100% !important;
        min-height: auto !important;
        padding: 0 !important;
        transform: none !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>

  <!-- نمط أبعاد الطباعة الديناميكي الذي يتحكم فيه المستخدم -->
  <style id="dynamic-page-rule">
    @page {
      size: ${defaultPageSize} ${defaultOrientation};
      margin: 5mm;
    }
  </style>
</head>
<body>

  <!-- شريط الأدوات العلوي -->
  <div class="preview-toolbar">
    <div class="title-box">
      <span>📄 ${escapeHtml(title)}</span>
      ${reportDateLabel ? `<span style="opacity:0.8; font-size:12px;">(${escapeHtml(reportDateLabel)})</span>` : ""}
    </div>

    <div class="controls-group">
      <!-- اختيار اتجاه الورقة -->
      <label style="font-size: 12px; font-weight: bold;">
        الاتجاه:
        <select id="selOrientation">
          <option value="portrait" ${defaultOrientation === "portrait" ? "selected" : ""}>طولي (Portrait)</option>
          <option value="landscape" ${defaultOrientation === "landscape" ? "selected" : ""}>عرضي (Landscape)</option>
        </select>
      </label>

      <!-- حجم الورق -->
      <label style="font-size: 12px; font-weight: bold;">
        الحجم:
        <select id="selPageSize">
          <option value="A4" ${defaultPageSize === "A4" ? "selected" : ""}>A4</option>
          <option value="A3" ${defaultPageSize === "A3" ? "selected" : ""}>A3</option>
          <option value="Letter" ${defaultPageSize === "Letter" ? "selected" : ""}>Letter</option>
        </select>
      </label>

      <!-- الهوامش -->
      <label style="font-size: 12px; font-weight: bold;">
        الهوامش:
        <select id="selMargin">
          <option value="3mm">ضيقة (3 مم)</option>
          <option value="5mm" selected>عادية (5 مم)</option>
          <option value="8mm">متوسطة (8 مم)</option>
          <option value="12mm">واسعة (12 مم)</option>
        </select>
      </label>

      <!-- نسبة التكبير / الملاءمة -->
      <label style="font-size: 12px; font-weight: bold;">
        الملاءمة:
        <select id="selScale">
          <option value="1">100% (طبيعي)</option>
          <option value="0.95">95%</option>
          <option value="0.90">90% (ملاءمة ضيقة)</option>
          <option value="0.85">85%</option>
          <option value="0.80">80%</option>
          <option value="0.75">75%</option>
        </select>
      </label>

      <!-- زر تنفيذ الطباعة -->
      <button type="button" class="btn-print" id="btnPrint">
        🖨️ طباعة التقرير (Ctrl+P)
      </button>

      <!-- زر الإغلاق -->
      <button type="button" class="btn-close" id="btnClose">
        ✕ إغلاق
      </button>
    </div>
  </div>

  <!-- مساحة المعاينة الحية للورقة -->
  <div class="sheet-viewport">
    <div id="paperContainer" class="sheet-paper ${defaultOrientation}">
      <div class="report-letterhead-block">
        <img class="report-letterhead-image" src="${REPORT_LETTERHEAD_SRC}" alt="الترويسة الرسمية" />
      </div>
      <div id="tableContainer" class="preview-report-content">
        ${tableHtml}
      </div>
    </div>
  </div>

  <!-- سكربت التحكم الحي في التنسيقات والطباعة داخل نافذة كروم -->
  <script>
    (function() {
      const selOrientation = document.getElementById('selOrientation');
      const selPageSize = document.getElementById('selPageSize');
      const selMargin = document.getElementById('selMargin');
      const selScale = document.getElementById('selScale');
      const paperContainer = document.getElementById('paperContainer');
      const dynamicRule = document.getElementById('dynamic-page-rule');
      const btnPrint = document.getElementById('btnPrint');
      const btnClose = document.getElementById('btnClose');
      let printInProgress = false;

      function printOnce() {
        if (printInProgress) return;
        printInProgress = true;
        window.print();
        window.setTimeout(function() { printInProgress = false; }, 1000);
      }

      function updatePageSettings() {
        const orientation = selOrientation.value;
        const pageSize = selPageSize.value;
        const margin = selMargin.value;
        const scale = parseFloat(selScale.value) || 1;

        // تحديث الصنف على حاوية الورقة
        paperContainer.classList.remove('portrait', 'landscape');
        paperContainer.classList.add(orientation);

        // تحديث الحجم بالبوصة أو الملليمتر في العرض
        if (pageSize === 'A3') {
          paperContainer.style.width = orientation === 'portrait' ? '297mm' : '420mm';
        } else if (pageSize === 'Letter') {
          paperContainer.style.width = orientation === 'portrait' ? '216mm' : '279mm';
        } else {
          paperContainer.style.width = orientation === 'portrait' ? '210mm' : '297mm';
        }

        // تطبيق الهامش والتدريج
        paperContainer.style.padding = margin;
        paperContainer.style.transform = scale === 1 ? 'none' : 'scale(' + scale + ')';

        // تحديث قاعدة الطباعة الفعلية لكروم
        dynamicRule.innerHTML = '@page { size: ' + pageSize + ' ' + orientation + '; margin: ' + margin + '; }';
      }

      selOrientation.addEventListener('change', updatePageSettings);
      selPageSize.addEventListener('change', updatePageSettings);
      selMargin.addEventListener('change', updatePageSettings);
      selScale.addEventListener('change', updatePageSettings);

      btnPrint.addEventListener('click', function() {
        printOnce();
      });

      btnClose.addEventListener('click', function() {
        window.close();
      });

      // اختصار لوحة المفاتيح
      window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          printOnce();
        } else if (e.key === 'Escape') {
          window.close();
        }
      });
    })();
  </script>
</body>
</html>`;

  newWin.document.open();
  newWin.document.write(html);
  newWin.document.close();
  return true;
}
