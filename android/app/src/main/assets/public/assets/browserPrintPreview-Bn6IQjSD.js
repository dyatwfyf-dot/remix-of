const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-capacitor-CGjsZc7I.js","assets/rolldown-runtime-COiEfhsA.js","assets/esm-BqaYp_Yq.js"])))=>i.map(i=>d[i]);
import{a as e,o as t,r as n,t as r}from"./vendor-capacitor-CGjsZc7I.js";import{f as i,i as a,m as o,n as s,o as c}from"./capacitor-BGs8GKJp.js";var l=e=>e==null||isNaN(Number(e))?``:Number(e).toLocaleString(`en-US`),u=()=>new Date().toISOString().slice(0,10),d=`exports`;function f(){return typeof window<`u`&&t.isNativePlatform()}function p(e){return String(e||`export`).replace(/[\\/:*?"<>|\u0000-\u001f]/g,`-`).replace(/\s+/g,`_`).trim()||`export`}async function m(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=typeof r.result==`string`?r.result:``,i=e.indexOf(`,`);i<0?n(Error(`تعذر تحويل الملف إلى صيغة التخزين الداخلية`)):t(e.slice(i+1))},r.onerror=()=>n(r.error||Error(`تعذر قراءة الملف`)),r.readAsDataURL(e)})}async function h(e,t){if(!f())return null;let i=`${d}/${p(t)}`,a=await m(e);await r.writeFile({path:i,data:a,directory:n.Data,recursive:!0});let{uri:o}=await r.getUri({path:i,directory:n.Data});return console.info(`[Storage] File saved inside app storage`,{path:i,uri:o}),o}async function g(t,n){if(!f())return!1;let r=await h(t,n);if(!r)return!1;let i=/\.pdf$/i.test(n),a=/\.xlsx?$/i.test(n),o=i?`PDF`:a?`Excel`:``,{Share:s}=await e(async()=>{let{Share:e}=await import(`./vendor-capacitor-CGjsZc7I.js`).then(e=>e.n);return{Share:e}},__vite__mapDeps([0,1]));return await s.share({title:n,text:o?`ملف ${o} تم تصديره من تطبيق مِيزان`:`ملف تم تصديره من تطبيق مِيزان`,url:r,dialogTitle:o?`حفظ أو مشاركة ملف ${o}`:`حفظ أو مشاركة الملف`}),!0}var _=[{tone:`red`,words:[`مفصول`,`فصل`,`ملغي`,`ملغى`,`مستبعد`,`محروم`]},{tone:`amber`,words:[`منسحب`,`انسحاب`,`انسحب`,`موقوف`,`متوقف`,`معلق`,`مؤجل`,`تأجيل`,`إجمالي الفترة`]},{tone:`green`,words:[`متخرج`,`متحرج`,`تخرج`,`خريج`,`مكتمل`,`مسدد`,`منتهي`]},{tone:`blue`,words:[`محول`,`منقول`,`تحويل`,`مستمر`,`منتظم`,`إجمالي الرسم`]},{tone:`violet`,words:[`معفى`,`إعفاء`,`اعفاء`,`منحة`,`مبتعث`]}];function v(e){let t=String(e??``).trim();if(!t)return null;for(let e of _)if(e.words.some(e=>t.includes(e)))return e.tone;return`gray`}function y(e){let t=v(e);return t?`note-row note-${t}`:``}var b=`
  table tbody tr.note-row td { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  table tbody tr.note-red td { background: #fecaca !important; }
  table tbody tr.note-amber td { background: #fef08a !important; }
  table tbody tr.note-green td { background: #bbf7d0 !important; }
  table tbody tr.note-blue td { background: #bfdbfe !important; }
  table tbody tr.note-violet td { background: #e9d5ff !important; }
  table tbody tr.note-gray td { background: #e5e7eb !important; }
`,x=`"Cairo", Tahoma, Arial, sans-serif`,S=`"IBM Plex Sans Arabic", "Noto Sans Arabic", Tahoma, Arial, sans-serif`,C=`"IBM Plex Sans Arabic", "Noto Sans Arabic", "Noto Naskh Arabic", "Cairo", Tahoma, Arial, sans-serif`,w=`
  @font-face {
    font-family: "Cairo";
    src: url("/fonts/Cairo-Variable.ttf") format("truetype");
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
  }

  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-Regular.woff2") format("woff2");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-Medium.woff2") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-SemiBold.woff2") format("woff2");
    font-style: normal;
    font-weight: 600;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Sans Arabic";
    src: url("/fonts/IBMPlexSansArabic-Bold.woff2") format("woff2");
    font-style: normal;
    font-weight: 700;
    font-display: swap;
  }

  @font-face {
    font-family: "Noto Sans Arabic";
    src: url("/NotoSansArabic-Regular.ttf") format("truetype");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "Noto Sans Arabic";
    src: url("/NotoSansArabic-SemiBold.ttf") format("truetype");
    font-style: normal;
    font-weight: 600;
    font-display: swap;
  }

  @font-face {
    font-family: "Noto Naskh Arabic";
    src: url("/fonts/NotoNaskhArabic-Variable.ttf") format("truetype");
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
  }
`,T=()=>`
  <div class="report-letterhead-block">
    <div class="report-letterhead-frame">
      <div class="report-letterhead-side report-letterhead-right">
        <div class="letterhead-title-ar">الجمهورية اليمنية</div>
        <div class="letterhead-sub-ar">وزارة الصحة والبيئة</div>
        <div class="letterhead-sub-ar">المجلس اليمني للاختصاصات الطبية</div>
        <div class="letterhead-branch-ar">فرع صعدة</div>
      </div>
      <div class="report-letterhead-center">
        <div class="letterhead-bismillah">بسم الله الرحمن الرحيم</div>
        <div class="letterhead-center-divider"></div>
      </div>
      <div class="report-letterhead-side report-letterhead-left">
        <div class="letterhead-title-en">Republic of Yemen</div>
        <div class="letterhead-sub-en">Ministry of Public Health &amp; Environment</div>
        <div class="letterhead-sub-en">Yemeni Council for Medical Specializations</div>
        <div class="letterhead-branch-en">Saada Branch</div>
      </div>
    </div>
  </div>
`,E=`
  @media print {
    .report-letterhead-block {
      display: block !important;
      position: relative !important;
      width: 100% !important;
      margin: 0 auto 3mm !important;
      background: #ffffff !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    thead { display: table-header-group !important; }
    tfoot { display: table-footer-group !important; }
  }
`,D=e=>String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),O=e=>{let t=String(e??``).trim();if(!t)return``;let n=t.split(` - `);return n.length>1?n[n.length-1].trim():t},k=(e,t)=>{let n=e.filter(e=>e&&e.summaryLevel===`signature`).slice(0,3);if(!n.length)return``;let r=n.map(e=>`<div class="sig-title">${D(String(e.description||`المسمى / الإدارة`))}</div>`).join(``),i=n.map(e=>`<div class="sig-name">${D(String(e.name||`....................`))}</div>`).join(``);return`<tr aria-hidden="true" class="signature-spacer-row"><td colspan="${t.length+1}"></td></tr>
  <tr class="signature-block-row report-signature-group">
    <td colspan="${t.length+1}" class="signature-block-cell">
      <div class="signature-block-grid">${r}${i}</div>
    </td>
  </tr>`},A=(e,t)=>{let n=String(e.__signatureFinance||e.financeManager||``).trim(),r=String(e.__signatureVice||e.viceManager||``).trim(),i=String(e.__signaturePresident||e.presidentManager||``).trim();if(!n&&!r&&!i){let a=[];t.forEach(t=>{let n=e[t.key];n!=null&&String(n).trim()!==``&&a.push(String(n).trim())}),a[0]&&(n=O(a[0])),a[1]&&(r=O(a[1])),a[2]&&(i=O(a[2]))}return`<tr class="signature-block-row">
    <td colspan="${t.length+1}" class="signature-block-cell">
      <div class="signature-block-grid">
        <div class="sig-title">الشؤون المالية</div>
        <div class="sig-title">نائب رئيس المجلس</div>
        <div class="sig-title">رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة</div>
        <div class="sig-name">${D(n||`....................`)}</div>
        <div class="sig-name">${D(r||`....................`)}</div>
        <div class="sig-name">${D(i||`....................`)}</div>
      </div>
    </td>
  </tr>`};function j(e){let{title:t,columns:n,rows:r,numericKeys:i=[],subtitle:a,reportDate:s,includeTotalRow:c=!0,includeIndexColumn:u=!0,tableClassName:d,rowStyleResolver:f}=e,p=+!!u,m=e=>e.key===`description`||/^(البيان|بيان|تفاصيل|وصف|الشرح)$/i.test(e.label.trim()),h=e=>e.key===`name`||/^(الاسم|اسم المتدرب|اسم العميل)$/i.test(e.label.trim()),g=e=>/(date|year|period|month|تاريخ|السنة|الشهر)/i.test(`${e.key} ${e.label}`),_=e=>/(ref|reference|number|code|key|id|check|notify|hafiza|doc|settlement|no$)/i.test(e.key)||/^(رقم|رمز|كود|شيك|إشعار|اشعار|حافظة|دفعة|الدفعة|مرجع|المرجع)/i.test(e.label.trim()),v=e=>e.key===`specialty`||/^(التخصص|المساق)$/i.test(e.label.trim()),b=e=>e.key===`batch`||/^(الدفعة)$/i.test(e.label.trim()),x=(e,t)=>{if(m(e))return`desc-cell`;if(h(e))return`name-cell text-cell`;if(v(e))return`specialty-cell text-cell`;if(b(e))return`batch-cell text-cell`;let n=i.includes(e.key)||typeof t==`number`,r=g(e),a=_(e);return[n?`num numeric-cell amount-cell financial-amount-cell`:``,r?`date-cell`:``,a?`ref-cell compact-cell`:``,!n&&!r&&!a?`text-cell`:``].filter(Boolean).join(` `)},S=(e,t)=>{let n=e?.summaryLevel;return n===`trainee-name-total`?`report-trainee-name-total-row`:n===`trainee-fee-total`?e?.category===`رسوم الامتحانات`?`reports-fee-row reports-exam-fee-total-row`:e?.category===`الأقساط الدراسية السنوية`?`reports-fee-row reports-tuition-fee-total-row`:e?.category===`رسوم القيد والتسجيل`?`reports-fee-row reports-registration-fee-total-row`:`reports-fee-row`:y(e?.notes)||[n===`opening`?`report-opening-row`:``,n===`period`?`report-period-row`:``,n===`fee`?`report-fee-row`:``,n===`trainee-name-total`?`report-trainee-name-total-row`:``,n===`month-total`?`report-subtotal-row`:``,n===`year-total`?`report-subtotal-row`:``,n===`total`||e?.total===`نعم`&&String(e?.description??e?.category??e?.item??``).includes(`الإجمالي الكلي`)||e?.description===`الإجمالي الكلي`?`report-grand-total-row`:``,e?.displayType===`تفصيلي`?`trainee-detail-row`:``,e?.displayType&&e?.displayType!==`تفصيلي`?`trainee-summary-row`:``,t%2==1?`report-row-striped`:`report-row-plain`].filter(Boolean).join(` `)},C=(e,t)=>e==null||e===``?`—`:D(t?l(Number(e)||0):e),w=(e,t)=>{let r=String(e?.description??e?.category??e?.item??``).trim(),a=(e?.summaryLevel===`total`||e?.total===`نعم`)&&r.includes(`الإجمالي الكلي`),o=n.findIndex(e=>e.key===`amount`);if(a&&o>=0){let i=n[o],a=n.length-o-1,s=x(i,e.amount);return`<tr class="${S(e,t)}">
        <td class="idx numeric-cell" data-col-key="description" colspan="${o+1}">
          <span class="pdf-cell-text">${D(r)}</span>
        </td>
        <td class="${s}" data-col-key="amount" data-col-name="${D(i.label)}">
          <span class="pdf-cell-text">${C(e.amount,!0)}</span>
        </td>
        ${a>0?`<td colspan="${a}"><span class="pdf-cell-text"></span></td>`:``}
      </tr>`}let s=f?.(e)||``,c=s?` style="${D(s)}"`:``;return`<tr class="${S(e,t)}"${s?` data-installment-conditional="true"`:``}>${u?`<td class="idx numeric-cell" data-col-key="idx"${c}><span class="pdf-cell-text">${e.summaryLevel===`opening`?`—`:e.summaryLevel===`total`||e.total===`نعم`?`★`:t+1}</span></td>`:``}${n.map(t=>{let n=e[t.key],r=i.includes(t.key)||typeof n==`number`;return`<td class="${x(t,n)}" data-col-key="${D(t.key)}" data-col-name="${D(t.label)}"${c}><span class="pdf-cell-text">${C(n,r)}</span></td>`}).join(``)}</tr>`},T=o(s)||new Date().toLocaleDateString(`ar-EG-u-nu-latn`),E=/^مسير إخلاء\s*[-–—]\s*عهدة\s*[-–—]/.test(String(t||``).trim()),O=a??`المجلس اليمني للاختصاصات الطبية - صعدة • تاريخ التقرير: ${T} • عدد السجلات: ${r.length}`,j=String(t||``).split(/\r?\n/),M=j.shift()||``,N=j.join(` `).trim(),P=`${`<tr class="doc-title-row"><td colspan="${n.length+p}" class="doc-title-cell">
    <h1 class="report-title">${D(M)}</h1>
    ${E?``:`<div class="sub">${D(O)}</div>`}
  </td></tr>${E&&N?`<tr class="custody-date-row"><td colspan="${n.length+p}"><div class="custody-date-line">${D(N)}</div></td></tr>`:``}`}<tr>${u?`<th class="idx numeric-cell" data-col-key="idx" data-col-name="م">م</th>`:``}${n.map(e=>`<th class="${x(e)}" data-col-key="${D(e.key)}" data-col-name="${D(e.label)}"><span class="pdf-cell-text">${D(e.label)}</span></th>`).join(``)}</tr>`,F=r.some(e=>e?.summaryLevel===`detail`),I=r.some(e=>e?.summaryLevel===`fee`),L=r.some(e=>e?.summaryLevel===`period`),R=r.filter(e=>!e||e.__summaryCard||e.summaryLevel===`summary-card`||e.summaryLevel===`total`||e.summaryLevel===`opening`||e.summaryLevel===`signature`||e.total===`نعم`?!1:F?e.summaryLevel===`detail`:I?e.summaryLevel===`fee`:!L||e.summaryLevel===`period`),z={};n.forEach(e=>{i.includes(e.key)&&(z[e.key]=R.reduce((t,n)=>t+(Number(n[e.key])||0),0))});let B=c?`<tr class="total-row">${u?`<td class="idx numeric-cell">الإجمالي</td>`:``}${n.map(e=>i.includes(e.key)?`<td class="num numeric-cell amount-cell" data-col-key="${D(e.key)}"><span class="pdf-cell-text">${D(l(z[e.key]||0))}</span></td>`:`<td class="${g(e)?`date-cell`:``}" data-col-key="${D(e.key)}"><span class="pdf-cell-text"></span></td>`).join(``)}</tr>`:``,V=r.findIndex(e=>e&&e.summaryLevel===`signature`),H=r.map((e,t)=>{if(e&&e.summaryLevel===`signature`)return t===V?k(r,n):``;if(e&&e.signature)return A(e,n);if(e&&(e.__summaryCard||e.summaryLevel===`summary-card`)){let t=Number(e.__summaryCard?.index??e.summaryCardIndex??0)||0,r=String(e.__summaryCard?.label??e.description??``),i=Number(e.__summaryCard?.value??e.credit??0)||0;return`<tr class="summary-card-row ${`summary-card-${t%3}`}">
          <td class="summary-label-cell" colspan="${Math.max(1,n.length-1)}">
            <span class="pdf-cell-text">${D(r)}</span>
          </td>
          <td class="summary-value-cell" colspan="2">
            <span class="pdf-cell-text">${D(l(i))}</span>
          </td>
        </tr>`}return w(e,t)}).join(``),U=(()=>{if(!r.some(e=>e&&(e.__summaryCard||e.summaryLevel===`summary-card`)))return H;let e=r.findIndex(e=>e&&(e.__summaryCard||e.summaryLevel===`summary-card`));if(e<=0)return H;let t=`<tr class="summary-spacer-row"><td colspan="${n.length+p}"></td></tr>`,i=r.slice(0,e),a=r.slice(e),o=(e,t)=>e.map((e,i)=>{let a=t+i;if(e&&e.summaryLevel===`signature`)return a===V?k(r,n):``;if(e&&e.signature)return A(e,n);if(e&&(e.__summaryCard||e.summaryLevel===`summary-card`)){let t=Number(e.__summaryCard?.index??e.summaryCardIndex??0)||0,r=String(e.__summaryCard?.label??e.description??``),i=Number(e.__summaryCard?.value??e.credit??0)||0;return`<tr class="summary-card-row ${`summary-card-${t%3}`}">
            <td class="summary-label-cell" colspan="${Math.max(1,n.length-1)}">
              <span class="pdf-cell-text">${D(r)}</span>
            </td>
            <td class="summary-value-cell" colspan="2">
              <span class="pdf-cell-text">${D(l(i))}</span>
            </td>
          </tr>`}return w(e,a)}).join(``);return o(i,0)+t+o(a,e)})(),W=c?U.includes(`<tr class="signature-block-row`)?U.replace(/(?=<tr class="signature-block-row)/,B):U+B:U;return`<table class="reports-data-table${d?` `+d:``}"><thead>${P}</thead><tbody>${W}</tbody></table>`}var M=`
  .report-page-content table,
  .report-page-content table[class],
  #tableContainer table,
  #tableContainer table[class],
  .preview-report-content table,
  .preview-report-content table[class],
  body table,
  body table[class] {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    direction: rtl !important;
  }

  .report-page-content table col,
  .report-page-content table[class] col,
  #tableContainer table col,
  #tableContainer table[class] col,
  .preview-report-content table col,
  .preview-report-content table[class] col,
  body table col,
  body table[class] col {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }

  .report-page-content table th,
  .report-page-content table td,
  .report-page-content table[class] th,
  .report-page-content table[class] td,
  #tableContainer table th,
  #tableContainer table td,
  #tableContainer table[class] th,
  #tableContainer table[class] td,
  .preview-report-content table th,
  .preview-report-content table td,
  .preview-report-content table[class] th,
  .preview-report-content table[class] td,
  body table th,
  body table td,
  body table[class] th,
  body table[class] td {
    box-sizing: border-box !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    padding: var(--print-cell-padding, 3px 5px) !important;
    margin: 0 !important;
    text-align: center !important;
    vertical-align: middle !important;
    line-height: var(--print-cell-line-height, 1.35) !important;
    white-space: normal !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    hyphens: none !important;
    overflow: visible !important;
  }

  .report-page-content table thead,
  #tableContainer table thead,
  .preview-report-content table thead,
  body table thead {
    display: table-header-group !important;
  }
  .report-page-content table tfoot,
  #tableContainer table tfoot,
  .preview-report-content table tfoot,
  body table tfoot {
    display: table-footer-group !important;
  }

  /* Amounts, counts, dates, reference numbers and identifiers never wrap. */
  .report-page-content table th.numeric-cell,
  .report-page-content table td.numeric-cell,
  .report-page-content table th.num,
  .report-page-content table td.num,
  .report-page-content table th.date-cell,
  .report-page-content table td.date-cell,
  .report-page-content table th.compact-cell,
  .report-page-content table td.compact-cell,
  .report-page-content table th.ref-cell,
  .report-page-content table td.ref-cell,
  .report-page-content table th.idx,
  .report-page-content table td.idx,
  #tableContainer table th.numeric-cell,
  #tableContainer table td.numeric-cell,
  #tableContainer table th.num,
  #tableContainer table td.num,
  #tableContainer table th.date-cell,
  #tableContainer table td.date-cell,
  #tableContainer table th.compact-cell,
  #tableContainer table td.compact-cell,
  #tableContainer table th.ref-cell,
  #tableContainer table td.ref-cell,
  #tableContainer table th.idx,
  #tableContainer table td.idx,
  .preview-report-content table th.numeric-cell,
  .preview-report-content table td.numeric-cell,
  .preview-report-content table th.num,
  .preview-report-content table td.num,
  .preview-report-content table th.date-cell,
  .preview-report-content table td.date-cell,
  .preview-report-content table th.compact-cell,
  .preview-report-content table td.compact-cell,
  .preview-report-content table th.ref-cell,
  .preview-report-content table td.ref-cell,
  .preview-report-content table th.idx,
  .preview-report-content table td.idx {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    direction: ltr !important;
    unicode-bidi: isolate !important;
    font-variant-numeric: tabular-nums !important;
  }

  /* Semantic fields that are expected to contain words can wrap naturally. */
  .report-page-content table td.text-cell,
  .report-page-content table td.name-cell,
  .report-page-content table td.specialty-cell,
  .report-page-content table td.batch-cell,
  .report-page-content table td.desc-cell,
  .report-page-content table td.details-cell,
  .report-page-content table td.description-cell,
  #tableContainer table td.text-cell,
  #tableContainer table td.name-cell,
  #tableContainer table td.specialty-cell,
  #tableContainer table td.batch-cell,
  #tableContainer table td.desc-cell,
  #tableContainer table td.details-cell,
  #tableContainer table td.description-cell,
  .preview-report-content table td.text-cell,
  .preview-report-content table td.name-cell,
  .preview-report-content table td.specialty-cell,
  .preview-report-content table td.batch-cell,
  .preview-report-content table td.desc-cell,
  .preview-report-content table td.details-cell,
  .preview-report-content table td.description-cell {
    white-space: normal !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    direction: rtl !important;
  }

  /* Data-key fallback for tables whose values arrive as strings rather than numbers. */
  .report-page-content table th[data-col-key*="date" i],
  .report-page-content table td[data-col-key*="date" i],
  .report-page-content table th[data-col-key$="no" i],
  .report-page-content table td[data-col-key$="no" i],
  .report-page-content table th[data-col-key*="number" i],
  .report-page-content table td[data-col-key*="number" i],
  .report-page-content table th[data-col-key*="code" i],
  .report-page-content table td[data-col-key*="code" i],
  .report-page-content table th[data-col-key*="reference" i],
  .report-page-content table td[data-col-key*="reference" i],
  #tableContainer table th[data-col-key*="date" i],
  #tableContainer table td[data-col-key*="date" i],
  #tableContainer table th[data-col-key$="no" i],
  #tableContainer table td[data-col-key$="no" i],
  #tableContainer table th[data-col-key*="number" i],
  #tableContainer table td[data-col-key*="number" i],
  #tableContainer table th[data-col-key*="code" i],
  #tableContainer table td[data-col-key*="code" i],
  #tableContainer table th[data-col-key*="reference" i],
  #tableContainer table td[data-col-key*="reference" i],
  .preview-report-content table th[data-col-key*="date" i],
  .preview-report-content table td[data-col-key*="date" i],
  .preview-report-content table th[data-col-key$="no" i],
  .preview-report-content table td[data-col-key$="no" i],
  .preview-report-content table th[data-col-key*="number" i],
  .preview-report-content table td[data-col-key*="number" i],
  .preview-report-content table th[data-col-key*="code" i],
  .preview-report-content table td[data-col-key*="code" i],
  .preview-report-content table th[data-col-key*="reference" i],
  .preview-report-content table td[data-col-key*="reference" i],
  .report-page-content table th[data-col-key*="amount" i],
  .report-page-content table td[data-col-key*="amount" i],
  .report-page-content table th[data-col-key*="fee" i],
  .report-page-content table td[data-col-key*="fee" i],
  .report-page-content table th[data-col-key*="total" i],
  .report-page-content table td[data-col-key*="total" i],
  .report-page-content table th[data-col-key*="balance" i],
  .report-page-content table td[data-col-key*="balance" i],
  #tableContainer table th[data-col-key*="amount" i],
  #tableContainer table td[data-col-key*="amount" i],
  #tableContainer table th[data-col-key*="fee" i],
  #tableContainer table td[data-col-key*="fee" i],
  #tableContainer table th[data-col-key*="total" i],
  #tableContainer table td[data-col-key*="total" i],
  #tableContainer table th[data-col-key*="balance" i],
  #tableContainer table td[data-col-key*="balance" i],
  .preview-report-content table th[data-col-key*="amount" i],
  .preview-report-content table td[data-col-key*="amount" i],
  .preview-report-content table th[data-col-key*="fee" i],
  .preview-report-content table td[data-col-key*="fee" i],
  .preview-report-content table th[data-col-key*="total" i],
  .preview-report-content table td[data-col-key*="total" i],
  .preview-report-content table th[data-col-key*="balance" i],
  .preview-report-content table td[data-col-key*="balance" i] {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    direction: ltr !important;
    unicode-bidi: isolate !important;
    font-variant-numeric: tabular-nums !important;
  }

  .report-page-content table td .pdf-cell-text,
  #tableContainer table td .pdf-cell-text,
  .preview-report-content table td .pdf-cell-text {
    display: inline-block !important;
    max-width: 100% !important;
    white-space: inherit !important;
    overflow-wrap: inherit !important;
    word-break: inherit !important;
    vertical-align: middle !important;
  }

  .report-page-content table tr,
  #tableContainer table tr,
  .preview-report-content table tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }


  /* Screen/print/PDF palette parity for the 2026 installments reports. */
  #tableContainer table.installments-summary-2026 thead th,
  #report-source table.installments-summary-2026 thead th {
    background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important;
    color: #000 !important; border: 1px solid #000000 !important; border-color: #000000 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  #tableContainer table.installments-summary-2026 thead th[data-col-key="idx"],
  #tableContainer table.installments-summary-2026 thead th[data-col-key="name"],
  #report-source table.installments-summary-2026 thead th[data-col-key="idx"],
  #report-source table.installments-summary-2026 thead th[data-col-key="name"] { color: #fff !important; }

  #tableContainer table.installments-screen-parity thead th,
  #report-source table.installments-screen-parity thead th {
    background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important;
    color: #000 !important; border: 1px solid #000000 !important; border-color: #000000 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  #tableContainer table.installments-screen-parity thead th[data-col-key="idx"],
  #tableContainer table.installments-screen-parity thead th[data-col-key="name"],
  #report-source table.installments-screen-parity thead th[data-col-key="idx"],
  #report-source table.installments-screen-parity thead th[data-col-key="name"] { color: #fff !important; }

  #tableContainer table.installments-summary-2026 tbody td,
  #tableContainer table.installments-screen-parity tbody td,
  #report-source table.installments-summary-2026 tbody td,
  #report-source table.installments-screen-parity tbody td {
    border: 1px solid #000000 !important;
    border-color: #000000 !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="name"],
  #tableContainer table.installments-screen-parity tbody td.screen-name-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="name"],
  #report-source table.installments-screen-parity tbody td.screen-name-cell { background: #fdf4ff !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="batch"],
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="specialty"],
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="fees"],
  #tableContainer table.installments-screen-parity tbody td.screen-batch-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-specialty-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-fees-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="batch"],
  #report-source table.installments-summary-2026 tbody td[data-col-key="specialty"],
  #report-source table.installments-summary-2026 tbody td[data-col-key="fees"],
  #report-source table.installments-screen-parity tbody td.screen-batch-cell,
  #report-source table.installments-screen-parity tbody td.screen-specialty-cell,
  #report-source table.installments-screen-parity tbody td.screen-fees-cell { background: #f0f9ff !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="prevDue"],
  #tableContainer table.installments-screen-parity tbody td.screen-prevdue-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="prevDue"],
  #report-source table.installments-screen-parity tbody td.screen-prevdue-cell { background: #f8fcff !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="totalPaid"],
  #tableContainer table.installments-screen-parity tbody td.screen-totalpaid-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="totalPaid"],
  #report-source table.installments-screen-parity tbody td.screen-totalpaid-cell { background: #ecfdf5 !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="remaining"],
  #tableContainer table.installments-screen-parity tbody td.screen-remaining-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="remaining"],
  #report-source table.installments-screen-parity tbody td.screen-remaining-cell { background: #fff1f2 !important; }
  #tableContainer table.installments-summary-2026 tbody td[data-col-key="notes"],
  #tableContainer table.installments-screen-parity tbody td.screen-notes-cell,
  #report-source table.installments-summary-2026 tbody td[data-col-key="notes"],
  #report-source table.installments-screen-parity tbody td.screen-notes-cell { background: #fffbeb !important; }
  #tableContainer table.installments-screen-parity tbody td.screen-month-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-extra-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-status-cell,
  #tableContainer table.installments-screen-parity tbody td.screen-idx-cell,
  #report-source table.installments-screen-parity tbody td.screen-month-cell,
  #report-source table.installments-screen-parity tbody td.screen-extra-cell,
  #report-source table.installments-screen-parity tbody td.screen-status-cell,
  #report-source table.installments-screen-parity tbody td.screen-idx-cell { background: #fff !important; }
  #tableContainer table.installments-summary-2026 tbody tr.total-row > td,
  #tableContainer table.installments-screen-parity tbody tr.total-row > td,
  #report-source table.installments-summary-2026 tbody tr.total-row > td,
  #report-source table.installments-screen-parity tbody tr.total-row > td {
    background: #e0f2fe !important;
    color: #000000 !important;
    border: 1px solid #000000 !important;
    border-color: #000000 !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Keep 2026 installment total-row text and cell outlines black after shared themes. */
  #tableContainer table.installments-summary-2026 tbody tr.total-row > td,
  #tableContainer table.installments-screen-parity tbody tr.total-row > td,
  #report-source table.installments-summary-2026 tbody tr.total-row > td,
  #report-source table.installments-screen-parity tbody tr.total-row > td,
  #tableContainer table.installments-summary-2026 tbody tr.total-row > td *,
  #tableContainer table.installments-screen-parity tbody tr.total-row > td *,
  #report-source table.installments-summary-2026 tbody tr.total-row > td *,
  #report-source table.installments-screen-parity tbody tr.total-row > td * {
    color: #000000 !important;
    border: 1px solid #000000 !important;
    border-color: #000000 !important;
    font-weight: 900 !important;
  }

  /* Preserve all semantic row highlighting after shared white-cell themes. */
  .report-page-content table tbody tr.note-red > td,
  #tableContainer table tbody tr.note-red > td,
  .preview-report-content table tbody tr.note-red > td,
  body table tbody tr.note-red > td { background: #fecaca !important; }
  .report-page-content table tbody tr.note-amber > td,
  #tableContainer table tbody tr.note-amber > td,
  .preview-report-content table tbody tr.note-amber > td,
  body table tbody tr.note-amber > td { background: #fef08a !important; }
  .report-page-content table tbody tr.note-green > td,
  #tableContainer table tbody tr.note-green > td,
  .preview-report-content table tbody tr.note-green > td,
  body table tbody tr.note-green > td { background: #bbf7d0 !important; }
  .report-page-content table tbody tr.note-blue > td,
  #tableContainer table tbody tr.note-blue > td,
  .preview-report-content table tbody tr.note-blue > td,
  body table tbody tr.note-blue > td { background: #bfdbfe !important; }
  .report-page-content table tbody tr.note-violet > td,
  #tableContainer table tbody tr.note-violet > td,
  .preview-report-content table tbody tr.note-violet > td,
  body table tbody tr.note-violet > td { background: #e9d5ff !important; }
  .report-page-content table tbody tr.note-gray > td,
  #tableContainer table tbody tr.note-gray > td,
  .preview-report-content table tbody tr.note-gray > td,
  body table tbody tr.note-gray > td { background: #e5e7eb !important; }

  .report-page-content table tbody tr.notes-status-red > td,
  #tableContainer table tbody tr.notes-status-red > td,
  .preview-report-content table tbody tr.notes-status-red > td,
  .report-page-content table tbody tr.notes-status-yellow > td,
  #tableContainer table tbody tr.notes-status-yellow > td,
  .preview-report-content table tbody tr.notes-status-yellow > td,
  .report-page-content table tbody tr.notes-status-green > td,
  #tableContainer table tbody tr.notes-status-green > td,
  .preview-report-content table tbody tr.notes-status-green > td,
  .report-page-content table tbody tr.notes-status-orange > td,
  #tableContainer table tbody tr.notes-status-orange > td,
  .preview-report-content table tbody tr.notes-status-orange > td,
  .report-page-content table tbody tr.notes-status-blue > td,
  #tableContainer table tbody tr.notes-status-blue > td,
  .preview-report-content table tbody tr.notes-status-blue > td,
  .report-page-content table tbody tr.notes-status-emerald > td,
  #tableContainer table tbody tr.notes-status-emerald > td,
  .preview-report-content table tbody tr.notes-status-emerald > td {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .report-page-content table tbody tr.notes-status-red > td,
  #tableContainer table tbody tr.notes-status-red > td,
  .preview-report-content table tbody tr.notes-status-red > td { background: #fecaca !important; }
  .report-page-content table tbody tr.notes-status-yellow > td,
  #tableContainer table tbody tr.notes-status-yellow > td,
  .preview-report-content table tbody tr.notes-status-yellow > td { background: #fef08a !important; }
  .report-page-content table tbody tr.notes-status-green > td,
  #tableContainer table tbody tr.notes-status-green > td,
  .preview-report-content table tbody tr.notes-status-green > td { background: #bbf7d0 !important; }
  .report-page-content table tbody tr.notes-status-orange > td,
  #tableContainer table tbody tr.notes-status-orange > td,
  .preview-report-content table tbody tr.notes-status-orange > td { background: #fed7aa !important; }
  .report-page-content table tbody tr.notes-status-blue > td,
  #tableContainer table tbody tr.notes-status-blue > td,
  .preview-report-content table tbody tr.notes-status-blue > td { background: #e0f2fe !important; }
  .report-page-content table tbody tr.notes-status-emerald > td,
  #tableContainer table tbody tr.notes-status-emerald > td,
  .preview-report-content table tbody tr.notes-status-emerald > td { background: #ecfdf5 !important; }

  .report-page-content table tbody tr.note-row > td,
  #tableContainer table tbody tr.note-row > td,
  .preview-report-content table tbody tr.note-row > td,
  .report-page-content table tbody tr.notes-status-red > td,
  #tableContainer table tbody tr.notes-status-red > td,
  .preview-report-content table tbody tr.notes-status-red > td,
  .report-page-content table tbody tr.notes-status-yellow > td,
  #tableContainer table tbody tr.notes-status-yellow > td,
  .preview-report-content table tbody tr.notes-status-yellow > td,
  .report-page-content table tbody tr.notes-status-green > td,
  #tableContainer table tbody tr.notes-status-green > td,
  .preview-report-content table tbody tr.notes-status-green > td,
  .report-page-content table tbody tr.notes-status-orange > td,
  #tableContainer table tbody tr.notes-status-orange > td,
  .preview-report-content table tbody tr.notes-status-orange > td,
  .report-page-content table tbody tr.notes-status-blue > td,
  #tableContainer table tbody tr.notes-status-blue > td,
  .preview-report-content table tbody tr.notes-status-blue > td,
  .report-page-content table tbody tr.notes-status-emerald > td,
  #tableContainer table tbody tr.notes-status-emerald > td,
  .preview-report-content table tbody tr.notes-status-emerald > td {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }


  /* Final universal rules: include every nested table, not only report wrappers. */
  body table,
  body table[class] {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
  }
  body table col,
  body table[class] col {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }
  body table th,
  body table td,
  body table[class] th,
  body table[class] td {
    box-sizing: border-box !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    vertical-align: middle !important;
    text-align: center !important;
    padding: var(--print-cell-padding, 3px 5px) !important;
    line-height: var(--print-cell-line-height, 1.35) !important;
    white-space: normal !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    hyphens: none !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  body table td.text-cell,
  body table td.name-cell,
  body table td.specialty-cell,
  body table td.batch-cell,
  body table td.desc-cell,
  body table td.details-cell,
  body table td.description-cell,
  body table td.long-text-cell {
    width: auto !important;
    white-space: normal !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
  }
  body table td.num,
  body table td.numeric-cell,
  body table td.date-cell,
  body table td.compact-cell,
  body table td.ref-cell,
  body table td.idx,
  body table td.reports-numeric-cell,
  body table td.reports-no-wrap-cell,
  body table th.num,
  body table th.numeric-cell,
  body table th.date-cell,
  body table th.compact-cell,
  body table th.ref-cell,
  body table th.idx,
  body table th[data-col-key*="date" i],
  body table td[data-col-key*="date" i],
  body table th[data-col-key*="amount" i],
  body table td[data-col-key*="amount" i],
  body table th[data-col-key*="total" i],
  body table td[data-col-key*="total" i],
  body table th[data-col-key*="balance" i],
  body table td[data-col-key*="balance" i] {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    direction: ltr !important;
    unicode-bidi: isolate !important;
    font-variant-numeric: tabular-nums !important;
  }
  body table th .pdf-cell-text,
  body table td .pdf-cell-text {
    display: inline-block !important;
    width: auto !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    white-space: inherit !important;
    overflow-wrap: inherit !important;
    word-break: inherit !important;
    vertical-align: middle !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  body table tr {
    height: auto !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  @media print {
    .report-page-content table,
    .report-page-content table[class],
    #tableContainer table,
    #tableContainer table[class],
    .preview-report-content table,
    .preview-report-content table[class],
    body table,
    body table[class] {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: auto !important;
    }
  }
`;function N(e,t=!0){if(!e)return e;let n=e=>`<tr class="report-letterhead-row" data-report-letterhead-injected="true"><th class="report-letterhead-cell" colspan="${Math.max(1,e)}">${T()}</th></tr>`,r=`<div data-report-letterhead-injected="true">${T()}</div>`,i=`<style data-report-letterhead-styles="true">
    thead { display: table-header-group !important; }
    .report-letterhead-row { break-inside: avoid; page-break-inside: avoid; }
    .report-letterhead-cell { border: 0 !important; background: #fff !important; padding: 0 0 2mm !important; }
    .report-letterhead-block { display: block !important; width: 100% !important; margin: 0 auto 4mm !important; page-break-before: avoid !important; page-break-after: avoid !important; }
    ${M}
  </style>`,a=e.includes(`</head>`)?e.replace(`</head>`,`${i}</head>`):`${i}${e}`;return/<div[^>]*class=["'][^"']*report-letterhead-block[^"']*["']/i.test(a)?a:t&&/<table\b[^>]*>/i.test(a)?a.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi,e=>{if(/<tr\b[^>]*class=["'][^"']*report-letterhead-row[^"']*["']/i.test(e))return e;let t=e.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i),r=((t?.[1]?.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0]??e.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0]??``).match(/<(?:th|td)\b[^>]*>/gi)??[]).reduce((e,t)=>{let n=Number(t.match(/\bcolspan\s*=\s*["']?(\d+)/i)?.[1]??1);return e+(Number.isFinite(n)&&n>0?n:1)},0)||1,i=n(r);return t?e.replace(/(<thead\b[^>]*>)/i,`$1${i}`):e.replace(/(<table\b[^>]*>)/i,`$1<thead>${i}</thead>`)}):a.replace(/<body\b([^>]*)>/i,`<body$1>${r}`)}function P(){return typeof window<`u`&&t.isNativePlatform()}var F=`app-native-report-print-frame`;function I(e){document.getElementById(F)?.remove();let t=document.createElement(`iframe`);t.id=F,t.title=`معاينة التقرير للطباعة`,Object.assign(t.style,{position:`fixed`,left:`-10000px`,top:`0`,width:`100vw`,height:`100vh`,border:`0`,pointerEvents:`none`,background:`#fff`}),document.body.appendChild(t);let n=t.contentDocument;if(!n)throw t.remove(),Error(`تعذر إنشاء إطار تجهيز التقرير للطباعة`);return n.open(),n.write(e),n.close(),t}function L(e){return new Promise(t=>{let n=!1,r=0,i=()=>{n||(n=!0,window.clearTimeout(r),e.removeEventListener(`load`,i),e.removeEventListener(`error`,i),t())};r=window.setTimeout(i,12e3),e.addEventListener(`load`,i,{once:!0}),e.addEventListener(`error`,i,{once:!0})})}async function R(e){let t=e.contentDocument;if(!t)throw Error(`تعذر قراءة محتوى التقرير`);let n=[];t.fonts?.ready&&n.push(t.fonts.ready.catch(()=>void 0)),Array.from(t.querySelectorAll(`link[rel="stylesheet"]`)).forEach(e=>{e.sheet||n.push(L(e))}),Array.from(t.images).forEach(e=>{e.complete||n.push(L(e))}),await Promise.race([Promise.all(n),new Promise(e=>window.setTimeout(e,2e4))]),await new Promise(e=>{window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>e()))})}async function z(t,n){await R(I(n));let{Printer:r}=await e(async()=>{let{Printer:e}=await import(`./esm-BqaYp_Yq.js`);return{Printer:e}},__vite__mapDeps([2,0,1]));typeof r.printIframe==`function`?await r.printIframe({selector:`#${F}`,name:t}):await r.printHtml({name:t,html:n})}function B(e){return e.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,e=>/print\s*\(/.test(e)?``:e)}function V(e){try{document.getElementById(`app-print-frame`)?.remove();let t=document.createElement(`iframe`);t.id=`app-print-frame`,Object.assign(t.style,{position:`fixed`,right:`0`,bottom:`0`,width:`0`,height:`0`,border:`0`,visibility:`hidden`}),document.body.appendChild(t);let n=t.contentWindow,r=n?.document;if(!n||!r)return!1;r.open(),r.write(B(e)),r.close();let i=!1,a=()=>{if(!i){i=!0;try{n.focus(),n.print()}catch(e){console.error(`[Print] iframe print error:`,e)}}},o=Array.from(r.images).map(e=>e.complete?Promise.resolve():new Promise(t=>{e.onload=e.onerror=()=>t()})),s=r.fonts?.ready??Promise.resolve();return Promise.race([Promise.all([s,...o]),new Promise(e=>setTimeout(e,2500))]).then(()=>setTimeout(a,200)),!0}catch(e){return console.error(`[Print] Failed via iframe:`,e),!1}}function H(e,t){let n=N(e);if(P())return z(t,B(n)).catch(e=>{console.error(`[Print] Native Android printing failed`,e)}),!0;if(V(n))return!0;let r=i(window.open(``,`_blank`,`width=1800,height=1800`));return r?(r.document.open(),r.document.write(n),r.document.close(),!0):!1}async function U(e,t){if(P())try{return await z(t,B(N(e))),!0}catch(e){return console.error(`[Print] Native Android printing failed`,e),!1}return H(e,t)}var W=`
  :root {
    --report-table-header-start: #fff4a3;
    --report-table-header-mid: #ffd700;
    --report-table-header-end: #d99b00;
    --report-table-body: #ffffff;
    --report-table-ink: #1e293b;
    --report-table-grid: #000000;
    --report-table-total-start: #39a2ff;
    --report-table-total-mid: #087bff;
    --report-table-total-end: #0052cc;
  }

  .report-page-content table,
  #tableContainer table,
  body > table {
    border-collapse: collapse !important;
    border-color: var(--report-table-grid) !important;
  }

  .report-page-content table th,
  .report-page-content table td,
  #tableContainer table th,
  #tableContainer table td,
  body > table th,
  body > table td {
    border: 1px solid var(--report-table-grid) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-page-content table thead th,
  #tableContainer table thead th,
  body > table thead th {
    background: linear-gradient(
      180deg,
      var(--report-table-header-start) 0%,
      var(--report-table-header-mid) 48%,
      var(--report-table-header-end) 100%
    ) !important;
    background-color: var(--report-table-header-mid) !important;
    color: #3b2600 !important;
    font-weight: 900 !important;
  }

  .report-page-content table thead th .pdf-cell-text,
  #tableContainer table thead th .pdf-cell-text,
  body > table thead th .pdf-cell-text {
    background: transparent !important;
    color: #3b2600 !important;
  }

  .report-page-content table tbody > tr:not(.report-grand-total-row):not(.total-row):not(.signature-block-row):not(.signature-spacer-row):not(.installments-statement-row):not(.reports-fee-row) > td,
  #tableContainer table tbody > tr:not(.report-grand-total-row):not(.total-row):not(.signature-block-row):not(.signature-spacer-row):not(.installments-statement-row):not(.reports-fee-row) > td,
  body > table tbody > tr:not(.report-grand-total-row):not(.total-row):not(.signature-block-row):not(.signature-spacer-row):not(.installments-statement-row):not(.reports-fee-row) > td {
    background: var(--report-table-body) !important;
    background-color: var(--report-table-body) !important;
    color: var(--report-table-ink) !important;
  }

  .report-page-content table tbody > tr.report-grand-total-row > td,
  .report-page-content table tbody > tr.total-row > td,
  #tableContainer table tbody > tr.report-grand-total-row > td,
  #tableContainer table tbody > tr.total-row > td,
  body > table tbody > tr.report-grand-total-row > td,
  body > table tbody > tr.total-row > td {
    background: linear-gradient(
      180deg,
      var(--report-table-total-start) 0%,
      var(--report-table-total-mid) 52%,
      var(--report-table-total-end) 100%
    ) !important;
    background-color: var(--report-table-total-mid) !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-page-content table tbody > tr.report-grand-total-row > td *,
  .report-page-content table tbody > tr.total-row > td *,
  #tableContainer table tbody > tr.report-grand-total-row > td *,
  #tableContainer table tbody > tr.total-row > td *,
  body > table tbody > tr.report-grand-total-row > td *,
  body > table tbody > tr.total-row > td * {
    background: transparent !important;
    color: #ffffff !important;
  }

  .report-page-content table tbody > tr.signature-block-row > td,
  #tableContainer table tbody > tr.signature-block-row > td,
  body > table tbody > tr.signature-block-row > td,
  .report-page-content table tbody > tr.signature-spacer-row > td,
  #tableContainer table tbody > tr.signature-spacer-row > td,
  body > table tbody > tr.signature-spacer-row > td {
    background: #ffffff !important;
    color: #000000 !important;
  }
  /* Readable print typography: preserve 16px body text in preview, print and PDF. */
  .report-page-content table.reports-data-table tbody td,
  #tableContainer table.reports-data-table tbody td,
  .report-page-content table.reports-fee-status-table tbody td,
  #tableContainer table.reports-fee-status-table tbody td {
    font-size: var(--print-cell-font-size, 16px) !important;
    line-height: var(--print-cell-line-height, 1.45) !important;
    vertical-align: middle !important;
  }

  /* Semantic text columns wrap long values; compact identifiers and numbers stay on one line. */
  .report-page-content table.reports-data-table tbody td.text-cell,
  .report-page-content table.reports-data-table tbody td.name-cell,
  .report-page-content table.reports-data-table tbody td.specialty-cell,
  .report-page-content table.reports-data-table tbody td.batch-cell,
  .report-page-content table.reports-data-table tbody td.desc-cell,
  .report-page-content table.reports-data-table tbody td.details-cell,
  .report-page-content table.reports-data-table tbody td.description-cell,
  #tableContainer table.reports-data-table tbody td.text-cell,
  #tableContainer table.reports-data-table tbody td.name-cell,
  #tableContainer table.reports-data-table tbody td.specialty-cell,
  #tableContainer table.reports-data-table tbody td.batch-cell,
  #tableContainer table.reports-data-table tbody td.desc-cell,
  #tableContainer table.reports-data-table tbody td.details-cell,
  #tableContainer table.reports-data-table tbody td.description-cell,
  .report-page-content table.reports-fee-status-table tbody td,
  #tableContainer table.reports-fee-status-table tbody td {
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
  }

  .report-page-content table.reports-data-table tbody td .pdf-cell-text,
  #tableContainer table.reports-data-table tbody td .pdf-cell-text {
    font-size: inherit !important;
    line-height: inherit !important;
    white-space: inherit !important;
    overflow-wrap: inherit !important;
  }

`,G=`@bottom-center {
  content: "صفحة " counter(page) " من " counter(pages);
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 11px;
}`;function K(e){let{title:n,tableHtml:r,reportDateLabel:i,contentCss:o=``,finalCss:l=``,defaultOrientation:u=`landscape`}=e,d=e.fitToContent??!1,f=e.defaultPageSize??e.paperSize??`A4`,p=e.defaultMarginMm===void 0?e.margin===`normal`?`8mm`:`3mm`:`${e.defaultMarginMm}mm`,m=`${p} ${p} ${`${Math.max(6,Number.parseFloat(p)||0)}mm`} ${p}`,h=r.includes(`report-letterhead`),g=e=>{let t=``,n=0,r=/@page\b[^{}]*[{]/gi,i;for(;(i=r.exec(e))!==null;){let a=1,o=r.lastIndex;for(;o<e.length&&a>0;o+=1)e[o]===`{`?a+=1:e[o]===`}`&&--a;a===0&&(t+=e.slice(n,i.index),n=o,r.lastIndex=o)}return t+e.slice(n)},_=g(o),v=g(l),y=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${n}</title>
  <style id="arabic-font-faces">${w}</style>
  <style id="dynamic-page-rule">
    @page {
      size: ${f} ${u};
      margin: ${m};
      ${G}
    }
  </style>
  <style>
    :root {
      --print-cell-font-size: 16px;
      --print-header-font-size: 16px;
      --print-cell-padding: 4px 5px;
      --print-cell-line-height: 1.4;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${S} !important;
      counter-reset: pageNumber;
      direction: rtl;
      background: #525659;
      color: #000000 !important;
      padding: 0;
      margin: 0;
      font-weight: 700;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* شريط الأدوات العلوي */
    .preview-toolbar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 16px;
      background: #323639;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      user-select: none;
    }

    .toolbar-left, .toolbar-center, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .toolbar-title {
      font-size: 14px;
      font-weight: 700;
      color: #e8eaed;
      white-space: nowrap;
    }

    .toolbar-control {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #bdc1c6;
    }

    .toolbar-control select,
    .toolbar-control input[type="date"] {
      background: #202124;
      color: #e8eaed;
      border: 1px solid #5f6368;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
    }

    .btn-action {
      background: #1a73e8;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-action:hover { background: #1557b0; }
    .btn-filter { background: #0d9488; }
    .btn-filter:hover { background: #0f766e; }
    .btn-reset { background: #6b7280; }
    .btn-reset:hover { background: #4b5563; }
    .btn-download { background: #059669; }
    .btn-download:hover { background: #047857; }
    .btn-close {
      background: transparent;
      color: #bdc1c6;
      border: 1px solid #5f6368;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-close:hover { background: #202124; color: #fff; }

    /* مساحة عرض الورقة */
    .sheet-viewport {
      display: flex;
      justify-content: center;
      padding: 16px 8px 40px;
      overflow-x: auto;
    }

    .sheet-paper {
      background: #ffffff;
      color: #000000 !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
      border-radius: 2px;
      position: relative;
      flex: 0 0 auto;
      min-width: 0;
      transform-origin: top center;
      box-sizing: border-box;
      transition: width 0.15s ease, min-height 0.15s ease, padding 0.15s ease;
    }

    .sheet-paper.portrait {
      width: 210mm;
      min-height: 297mm;
      padding: 3mm;
    }

    .sheet-paper.landscape {
      width: 297mm;
      min-height: 210mm;
      padding: 3mm;
    }

    /* ===== إطار الترويسة الموحّد والنصوص الرسمية ===== */
    .report-letterhead-block {
      display: block !important;
      position: relative !important;
      width: 100% !important;
      margin: 0 auto 3mm !important;
      page-break-before: avoid !important;
      page-break-after: avoid !important;
      break-before: avoid !important;
      break-after: avoid !important;
    }

    .report-letterhead-frame {
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
      color: #000000 !important;
    }

    .report-letterhead-side {
      flex: 1 1 36% !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      color: #000000 !important;
    }

    .report-letterhead-right {
      text-align: right !important;
      direction: rtl !important;
    }

    .letterhead-title-ar {
      font-family: ${x} !important;
      font-size: 13.5px !important;
      font-weight: 900 !important;
      line-height: 1.3 !important;
      color: #000000 !important;
    }

    .letterhead-sub-ar {
      font-family: ${S} !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      line-height: 1.3 !important;
      color: #000000 !important;
    }

    .letterhead-branch-ar {
      font-family: ${S} !important;
      font-size: 12.5px !important;
      font-weight: 900 !important;
      line-height: 1.3 !important;
      color: #000000 !important;
    }

    .report-letterhead-center {
      flex: 0 0 28% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      padding: 0 4px !important;
    }

    .letterhead-bismillah {
      font-family: ${x} !important;
      font-size: 14.5px !important;
      font-weight: 900 !important;
      color: #000000 !important;
      white-space: nowrap !important;
      text-align: center !important;
    }

    .letterhead-center-divider {
      width: 75px !important;
      height: 1.5px !important;
      background: #000000 !important;
      margin: 3px auto 0 !important;
    }

    .report-letterhead-left {
      text-align: left !important;
      direction: ltr !important;
    }

    .letterhead-title-en {
      font-family: ${x} !important;
      font-size: 12px !important;
      font-weight: 900 !important;
      line-height: 1.25 !important;
      color: #000000 !important;
    }

    .letterhead-sub-en {
      font-family: ${S} !important;
      font-size: 10.5px !important;
      font-weight: 800 !important;
      line-height: 1.25 !important;
      color: #000000 !important;
    }

    .letterhead-branch-en {
      font-family: ${S} !important;
      font-size: 11px !important;
      font-weight: 900 !important;
      line-height: 1.25 !important;
      color: #000000 !important;
    }

    table {
      width: 100% !important;
      max-width: auto;
      border-collapse: collapse;
      table-layout: auto;
      margin: 0 auto;
      color: #000000 !important;
      text-align: center !important;
    }

    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid; break-inside: avoid; }

    th, td {
      border: 1px solid #000000 !important; 
      text-align: center;
      vertical-align: middle !important;
      padding: var(--print-cell-padding);
      box-sizing: border-box;
      color: #000000 !important;
      font-weight: 800;
      font-size: 16px !important;
      line-height: var(--print-cell-line-height, 1.4) !important;
    }

    thead th {
      background: #027d11 !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      font-size: 16px !important;
      padding: 6px 4px;
      white-space: normal !important;
      word-break: keep-all;
    }

    thead th .pdf-cell-text, th .pdf-cell-text {
      color: #000 !important;
      font-weight: 900;
      white-space: normal !important;
      background: transparent !important;
    }

    thead th.desc-cell,
    thead th[data-col-key="description"] {
      background: #174258 !important;
      color: #000 !important;
      white-space: normal !important;
      min-width: 50%;
    }

    tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]) {
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
      min-width: 0 !important;
    }

    tbody td:not(.desc-cell):not(.details-cell):not(.description-cell):not([data-col-key="description"]) .pdf-cell-text {
      display: inline-block !important;
      max-width: 100% !important;
      white-space: inherit !important;
      word-break: inherit !important;
      overflow-wrap: inherit !important;
      min-width: 0 !important;
    }

    tbody td.desc-cell,
    tbody td.details-cell,
    tbody td.description-cell,
    tbody td[data-col-key="description"],
    tbody td.desc-cell .pdf-cell-text,
    tbody td.details-cell .pdf-cell-text,
    tbody td.description-cell .pdf-cell-text,
    tbody td[data-col-key="description"] .pdf-cell-text {
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
      text-align: center !important;
      direction: rtl !important;
      min-width: 0 !important;
      max-width: 28ch !important;
    }

    .num, .numeric-cell, .date-cell, .compact-cell, .ref-cell, .idx {
      direction: ltr !important;
      font-family: ${S} !important;
      font-weight: 800 !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      text-align: center !important;
    }

    .total-row td {
      background: #0437bb !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      border-top: 2px solid #000000 !important;
      white-space: nowrap !important;
    }
    .total-row td .pdf-cell-text {
      color: #ffffff !important;
    }

    /* أنماط خاصة عند تنفيذ أمر الطباعة المباشر */
    @media print {
      body:not(.fit-content-mode) .sheet-paper { width: 100% !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; transform: none !important; }
      body:not(.fit-content-mode) .preview-report-content, body:not(.fit-content-mode) .preview-report-content table { width: 100% !important; max-width: 100% !important; }
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .preview-toolbar {
        display: none !important;
      }
      .sheet-viewport {
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
      }
      .sheet-paper {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 100% !important;
        min-height: auto !important;
        transform: none !important;
      }
      .report-letterhead-block {
        display: block !important;
        position: relative !important;
        width: 100% !important;
        margin: 0 auto 3mm !important;
        background: #ffffff !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead { display: table-header-group !important; }
      tfoot { display: table-footer-group !important; }
    }

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
    background: #0437bb !important; background-color: #0437bb !important; color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { color: #ffffff !important; }
  </style>
  <style>
    ${_}
    /* تنسيق موحّد لرؤوس الجداول والإجماليات والتوقيعات في المعاينة والطباعة */
    #tableContainer table thead th,
    #tableContainer table thead th.desc-cell,
    #tableContainer table thead th[data-col-key="description"] {
      background: #FFD700 !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #tableContainer table thead th .pdf-cell-text,
    #tableContainer table thead th span {
      color: #000000 !important;
      background: transparent !important;
    }
    #tableContainer table .total-row td,
    #tableContainer table .report-grand-total-row td {
      background: #0437bb !important;
      color: #ffffff !important;
      font-weight: 900 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #tableContainer table .total-row td .pdf-cell-text,
    #tableContainer table .report-grand-total-row td .pdf-cell-text {
      color: #ffffff !important;
    }
    #tableContainer table .signature-spacer-row,
    #tableContainer table .signature-spacer-row > td {
      height: 4mm !important;
      min-height: 4mm !important;
      padding: 0 !important;
      border: 0 !important;
      background: #ffffff !important;
      line-height: 0 !important;
    }
    #tableContainer table .signature-block-row {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    #tableContainer table .signature-block-row > td {
      background: #ffffff !important;
      border: 1.5px solid #000000 !important;
      padding: 14px 18px !important;
      color: #000000 !important;
    }
    #tableContainer .signature-block-grid {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 6px 12px !important;
      width: 100% !important;
      min-width: 0 !important;
      direction: rtl !important;
      align-items: end !important;
    }
    #tableContainer .sig-title {
      font-family: ${x} !important;
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
    #tableContainer .sig-name {
      font-family: ${S} !important;
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
    @media print {
      #tableContainer table thead th,
      #tableContainer table thead th.desc-cell,
      #tableContainer table thead th[data-col-key="description"] {
        background: #FFD700 !important;
        color: #000000 !important;
      }
      #tableContainer table .total-row td,
      #tableContainer table .report-grand-total-row td {
        background: #0437bb !important;
        color: #ffffff !important;
      }
      #tableContainer table .signature-block-row,
      #tableContainer table .signature-block-row > td {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    /* تثبيت محاذاة ومقاس كل خلايا التقارير في المعاينة ونسخة PDF */
    .sheet-paper table th,
    .sheet-paper table td {
      display: table-cell !important;
      vertical-align: middle !important;
      text-align: center !important;
      font-size: 16px !important;
      line-height: var(--print-cell-line-height, 1.4) !important;
    }
    .sheet-paper table th > *,
    .sheet-paper table td > * {
      vertical-align: middle !important;
    }
    .sheet-paper .pdf-cell-text {
      display: inline-block !important;
      vertical-align: middle !important;
      font-size: 16px !important;
      line-height: var(--print-cell-line-height, 1.4) !important;
    }

  html body table tr.report-grand-total-row > td, html body table tr.total-row > td,
  html body table tr.report-grand-total-row > td.description-cell, html body table tr.total-row > td.description-cell,
  html body table tr.report-grand-total-row > td.financial-amount-cell, html body table tr.total-row > td.financial-amount-cell {
    background: #0437bb !important; background-color: #0437bb !important; color: #ffffff !important; font-weight: 900 !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
  }
  html body table tr.report-grand-total-row > td *, html body table tr.total-row > td * { color: #ffffff !important; }
    /* Final report sizing overrides: only numeric/date/reference cells stay nowrap. */
    #tableContainer table.reports-data-table {
      table-layout: auto !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
    #tableContainer table.reports-data-table th,
    #tableContainer table.reports-data-table td {
      width: auto !important;
      min-width: 0 !important;
    }
    #tableContainer table.reports-data-table tbody td.text-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.name-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.specialty-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.batch-cell:not(.num):not(.numeric-cell):not(.date-cell):not(.compact-cell):not(.ref-cell):not(.idx),
    #tableContainer table.reports-data-table tbody td.desc-cell,
    #tableContainer table.reports-data-table tbody td.details-cell,
    #tableContainer table.reports-data-table tbody td.description-cell {
      max-width: 280px !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table.reports-data-table tbody td.text-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.name-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.specialty-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.batch-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.desc-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.details-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.description-cell .pdf-cell-text {
      display: inline-block !important;
      width: auto !important;
      max-width: 100% !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table.reports-data-table tbody td.num,
    #tableContainer table.reports-data-table tbody td.numeric-cell,
    #tableContainer table.reports-data-table tbody td.date-cell,
    #tableContainer table.reports-data-table tbody td.compact-cell,
    #tableContainer table.reports-data-table tbody td.ref-cell,
    #tableContainer table.reports-data-table tbody td.idx,
    #tableContainer table.reports-data-table tbody td.num .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.numeric-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.date-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.compact-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.ref-cell .pdf-cell-text,
    #tableContainer table.reports-data-table tbody td.idx .pdf-cell-text {
      max-width: none !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
    }
    ${s}
    ${W}
    ${v}
    /* Final page-fit rules shared by preview and browser printing. */
    #tableContainer, #tableContainer .preview-report-content {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    /* Excel-like adaptive columns: let content determine width, wrap prose only. */
    #tableContainer table,
    #tableContainer table.reports-data-table {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      table-layout: auto !important;
      border-collapse: collapse !important;
    }
    #tableContainer table th,
    #tableContainer table td {
      box-sizing: border-box !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      height: auto !important;
      vertical-align: middle !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
      line-height: var(--print-cell-line-height, 1.4) !important;
      font-size: var(--print-cell-font-size, 12px) !important;
      padding: var(--print-cell-padding, 4px 5px) !important;
    }
    #tableContainer table th {
      font-size: var(--print-header-font-size, 12px) !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table td.num,
    #tableContainer table td.numeric-cell,
    #tableContainer table td.date-cell,
    #tableContainer table td.compact-cell,
    #tableContainer table td.ref-cell,
    #tableContainer table td.idx,
    #tableContainer table td.reports-numeric-cell,
    #tableContainer table td.reports-no-wrap-cell,
    #tableContainer table th.numeric-cell,
    #tableContainer table th.date-cell {
      white-space: nowrap !important;
      overflow-wrap: normal !important;
      word-break: keep-all !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      font-variant-numeric: tabular-nums !important;
    }
    #tableContainer table td.numeric-cell .pdf-cell-text,
    #tableContainer table td.date-cell .pdf-cell-text,
    #tableContainer table td.num .pdf-cell-text,
    #tableContainer table td.ref-cell .pdf-cell-text,
    #tableContainer table td.idx .pdf-cell-text {
      white-space: nowrap !important;
      overflow-wrap: normal !important;
      word-break: keep-all !important;
    }
    #tableContainer table .pdf-cell-text {
      display: inline-block !important;
      max-width: 100% !important;
      white-space: inherit !important;
      overflow-wrap: inherit !important;
      word-break: inherit !important;
      vertical-align: middle !important;
    }
    #tableContainer table tr { height: auto !important; }
    @media print {
      #tableContainer table { table-layout: auto !important; width: 100% !important; }
      #tableContainer table th, #tableContainer table td {
        height: auto !important;
        font-size: var(--print-cell-font-size, 11px) !important;
      }
    }
    @media print {
      html, body { width: 100% !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
      .sheet-viewport { display: block !important; width: 100% !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
      .sheet-paper { width: 100% !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; margin: 0 auto !important; overflow: visible !important; box-shadow: none !important; transform: none !important; }
      #tableContainer { width: 100% !important; min-width: 0 !important; max-width: 100% !important; }
      #tableContainer table, #tableContainer table.reports-data-table { width: 100% !important; min-width: 0 !important; max-width: 100% !important; table-layout: fixed !important; }
      #tableContainer table th, #tableContainer table td { min-width: 0 !important; max-width: none !important; }
    } 

    /* Unified professional layout for every report in preview and browser print. */
    #paperContainer, .sheet-paper, #tableContainer, .preview-report-content {
      box-sizing: border-box !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
    #tableContainer table,
    #tableContainer table.reports-data-table,
    .preview-report-content table {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      table-layout: auto !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      direction: rtl !important;
    }
    #tableContainer table th,
    #tableContainer table td,
    .preview-report-content table th,
    .preview-report-content table td {
      box-sizing: border-box !important;
      min-width: 0 !important;
      max-width: none !important;
      padding: 4px 5px !important;
      font-family: ${S} !important;
      font-size: 16px !important;
      line-height: var(--print-cell-line-height, 1.4) !important;
      text-align: center !important;
      vertical-align: middle !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
    }
    #tableContainer table thead,
    .preview-report-content table thead { display: table-header-group !important; }
    #tableContainer table tfoot,
    .preview-report-content table tfoot { display: table-footer-group !important; }
    #tableContainer table thead th,
    .preview-report-content table thead th {
      font-size: 15px !important;
      font-weight: 900 !important;
      line-height: 1.3 !important;
      background: linear-gradient(180deg,#fff8d9,#f5d978 48%,#d7a92e) !important;
      color: #111 !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table tbody td,
    .preview-report-content table tbody td {
      background: #fff !important;
      color: #111 !important;
      font-weight: 700 !important;
    }
    #tableContainer table td.num,
    #tableContainer table td.numeric-cell,
    #tableContainer table td.date-cell,
    #tableContainer table td.compact-cell,
    #tableContainer table td.ref-cell,
    #tableContainer table td.idx,
    #tableContainer table td.reports-numeric-cell,
    #tableContainer table td.reports-no-wrap-cell,
    .preview-report-content table td.num,
    .preview-report-content table td.numeric-cell,
    .preview-report-content table td.date-cell,
    .preview-report-content table td.compact-cell,
    .preview-report-content table td.ref-cell,
    .preview-report-content table td.idx,
    .preview-report-content table td.reports-numeric-cell,
    .preview-report-content table td.reports-no-wrap-cell {
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
      font-variant-numeric: tabular-nums !important;
    }
    #tableContainer table td .pdf-cell-text,
    .preview-report-content table td .pdf-cell-text {
      display: inline-block !important;
      max-width: 100% !important;
      white-space: inherit !important;
      overflow-wrap: inherit !important;
      vertical-align: middle !important;
    }
    #tableContainer table tr,
    .preview-report-content table tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    #tableContainer table tr.signature-block-row,
    .preview-report-content table tr.signature-block-row {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    #tableContainer table tr.total-row > td,
    #tableContainer table tr.report-grand-total-row > td,
    .preview-report-content table tr.total-row > td,
    .preview-report-content table tr.report-grand-total-row > td {
      background: #0871ce !important;
      color: #fff !important;
      font-weight: 900 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media screen {
      .sheet-viewport { align-items: flex-start !important; }
      .sheet-paper { flex: 0 0 auto !important; }
      #tableContainer { overflow: visible !important; }
    }
    @media print {
      html, body {
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
      }
      .preview-toolbar { display: none !important; }
      .sheet-viewport {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      .sheet-paper {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: var(--print-page-margin, 3mm) !important;
        overflow: visible !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        transform: none !important;
      }
      #tableContainer {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: visible !important;
      }
      #tableContainer table,
      #tableContainer table.reports-data-table {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
      }
      #tableContainer table thead { display: table-header-group !important; }
      #tableContainer table tfoot { display: table-footer-group !important; }
      #tableContainer table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
      .report-letterhead-block { break-inside: avoid !important; page-break-inside: avoid !important; }
      .signature-block-row { break-inside: avoid !important; page-break-inside: avoid !important; }
    }

    /* A4-safe print layout: fit columns to the printable page without scaling the whole report. */
    #tableContainer table,
    #tableContainer table.reports-data-table,
    .preview-report-content table {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      table-layout: fixed !important;
    }
    #tableContainer table th,
    #tableContainer table td,
    .preview-report-content table th,
    .preview-report-content table td {
      min-width: 0 !important;
      max-width: none !important;
      font-size: var(--print-cell-font-size, 16px) !important;
      padding: var(--print-cell-padding, 4px 5px) !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
    }
    #tableContainer table thead th,
    .preview-report-content table thead th {
      font-size: var(--print-header-font-size, 16px) !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
    }
    #tableContainer table td.num,
    #tableContainer table td.numeric-cell,
    #tableContainer table td.date-cell,
    #tableContainer table td.compact-cell,
    #tableContainer table td.ref-cell,
    #tableContainer table td.idx,
    .preview-report-content table td.num,
    .preview-report-content table td.numeric-cell,
    .preview-report-content table td.date-cell,
    .preview-report-content table td.compact-cell,
    .preview-report-content table td.ref-cell,
    .preview-report-content table td.idx {
      white-space: nowrap !important;
      overflow-wrap: normal !important;
      word-break: keep-all !important;
    }
    #tableContainer table.a4-dense-table td.num,
    #tableContainer table.a4-dense-table td.numeric-cell,
    #tableContainer table.a4-dense-table td.date-cell,
    #tableContainer table.a4-dense-table td.compact-cell,
    #tableContainer table.a4-dense-table td.ref-cell,
    #tableContainer table.a4-dense-table td.idx {
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }
    #tableContainer table th .pdf-cell-text,
    #tableContainer table td .pdf-cell-text {
      max-width: 100% !important;
      white-space: inherit !important;
      overflow-wrap: inherit !important;
      word-break: inherit !important;
    }
    @media print {
      html, body, .sheet-viewport, .sheet-paper, #tableContainer {
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: visible !important;
      }
      .sheet-paper { width: 100% !important; }
      #tableContainer table,
      #tableContainer table.reports-data-table {
        width: 100% !important;
        table-layout: fixed !important;
      }
      #tableContainer table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
    }

      /* Shared content-measured Excel-like layout for every printed table. */
    ${M}

    /* Central heading/data typography shared by every report tab. */
    #paperContainer .letterhead-title-ar,
    #paperContainer .letterhead-bismillah,
    #tableContainer .report-title,
    #tableContainer .doc-title-cell h1,
    #tableContainer .reports-print-heading h1 {
      font-family: ${x} !important;
      font-weight: 900 !important;
      color: #000000 !important;
    }
    #tableContainer table thead th,
    #tableContainer table thead th .pdf-cell-text,
    .preview-report-content table thead th,
    .preview-report-content table thead th .pdf-cell-text {
      font-family: ${x} !important;
      font-weight: 800 !important;
      font-size: var(--print-header-font-size, 16px) !important;
      color: #000000 !important;
    }
    #tableContainer table tbody td,
    #tableContainer table tbody td .pdf-cell-text,
    .preview-report-content table tbody td,
    .preview-report-content table tbody td .pdf-cell-text {
      font-family: ${S} !important;
      font-weight: 500 !important;
      color: #000000 !important;
      line-height: var(--print-cell-line-height, 1.4) !important;
      padding: var(--print-cell-padding, 4px 5px) !important;
      font-variant-numeric: tabular-nums !important;
      font-feature-settings: "tnum" 1 !important;
    }
    #tableContainer table tbody td.num,
    #tableContainer table tbody td.numeric-cell,
    #tableContainer table tbody td.amount-cell,
    #tableContainer table tbody td.financial-amount-cell,
    #tableContainer table tbody td.reports-numeric-cell,
    #tableContainer table tbody td.reports-no-wrap-cell,
    #tableContainer table tbody td.num .pdf-cell-text,
    #tableContainer table tbody td.numeric-cell .pdf-cell-text,
    #tableContainer table tbody td.amount-cell .pdf-cell-text,
    #tableContainer table tbody td.financial-amount-cell .pdf-cell-text,
    #tableContainer table tbody td.reports-numeric-cell .pdf-cell-text,
    #tableContainer table tbody td.reports-no-wrap-cell .pdf-cell-text,
    .preview-report-content table tbody td.num,
    .preview-report-content table tbody td.numeric-cell,
    .preview-report-content table tbody td.amount-cell,
    .preview-report-content table tbody td.financial-amount-cell,
    .preview-report-content table tbody td.reports-numeric-cell,
    .preview-report-content table tbody td.reports-no-wrap-cell {
      font-family: ${S} !important;
      font-weight: 700 !important;
      font-variant-numeric: tabular-nums !important;
      font-feature-settings: "tnum" 1 !important;
    }
    #tableContainer .sig-title,
    .preview-report-content .sig-title {
      font-family: ${x} !important;
      font-weight: 900 !important;
      color: #000000 !important;
    }
    #tableContainer .sig-name,
    .preview-report-content .sig-name {
      font-family: ${S} !important;
      font-weight: 600 !important;
      color: #000000 !important;
    }
    #tableContainer table tbody tr.total-row > td,
    #tableContainer table tbody tr.total-row > td *,
    #tableContainer table tbody tr.report-grand-total-row > td,
    #tableContainer table tbody tr.report-grand-total-row > td *,
    #tableContainer table tbody tr.reports-trainee-total-row > td,
    #tableContainer table tbody tr.reports-trainee-total-row > td *,
    .preview-report-content table tbody tr.total-row > td,
    .preview-report-content table tbody tr.total-row > td *,
    .preview-report-content table tbody tr.report-grand-total-row > td,
    .preview-report-content table tbody tr.report-grand-total-row > td *,
    .preview-report-content table tbody tr.reports-trainee-total-row > td,
    .preview-report-content table tbody tr.reports-trainee-total-row > td * {
      color: #ffffff !important;
    }
    @media print {
      body { counter-reset: pageNumber; }
    }
