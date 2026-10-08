import { fmt } from './format';
import {
  buildTableHtml,
  escapeHtml,
  reportLetterheadHtml,
  tablePrintStyles,
} from './printTableHtml';
import { downloadReportPdf } from "@/lib/reportPdf";
import { printReportHtml } from "@/lib/nativePrinter";

async function htmlToPdf(opts: { html: string; css: string; fileName: string; orientation?: 'portrait' | 'landscape'; pageWidthPx?: number }): Promise<void> {
  await downloadReportPdf({ title: opts.fileName, body: opts.html, css: opts.css, fileName: opts.fileName, orientation: opts.orientation });
}

const statementCss = `
  ${tablePrintStyles}
  body, .pdf-page { 
    font-size: 18px; 
    margin: 0;
    padding: 0;
width: 100%;
height: 100%;
box-sizing: border-box;
  }
  table {
width: 100% !important;
max-width:auto !important; 
table-layout:auto !important; 
height:100% !important;
min-height:auto !important;

  }
  .info {
    width: 100%; 
    border: solid 1px black;
    margin: 6px 0 10px;
  }
  .info td {
    border: 1px solid #000; 
    padding: 6px 8px; 
    text-align: center; 
    font-weight: 700; 
  }
  .info td.lbl { 
    background: #f1f5f9 !important; 
    width: 100%; 
 white-space: nowrap !important; 
  }
  .sign {
    margin-top: 20px; 
    font-weight: 700;
    font-size: 15.px; 
  }
`;

