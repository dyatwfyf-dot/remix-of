import { reportsCompactColumnsCss, tagReportCells } from "./reportsCompactColumnsCss";
import { deliverBlobToUser, isNativeFileStorageAvailable } from './nativeFileStorage';
import { escapeHtml, reportLetterheadHtml } from './printTableHtml';
import { reportTableThemeCss } from './reportTheme';

export type ReportPaperSize = 'A4' | 'A3' | 'Letter';
export type ReportOrientation = 'portrait' | 'landscape';

export const reportDocumentCss = `
  :root { 
    --report-paper: #ffffff; 
    --report-ink: #000000; 
    --report-muted: #334155;
    --report-rule: #000000; 
    --report-stripe: #f8fafc;
    --report-total: #0437bb; 
    --report-accent: #174258; 
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { 
    margin: 0; 
    padding: 0; 
    direction: rtl; 
    background: var(--report-paper);
    color: #000000; 
    font-family: Cairo !important; 
    font-size: 16px; 
    line-height: 1.4; 
    font-weight: 800;
    width: 100% !important;
    height: auto !important;
  }
  h1, h2 { text-align: center; color: #000000; font-size: 22px; margin: 0 0 6px; font-weight: 900; white-space: pre-line; line-height: 1.4; }
  .sub, .meta { text-align: center; color: #000000; font-size: 18px; margin-bottom: 8px; font-weight: 700; }
  table {
    width: 100%; 
    max-width: auto;
    border-collapse: collapse; 
    table-layout: auto; 
    text-align: center; 
    font-weight: 800;
  }
  th, td {
    padding: 6px 7px;
    text-align: center !important;
    vertical-align: middle !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
    border: 1px solid #000000 !important;
  }
  thead th {
    background: #FFD700 !important;
    color: #000000 !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  thead th .pdf-cell-text {
  
  color: #000000 !important; 
    
  }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  .total-row td,
  .report-grand-total-row td {
    background: #0437bb !important;
    font-weight: 900 !important;
    border-top: 2px solid #000000 !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .total-row td .pdf-cell-text,
  .report-grand-total-row td .pdf-cell-text { 
background: #0437bb !important;
  color: #ffffff !important; }
  .doc-title-cell { border: 0 !important; background: var(--report-paper); padding: 0 0 6px; }

  /* ===== إطار الترويسة الموحّد للتقارير الرسمية ===== */
  .report-letterhead-block {
    display: block;
    width: 100%;
    margin: 0 0 3mm;
  }
  .report-letterhead-frame {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: 1.5px solid #000000;
    border-radius: 4px;
    padding: 5px 12px;
    background: #ffffff;
    box-sizing: border-box;
    color: #000000;
  }
  .report-letterhead-side {
    flex: 1 1 36%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #000000;
  }
  .report-letterhead-right {
    text-align: right;
    direction: rtl;
  }
  .letterhead-title-ar {
    font-family: Cairo !important;
    font-size: 13.5px;
    font-weight: 900;
    line-height: 1.3;
    color: #000000;
  }
  .letterhead-sub-ar {
    font-family: Cairo !important;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.3;
    color: #000000;
  }
  .letterhead-branch-ar {
    font-family: Cairo !important;
    font-size: 12.5px;
    font-weight: 900;
    line-height: 1.3;
    color: #000000;
  }
  .report-letterhead-center {
    flex: 0 0 28%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 4px;
  }
  .letterhead-bismillah {
    font-family: Cairo !important;
    font-size: 14.5px;
    font-weight: 900;
    color: #000000;
    white-space: nowrap;
  }
  .letterhead-center-divider {
    width: 75px;
    height: 1.5px;
    background: #000000;
    margin: 3px auto 0;
  }
  .report-letterhead-left {
    text-align: left;
    direction: ltr;
  }
  .letterhead-title-en {
    font-family: Arial, Cairo !important;
    font-size: 12px;
    font-weight: 900;
    line-height: 1.25;
    color: #000000;
  }
  .letterhead-sub-en {
    font-family: Arial, Cairo !important;
    font-size: 10.5px;
    font-weight: 800;
    line-height: 1.25;
    color: #000000;
  }
  .letterhead-branch-en {
    font-family: Arial, Cairo !important;
    font-size: 11px;
    font-weight: 900;
    line-height: 1.25;
    color: #000000;
  }

  .num, .numeric-cell, .date-cell, .idx { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
`;

