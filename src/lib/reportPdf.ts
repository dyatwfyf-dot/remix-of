import { saveBlobToInternalStorage } from './nativeFileStorage';
import { escapeHtml, reportLetterheadHtml } from './printTableHtml';

export type ReportPaperSize = 'A4' | 'A3' | 'Letter';
export type ReportOrientation = 'portrait' | 'landscape';

/** Shared, isolated document palette; does not inherit the application's screen theme. */
export const reportDocumentCss = `
  :root { --report-paper:#ffffff; --report-ink:#172b35; --report-muted:#526773;
    --report-rule:#718994; --report-header:#dceef2; --report-stripe:#f0f7f8;
    --report-total:#e4f1de; --report-accent:#176b74; }
  * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { margin:0; padding:0; direction:rtl; background:var(--report-paper);
    color:var(--report-ink); font-family:'Report Arabic','Cairo',Tahoma,sans-serif; font-size:13px; line-height:1.45; }
  h1,h2 { text-align:center; color:var(--report-accent); font-size:20px; margin:0 0 6px; }
  .sub,.meta { text-align:center; color:var(--report-muted); font-size:12px; margin-bottom:10px; }
  table { width:100%; border-collapse:collapse; table-layout:auto; }
  th,td { border:1px solid var(--report-rule); padding:5px 6px; text-align:center; vertical-align:middle; }
  thead th { background:var(--report-header); color:var(--report-ink); font-weight:800; }
  tbody tr:nth-child(even) td { background:var(--report-stripe); }
  .total-row td { background:var(--report-total); font-weight:800; border-top:2px solid var(--report-accent); }
  .doc-title-cell { border:0; background:var(--report-paper); padding:0 0 8px; }
  .report-letterhead-block { width:100%; height:26mm; margin:0 0 3mm; }
  .report-letterhead-image { display:flex; width:100%; height:100%; object-fit:fill; }
  .num,.numeric-cell,.date-cell,.idx { direction:ltr; unicode-bidi:isolate; font-variant-numeric:tabular-nums; }
`;

export const reportContainmentCss = `
  .report-page-content { width:100%; max-width:auto; }
  .report-page-content table { width:100% !important; max-width:100% !important; table-layout:auto !important; }
  .report-page-content th,.report-page-content td { min-width:auto !important; white-space:nowrap !important;
    overflow-wrap:anywhere !important; word-break:normal !important; }
  .report-page-content .num,.report-page-content .numeric-cell,.report-page-content .date-cell,
  .report-page-content .idx,.report-page-content .cell-number { direction:ltr !important; unicode-bidi:isolate;
    white-space:nowrap !important; overflow-wrap:normal !important; word-break:keep-all !important; }
  .report-page-content .pdf-cell-text { white-space:normal !important; font-size:inherit; }
  .report-page-content thead { display:table-header-group; }
  .report-page-content tr { break-inside:avoid; }
  .report-page-content .report-letterhead-cell { background:var(--report-paper) !important; border:0 !important; }
  .report-page-content .report-letterhead-cell img { max-height:26mm; object-fit:fill; }
`;

const dimensions = (size: ReportPaperSize, orientation: ReportOrientation) => {
  const [short, long] = size === 'A3' ? [297, 420] : size === 'Letter' ? [215.9, 279.4] : [210, 297];
  return orientation === 'landscape' ? [long, short] : [short, long];
};

async function ready(doc: Document) {
  await doc.fonts.ready;
  await Promise.all(Array.from(doc.images).map(image => image.decode().catch(() => undefined)));
}

