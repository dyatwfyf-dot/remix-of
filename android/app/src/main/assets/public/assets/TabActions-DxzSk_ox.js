import{i as e}from"./rolldown-runtime-COiEfhsA.js";import{C as t,D as n,F as r,R as i,st as a,u as o}from"./vendor-icons-B1CCHuqf.js";import{a as s,c as ee,i as c,n as l,o as u,s as d,t as te}from"./excelExport-DRbJaRDH.js";import{h as f,p}from"./capacitor-BGs8GKJp.js";import{a as m,t as h}from"./browserPrintPreview-Bn6IQjSD.js";import{r as g}from"./reportPdf-Bzyf0cU6.js";import{t as _}from"./WebActionMenu-BJqxu-1S.js";import{n as v}from"./vendor-react-bFf7IZBE.js";var y=e(a(),1),b=v(),x=`/app/applet/src/components/TabActions.tsx`,S=`
/* Base semantic hints for ledger tables; final shared Excel-like rules size every column by content. */
#tableContainer table.hafiza-ledger-table,
#tableContainer table.accounts-ledger-table,
#tableContainer table.journal-ledger-table {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  table-layout: auto !important;
  border-collapse: collapse !important;
  direction: rtl !important;
}
#tableContainer table.hafiza-ledger-table th,
#tableContainer table.hafiza-ledger-table td,
#tableContainer table.accounts-ledger-table th,
#tableContainer table.accounts-ledger-table td,
#tableContainer table.journal-ledger-table th,
#tableContainer table.journal-ledger-table td {
  box-sizing: border-box !important;
  height: auto !important;
  vertical-align: middle !important;
  text-align: center !important;
  line-height: 1.35 !important;
  padding: 3px 4px !important;
}
#tableContainer table.hafiza-ledger-table thead,
#tableContainer table.accounts-ledger-table thead,
#tableContainer table.journal-ledger-table thead {
  display: table-header-group !important;
}
#tableContainer table.hafiza-ledger-table tbody tr,
#tableContainer table.accounts-ledger-table tbody tr,
#tableContainer table.journal-ledger-table tbody tr {
  height: auto !important;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
#tableContainer table.hafiza-ledger-table td.numeric-cell,
#tableContainer table.hafiza-ledger-table td.date-cell,
#tableContainer table.accounts-ledger-table td.numeric-cell,
#tableContainer table.accounts-ledger-table td.date-cell,
#tableContainer table.journal-ledger-table td.numeric-cell,
#tableContainer table.journal-ledger-table td.date-cell {
  white-space: nowrap !important;
  overflow-wrap: normal !important;
  word-break: keep-all !important;
}
@media print {
  #tableContainer table.hafiza-ledger-table,
  #tableContainer table.accounts-ledger-table,
  #tableContainer table.journal-ledger-table {
    table-layout: auto !important;
    width: 100% !important;
  }
}
`,C=`
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
`;function w({title:e,rows:a,printRows:v,columns:C,printColumns:w=C,fileName:T,onClear:E,numericKeys:D=[],className:O=``,printLabel:k=`طباعة`,pdfOrientation:A,pdfMarginMm:j,pdfCss:M,pdfFinalCss:N,renderPrintTableHtml:P,printRowStyle:F,includeTotalRow:I=!0,includeIndexColumn:L=!0,printTableClassName:R=``,excelCellFontSize:z,excelMaxTextLines:B,onPrintRequest:V,onPdfExportRequest:H,additionalWebActions:ne=[],webClassName:re=``,inlineActions:ie=!1}){let[U,W]=(0,y.useState)(!1),{reportDate:G,reportDateLabel:K}=f(),q=v??a,J=()=>P?P(K):m({title:e,columns:w,rows:q,numericKeys:D,reportDate:G,includeTotalRow:I,includeIndexColumn:L,tableClassName:R,rowStyleResolver:F}),Y=()=>{if(V){V();return}if(!q.length){p.error(`لا توجد بيانات للطباعة`);return}let t=A===`portrait`?`portrait`:A===`landscape`||w.length>7?`landscape`:`portrait`;h({title:e,reportDateLabel:K,tableHtml:J(),contentCss:M?`${g}\n${M}`:g,finalCss:[S,N].filter(Boolean).join(`
`),defaultOrientation:t,defaultPageSize:`A4`,...j===void 0?{}:{defaultMarginMm:j}})||p.error(`تم منع فتح نافذة المتصفح، يرجى السماح بالنوافذ المنبثقة (Popups) في كروم`)},X=async()=>{if(H){if(!q.length){p.error(`لا توجد بيانات للتصدير`);return}H()}else if(!q.length)p.error(`لا توجد بيانات للتصدير`);else if(!U){W(!0);try{let t=A===`portrait`?`portrait`:A===`landscape`||w.length>7?`landscape`:`portrait`;if(!h({title:e,reportDateLabel:K,tableHtml:J(),contentCss:M?`${g}\n${M}`:g,finalCss:[S,N].filter(Boolean).join(`
`),defaultOrientation:t,defaultPageSize:`A4`,...j===void 0?{}:{defaultMarginMm:j},autoDownloadPdf:!0,downloadFileName:`${T}-${G||new Date().toISOString().slice(0,10)}.pdf`})){p.error(`تعذر فتح معاينة التقرير؛ اسمح بالنوافذ المنبثقة ثم أعد المحاولة`);return}p.success(`تم فتح واجهة تصدير PDF؛ اختر «حفظ كملف PDF» لإتمام الحفظ`)}catch(e){console.error(`PDF export error:`,e),p.error(`تعذّر فتح واجهة تصدير PDF، حاول مرة أخرى`)}finally{W(!1)}}},Z=async()=>{let t=a.filter(e=>e?.summaryLevel!==`summary-card`);if(!t.length)p.error(`لا توجد بيانات للتصدير`);else try{let n=[...L?[`م`]:[],...C.map(e=>e.label)],r=t.map((e,t)=>[...L?[t+1]:[],...C.map(t=>{let n=e[t.key];return D.includes(t.key)||typeof n==`number`?Number(n)||0:n??``})]),i=t.filter(e=>e?.summaryLevel===`detail`),a=t.filter(e=>e?.summaryLevel===`fee`),o=t.filter(e=>e?.summaryLevel===`period`),f=i.length?i:a.length?a:o.length?o:t.filter(e=>e?.summaryLevel!==`total`&&e?.summaryLevel!==`opening`&&e?.summaryLevel!==`signature`&&e?.summaryLevel!==`trainee-fee-total`&&e?.summaryLevel!==`trainee-name-total`&&e?.total!==`نعم`),m=[...L?[`الإجمالي`]:[],...C.map(e=>D.includes(e.key)?f.reduce((t,n)=>t+(Number(n[e.key])||0),0):``)],h=await c(),g=h.addWorksheet(e.slice(0,31)||`Sheet1`),_=await ee(h),v=te(h,g,{title:e,reportDateLabel:K,recordCount:t.length,totalColumns:n.length,palette:d(e)},_);l(g,[n,...r,m],v),u(g,{headerRow:v,totalRows:[v+r.length+1],palette:d(e)}),(z||B)&&g.eachRow({includeEmpty:!0},(e,t)=>{if(t<v)return;let n=Number.isFinite(B)?Math.max(1,Math.floor(B)):1/0,r=t===v?Math.min(2,n):1;e.eachCell({includeEmpty:!0},e=>{z&&(e.font={...e.font||{},name:`Arial`,size:z}),e.alignment={...e.alignment||{},vertical:`middle`,wrapText:!0,shrinkToFit:!1};let t=g.getColumn(e.col).width||12,i=String(e.value??``).split(/\r?\n/).reduce((e,n)=>e+Math.max(1,Math.ceil(n.length/Math.max(8,t-2))),0);r=Math.max(r,Math.min(n,i))}),e.height=Math.max(18,r*14+4)}),await s(h,`${T}-${G}.xlsx`),p.success(`تم تصدير الملف بنجاح`)}catch(e){console.error(`Excel export error:`,e),p.error(`تعذّر تصدير ملف Excel، حاول مرة أخرى`)}},Q=()=>{E&&confirm(`هل أنت متأكد من مسح جميع بيانات: ${e}؟ لا يمكن التراجع.`)&&(E(),p.success(`تم مسح البيانات`))},$=[...ne,{label:k,icon:t,onSelect:Y},{label:U?`جارٍ التحضير…`:H?`تصدير PDF`:`تنزيل PDF`,icon:U?n:i,onSelect:X,disabled:U},{label:`تصدير Excel`,icon:r,onSelect:Z},...E?[{label:`مسح البيانات`,icon:o,onSelect:Q,destructive:!0}]:[]];return(0,b.jsxDEV)(b.Fragment,{children:[(0,b.jsxDEV)(`div`,{className:`web-only-actions ${re}`,children:ie?(0,b.jsxDEV)(`div`,{className:`accounts-inline-actions`,children:$.map(e=>{let t=e.icon,n=e.destructive?`clear`:e.label.includes(`طباعة`)?`print`:e.label.includes(`PDF`)||e.label.includes(`تنزيل`)?`pdf`:`excel`;return(0,b.jsxDEV)(`button`,{type:`button`,disabled:e.disabled,onClick:e.onSelect,title:e.label,className:`accounts-inline-action accounts-inline-action--${n}`,children:[t?(0,b.jsxDEV)(t,{className:`accounts-inline-action__icon`,"aria-hidden":`true`},void 0,!1,{fileName:x,lineNumber:386,columnNumber:27},this):null,(0,b.jsxDEV)(`span`,{children:e.label},void 0,!1,{fileName:x,lineNumber:387,columnNumber:19},this)]},e.label,!0,{fileName:x,lineNumber:378,columnNumber:17},this)})},void 0,!1,{fileName:x,lineNumber:367,columnNumber:11},this):(0,b.jsxDEV)(_,{label:`إجراءات ${e}`,actions:$,className:`w-full sm:w-auto`},void 0,!1,{fileName:x,lineNumber:393,columnNumber:11},this)},void 0,!1,{fileName:x,lineNumber:365,columnNumber:7},this),(0,b.jsxDEV)(`div`,{className:`apk-only-actions flex flex-wrap gap-2 ${O}`,children:[(0,b.jsxDEV)(`button`,{onClick:Y,className:`flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#10528e] border border-[#10528e]/30 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 active:scale-95 transition-all cursor-pointer`,title:`معاينة وطباعة هذا التبويب في نافذة كروم`,children:[(0,b.jsxDEV)(t,{className:`w-4 h-4`},void 0,!1,{fileName:x,lineNumber:403,columnNumber:11},this),` `,k]},void 0,!0,{fileName:x,lineNumber:398,columnNumber:9},this),(0,b.jsxDEV)(`button`,{onClick:X,disabled:U,className:`flex items-center gap-1.5 px-3 py-1.5 bg-[#10528e] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[#0d4272] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait`,title:H?`تصدير التقرير وفق إعدادات التقارير`:`تنزيل PDF بنفس تنسيق الطباعة`,children:U?(0,b.jsxDEV)(b.Fragment,{children:[(0,b.jsxDEV)(n,{className:`w-4 h-4 animate-spin`},void 0,!1,{fileName:x,lineNumber:414,columnNumber:15},this),` جارٍ التحضير…`]},void 0,!0,{fileName:x,lineNumber:413,columnNumber:13},this):(0,b.jsxDEV)(b.Fragment,{children:[(0,b.jsxDEV)(i,{className:`w-4 h-4`},void 0,!1,{fileName:x,lineNumber:418,columnNumber:15},this),` `,H?`تصدير PDF`:`تنزيل PDF`]},void 0,!0,{fileName:x,lineNumber:417,columnNumber:13},this)},void 0,!1,{fileName:x,lineNumber:406,columnNumber:9},this),(0,b.jsxDEV)(`button`,{onClick:Z,className:`flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer`,title:`تصدير إلى Excel`,children:[(0,b.jsxDEV)(r,{className:`w-4 h-4`},void 0,!1,{fileName:x,lineNumber:428,columnNumber:11},this),` تصدير Excel`]},void 0,!0,{fileName:x,lineNumber:423,columnNumber:9},this),E&&(0,b.jsxDEV)(`button`,{onClick:Q,className:`flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer`,title:`مسح بيانات هذا التبويب`,children:[(0,b.jsxDEV)(o,{className:`w-4 h-4`},void 0,!1,{fileName:x,lineNumber:437,columnNumber:13},this),` مسح البيانات`]},void 0,!0,{fileName:x,lineNumber:432,columnNumber:11},this)]},void 0,!0,{fileName:x,lineNumber:397,columnNumber:7},this)]},void 0,!0,{fileName:x,lineNumber:364,columnNumber:5},this)}export{C as n,w as t};