export async function exportStudentStatementPdf(row: any, year: number): Promise<void> {
  const safeName = (row.name || 'متدرب').replace(/[^\u0600-\u06FFa-zA-Z0-9._-]/g, '_');
  const fileName = `كشف_حساب_${safeName}_${year}.pdf`;

  const monthsList =
    year === 2025
      ? ["يونيو 2024", "يوليو 2024", "أغسطس 2024", "مارس 2025", "ابريل 2025", "مايو 2025", "يونيو 2025", "يوليو 2025", "أغسطس 2025", "سبتمبر 2025", "أكتوبر 2025", "نوفمبر2025", "ديسمبر2025"]
      : ["يناير", "فبراير", "مارس", "ابريل", "مايو", "يونيو", "يوليو", "اغسطس", "سبتمبر", "اكتوبر ", "نوفمبر", "ديسمبر"];

  const fees = Number(String(row.fees || 0).replace(/[^0-9.-]/g, "")) || 0;
  const prevDue = Number(String(row.prevDue || 0).replace(/[^0-9.-]/g, "")) || 0;
  const totalPaid = monthsList.reduce((s, m) => s + (Number(row.payments?.[m]) || 0), 0);
  const dueTotal = year === 2026 ? prevDue || fees : fees;
  const remaining = dueTotal - totalPaid;

  const lines: { label: string; value: number; color?: string }[] = [];
  lines.push({ label: 'إجمالي الرسوم المستحقة', value: fees, color: '#dbeafe' });
  if (year === 2026) {
    lines.push({ label: 'متبقي من العام 2025 (مدور)', value: prevDue, color: '#fde68a' });
  }
  lines.push({ label: 'إجمالي المبلغ المطلوب', value: dueTotal, color: '#fca5a5' });
  monthsList.forEach((m) => {
    const val = Number(row.payments?.[m]) || 0;
    if (val > 0) lines.push({ label: `سداد شهر ${m}`, value: val });
  });
  lines.push({ label: 'إجمالي المسدد (له)', value: totalPaid, color: '#a7f3d0' });
  lines.push({
    label: remaining > 0 ? 'الرصيد المتبقي (عليه)' : 'الرصيد الإضافي (له)',
    value: Math.abs(remaining),
    color: '#fecaca',
  });

  const today = new Date().toLocaleDateString('ar-EG-u-nu-latn');

  const html = `
    <h1>المجلس اليمني للاختصاصات الطبية</h1>
    <div class="sub">كشف حساب رسمي - للعام ${year}م • ${today}</div>
    <table class="info">
      <tr>
        <td class="lbl">اسم المتدرب</td><td>${escapeHtml(row.name || '—')}</td>
        <td class="lbl">الدفعة</td><td>${escapeHtml(row.batch || '—')}</td>
      </tr>
      <tr>
        <td class="lbl">المساق</td><td>${escapeHtml(row.specialty || '—')}</td>
        <td class="lbl">رقم الهاتف</td><td>${escapeHtml(row.phone || '—')}</td>
      </tr>
    </table>
    <table>
      <thead><tr><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>
        ${lines
          .map(
            (l) =>
              `<tr><td style="text-align:center;${l.color ? `background:${l.color} !important;` : ''}">${escapeHtml(
                l.label
              )}</td><td class="num"${l.color ? ` style="background:${l.color} !important;"` : ''}>${escapeHtml(
                fmt(l.value)
              )}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>
    <div class="sign">تاريخ الإصدار: ${today}</div>
    <div class="sign">التوقيع: _______________</div>
  `;

  await htmlToPdf({ html, css: statementCss, fileName, orientation: 'portrait' });
}

export function printHtmlContent(htmlContent: string): void {
  const styledContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: A4; margin: 5mm; }
        body {
          font-family:cairo;
          direction: rtl;
          color: #000 !important;
          background: white;
          line-height: 1.5;
          font-size: 17px;
          font-weight: 900 !important;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: bold;
          margin: 8px 0;
          color: #000 !important;
        }
        table {
          width: 100% !important;
          max-width:auto !important;
          border-collapse: collapse;
          table-layout: auto !important;
          margin: 10px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 3px 5px !important;
          text-align: center;
          vertical-align: middle;
          font-size: 16px;
          color: #000 !important;
          font-weight: 900 !important;
        }
        th {
          border: 1px solid #000 !important;
          background: #1f7fb8;
          color: #000 !important;
          font-weight: 900 !important;
          white-space: normal !important;
          font-size: 18px;
font-family: AlQabas-Bold;


        }
        td:not(.num):not(.idx):not(.numeric-cell) {
          white-space: nowrap !important;
          overflow-wrap: break-word !important;
          word-break: normal !important;
          overflow: visible;
          width: auto !important;
        }
        td.num, td.idx, td.numeric-cell {
          white-space: nowrap !important;
          word-break: keep-all !important;
          overflow-wrap: normal !important;
          hyphens: none !important;
          width: 1% !important;
        }
        .num {
          font-family: 'Times New Roman', Times, serif !important;
          color: #000 !important;
          font-weight: 900 !important;
          direction: ltr;
 white-space: nowrap !important;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }
        @media print {
          * { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white; color: #000 !important; font-weight: 900 !important; width: 100%; margin: 0; padding: 0; }
          table { 
width: 100% !important; max-width:auto!important; }
th, td { color: #000 !important; font-weight: 900 !important; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
  
  printReportHtml(styledContent, "تقرير للطباعة");
}

export function printTable(title: string, columns: string[], rows: (string | number)[][]): void {
  const tableHtml = `
    <h1>${title}</h1>
    <div style="text-align: center; color: #000 !important; margin-bottom: 15px; font-weight: 700;">
      ${new Date().toLocaleDateString('ar-EG-u-nu-latn')}
    </div>
    <table>
      <thead>
        <tr>
          ${columns.map(col => `<th>${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td${typeof cell === 'number' ? ' class="num"' : ''}>${cell === undefined || cell === null ? '' : cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  printHtmlContent(tableHtml);
}

export async function exportTablePdf(opts: {
  title: string;
  columns: { key: string; label: string }[];
  rows: Record<string, any>[];
  numericKeys?: string[];
  fileName: string;
  reportDate?: string;
  pdfLayout?: 'default' | 'wide-centered';
  orientation?: 'portrait' | 'landscape';
}): Promise<void> {
  const {
    title,
    columns,
    rows,
    numericKeys = [],
    fileName,
    reportDate,
    pdfLayout = 'default',
    orientation = 'portrait',
  } = opts;
  const safeDate = reportDate || new Date().toISOString().slice(0, 10);

  await downloadReportPdf({
    title,
    body: buildTableHtml({ title, columns, rows, numericKeys, reportDate }),
    fileName: `${fileName}-${safeDate}.pdf`,
    orientation: opts.orientation ?? (columns.length > 7 || pdfLayout === 'wide-centered' ? 'landscape' : 'portrait'),
  });
}

import revSchema from "@/data/revenueTemplate.json";

type RType = { no: number; title: string };
type RItem = { no: number; title: string; types: RType[] };
type RSection = { no: number; title: string; items: RItem[] };
type RChapter = { no: number; title: string; longTitle?: string; sections: RSection[] };
const REV_SCHEMA = revSchema as { title: string; office: string; chapters: RChapter[] };
const MONTHS_PDF = [
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

export function revenuePdf(revenue: Record<string, number>, year: number, month: number) {
  const get = (m: number, key: string) => revenue[`${year}-${m}-${key}`] || 0;
  const sumPrev = (key: string) => {
    let s = 0;
    for (let m = 1; m < month; m++) s += get(m, key);
    return s;
  };

  const types: Record<string, { cur: number; prev: number }> = {};
  const itemsAgg: Record<string, { cur: number; prev: number }> = {};
  const sectionsAgg: Record<string, { cur: number; prev: number }> = {};
  const chaptersAgg: Record<string, { cur: number; prev: number }> = {};
  let gCur = 0,
    gPrev = 0;
  REV_SCHEMA.chapters.forEach((ch) => {
    let cCur = 0,
      cPrev = 0;
    ch.sections.forEach((sec) => {
      let sCur = 0,
        sPrev = 0;
      sec.items.forEach((it) => {
        let iCur = 0,
          iPrev = 0;
        it.types.forEach((t) => {
          const k = `${ch.no}-${sec.no}-${it.no}-${t.no}`;
          const cur = get(month, k),
            prev = sumPrev(k);
          types[k] = { cur, prev };
          iCur += cur;
          iPrev += prev;
        });
        itemsAgg[`${ch.no}-${sec.no}-${it.no}`] = { cur: iCur, prev: iPrev };
        sCur += iCur;
        sPrev += iPrev;
      });
      sectionsAgg[`${ch.no}-${sec.no}`] = { cur: sCur, prev: sPrev };
      cCur += sCur;
      cPrev += sPrev;
    });
    chaptersAgg[`${ch.no}`] = { cur: cCur, prev: cPrev };
    gCur += cCur;
    gPrev += cPrev;
  });

  const fc = (n: number) =>
    `<span class="num">${escapeHtml(n ? fmt(n) : "-")}</span>`;

  let body = `${reportLetterheadHtml()}<h1>${REV_SCHEMA.title}</h1>`;
  body += `<div class="meta">${REV_SCHEMA.office}</div>`;
  body += `<div class="meta period">عن شهر ${MONTHS_PDF[month - 1]} من العام المالي ${year}م</div>`;
  body += `<table><thead>
    <tr>
      <th rowspan="2">بيان مفردات الموارد</th>
      <th rowspan="2">الباب</th><th rowspan="2">الفصل</th><th rowspan="2">البند</th><th rowspan="2">النوع</th>
      <th>الشهر الجاري</th><th>الأشهر السابقة</th><th>الجملة</th>
    </tr>
    <tr><th>ريال</th><th>ريال</th><th>ريال</th></tr>
  </thead><tbody>`;

  body += `<tr class="total-row"><td class="acc">إجمالي الموارد</td><td colspan="4"></td><td>${fc(gCur)}</td><td>${fc(gPrev)}</td><td>${fc(gCur + gPrev)}</td></tr>`;

  REV_SCHEMA.chapters.forEach((ch) => {
    if (ch.sections.length === 0) return;
    const a = chaptersAgg[ch.no];
    body += `<tr class="group-row"><td class="acc">${ch.longTitle || ch.title}</td><td>${ch.no}</td><td colspan="3"></td><td>${fc(a.cur)}</td><td>${fc(a.prev)}</td><td>${fc(a.cur + a.prev)}</td></tr>`;
    ch.sections.forEach((sec) => {
      const sa = sectionsAgg[`${ch.no}-${sec.no}`];
      body += `<tr class="subtotal-row"><td class="acc">&nbsp;&nbsp;${sec.title}</td><td></td><td>${sec.no}</td><td colspan="2"></td><td>${fc(sa.cur)}</td><td>${fc(sa.prev)}</td><td>${fc(sa.cur + sa.prev)}</td></tr>`;
      sec.items.forEach((it) => {
        const ia = itemsAgg[`${ch.no}-${sec.no}-${it.no}`];
        body += `<tr class="subtotal-row"><td class="acc">&nbsp;&nbsp;&nbsp;&nbsp;${it.title}</td><td colspan="2"></td><td>${it.no}</td><td></td><td>${fc(ia.cur)}</td><td>${fc(ia.prev)}</td><td>${fc(ia.cur + ia.prev)}</td></tr>`;
        it.types.forEach((t) => {
          const v = types[`${ch.no}-${sec.no}-${it.no}-${t.no}`];
          body += `<tr><td class="acc">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${t.title}</td><td colspan="3"></td><td>${t.no}</td><td>${fc(v.cur)}</td><td>${fc(v.prev)}</td><td>${fc(v.cur + v.prev)}</td></tr>`;
        });
      });
    });
  });

  REV_SCHEMA.chapters.forEach((ch) => {
    const a = chaptersAgg[ch.no];
    body += `<tr class="group-row"><td class="acc">إجمالي ${ch.title}</td><td>${ch.no}</td><td colspan="3"></td><td>${fc(a.cur)}</td><td>${fc(a.prev)}</td><td>${fc(a.cur + a.prev)}</td></tr>`;
  });

  const head = `<meta charset="utf-8"><title>${REV_SCHEMA.title} - ${MONTHS_PDF[month - 1]} ${year}م</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Tajawal:wght@400;500;700;900&display=swap">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 5mm; padding: 0; }
    @page :first { margin-top: 5mm; }
    html { margin: 0; padding: 0; }
    body { 
      font-family: Cairo'; 
      direction: rtl; 
      color: #000 !important; 
      margin: 0; 
      padding: 0; 
      width: 100%; 
      background: white;
      line-height: 1.5;
      font-weight: 900 !important;
    }
    h1 { 
      text-align: center; 
      font-size: 18px; 
      font-weight: 900;
      margin: 4px 0; 
      color: #000 !important;
    }
    .meta { 
      text-align: center; 
      font-size: 15px; 
      color: #000 !important;
      font-weight: 900 !important;
    }
    .period { 
      font-weight: 900 !important; 
      color: #000 !important; 
      margin: 2px 0;
      font-size: 15px;
    }
    table { 
      width: 100% !important;
      max-width: 100% !important;
      border: solid 1px black; 
      font-size: 15px !important; 
      table-layout: auto !important;
      margin-top: 8px;
    }
    th, td { 
      border: 1px solid black; 
      padding: 2px 2px !important;
      text-align: center;
      vertical-align: middle;
      font-size: 16px !important;
      font-weight: 900 !important;
      color: #000 !important;
    }
    th {
      border: 2px solid #000 !important;
      background: #1f7fb8;
      color: #000 !important;
      font-weight: 900 !important;
      white-space: nowrap !important;
    }
    td:not(.num):not(.idx) {
      white-space: nowrap !important;
      overflow-wrap: break-word !important;
      word-break: normal !important;
      overflow: visible;
      width: auto !important; 
    }
    td.num, td.idx {
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
      hyphens: none !important;
      width: 1% !important;
    }
    .num {
      font-family: 'Times New Roman', Times, serif !important;
      color: #000 !important;
      font-weight: 900 !important;
      direction: ltr;
    }
    td.acc { 
      text-align: center; 
      font-weight: 900 !important; 
      color: #000 !important;
    }
    tr.group-row td { 
      background: #fef3c7; 
      color: white !important; 
      font-weight: 900 !important; 
      text-align: center; 
    }
    tr.subtotal-row td { 
      background: #cbd5e1; 
      font-weight: 900 !important;
      color: white !important;
    }
    tr.total-row td { 
      background: #1f7fb8; 
      color: white !important; 
      font-weight: 900 !important; 
      white-space: nowrap !important;
    }
    @media print { 
      * { margin: 0; padding: 0; } 
      body { margin: 0; padding: 0; width: 100%; background: white; }
      table { width: 100% !important; max-width: 100% !important; }
      @page { margin: 5mm; }
    }
  </style>`;
  printReportHtml(
    `<!doctype html><html lang="ar" dir="rtl"><head>${head}</head><body>${body}<script>window.onload=()=>{setTimeout(()=>window.print(),500)}</script></body></html>`,
    `${REV_SCHEMA.title} - ${MONTHS_PDF[month - 1]} ${year}م`,
  );
}