export const reportContainmentCss = `
  .report-page-content { 
    width: 100%; 
    max-width: auto; 
  }
  .report-page-content th
  {
  min-width: auto !important;
padding: 6px 7px!important;
margin: 0 !important;
text-align: center !important;
vertical-align: middle !important;
font-family: Cairo !important;
font-size: 16px !important;
font-weight: 800!important;
line-height: 1.35!important;
border: 1px solid #000000 !important;
    color: #ffffff !important;
  }
  .report-page-content td {
   min-width: auto !important;
  padding: 6px 7px !important;
    margin: 0 !important;
text-align: center !important;
vertical-align: middle !important; 
font-family: Cairo !important;
font-size: 16px !important;
font-weight: 800 !important;
line-height: 1.35 !important;
border: 1px solid #000000 !important;

  }
  .report-page-content thead th {
    font-size: 16px !important;
    padding: 7px 7px !important;
    font-weight: 900 !important;
    background: #FFD700 !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-page-content thead th .pdf-cell-text {
    color: #000000 !important;
    background: transparent !important;
  }
  .report-page-content .total-row td,
  .report-page-content .report-grand-total-row td {
    background: #0437bb !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-page-content .total-row td .pdf-cell-text,
  .report-page-content .report-grand-total-row td .pdf-cell-text {
  background: #0437bb !important;
    color: #ffffff !important;
  }

  /* كتلة التوقيعات الموحدة: ثلاثة مسميات في صف وثلاثة أسماء أسفلها */
  .report-page-content .signature-spacer-row,
  .report-page-content .signature-spacer-row > td {
    height: 20mm !important;
    min-height: 20mm !important;
    padding: 0 !important;
    border: 0 !important;
    background: #ffffff !important;
    line-height: 0 !important;
  }
  .report-page-content .signature-block-row {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .report-page-content .signature-block-row > td {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    padding: 14px 18px !important;
    color: #000000 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .report-page-content .signature-block-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 6px 12px !important;
    width: 100% !important;
    min-width: 0 !important;
    direction: rtl !important;
    align-items: end !important;
  }
  .report-page-content .sig-title {
    font-family: Cairo, sans-serif !important;
    font-weight: 900 !important;
    font-size: 16px !important;
    color: #000000 !important;
    text-align: center !important;
    padding: 4px !important;
    line-height: 1.3 !important;
    min-width: 0 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content .sig-name {
    font-family: Cairo, sans-serif !important;
    font-weight: 800 !important;
    font-size: 16px !important;
    color: #000000 !important;
    text-align: center !important;
    padding: 4px !important;
    min-height: 24px !important;
    border-bottom: 1px dotted #000000 !important;
    min-width: 0 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content table {
    width: 100% !important; 
    max-width: auto !important;
    table-layout: auto !important; 
  }
  .report-page-content tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]),
  .report-page-content tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]) .pdf-cell-text {
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
    border: 1px solid #000000 !important;

  }
  .report-page-content tbody td.desc-cell,
  .report-page-content tbody td.details-cell,
  .report-page-content tbody td.description-cell,
  .report-page-content tbody td[data-col-key="description"],
  .report-page-content tbody td.desc-cell .pdf-cell-text,
  .report-page-content tbody td.details-cell .pdf-cell-text,
  .report-page-content tbody td.description-cell .pdf-cell-text,
  .report-page-content tbody td[data-col-key="description"] .pdf-cell-text {
  border: 1px solid #000000 !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: normal !important;
    min-width: auto !important; 
    text-align: center !important;
  }
  .report-page-content .num, .report-page-content .numeric-cell, .report-page-content .date-cell,
  .report-page-content .idx, .report-page-content .cell-number { 
    direction: ltr !important; 
    unicode-bidi: isolate;
    white-space: nowrap !important; 
    overflow-wrap: normal !important; 
    word-break: keep-all !important; 
  }
  .report-page-content .pdf-cell-text {
  border: 1px solid #000000 !important;
    font-family: Cairo !important;
    font-size: 16px !important;
    text-align: center !important;
    vertical-align: middle !important;
  }
  .report-page-content thead { display: table-header-group; }
  .report-page-content tr { break-inside: avoid; }
  .report-page-content .report-letterhead-cell { 
    background: var(--report-paper) !important; 
    border: none !important; 
    padding: 0 !important;
  }

  /* تنسيق إطار الترويسة داخل المحتوى المحول إلى PDF */
  .report-page-content .report-letterhead-block {
    display: block !important;
    width: 100% !important;
    margin: 0 auto 3mm !important;
  }
  .report-page-content table th,
  .report-page-content table td {
    display: flex !important;
    vertical-align: middle !important;
    text-align: center !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
  }
  .report-page-content table th > *,
  .report-page-content table td > * {
    vertical-align: middle !important;
  }
  .report-page-content .pdf-cell-text {
    display: inline-block !important;
    vertical-align: middle !important;
    font-size: 16px !important;
    line-height: 2.5 !important;
  }

  .report-page-content .report-letterhead-frame {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    border: 1.5px solid #000000 !important;
    border-radius: 4px !important;
    padding: 5px 12px !important;
    background: #ffffff !important;
    box-sizing: border-box !important;
  }

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
    background: #0437bb !important;
  color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { 
background: #0437bb !important;

  color: #ffffff !important; }

  /* Fit report columns to their values; wrap only semantic text cells. */
  .report-page-content table.reports-data-table tbody td.text-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.name-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.specialty-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.batch-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
  .report-page-content table.reports-data-table tbody td.desc-cell,
  .report-page-content table.reports-data-table tbody td.details-cell,
  .report-page-content table.reports-data-table tbody td.description-cell {
    width: auto !important;
    min-width: 0 !important;
    max-width: 280px !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content table.reports-data-table tbody td.text-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.name-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.specialty-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.batch-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.desc-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.details-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.description-cell .pdf-cell-text {
    display: flex !important;
    width: auto !important;
    max-width: auto !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }
  .report-page-content table.reports-data-table tbody td.num,
  .report-page-content table.reports-data-table tbody td.numeric-cell,
  .report-page-content table.reports-data-table tbody td.date-cell,
  .report-page-content table.reports-data-table tbody td.compact-cell,
  .report-page-content table.reports-data-table tbody td.ref-cell,
  .report-page-content table.reports-data-table tbody td.idx,
  .report-page-content table.reports-data-table tbody td.num .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.numeric-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.date-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.compact-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.ref-cell .pdf-cell-text,
  .report-page-content table.reports-data-table tbody td.idx .pdf-cell-text {
    max-width: auto !important;
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
  }
`;
const dimensions = (size: ReportPaperSize, orientation: ReportOrientation) => {
  const [short, long] = size === 'A3' ? [297, 420] : size === 'Letter' ? [215.9, 279.4] : [210, 297];
  return orientation === 'landscape' ? [long, short] : [short, long];
};