</style>
</head>
<body>
  <div class="preview-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-title">🖨️ ${n}${i?` — ${i}`:``}</span>

      <div class="toolbar-control">
        <label>الاتجاه:</label>
        <select id="selOrientation">
          <option value="landscape" ${u===`landscape`?`selected`:``}>أفقي (Landscape)</option>
          <option value="portrait" ${u===`portrait`?`selected`:``}>طولي (Portrait)</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>الحجم:</label>
        <select id="selPageSize">
          <option value="A4" ${f===`A4`?`selected`:``}>A4</option>
          <option value="A3" ${f===`A3`?`selected`:``}>A3</option>
          <option value="Letter" ${f===`Letter`?`selected`:``}>Letter</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>الهامش:</label>
        <select id="selMargin">
          <option value="0mm" ${p===`0mm`?`selected`:``}>بدون هامش (0 مم)</option>
          <option value="2mm">ضيق جداً (2 مم)</option>
          <option value="3mm" ${p===`3mm`?`selected`:``}>ضيق (3 مم)</option>
          <option value="6mm">متوسط (6 مم)</option>
          <option value="10mm">عادي (10 مم)</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>تباعد الأسطر:</label>
        <select id="selLineSpacing" title="تحديد المسافة بين أسطر النص داخل خلايا الجدول">
          <option value="1">متقارب جداً (1.0)</option>
          <option value="1.2">ضيق (1.2)</option>
          <option value="1.35">متوسط (1.35)</option>
          <option value="1.4" selected>عادي (1.4)</option>
          <option value="1.45">مريح (1.45)</option>
          <option value="1.6">واسع (1.6)</option>
          <option value="1.8">واسع جداً (1.8)</option>
          <option value="2">مزدوج (2.0)</option>
        </select>
      </div>

      <div class="toolbar-control">
        <label>الملاءمة:</label>
        <select id="selScale">
          <option value="1">100% (تلقائي)</option>
          <option value="0.95">95%</option>
          <option value="0.9">90%</option>
          <option value="0.85">85%</option>
          <option value="0.8">80%</option>
          <option value="0.75">75%</option>
        </select>
      </div>
    </div>

    <div class="toolbar-center">
      <div class="toolbar-control">
        <label>من:</label>
        <input type="date" id="dateFrom" />
      </div>
      <div class="toolbar-control">
        <label>إلى:</label>
        <input type="date" id="dateTo" />
      </div>
      <button type="button" class="btn-action btn-filter" id="btnFilter">
        🔍 تطبيق
      </button>
      <button type="button" class="btn-action btn-reset" id="btnResetFilter" title="إعادة تعيين الفترة">
        ↺
      </button>
    </div>

    <div class="toolbar-right">
      <button type="button" class="btn-action" id="btnPrint">
        🖨️ طباعة
      </button>

      <button type="button" class="btn-action btn-download" id="btnDownloadPdf">
        📄 تصدير PDF
      </button>

      <button type="button" class="btn-close" id="btnClose">
        ✕
      </button>
    </div>
  </div>

  <div class="sheet-viewport">
    <div id="paperContainer" class="sheet-paper ${u}">
      ${h?``:T()}
      <div id="tableContainer" class="preview-report-content report-page-content">
        ${r}
      </div>
    </div>
  </div>

  <script>
    try { ${a}\n${c} } catch (e) {}
    (function() {
      const fitToContent = ${d?`true`:`false`};
      if (fitToContent) document.body.classList.add('fit-content-mode');
      const autoDownloadPdf = ${e.autoDownloadPdf?`true`:`false`};
      const selOrientation = document.getElementById('selOrientation');
      const selPageSize = document.getElementById('selPageSize');
      const selMargin = document.getElementById('selMargin');
      const selScale = document.getElementById('selScale');
      const selLineSpacing = document.getElementById('selLineSpacing');
      const paperContainer = document.getElementById('paperContainer');
      const tableContainer = document.getElementById('tableContainer');
      const dynamicRule = document.getElementById('dynamic-page-rule');
      const pageNumberMarginRule = ${JSON.stringify(G)};
      const buildDynamicPageRule = function(pageSize, orientation, pageMargin, important) {
        const priority = important ? ' !important' : '';
        const requestedMargin = Number.parseFloat(pageMargin);
        const footerMargin = Math.max(6, Number.isFinite(requestedMargin) ? requestedMargin : 3) + 'mm';
        const pageMargins = pageMargin + ' ' + pageMargin + ' ' + footerMargin + ' ' + pageMargin;
        return '@page { size: ' + pageSize + ' ' + orientation + '; margin: ' + pageMargins + priority + '; ' + pageNumberMarginRule + ' }';
      };
      // Apply live controls after all report-specific CSS so no fixed !important rule can cancel them.
      const liveSettingsStyle = document.createElement('style');
      liveSettingsStyle.id = 'live-print-settings';
      function refreshLiveSettingsCss(pageSize, orientation, pageMargin) {
        // This node is always the final stylesheet, so toolbar values override
        // report-specific rules in both the preview and the browser print dialog.
        const pageRule = buildDynamicPageRule(pageSize, orientation, pageMargin, true);
        liveSettingsStyle.textContent = [
          pageRule,
          ':root { --print-page-margin: ' + pageMargin + '; }',
          '#paperContainer.sheet-paper { padding: ' + pageMargin + ' !important; margin: 0 auto !important; }',
          '#paperContainer #tableContainer table th,',
          '#paperContainer #tableContainer table td {',
          '  font-size: var(--print-cell-font-size, 14px) !important;',
          '  line-height: var(--print-cell-line-height, 1.4) !important;',
          '  padding: var(--print-cell-padding, 4px 5px) !important;',
          '}',
          '#paperContainer #tableContainer table thead th { font-size: var(--print-header-font-size, 14px) !important; }',
          '#paperContainer #tableContainer table th .pdf-cell-text,',
          '#paperContainer #tableContainer table td .pdf-cell-text { font-size: inherit !important; line-height: inherit !important; }',
          '@media print {',
          '  html, body { margin: 0 !important; padding: 0 !important; }',
          '  .sheet-viewport { margin: 0 !important; padding: 0 !important; }',
          '  #paperContainer.sheet-paper { width: 100% !important; padding: ' + pageMargin + ' !important; margin: 0 auto !important; }',
          '  #paperContainer #tableContainer { width: 100% !important; margin: 0 !important; padding: 0 !important; }',
          '  #paperContainer #tableContainer table th,',
          '  #paperContainer #tableContainer table td {',
          '    font-size: var(--print-cell-font-size, 14px) !important;',
          '    line-height: var(--print-cell-line-height, 1.4) !important;',
          '    padding: var(--print-cell-padding, 4px 5px) !important;',
          '  }',
          '  #paperContainer #tableContainer table thead th { font-size: var(--print-header-font-size, 14px) !important; }',
          '}'
        ].join('\\n');
        document.head.appendChild(liveSettingsStyle);
      }

      const btnPrint = document.getElementById('btnPrint');
      const btnDownloadPdf = document.getElementById('btnDownloadPdf');
      const btnClose = document.getElementById('btnClose');
      const dateFrom = document.getElementById('dateFrom');
      const dateTo = document.getElementById('dateTo');
      const btnFilter = document.getElementById('btnFilter');
      const btnResetFilter = document.getElementById('btnResetFilter');
      const subTitleEl = document.querySelector('.sub');
      const originalSubText = subTitleEl ? subTitleEl.textContent : '';

      let printInProgress = false;

      function toLatinDigits(str) {
        if (!str) return '';
        const arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        return String(str).replace(/[٠-٩]/g, function(d) {
          return arabic.indexOf(d);
        });
      }

      function parseRowDate(raw) {
        if (!raw) return null;
        const text = toLatinDigits(raw.trim());
        
        let m = text.match(/(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})/);
        if (m) {
          return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        }

        m = text.match(/(\\d{1,2})[-\\/](\\d{1,2})[-\\/](\\d{4})/);
        if (m) {
          return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }

        const d = new Date(text);
        return isNaN(d.getTime()) ? null : d;
      }

      function findDateColumnIndex(table) {
        const ths = Array.from(table.querySelectorAll('thead th'));
        const exactPatterns = [
          /^التاريخ$/,
          /^تاريخ$/,
          /^date$/i
        ];
        for (let idx = 0; idx < ths.length; idx++) {
          const raw = ths[idx].textContent || '';
          const clean = raw.replace(/[\\u200f\\u200e\\u202a-\\u202e]/g, '').trim();
          if (exactPatterns.some(function(p) { return p.test(clean); })) {
            return idx;
          }
        }
        for (let idx = 0; idx < ths.length; idx++) {
          const clean = (ths[idx].textContent || '').replace(/\\s+/g, ' ').trim();
          if (/التاريخ|تاريخ|date/i.test(clean)) {
            return idx;
          }
        }
        const firstBodyRow = table.querySelector('tbody tr:not(.total-row)');
        if (firstBodyRow) {
          for (let idx = 0; idx < firstBodyRow.cells.length; idx++) {
            const cellText = (firstBodyRow.cells[idx].textContent || '').trim();
            if (parseRowDate(cellText)) {
              return idx;
            }
          }
        }
        return -1;
      }

      function readCellDate(cell) {
        if (!cell) return null;
        const dataAttr = cell.getAttribute('data-date') || cell.getAttribute('datetime');
        if (dataAttr) {
          const d = parseRowDate(dataAttr);
          if (d) return d;
        }
        const textEl = cell.querySelector('.pdf-cell-text') || cell;
        return parseRowDate((textEl.textContent || '').trim());
      }

      function formatNum(num) {
        return Number(num).toLocaleString('en-US');
      }

      function applyDateFilter() {
        const fromStr = dateFrom.value;
        const toStr = dateTo.value;
        const fromVal = fromStr ? new Date(fromStr + 'T00:00:00') : null;
        const toVal = toStr ? new Date(toStr + 'T23:59:59') : null;

        const table = document.querySelector('.sheet-paper table');
        if (!table) return;

        const dateColIdx = findDateColumnIndex(table);

        const numericColIndices = [];
        const totalRow = table.querySelector('.total-row');
        if (totalRow) {
          Array.from(totalRow.cells).forEach(function(cell, idx) {
            if (cell.classList.contains('numeric-cell') || cell.classList.contains('num')) {
              if (idx > 0) numericColIndices.push(idx);
            }
          });
        }

        const colTotals = {};
        numericColIndices.forEach(function(idx) { colTotals[idx] = 0; });

        const rows = Array.from(table.querySelectorAll('tbody tr')).filter(function(r) {
          return !r.classList.contains('total-row');
        });
        
        let visibleCount = 0;

        rows.forEach(function(row) {
          let rowDate = null;
          if (dateColIdx >= 0 && row.cells[dateColIdx]) {
            rowDate = readCellDate(row.cells[dateColIdx]);
          }

          let show = true;
          if (fromVal || toVal) {
            if (rowDate) {
              if (fromVal && rowDate < fromVal) show = false;
              if (toVal && rowDate > toVal) show = false;
            } else {
              show = false;
            }
          }

          row.style.display = show ? '' : 'none';
          if (show) {
            visibleCount++;
            if (row.cells[0]) {
              const idxSpan = row.cells[0].querySelector('.pdf-cell-text') || row.cells[0];
              idxSpan.textContent = visibleCount;
            }

            numericColIndices.forEach(function(colIdx) {
              if (row.cells[colIdx]) {
                const rawVal = toLatinDigits(row.cells[colIdx].textContent).replace(/[^0-9.-]/g, '');
                const num = parseFloat(rawVal) || 0;
                colTotals[colIdx] += num;
              }
            });
          }
        });

        if (totalRow) {
          numericColIndices.forEach(function(colIdx) {
            if (totalRow.cells[colIdx]) {
              const span = totalRow.cells[colIdx].querySelector('.pdf-cell-text') || totalRow.cells[colIdx];
              span.textContent = formatNum(colTotals[colIdx]);
            }
          });
        }

        if (subTitleEl) {
          if (fromVal || toVal) {
            const rangeStr = (fromVal ? 'من ' + fromStr : '') + (toVal ? ' إلى ' + toStr : '');
            subTitleEl.textContent = originalSubText + ' • الفترة المحددة: ' + rangeStr + ' (السجلات: ' + visibleCount + ')';
          } else {
            subTitleEl.textContent = originalSubText;
          }
        }
      }

      btnFilter.addEventListener('click', applyDateFilter);
      btnResetFilter.addEventListener('click', function() {
        dateFrom.value = '';
        dateTo.value = '';
        applyDateFilter();
      });

      function ensureMultiPagePrintLayout() {
        if (document.getElementById('multi-page-print-layout')) return;
        var style = document.createElement('style');
        style.id = 'multi-page-print-layout';
        style.textContent = [
          '@media print {',
          'html, body { height:auto!important; min-height:0!important; overflow:visible!important; }',
          '.sheet-viewport, #tableContainer, .preview-report-content { display:block!important; position:static!important; width:100%!important; min-width:0!important; max-width:100%!important; height:auto!important; min-height:0!important; max-height:none!important; margin:0!important; overflow:visible!important; transform:none!important; box-shadow:none!important; }',
          '.sheet-paper, #paperContainer { display:block!important; position:static!important; width:100%!important; min-width:0!important; max-width:100%!important; height:auto!important; min-height:0!important; max-height:none!important; margin:0 auto!important; padding: var(--print-page-margin, 3mm) !important; overflow:visible!important; transform:none!important; box-shadow:none!important; }',
          'table, table.reports-data-table { display:table!important; width:100%!important; min-width:0!important; max-width:100%!important; height:auto!important; border-collapse:collapse!important; break-inside:auto!important; page-break-inside:auto!important; }',
          'thead { display:table-header-group!important; }',
          'tfoot { display:table-footer-group!important; }',
          'tbody { display:table-row-group!important; }',
          'tr { break-inside:avoid-page!important; page-break-inside:avoid!important; }',
          '.preview-toolbar { display:none!important; }',
          '}'
        ].join('\\n');
        document.head.appendChild(style);
      }

      // IMPORTANT: call window.print() synchronously in the original click handler.
      // Awaiting fonts/images or requestAnimationFrame first can consume transient user
      // activation and cause Chrome/Android to silently ignore the print request.
      function releasePrintLock() {
        printInProgress = false;
      }

      // Some browsers fire afterprint only after the dialog closes; Android Chrome
      // may return from print() immediately. Support both paths without leaving the
      // toolbar permanently locked after a cancelled or failed print attempt.
      window.addEventListener('afterprint', releasePrintLock);

      function printOnce() {
        if (printInProgress) return false;
        if (typeof window.print !== 'function') {
          alert('ميزة الطباعة غير متاحة في هذا المتصفح. افتح المعاينة باستخدام Chrome ثم أعد المحاولة.');
          return false;
        }

        printInProgress = true;
        let printStarted = false;
        try {
          ensureMultiPagePrintLayout();
          // Re-append live settings after helper styles immediately before printing.
          updatePageSettings();
          window.focus();
          // Keep this call synchronous in the actual toolbar click handler.
          window.print();
          printStarted = true;
          return true;
        } catch (error) {
          console.error('[Print] Browser print invocation failed:', error);
          alert('تعذّر تشغيل الطباعة. تحقق من خدمة الطباعة في المتصفح ثم أعد المحاولة.');
          return false;
        } finally {
          // Desktop browsers usually wait for the print dialog to close, while
          // Android may return immediately. The fallback guarantees retry works.
          window.setTimeout(releasePrintLock, printStarted ? 1800 : 0);
        }
      }

      function updatePageSettings() {
        const orientation = selOrientation.value;
        const pageSize = selPageSize.value;
        const margin = selMargin.value;
        const scale = parseFloat(selScale.value) || 1;
        const lineSpacing = parseFloat(selLineSpacing.value) || 1.45;
        paperContainer.style.setProperty('--print-cell-line-height', String(lineSpacing));
        tableContainer.style.setProperty('--print-cell-line-height', String(lineSpacing));
        tableContainer.style.setProperty('--print-preview-scale', String(scale));

        paperContainer.classList.remove('portrait', 'landscape');
        paperContainer.classList.add(orientation);
        paperContainer.dataset.pageOrientation = orientation;
        paperContainer.dataset.pageSize = pageSize;

        if (pageSize === 'A3') {
          paperContainer.style.width = orientation === 'portrait' ? '297mm' : '420mm';
        } else if (pageSize === 'Letter') {
          paperContainer.style.width = orientation === 'portrait' ? '216mm' : '279mm';
        } else {
          paperContainer.style.width = orientation === 'portrait' ? '210mm' : '297mm';
        }

        paperContainer.style.padding = margin;
        paperContainer.style.setProperty('--print-page-margin', margin);
        paperContainer.style.setProperty('max-width', 'none', 'important');
        const heights = pageSize === 'A3' ? [420, 297] : pageSize === 'Letter' ? [279.4, 215.9] : [297, 210];
        paperContainer.style.minHeight = heights[orientation === 'portrait' ? 0 : 1] + 'mm';
        paperContainer.style.height = '';
        paperContainer.style.transform = 'none';

        const table = paperContainer.querySelector('table');
        const headerRow = table && table.tHead && table.tHead.rows[table.tHead.rows.length - 1];
        const columnCount = headerRow ? headerRow.cells.length : 1;
        const isReportsTabTable = table?.id === 'reports-table';
        const fontSize = isReportsTabTable
          ? (columnCount > 16 ? 10 : columnCount > 13 ? 11 : columnCount > 10 ? 12 : columnCount > 7 ? 13 : 14)
          : (columnCount > 16 ? 9 : columnCount > 13 ? 10 : columnCount > 10 ? 11 : columnCount > 7 ? 12 : 14);
        const headerFontSize = isReportsTabTable ? Math.min(fontSize + 1, 15) : fontSize;
        const horizontalPadding = columnCount > 13 ? 1.5 : columnCount > 9 ? 2.5 : 4;

        const scaledFontSize = fontSize * scale;
        const scaledHeaderFontSize = headerFontSize * scale;
        const scaledHorizontalPadding = horizontalPadding * scale;
        const scaledVerticalPadding = 3 * scale;
        paperContainer.style.setProperty('--print-cell-font-size', scaledFontSize + 'px');
        paperContainer.style.setProperty('--print-header-font-size', scaledHeaderFontSize + 'px');
        paperContainer.style.setProperty('--print-cell-padding', scaledVerticalPadding + 'px ' + scaledHorizontalPadding + 'px');
        tableContainer.style.setProperty('--print-cell-font-size', scaledFontSize + 'px');
        tableContainer.style.setProperty('--print-header-font-size', scaledHeaderFontSize + 'px');
        tableContainer.style.setProperty('--print-cell-padding', scaledVerticalPadding + 'px ' + scaledHorizontalPadding + 'px');

        tableContainer.style.width = '100%';
        const pageMargin = margin;
        dynamicRule.textContent = buildDynamicPageRule(pageSize, orientation, pageMargin, false);
        document.head.appendChild(dynamicRule);
        refreshLiveSettingsCss(pageSize, orientation, pageMargin);

        const contentTable = tableContainer.querySelector('table');
        if (!contentTable) return;
        const denseTable = columnCount > 9;
        contentTable.classList.toggle('a4-dense-table', denseTable);
        tableContainer.style.width = '100%';
        tableContainer.style.removeProperty('zoom');
        paperContainer.style.setProperty('--print-preview-scale', String(scale));
        tableContainer.style.setProperty('--print-preview-scale', String(scale));

        if (tableContainer.dataset.printCellsTagged !== 'true' && tableContainer.dataset.printCellsTagging !== 'true') {
          tableContainer.dataset.printCellsTagging = 'true';
          window.requestAnimationFrame(function() {
            if (tableContainer.dataset.printCellsTagged === 'true') return;
  
              const numericOrDate = /^[\\s\\u200e\\u200f]*[+-]?(?:(?:[0-9٠-٩۰-۹]+)(?:[,.٬٫][0-9٠-٩۰-۹]+)*|[0-9٠-٩۰-۹]{1,4}[-/.][0-9٠-٩۰-۹]{1,2}[-/.][0-9٠-٩۰-۹]{1,4})(?:\\s*(?:ر\\.?\\s*ي|ريال|ر\\.?\\s*س))?[\\s\\u200e\\u200f]*$/;
              tableContainer.querySelectorAll('table').forEach(function(currentTable) {
                currentTable.querySelectorAll('th,td').forEach(function(cell) {
                  const value = (cell.textContent || '').trim();
                  if (numericOrDate.test(value)) cell.classList.add('numeric-cell');
                });
              });
    
              const serialHeader = /^(?:م|#|المسلسل|مسلسل|التسلسل|تسلسل|no|sno)$/i;
              tableContainer.querySelectorAll('table').forEach(function(currentTable) {
                const headerCells = Array.from(currentTable.querySelectorAll('thead tr:first-child th, thead tr:first-child td, tr:first-child th, tr:first-child td'));
                const serialIndex = headerCells.findIndex(function(cell) {
                  return serialHeader.test((cell.textContent || '').replace(/[\\s.]/g, '').trim());
                });
                if (serialIndex < 0) return;
                currentTable.querySelectorAll('tr').forEach(function(row) {
                  const cell = row.children.item(serialIndex);
                  if (cell) cell.classList.add('serial-number-column');
                });
              });
              tableContainer.dataset.printCellsTagged = 'true';
          });
        }
      }

      function downloadDirectPdf() {
        if (printInProgress) return;
        btnDownloadPdf.disabled = true;
        btnDownloadPdf.innerText = 'جارٍ فتح حفظ PDF...';
        try {
          printOnce();
        } catch (err) {
          console.error('[PDF] Browser print failed:', err);
          alert('تعذر فتح واجهة حفظ PDF. أعد المحاولة وتحقق من خدمة الطباعة في المتصفح.');
        } finally {
          window.setTimeout(function() {
            btnDownloadPdf.disabled = false;
            btnDownloadPdf.innerText = '📄 تصدير PDF';
          }, 1200);
        }
      }

      selOrientation.addEventListener('change', updatePageSettings);
      selPageSize.addEventListener('change', updatePageSettings);
      selMargin.addEventListener('change', updatePageSettings);
      selScale.addEventListener('change', updatePageSettings);
      selLineSpacing.addEventListener('change', updatePageSettings);
      window.addEventListener('beforeprint', updatePageSettings);

      btnPrint.addEventListener('click', function(event) {
        event.preventDefault();
        if (btnPrint.disabled) return;
        btnPrint.disabled = true;
        const originalLabel = btnPrint.textContent;
        btnPrint.textContent = 'جارٍ فتح الطباعة…';
        try {
          printOnce();
        } catch (error) {
          console.error('[Print] Toolbar action failed:', error);
          alert('تعذّرت الطباعة. أعد المحاولة.');
        } finally {
          window.setTimeout(function() {
            btnPrint.disabled = false;
            btnPrint.textContent = originalLabel || '🖨️ طباعة';
          }, 1800);
        }
      });
      btnDownloadPdf.addEventListener('click', downloadDirectPdf);
      btnClose.addEventListener('click', function() { window.close(); });

      if (autoDownloadPdf) {
        window.addEventListener('load', function() {
          window.setTimeout(downloadDirectPdf, 250);
        }, { once: true });
      }

      window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          try { printOnce(); } catch (error) { console.error('[Print] Failed:', error); }
        } else if (e.key === 'Escape') {
          window.close();
        }
      });
      updatePageSettings();
    })();
  <\/script>