export async function downloadRenderedReportPdf(source: HTMLElement, options: {
  fileName: string; pageSize?: ReportPaperSize; orientation?: ReportOrientation; marginMm?: number;
}) {
  const { fileName, pageSize = 'A4', orientation = 'portrait', marginMm = 2} = options;
  const doc = source.ownerDocument;
  await ready(doc);
  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const [widthMm, heightMm] = dimensions(pageSize, orientation);
  const pxPerMm = 96 / 25.4;
  const holder = doc.createElement('div');
  holder.style.cssText = 'position:absolute;left:-20000px;top:0;pointer-events:none;';
  const paper = doc.createElement('div');
  paper.style.cssText = `width:${widthMm}mm;height:${heightMm}mm;padding:${marginMm}mm;box-sizing:border-box;background:var(--report-paper,#fff);display:flex;flex-direction:column;`;
  const content = source.cloneNode(true) as HTMLElement;
  content.classList.add('report-page-content');
  content.style.cssText = 'width:100%;min-height:auto;height:auto;padding:0;margin:0;border:0;box-shadow:none;transform:none;';
  const footer = doc.createElement('div');
  footer.style.cssText = 'margin-top:auto;padding-top:2mm;text-align:center;font-size:16px;color:var(--report-muted);direction:rtl;';
  paper.append(content, footer);
  holder.append(paper);
  doc.body.append(holder);
  try {
    // Paginate by actual rendered row heights, preserving all headers and original totals.
    const table = Array.from(content.querySelectorAll('table')).sort((a,b) => b.rows.length - a.rows.length)[0];
    const body = table?.tBodies[0];
    const rows = body ? Array.from(body.rows).map(row => row.cloneNode(true) as HTMLTableRowElement) : [];
    if (body) body.replaceChildren();
    const maxHeight = (heightMm - marginMm * 2) * pxPerMm - 22;
    const fitWidth = () => {
      content.style.zoom = '1';
      const available = (widthMm - marginMm * 2) * pxPerMm;
      if (content.scrollWidth > available + 1) content.style.zoom = String(available / content.scrollWidth);
    };
    const overflows = () => content.getBoundingClientRect().height > maxHeight;
    const groups: HTMLTableRowElement[][] = [];
    let group: HTMLTableRowElement[] = [];
    for (const row of rows) {
      body?.append(row);
      fitWidth();
      if (overflows() && group.length) {
        row.remove();
        groups.push(group);
        group = [];
        body?.replaceChildren(row);
      }
      group.push(row);
    }
    groups.push(group);
    const pdf = new JsPDF({ unit:'mm', format:pageSize.toLowerCase(), orientation, compress:true });
    pdf.setProperties({ title:fileName.replace(/\.pdf$/i,''), subject:'تقرير مالي', creator:'المجلس اليمني للاختصاصات الطبية' });
    for (let index = 0; index < groups.length; index++) {
      body?.replaceChildren(...groups[index]);
      fitWidth();
      if (overflows()) throw new Error('أحد صفوف التقرير أكبر من مساحة الورقة؛ اختر ورقة أكبر');
      footer.textContent = `صفحة ${index + 1} من ${groups.length}`;
      const canvas = await html2canvas(paper, { scale:2, useCORS:true, backgroundColor:null,
        logging:false, windowWidth:Math.ceil(widthMm * pxPerMm), scrollX:0, scrollY:0 });
      if (index) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    }
    const blob = pdf.output('blob');
    if (await saveBlobToInternalStorage(blob, fileName)) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = fileName;
    document.body.append(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } finally { holder.remove(); }
}

export async function downloadReportPdf(options: {
  title:string; body:string; css?:string; fileName:string;
  pageSize?:ReportPaperSize; orientation?:ReportOrientation; marginMm?:number;
}) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden','true');
  frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px;height:1800px;border:0;pointer-events:none;';
  document.body.append(frame);
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('تعذر تجهيز التقرير');
    doc.open();
    doc.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(options.title)}</title>
      <style>@font-face{font-family:'cairo';src:url('${window.location.origin}/public/Cairo-Regular-normal.js')} ${reportDocumentCss}
      ${options.css || ''} ${reportContainmentCss}</style></head><body><div id="report-source" class="report-page-content">
      ${options.body.includes('report-letterhead') ? '' : reportLetterheadHtml()}${options.body}</div></body></html>`);
    doc.close();
    const source = doc.getElementById('report-source');
    if (!source) throw new Error('تعذر تحديد محتوى التقرير');
    await downloadRenderedReportPdf(source, options);
  } finally { frame.remove(); }
}

/** Accept legacy builders without running their embedded automatic-print scripts. */
export async function downloadReportDocumentPdf(html: string, title: string, orientation: ReportOrientation = 'landscape') {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script').forEach(script => script.remove());
  const css = Array.from(parsed.querySelectorAll('style')).map(style => style.textContent || '').join('\n');
  await downloadReportPdf({ title, body:parsed.body.innerHTML, css, orientation,
    fileName:`${title.replace(/[\\/:*?"<>|]/g, '-')}.pdf` });
}