async function ready(doc: Document) {
  const fontReady = doc.fonts?.ready ?? Promise.resolve();
  await Promise.race([
    fontReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
  ]);
  await Promise.all(Array.from(doc.images).map(image => {
    if (image.complete) return Promise.resolve();
    return image.decode().catch(() => undefined);
  }));
}

export async function downloadRenderedReportPdf(source: HTMLElement, options: {
  fileName: string; pageSize?: ReportPaperSize; orientation?: ReportOrientation; marginMm?: number;
  fitToContent?: boolean;
}) {
  const { fileName, pageSize = 'A4', orientation = 'portrait', marginMm = 3, fitToContent = false } = options;
  const doc = source.ownerDocument;
  tagReportCells(source);
  await ready(doc);
  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const [widthMm, pageHeightMm] = dimensions(pageSize, orientation);
  let heightMm = pageHeightMm;
  const pxPerMm = 96 / 25.4;
  const holder = doc.createElement('div');
  holder.style.cssText = 'position:absolute;left:-20000px;top:0;pointer-events:none;';
  const paper = doc.createElement('div');
  paper.style.cssText = fitToContent
    ? `width:${widthMm}mm;height:auto;min-height:0;padding:0;box-sizing:border-box;background:var(--report-paper,#fff);display:flex;flex-direction:column;`
    : `width:${widthMm}mm;min-height:${heightMm}mm;padding:${marginMm}mm;box-sizing:border-box;background:var(--report-paper,#fff);display:flex;flex-direction:column;`;
  const content = source.cloneNode(true) as HTMLElement;
  content.classList.add('report-page-content');
  // Keep the scale selected by the browser preview; do not apply a second fit scale.
  content.style.cssText = fitToContent
    ? 'width:100%;max-width:100%;max-height:none;height:auto;min-height:0;flex:0 0 auto;padding:0;margin:0;border:1px solid #000;box-shadow:none;transform:none;'
    : 'width:100%;max-width:100%;max-height:none;height:auto;min-height:0;flex:0 0 auto;padding:0;margin:0;border:0;box-shadow:none;transform:none;';
  const footer = doc.createElement('div');
  footer.style.cssText = 'margin-top:8px;padding-top:6px;text-align:center;font-size:14px;color:#000000;direction:rtl;font-weight:700;';
  if (fitToContent) footer.style.display = 'none';
  paper.append(content, footer);
  holder.append(paper);
  doc.body.append(holder);
  
  try {
    const table = Array.from(content.querySelectorAll('table')).sort((a, b) => b.rows.length - a.rows.length)[0];
    const body = table?.tBodies[0];
    
    // استخراج الصفوف الظاهرة فقط
    const allRows = body ? Array.from(body.rows).filter(r => (r as HTMLElement).style.display !== 'none') : [];
    // Keep every visible row in its original preview order, including the total row.
    const rows = allRows.map(r => r.cloneNode(true) as HTMLTableRowElement);
    
    if (body) body.replaceChildren();
    
    const maxHeight = (heightMm - marginMm * 2) * pxPerMm - 35;
    // The preview already computes the correct scale for the selected paper size.
    
    const overflows = () => {
      const h = content.offsetHeight || content.getBoundingClientRect().height;
      return h > maxHeight;
    };
    
    const groups: HTMLTableRowElement[][] = [];
    let group: HTMLTableRowElement[] = [];
    
    if (fitToContent) {
      body?.replaceChildren(...rows);
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      // قَصّ طول الصفحة إلى الارتفاع الفعلي للمحتوى بدل مساحة A4 الفارغة.
      heightMm = Math.max(40, Math.ceil((paper.scrollHeight / pxPerMm) * 10) / 10);
      paper.style.height = `${heightMm}mm`;
      groups.push(rows);
    } else if (rows.length === 0) {
      groups.push([]);
    } else {
      for (const row of rows) {
        body?.append(row);
        if (overflows() && group.length > 0) {
          row.remove();
          groups.push(group);
          group = [];
          body?.replaceChildren(row);
        }
        group.push(row);
      }
      if (group.length > 0) {
        groups.push(group);
      }
    }
    
    const pdf = new JsPDF({
      unit: 'mm',
      format: fitToContent ? [widthMm, heightMm] : pageSize.toLowerCase(),
      orientation,
      compress: true,
    });
    pdf.setProperties({ title: fileName.replace(/\.pdf$/i, ''), subject: 'تقرير مالي', creator: 'المجلس اليمني للاختصاصات الطبية' });
    
    for (let index = 0; index < groups.length; index++) {
      const currentRows = [...groups[index]];
      if (body) body.replaceChildren(...currentRows);
      footer.textContent = `صفحة ${index + 1} من ${groups.length}`;
      
      const canvas = await html2canvas(paper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: Math.ceil(widthMm * pxPerMm),
        scrollX: 0,
        scrollY: 0,
      });
      if (!canvas.width || !canvas.height) throw new Error('تعذر تجهيز صورة التقرير');
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('تعذر ترميز صفحة التقرير'));
        }, 'image/png');
      });
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
      if (index > 0) pdf.addPage();
      pdf.addImage(pngBytes, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
      canvas.width = 0;
      canvas.height = 0;
    }
    
    const blob = pdf.output('blob');
    const downloadName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    if (!blob.size) throw new Error('تم إنشاء ملف PDF فارغ');

    // Android WebView لا ينفذ تنزيل blob كمتصفح عادي؛ سلّم الملف للمشاركة.
    if (isNativeFileStorageAvailable()) {
      const delivered = await deliverBlobToUser(blob, downloadName);
      if (!delivered) throw new Error('تعذر تسليم ملف PDF إلى Android');
      return;
    }

    const url = URL.createObjectURL(blob);
    // أنشئ رابط التنزيل في النافذة العليا، لا داخل iframe إنشاء التقرير.
    let downloadDocument = doc;
    try {
      downloadDocument = doc.defaultView?.top?.document ?? window.document;
    } catch {
      downloadDocument = window.document;
    }
    const anchor = downloadDocument.createElement('a');
    anchor.href = url;
    anchor.download = downloadName;
    anchor.rel = 'noopener';
    anchor.style.position = 'fixed';
    anchor.style.left = '-10000px';
    anchor.style.top = '0';
    downloadDocument.body.append(anchor);
    try {
      anchor.click();
    } catch (error) {
      console.warn('[PDF] Anchor download failed; opening the generated file', error);
      const opened = window.open(url, '_blank');
      if (!opened) throw new Error('تعذر فتح ملف PDF الناتج');
    } finally {
      anchor.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } finally {
    holder.remove();
  }
}