</body>
</html>`;if(t.isNativePlatform())try{let e=new DOMParser().parseFromString(y,`text/html`);e.querySelector(`.preview-toolbar`)?.remove(),e.querySelectorAll(`script`).forEach(e=>e.remove());let t=e.createElement(`style`);return t.textContent=`
        @page { size: ${f} ${u}; margin: ${m}; ${G} }
        html, body { width: 100% !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
        .sheet-viewport { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
        .sheet-paper { width: 100% !important; min-width: 0 !important; min-height: 0 !important; height: auto !important; margin: 0 !important; padding: 0 !important; transform: none !important; box-shadow: none !important; border-radius: 0 !important; }
        .preview-report-content { width: 100% !important; zoom: 1 !important; }
        table { max-width: 100% !important; }
        @media print { html, body { background: #fff !important; } }
      `,e.head.appendChild(t),U(`<!DOCTYPE html>${e.documentElement.outerHTML}`,n).then(e=>{e||window.alert(`تعذر فتح خدمة الطباعة في Android. تحقق من تثبيت خدمة الطباعة ثم أعد المحاولة.`)}).catch(e=>{console.error(`[Print] Android printing failed`,e),window.alert(`تعذر فتح خدمة الطباعة في Android. أعد المحاولة بعد التحقق من إعدادات الطباعة.`)}),!0}catch(e){return console.error(`[Print] Unable to prepare Android report`,e),window.alert(`تعذر تجهيز التقرير للطباعة على Android.`),!1}let b=e.preopenedWindow??window.open(``,`_blank`);if(!b||b.closed)return alert(`يرجى السماح بالنوافذ المنبثقة لمعاينة الطباعة`),!1;try{return b.document.open(),b.document.write(y),b.document.close(),b.document.title=n,!0}catch(e){console.error(`[Print] Failed to populate preview window`,e);try{b.close()}catch{}return!1}}export{h as _,j as a,E as c,S as d,x as f,f as g,g as h,M as i,w as l,b as m,W as n,D as o,y as p,U as r,T as s,K as t,C as u,l as v,u as y};