export async function downloadReportPdf(options: {
  title: string; body: string; css?: string; fileName: string;
  pageSize?: ReportPaperSize; orientation?: ReportOrientation; marginMm?: number;
  fitToContent?: boolean;
}) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-20000px;top:20000px;width:2800px;height:2800px;border:0;pointer-events:none;font-family:Cairo';
  document.body.append(frame);
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('تعذر تجهيز التقرير');
    doc.open();
    doc.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(options.title)}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>${reportDocumentCss}
      ${reportContainmentCss}
      ${options.css || ''}
      ${reportsCompactColumnsCss}
      ${reportTableThemeCss}</style></head><body><div id="report-source" class="report-page-content">
      ${options.body.includes('report-letterhead') ? '' : reportLetterheadHtml()}${options.body}</div></body></html>`);
    doc.close();
    const source = doc.getElementById('report-source');
    if (!source) throw new Error('تعذر تحديد محتوى التقرير');
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
    await downloadRenderedReportPdf(source, options);
  } finally {
    frame.remove();
  }
}

export async function downloadReportDocumentPdf(html: string, title: string, orientation: ReportOrientation = 'portrait') {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script').forEach(script => script.remove());
  const css = Array.from(parsed.querySelectorAll('style')).map(style => style.textContent || '').join('\n');
  await downloadReportPdf({
    title,
    body: parsed.body.innerHTML,
    css,
    orientation,
    fileName: `${title.replace(/[\\/:*?"<>|]/g, '-')}.pdf`
  });
}
