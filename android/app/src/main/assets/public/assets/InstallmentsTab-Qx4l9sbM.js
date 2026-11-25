import{i as e}from"./rolldown-runtime-COiEfhsA.js";import{C as t,E as n,F as r,P as i,R as a,U as o,W as s,_ as c,at as l,g as u,it as d,n as f,nt as p,p as m,s as ee,st as h,u as te,w as g}from"./vendor-icons-B1CCHuqf.js";import{o as ne}from"./vendor-capacitor-CGjsZc7I.js";import{c as re,h as ie,p as _}from"./capacitor-BGs8GKJp.js";import{n as ae,t as v}from"./vendor-react-bFf7IZBE.js";import{t as oe}from"./feeClassification-BQzdw9Vf.js";import{l as se,m as ce,p as le,t as ue,u as y,v as b}from"./browserPrintPreview-Bn6IQjSD.js";import{n as de}from"./excelImportWorkerClient-DM-WNWEM.js";import{n as fe}from"./useTableControls-Cjj9lqCa.js";import{t as pe}from"./TabActions-DxzSk_ox.js";import{n as me,t as he}from"./PrintSettingsModal-Cf5eSzBV.js";import{n as ge,r as _e}from"./reportPdf-Bzyf0cU6.js";import{a as ve,c as ye,i as be,n as xe,o as Se,s as Ce,t as we}from"./excelExport-DRbJaRDH.js";var x=e(h()),S=ae(),C=`/app/applet/src/components/InstallmentsTab.tsx`,w=[`يونيو 2024`,`يوليو 2024`,`أغسطس 2024`,`مارس 2025`,`ابريل 2025`,`مايو 2025`,`يونيو 2025`,`يوليو 2025`,`أغسطس 2025`,`سبتمبر 2025`,`أكتوبر 2025`,`نوفمبر2025`,`ديسمبر2025`],T=[`يناير`,`فبراير`,`مارس`,`ابريل`,`مايو`,`يونيو`,`يوليو`,`اغسطس`,`سبتمبر`,`اكتوبر`,`نوفمبر`,`ديسمبر`],E=40,D=e=>!e||isNaN(Number(String(e).replace(/[^0-9.-]/g,``)))?0:Number(String(e).replace(/[^0-9.-]/g,``))||0,O=e=>String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`),Te=e=>String(e||`متدرب`).replace(/[\\/:*?"<>|]/g,`-`).replace(/\s+/g,`_`).trim()||`متدرب`,k=`w-4 h-4`,Ee=`px-2 py-1 text-xs rounded-md`,De=`text-lg sm:text-xl font-extrabold`,Oe=`
  html, body { margin: 0 !important; padding: 0 !important; }
  .report-page-content { width: 100% !important; min-width: 0 !important; }
  .report-page-content table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
  .report-page-content, .report-page-content table, .report-page-content th, .report-page-content td { font-family: ${y} !important; font-weight: 900 !important; }
  .report-page-content table th, .report-page-content table td, .report-page-content table th *, .report-page-content table td * { font-size: 8px !important; }
  .report-page-content th, .report-page-content td { box-sizing: border-box !important; padding: 1px 2px !important; margin: 0 !important; vertical-align: middle !important; text-align: center !important; white-space: normal !important; line-height: 1.1 !important; overflow: hidden !important; }
  .report-page-content th { background: #0f766e !important; color: #000 !important; }
  .report-page-content td { color: #000 !important; overflow-wrap: anywhere !important; word-break: normal !important; }
  .report-page-content td.numeric-cell, .report-page-content th.numeric-cell,
  .report-page-content td.numeric-cell *, .report-page-content th.numeric-cell * {
    white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important;
    direction: ltr !important; unicode-bidi: isolate !important; font-variant-numeric: tabular-nums !important;
    max-width: 100% !important; overflow: hidden !important; text-overflow: clip !important;
  }
  .report-page-content table.reports-data-table th[data-col-key="notes"],
  .report-page-content table.reports-data-table td[data-col-key="notes"] {
    width: 1% !important; max-width: 10% !important; white-space: normal !important;
    overflow-wrap: anywhere !important; word-break: normal !important;
  }
  .report-page-content .num, .report-page-content .numeric-cell { white-space: nowrap !important; word-break: keep-all !important; direction: ltr !important; }
  .report-page-content h1, .report-page-content h2 { margin: 0 0 5px !important; text-align: center !important; }
  /* Summary print style for installments 2026 mirrors visible screen table. */
  .report-page-content table.installments-summary-2026 { border-collapse: collapse !important; direction: rtl !important; }
  .report-page-content table.installments-summary-2026 thead th { background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important; color: #000 !important; border: 1px solid #000000 !important; border-color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .report-page-content table.installments-summary-2026 thead th[data-col-key="idx"], .report-page-content table.installments-summary-2026 thead th[data-col-key="name"] { color: #fff !important; }
  .report-page-content table.installments-summary-2026 tbody td { border: 1px solid #000000 !important; border-color: #000000 !important; color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="name"] { background: #fdf4ff !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="batch"], .report-page-content table.installments-summary-2026 tbody td[data-col-key="specialty"], .report-page-content table.installments-summary-2026 tbody td[data-col-key="fees"] { background: #f0f9ff !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="prevDue"] { background: #f8fcff !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="totalPaid"] { background: #ecfdf5 !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="remaining"] { background: #fff1f2 !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="notes"] { background: #fffbeb !important; }
  .report-page-content table.installments-summary-2026 tbody tr.total-row > td, .report-page-content table.installments-summary-2026 tbody tr.total-row > td * { background: #e0f2fe !important; color: #000000 !important; border: 1px solid #000000 !important; border-color: #000000 !important; font-weight: 900 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
`,ke=ge,Ae=({stats:e,columns:t=3})=>(0,S.jsxDEV)(`div`,{className:`grid ${t===4?`grid-cols-4`:`grid-cols-3`} gap-1.5 sm:gap-2 mb-3 sm:mb-4`,children:e.map((e,t)=>(0,S.jsxDEV)(`div`,{className:`${e.bgClass} relative overflow-hidden min-h-[46px] sm:min-h-[56px] px-2 sm:px-3 py-1 sm:py-2 rounded-xl sm:rounded-2xl border ${e.borderClass} shadow-sm`,children:[(0,S.jsxDEV)(`span`,{className:`absolute inset-y-0 right-0 w-1 sm:w-1.5 ${e.accentClass||`bg-sky-500`}`},void 0,!1,{fileName:C,lineNumber:185,columnNumber:1},void 0),(0,S.jsxDEV)(`div`,{className:`pr-1.5 sm:pr-2 min-w-0`,children:[(0,S.jsxDEV)(`div`,{className:`text-xs leading-tight sm:text-xs font-bold text-slate-500 truncate`,children:e.label},void 0,!1,{fileName:C,lineNumber:187,columnNumber:1},void 0),(0,S.jsxDEV)(`div`,{className:`text-sm sm:text-xl numeric-cell font-mono font-extrabold mt-0.5 text-slate-900 tabular-nums truncate`,children:e.value},void 0,!1,{fileName:C,lineNumber:190,columnNumber:13},void 0)]},void 0,!0,{fileName:C,lineNumber:186,columnNumber:1},void 0)]},t,!0,{fileName:C,lineNumber:180,columnNumber:9},void 0))},void 0,!1,{fileName:C,lineNumber:178,columnNumber:3},void 0),A=({title:e,isOpen:t,onClose:n,children:r})=>t?(0,S.jsxDEV)(`div`,{className:`fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4`,children:(0,S.jsxDEV)(`div`,{className:`bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto`,dir:`rtl`,children:[(0,S.jsxDEV)(`div`,{className:`flex justify-between items-center p-3 sm:p-4 border-b bg-gradient-to-l from-blue-50 to-slate-50 sticky top-0 z-10`,children:[(0,S.jsxDEV)(`h3`,{className:`font-bold text-sm sm:text-base ${De}`,children:e},void 0,!1,{fileName:C,lineNumber:221,columnNumber:11},void 0),(0,S.jsxDEV)(`button`,{onClick:n,className:`p-1 hover:bg-slate-200 rounded-lg`,children:(0,S.jsxDEV)(f,{className:`${k} text-slate-600`},void 0,!1,{fileName:C,lineNumber:223,columnNumber:13},void 0)},void 0,!1,{fileName:C,lineNumber:222,columnNumber:11},void 0)]},void 0,!0,{fileName:C,lineNumber:220,columnNumber:9},void 0),(0,S.jsxDEV)(`div`,{className:`p-3 sm:p-4 space-y-3`,children:r},void 0,!1,{fileName:C,lineNumber:226,columnNumber:9},void 0)]},void 0,!0,{fileName:C,lineNumber:216,columnNumber:7},void 0)},void 0,!1,{fileName:C,lineNumber:215,columnNumber:5},void 0):null,j=({sortConfig:e,columnKey:t})=>e?.key===t?e.direction===`asc`?(0,S.jsxDEV)(p,{className:`w-3 h-3 text-emerald-300`},void 0,!1,{fileName:C,lineNumber:245,columnNumber:7},void 0):(0,S.jsxDEV)(l,{className:`w-3 h-3 text-emerald-300`},void 0,!1,{fileName:C,lineNumber:247,columnNumber:7},void 0):(0,S.jsxDEV)(d,{className:`w-3 h-3 text-white/70`},void 0,!1,{fileName:C,lineNumber:242,columnNumber:12},void 0);function je(){let{installments:e,hafiza:l,installments2025:d,clearInstallments:p,installmentCustomColumns2026:h,installmentConditionalRules2026:ae,setInstallmentCustomColumns2026:je,setInstallmentConditionalRules2026:Me}=re(v(e=>({installments:e.installments,hafiza:e.hafiza,installments2025:e.installments2025,clearInstallments:e.clearInstallments,installmentCustomColumns2026:e.installmentCustomColumns2026,installmentConditionalRules2026:e.installmentConditionalRules2026,setInstallmentCustomColumns2026:e.setInstallmentCustomColumns2026,setInstallmentConditionalRules2026:e.setInstallmentConditionalRules2026}))),{reportDate:Ne,reportDateLabel:M}=ie(),[N,Pe]=(0,x.useState)(null),[Fe,Ie]=(0,x.useState)(``),[Le,Re]=(0,x.useState)(!1),[ze,Be]=(0,x.useState)(``),[Ve,He]=(0,x.useState)(``),[Ue,We]=(0,x.useState)(``),[P,Ge]=(0,x.useState)(null),[Ke,qe]=(0,x.useState)(``),[Je,Ye]=(0,x.useState)([]),[Xe,Ze]=(0,x.useState)(!1),[,Qe]=(0,x.useState)(null),[$e,et]=(0,x.useState)(null),[F,tt]=(0,x.useState)(null),[nt,rt]=(0,x.useState)(1),[it,at]=(0,x.useState)(1),[ot,st]=(0,x.useState)(null),[ct,lt]=(0,x.useState)(!1),[I,ut]=(0,x.useState)(null),[dt,ft]=(0,x.useState)(!1),[pt,mt]=(0,x.useState)(!0),[ht,gt]=(0,x.useState)(!1),[_t,vt]=(0,x.useState)(!1),[yt,bt]=(0,x.useState)(!1),[xt,St]=(0,x.useState)(1e4),[Ct,wt]=(0,x.useState)(3e4),[Tt,Et]=(0,x.useState)(()=>{try{let e=localStorage.getItem(`reports-fee-demand-signatures-v1`);if(e)return{department:`الشؤون المالية`,director:``,signer:``,...JSON.parse(e)}}catch{}return{department:`الشؤون المالية`,director:``,signer:``}});(0,x.useEffect)(()=>{try{localStorage.setItem(`reports-fee-demand-signatures-v1`,JSON.stringify(Tt))}catch{}},[Tt]);let[Dt,Ot]=(0,x.useState)(``),[kt,At]=(0,x.useState)(``),jt=(0,x.useDeferredValue)(Dt),Mt=(0,x.useDeferredValue)(kt),[L,Nt]=(0,x.useState)(null),[R,Pt]=(0,x.useState)(null),[z,Ft]=(0,x.useState)(null),[B,V]=(0,x.useState)({}),H=h||[],[It,Lt]=(0,x.useState)(!1),[Rt,zt]=(0,x.useState)(``),[Bt,Vt]=(0,x.useState)(`text`),[Ht,Ut]=(0,x.useState)(``),[Wt,Gt]=(0,x.useState)(``),[U,W]=(0,x.useState)(null),[Kt,qt]=(0,x.useState)(!1),[Jt,Yt]=(0,x.useState)({text:``,color:`bg-sky-100`}),G=ae||[],[Xt,Zt]=(0,x.useState)(!1),[K,Qt]=(0,x.useState)({name:``,batch:``,specialty:``,prevDue:0,fees:0}),$t=fe(e||[],[`name`,`batch`,`specialty`,`fees`,`prevDue`,`totalPaid`,`remaining`]),en=fe(d||[],[`name`,`batch`,`specialty`,`fees`,`totalPaid`,`remaining`]),tn=(e,t)=>{if(!e)return``;try{let n=e,r={fees:D(t.fees),prevDue:D(t.prevDue),totalPaid:D(t.totalPaid),remaining:D(t.remaining)};H.forEach(e=>{e.type!==`formula`&&(r[e.name]=D(t.customData?.[e.name]))}),Object.keys(r).forEach(e=>{let t=RegExp(`\\b${e}\\b`,`g`);n=n.replace(t,r[e].toString())});let i=Function(`return ${n}`)();return isNaN(i)?`خطأ`:Number(i).toFixed(2)}catch{return`صيغة غير صالحة`}},nn=e=>{let t=[e.name,e.batch,e.specialty,e.prevDue,e.fees,e.totalPaid,e.remaining,e.notes,...Object.values(e.payments||{}),...Object.values(e.customData||{})].map(e=>String(e??``).toLowerCase()),n=G.find(e=>{let n=String(e.text||``).trim().toLowerCase();return n.length>0&&t.some(e=>e.includes(n))}),r=an(e.notes),i={red:`#fecaca`,yellow:`#fef08a`,green:`#bbf7d0`,orange:`#fed7aa`,blue:`#e0f2fe`,emerald:`#ecfdf5`};if(r)return`background-color: ${i[r]} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;`;let a=n?.color?{"bg-sky-100":`#e0f2fe`,"bg-blue-100":`#dbeafe`,"bg-indigo-100":`#e0e7ff`,"bg-violet-100":`#ede9fe`,"bg-purple-100":`#f3e8ff`,"bg-pink-100":`#fce7f3`,"bg-rose-100":`#ffe4e6`,"bg-red-100":`#fee2e2`,"bg-orange-100":`#ffedd5`,"bg-amber-100":`#fef3c7`,"bg-yellow-100":`#fef9c3`,"bg-lime-100":`#ecfccb`,"bg-green-100":`#dcfce7`,"bg-emerald-100":`#d1fae5`,"bg-teal-100":`#ccfbf1`,"bg-cyan-100":`#cffafe`,"bg-slate-100":`#f1f5f9`,"bg-gray-100":`#f3f4f6`}[n.color]:void 0;return a?`background-color: ${a} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;`:``},rn=e=>String(e??``).trim().replace(/[ًٌٍَُِّْـ]/g,``).replace(/[إأآ]/g,`ا`).replace(/ى/g,`ي`).replace(/ة/g,`ه`).replace(/\s+/g,` `).toLocaleLowerCase(`ar`),an=e=>{let t=rn(e);if(!t)return null;let n=e=>e.some(e=>t.includes(rn(e)));return n([`منسحب`,`منسحبه`,`انسحب`,`انسحبت`,`منقطع`,`منقطعه`,`مستقيل`,`مستقيله`])?`red`:n([`مفصول`,`مفصوله`,`فصل`,`راسب`,`راسبه`])?`yellow`:n([`متخرج`,`متخرجه`,`خريج`,`خريجه`])?`green`:n([`موقوف`,`موقوفه`,`معتذر`,`معتذره`])?`orange`:n([`مؤجل`,`مؤجله`])?`blue`:n([`مستمر`,`مستمره`,`منتظم`,`منتظمه`,`على راس العمل`])?`emerald`:null},on=e=>{let t=an(e);return t?`notes-status-${t}`:``},sn=e=>{let t=[e.name,e.batch,e.specialty,e.prevDue,e.fees,e.totalPaid,e.remaining,e.notes,...Object.values(e.payments||{}),...Object.values(e.customData||{})].map(e=>String(e??``).toLowerCase());return G.find(e=>{let n=e.text.trim().toLowerCase();return n.length>0&&t.some(e=>e.includes(n))})?.color||`hover:bg-slate-50/80`},cn=()=>{if(!Jt.text.trim())return _.error(`يرجى إدخال نص الشرط`);Me([...G,{...Jt,text:Jt.text.trim()}]),Yt({text:``,color:`bg-sky-100`}),_.success(`تمت إضافة قاعدة التنسيق`)},ln=e=>{Me(G.filter((t,n)=>n!==e))},q=(0,x.useMemo)(()=>{let e=en.rows||[];if(jt){let t=jt.toLowerCase();e=e.filter(e=>e.name&&e.name.toLowerCase().includes(t)||e.batch&&String(e.batch).toLowerCase().includes(t)||e.specialty&&e.specialty.toLowerCase().includes(t))}return L&&(e=[...e].sort((e,t)=>{let n=e[L.key],r=t[L.key];return[`fees`,`totalPaid`,`remaining`].includes(L.key)?(n=D(n),r=D(r)):(n=n?String(n).toLowerCase():``,r=r?String(r).toLowerCase():``),n<r?L.direction===`asc`?-1:1:n>r?L.direction===`asc`?1:-1:0})),e},[en.rows,jt,L]),J=(0,x.useMemo)(()=>{let e=$t.rows||[];if(Mt){let t=Mt.toLowerCase();e=e.filter(e=>e.name&&e.name.toLowerCase().includes(t)||e.batch&&String(e.batch).toLowerCase().includes(t)||e.specialty&&e.specialty.toLowerCase().includes(t)||e.customData&&Object.values(e.customData).some(e=>String(e).toLowerCase().includes(t)))}return R&&(e=[...e].sort((e,t)=>{let n=e[R.key],r=t[R.key];return[`prevDue`,`fees`,`totalPaid`,`remaining`].includes(R.key)?(n=D(n),r=D(r)):(n=n?String(n).toLowerCase():``,r=r?String(r).toLowerCase():``),n<r?R.direction===`asc`?-1:1:n>r?R.direction===`asc`?1:-1:0})),e},[$t.rows,Mt,R]),un=(0,x.useMemo)(()=>{let e=new Map;return(d||[]).forEach((t,n)=>{e.has(t)||e.set(t,n)}),e},[d]),dn=(0,x.useMemo)(()=>{let t=new Map;return(e||[]).forEach((e,n)=>{t.has(e)||t.set(e,n)}),t},[e]),fn=Math.max(1,Math.ceil(q.length/E)),pn=Math.max(1,Math.ceil(J.length/E)),Y=Math.min(nt,fn),X=Math.min(it,pn),mn=(0,x.useMemo)(()=>q.slice((Y-1)*E,Y*E),[q,Y]),hn=(0,x.useMemo)(()=>J.slice((X-1)*E,X*E),[J,X]),gn=e=>{let t=`asc`;L&&L.key===e&&L.direction===`asc`&&(t=`desc`),Nt({key:e,direction:t})},_n=e=>{let t=`asc`;R&&R.key===e&&R.direction===`asc`&&(t=`desc`),Pt({key:e,direction:t})},Z=(0,x.useMemo)(()=>({fees:(q||[]).reduce((e,t)=>e+D(t.fees),0),paid:(q||[]).reduce((e,t)=>e+D(t.totalPaid),0),remaining:(q||[]).reduce((e,t)=>e+D(t.remaining),0),months:w.reduce((e,t)=>(e[t]=(q||[]).reduce((e,n)=>e+D(n.payments?.[t]),0),e),{})}),[q]),Q=(0,x.useMemo)(()=>({prevDue:(J||[]).reduce((e,t)=>e+D(t.prevDue),0),fees:(J||[]).reduce((e,t)=>e+D(t.fees),0),paid:(J||[]).reduce((e,t)=>e+D(t.totalPaid),0),remaining:(J||[]).reduce((e,t)=>e+D(t.remaining),0),months:T.reduce((e,t)=>(e[t]=(J||[]).reduce((e,n)=>e+D(n.payments?.[t]),0),e),{})}),[J]),vn=(0,x.useMemo)(()=>{let t=(d||[]).map(e=>e.name),n=(e||[]).map(e=>e.name);return[...new Set([...t,...n])]},[d,e]),yn=e=>{Be(e),Ze(e.length>0),Ye(e.length>0?vn.filter(t=>t.toLowerCase().includes(e.toLowerCase())):[])},$=e=>re.setState({installments:e}),bn=e=>re.setState({installments2025:e}),xn=async e=>{try{let t=e===2025?w:T,n=e===2025?q:J,r=e===2026?H:[],i=e===2025?[`#`,`اسم المتدرب`,`الدفعة`,`المساق`,`الرسوم`,...t,`المسدد`,`المتبقي`]:[`#`,`اسم المتدرب`,`الدفعة`,`المساق`,`المتبقي من 2025`,`الرسوم`,...t,...r.map(e=>e.name),`مسدد 2026`,`الرصيد المتبقي`,`الحالة`],a=n.map((n,i)=>{if(e===2025)return[i+1,n.name||``,n.batch||``,n.specialty||``,n.fees||0,...t.map(e=>n.payments?.[e]||0),n.totalPaid||0,n.remaining||0];let a=n.remaining<=0?`له`:`عليه`;return[i+1,n.name||``,n.batch||``,n.specialty||``,n.prevDue||0,n.fees||0,...t.map(e=>n.payments?.[e]||0),...r.map(e=>e.type===`formula`?tn(e.formula||``,n):n.customData?.[e.name]||``),n.totalPaid||0,n.remaining||0,a]}),o=e===2025?[`الإجمالي`,``,``,``,Z.fees,...t.map(e=>Z.months[e]||0),Z.paid,Z.remaining]:[`الإجمالي`,``,``,``,Q.prevDue,Q.fees,...t.map(e=>Q.months[e]||0),...r.map(()=>``),Q.paid,Q.remaining,``],s=await be(),c=s.addWorksheet(`أقساط ${e}`,{views:[{rightToLeft:!0}]}),l=await ye(s),u=we(s,c,{title:`أقساط العام ${e}`,reportDateLabel:M,recordCount:n.length,totalColumns:i.length,palette:Ce(`أقساط العام ${e}`)},l);xe(c,[i,...a,o],u),Se(c,{headerRow:u,totalRows:[u+a.length+1],palette:Ce(`أقساط العام ${e}`),maxColumnWidth:28}),await ve(s,`جدول_أقساط_${e}_${Ne}.xlsx`),_.success(`تم تصدير ملف Excel بنجاح`)}catch(e){console.error(`Installments Excel export error:`,e),_.error(`حدث خطأ أثناء تصدير ملف Excel`)}},Sn=e=>{let t=e===2025?w:T,n=[{key:`batch`,label:`الدفعة`},{key:`specialty`,label:`المساق`}];return e===2026&&n.push({key:`prevDue`,label:`مدور 2025`}),n.push({key:`fees`,label:`الرسوم`}),t.forEach(e=>n.push({key:`month:${e}`,label:e.trim()})),e===2026&&H.forEach(e=>n.push({key:`col:${e.name}`,label:e.name})),n.push({key:`totalPaid`,label:`إجمالي المسدد`}),n.push({key:`remaining`,label:`الرصيد المتبقي`}),e===2026&&(n.push({key:`status`,label:`الحالة`}),n.push({key:`notes`,label:`الملاحظات`})),n},Cn=async(e,t=he,n={})=>{let r=!n.download&&!ne.isNativePlatform()?window.open(`about:blank`,`_blank`):null;if(!n.download&&!ne.isNativePlatform()&&!r)_.error(`تعذّر فتح نافذة المعاينة؛ اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة`);else try{let i=e===2025?w:T,a=e===2025?q:J,o=e===2026?H:[],s=M,c=new Set(t.hiddenColumns||[]),l=e=>(a||[]).reduce((t,n)=>t+D(e(n)),0),u=[];u.push({key:`idx`,label:`م`,cell:(e,t)=>String(t+1)}),u.push({key:`name`,label:`اسم المتدرب`,cell:e=>O(e.name||``),wide:!0}),u.push({key:`batch`,label:`الدفعة`,cell:e=>O(e.batch||`—`)}),u.push({key:`specialty`,label:`المساق`,cell:e=>O(e.specialty||`—`),wide:!0}),e===2026&&u.push({key:`prevDue`,label:`مدور 2025`,cell:e=>b(D(e.prevDue)),total:()=>b(l(e=>e.prevDue)),tone:`due`}),u.push({key:`fees`,label:`الرسوم`,cell:e=>b(D(e.fees)),total:()=>b(l(e=>e.fees)),tone:`fees`}),i.forEach(e=>{u.push({key:`month:${e}`,label:e.trim(),cell:t=>D(t.payments?.[e])?b(D(t.payments[e])):`—`,total:()=>{let t=l(t=>t.payments?.[e]);return t>0?b(t):`—`}})}),o.forEach(e=>{u.push({key:`col:${e.name}`,label:e.name,cell:t=>e.type===`formula`?O(tn(e.formula||``,t)):O(t.customData?.[e.name]||`—`),total:e.type===`formula`?()=>{let t=(a||[]).reduce((t,n)=>t+D(tn(e.formula||``,n)),0);return t===0?`—`:b(t)}:void 0})}),u.push({key:`totalPaid`,label:`إجمالي المسدد`,cell:e=>b(D(e.totalPaid)),total:()=>b(l(e=>e.totalPaid)),tone:`paid`}),u.push({key:`remaining`,label:`الرصيد المتبقي`,cell:e=>b(D(e.remaining)),total:()=>b(l(e=>e.remaining)),tone:`due`}),e===2026&&(u.push({key:`status`,label:`الحالة`,cell:e=>D(e.remaining)<=0?`له`:`عليه`}),u.push({key:`notes`,label:`الملاحظات`,cell:e=>O(e.notes||`—`)}));let d=u.filter(e=>!c.has(e.key)),f=(t.pageSize===`A4`?t.orientation===`portrait`?210:297:t.orientation===`landscape`?297:210)-(t.margin===`narrow`?2:(t.margin,5))*2,p=d.reduce((e,t)=>e+(t.wide?2.4:1),0),m=f/Math.max(1,p),ee=Math.max(10,Math.min(15,m*1.18)),h=Math.min(t.fontMode===`manual`?t.fontSize:ee,ee),te=h+.4,g=(e,t=h)=>{let n=String(e??``).replace(/<[^>]*>/g,``).length,r=Math.max(0,Math.ceil(Math.max(0,n-16)/10));return`font-size:${Math.max(9,t-Math.min(6,r*.7)).toFixed(2)}px`},ne=`<colgroup>${d.map(e=>`<col style="width:${((e.wide?2.4:1)/p*100).toFixed(3)}%" />`).join(``)}</colgroup>`,re=`<tr>${d.map(e=>`<th class="c-${e.key.replace(/[^a-zA-Z]/g,``)}" data-col-key="${O(e.key)}">${O(e.label)}</th>`).join(``)}</tr>`,ie=(a||[]).map((t,n)=>{let r=e===2026?on(t.notes):``,i=e===2026?an(t.notes):null,a=i?{red:`#fecaca`,yellow:`#fef08a`,green:`#bbf7d0`,orange:`#fed7aa`,blue:`#e0f2fe`,emerald:`#ecfdf5`}[i]:void 0,o=d.map(r=>{let i=r.cell(t,n),o=r.tone?` t-${r.tone}`:``,s=r.key===`idx`||r.tone||r.key.startsWith(`month:`)?` numeric-cell`:``,c=e===2026?{idx:`screen-idx-cell`,name:`screen-name-cell`,batch:`screen-batch-cell`,specialty:`screen-specialty-cell`,prevDue:`screen-prevdue-cell`,fees:`screen-fees-cell`,totalPaid:`screen-totalpaid-cell`,remaining:`screen-remaining-cell`,notes:`screen-notes-cell`,status:`screen-status-cell`}[r.key]||(r.key.startsWith(`month:`)?`screen-month-cell`:r.key.startsWith(`col:`)?`screen-extra-cell`:``):``,l=r.key===`status`?D(t.remaining)<=0?` s-ok`:` s-bad`:``,u=[t.name,t.batch,t.specialty,t.prevDue,t.fees,t.totalPaid,t.remaining,t.notes,...Object.values(t.payments||{}),...Object.values(t.customData||{})].map(e=>String(e??``).toLowerCase()),d=e===2026?G.find(e=>{let t=String(e.text||``).trim().toLowerCase();return t.length>0&&u.some(e=>e.includes(t))}):void 0,f=d?.color&&{"bg-sky-100":`#e0f2fe`,"bg-blue-100":`#dbeafe`,"bg-indigo-100":`#e0e7ff`,"bg-violet-100":`#ede9fe`,"bg-purple-100":`#f3e8ff`,"bg-pink-100":`#fce7f3`,"bg-rose-100":`#ffe4e6`,"bg-red-100":`#fee2e2`,"bg-orange-100":`#ffedd5`,"bg-amber-100":`#fef3c7`,"bg-yellow-100":`#fef9c3`,"bg-lime-100":`#ecfccb`,"bg-green-100":`#dcfce7`,"bg-emerald-100":`#d1fae5`,"bg-teal-100":`#ccfbf1`,"bg-cyan-100":`#cffafe`,"bg-slate-100":`#f1f5f9`,"bg-gray-100":`#f3f4f6`}[d.color]||void 0,p=a||(e===2026?{fees:`#eaf2ff`,prevDue:`#f3e8ff`,totalPaid:`#e6f7ee`,remaining:`#fff0f1`}:{})[r.key]||f;return`<td class="${r.wide?`wrap`:``}${s}${o}${l} ${c}" data-col-key="${O(r.key)}" style="${g(i)}${p?`;background-color:${p} !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important`:``}"><span class="cell-content${s}">${i}</span></td>`}).join(``);return`<tr class="${le(t.notes)} ${r}">${o}</tr>`}).join(``),ae=t.showTotals?`<tr class="total-row">${d.map((e,t)=>e.key===`idx`?`<td><span class="cell-content">—</span></td>`:t===1?`<td class="wrap"><span class="cell-content">الإجمالي</span></td>`:`<td style="${g(``)}"><span class="cell-content">${e.total?e.total():``}</span></td>`).join(``)}</tr>`:``,v=t.colored?{head:`#0f766e`,headText:`#ffffff`,zebra:`#ffffff`,totals:`#ccfbf1`,fees:`#eff6ff`,paid:`#ecfdf5`,due:`#fff7ed`,accent:`#0d9488`}:{head:`#ffffff`,headText:`#ffffff`,zebra:`#ffffff`,totals:`#f2f2f2`,fees:`#ffffff`,paid:`#ffffff`,due:`#ffffff`,accent:`#000000`},oe=`
      html, body { 
      margin: 0 !important;
     padding: 0!important; 
      }
      * { 
    box-sizing:border-box; 
      }
 .print-toolbar {
 display: flex;
 justify-content:flex-end;
  margin: 0 0 6px;
      }
      .print-toolbar button {
        border: 0.6pt solid #0f766e;
        border-radius: 4px;
        background: #0f766e;
        color: #fff;
        cursor: pointer;
        font-family: ${y};
        font-size: 13px;
        font-weight: 800;
        padding: 4px 10px;
      }
      .print-toolbar button:hover { 
  background: #115e59; 
      }
      .doc-header {
        display: flex;
      text-align: center;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border-bottom: 2pt solid ${v.accent};
        padding-bottom: 4px;
        margin-bottom: 5px;
      }
      .doc-header.title {
      text-align:center;
       font-family:${y}; }
      .doc-header h1 { 
  font-size: 18px; 
 font-weight: 1000; 
 text-align: center;
 font-family:${y}; 
}
.doc-header h2 { 
font-size: 16px; 
font-weight: 700;
margin-top:8px; 
text-align: center;
color: ${v.accent}; }
  .doc-header .meta { 
font-size: 14px; 
font-weight: 700; 
text-align:center; 
line-height: 1.5; 
  }
   .doc-header .meta span { 
   display: block; 
   }

table {
font-size:${h}px !important;
table-layout: fixed !important;
width: 100% !important;
max-width:100% !important;
	border: 1px solid #000;
      }

th, td {
	 border: 1px solid #000;
	padding: 2px 2px !important;
	text-align: center !important;
min-width: 0 !important;
max-width: 100% !important;
font-size:${h}px;
overflow-wrap: normal !important;
word-break: break-word !important;
hyphens: none !important;
line-height: 1.5;
font-weight: 900;
color: #000 !important;
      }

      /* أعمدة الاسم والمساق (wide): السماح بالتفاف النص بدل خط واحد ممدود */
th.wrap, td.wrap {
white-space: nowrap !important; 
overflow: visible !important;
text-overflow: clip !important;
overflow-wrap: break-word !important;
word-break: normal !important;
      }

.cell-content {
  display: inline-block !important;
align-items:center !important; /* التمركز الرأسي للمحتوى */
justify-content:center !important; /* التمركز الأفقي للمحتوى */
 width: 100%;
height: auto;
box-sizing: border-box;
        padding: 3px 2px;
        margin: 0;
text-align: center !important;
white-space: normal !important;
        overflow: hidden;
        overflow-wrap: normal !important;
        word-break: keep-all !important;
        hyphens: none !important;
        line-height: 1.35;
      }

td.wrap .cell-content,
th.wrap .cell-content {
white-space: normal!important;
        overflow: visible !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
        line-height: 1.3;
      }
      td.wrap, td.wrap .cell-content {
        height: auto;
      }
      table th *, table td * {
        text-align: center !important;
      }
      table th.wrap *, table td.wrap * {
        white-space: normal!important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
      }
      td.numeric-cell, th.numeric-cell, td.date-cell, th.date-cell, td.compact-cell, th.compact-cell {
        font-family: ${y} !important;
        font-size: ${h}px !important;
        line-height: 1.15 !important;
        white-space: nowrap !important;
        overflow-wrap: normal !important;
        word-break:break-word !important;
        hyphens: none !important;
        text-align: center !important;
      }
      td.numeric-cell *, th.numeric-cell *, td.date-cell *, th.date-cell *, td.compact-cell *, th.compact-cell * {
        font-size: inherit !important;
        line-height: inherit !important;
        white-space: nowrap !important;
        overflow-wrap:nowrap !important;
        word-break: keep-all !important;
        text-align: center !important;
      }
      th {
background: ${v.head} !important;
        color: ${v.headText} !important;
font-family: ${y} !important;
font-size: ${te}px !important;
font-weight: 800;
padding: 5px 5px !important;
text-align: center !important;
vertical-align: middle !important;
   white-space: normal !important;
      }

tbody tr:nth-child(even) td { background: ${v.zebra} !important; }

td.t-fees { background: ${v.fees} !important; }
      td.t-paid { background: ${v.paid} !important; font-weight: 800; }
      td.t-due { background: ${v.due} !important; color: #000 !important; font-weight: 800; }
      td.s-ok { background: ${t.colored?`#d1fae5`:`#ffffff`} !important; }
      td.s-bad { background: ${t.colored?`#fee2e2`:`#ffffff`} !important; }
      thead { display: table-header-group; }
      .total-row td {
        background: ${v.totals} !important;
        font-weight: 900;
        border-top: 1pt solid #111;
        text-align: center !important;
      }
      .doc-foot {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 700;
        border-top: 0.75pt solid ${v.accent};
        padding-top: 3px;
      }
      ${t.colored?ce:``}
      /* تنسيق موحد لصفحات التقرير الإجمالي والتفصيلي عند الطباعة أو تصدير PDF */
      .doc-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 4px 6px 7px;
        margin: 0 0 8px;
        border-bottom: 2px solid ${v.accent};
      }
      .doc-header .title { flex: 1; text-align: center; }
      .doc-header h1, .doc-header h2 { margin: 0; line-height: 1.35; }
      .doc-header h1 { font-size: 18px; font-weight: 900; color: ${v.accent}; }
      .doc-header h2 { margin-top: 3px; font-size: 15px; font-weight: 800; color: #172b35; }
      .doc-header .meta { min-width: 105px; font-size: 11px; line-height: 1.6; text-align: right; color: #334155; }
      table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
      th, td { box-sizing: border-box !important; vertical-align: middle !important; text-align: center !important; }
      th { white-space: normal !important; line-height: 1.2 !important; }
      td { white-space: normal !important; line-height: 1.25 !important; }
      td.wrap, td.wrap .cell-content { white-space: normal !important; overflow-wrap: anywhere !important; word-break: normal !important; }
      .cell-content { display: block !important; width: 100% !important; overflow-wrap: anywhere !important; word-break: normal !important; }
      td.numeric-cell, td.date-cell, td.compact-cell, td.numeric-cell .cell-content { white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important; }
      .doc-foot { width: 100%; margin-top: 8px; padding-top: 5px; border-top: 1px solid ${v.accent}; font-size: 11px; }
      @media print {
        .print-toolbar { display: none !important; }
        tr { page-break-inside: avoid; }
        table { table-layout: auto !important; width: 100% !important; max-width: auto !important; }
        th, td {
          width: auto !important;
          min-width: 0 !important;
          max-width: 100% !important;
          overflow: hidden !important;
          white-space: normal !important;
          word-break: break-word !important;
        }
      }
      /* قواعد PDF النهائية: خط التقرير المحلي، حجم 16px، أسود غامق، وبدون حشو رأسي */
      html, body, table, th, td, .cell-content, .doc-header, .doc-foot {
        font-family: ${y} !important;
        font-weight: 900 !important;
        color: #000 !important;
      }
      html, body, table { font-size: ${h}px !important; }
      table.installments-report-table { table-layout: fixed !important; width: 100% !important; max-width: 100% !important; }
       table.installments-report-table th, table.installments-report-table td {
        padding: 0 4px !important;
        margin: 0 !important;
        text-align: center !important;
        vertical-align: middle !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.2 !important;
      }
      .cell-content {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        padding: 0 !important;
        margin: 0 !important;
        text-align: center !important;
        white-space: normal !important;
        overflow: visible !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.2 !important;
      }
      th *, td * { font-family: ${y} !important; font-size: inherit !important; font-weight: 900 !important; color: #000 !important; }
      table.installments-report-table td.numeric-cell, table.installments-report-table th.numeric-cell,
       table.installments-report-table td.numeric-cell .cell-content, table.installments-report-table th.numeric-cell .cell-content {
         white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important;
         direction: ltr !important; unicode-bidi: isolate !important; font-variant-numeric: tabular-nums !important;
       }
       table.installments-report-table th[data-col-key="notes"], table.installments-report-table td[data-col-key="notes"] {
         width: 1% !important; max-width: 10% !important; white-space: normal !important; overflow-wrap: anywhere !important;
       }
       /* 2026 notes-driven academic status row colors: same palette as trainee data tab. */
       table.installments-report-table tbody tr.notes-status-red > td {
         background: #fecaca !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-yellow > td {
         background: #fef08a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-green > td {
         background: #bbf7d0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-orange > td {
         background: #fed7aa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-blue > td {
         background: #e0f2fe !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-emerald > td {
         background: #ecfdf5 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       /* Screen-equivalent appearance for the detailed 2026 installments report. */
       table.installments-screen-parity { direction: rtl !important; border-collapse: collapse !important; }
       table.installments-screen-parity thead th {
         background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important;
         color: #000 !important; border: 1px solid #0369a1 !important;
         -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-screen-parity thead th[data-col-key="idx"], table.installments-screen-parity thead th[data-col-key="name"] { color: #fff !important; }
        table.installments-screen-parity tbody td { border: 1px solid #000000 !important; border-color: #000000 !important; color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
       table.installments-screen-parity tbody td.screen-name-cell { background: #fdf4ff !important; }
       table.installments-screen-parity tbody td.screen-batch-cell, table.installments-screen-parity tbody td.screen-specialty-cell { background: #f0f9ff !important; }
       /* Muted, distinct column colors for the 2026 detailed installments report.
          Keep each financial column identifiable in preview, print, and PDF. */
       table.installments-screen-parity tbody td[data-col-key="fees"] { background: #eaf2ff !important; }
       table.installments-screen-parity tbody td[data-col-key="prevDue"] { background: #f3e8ff !important; }
       table.installments-screen-parity tbody td[data-col-key="totalPaid"] { background: #e6f7ee !important; }
       table.installments-screen-parity tbody td[data-col-key="remaining"] { background: #fff0f1 !important; }
       table.installments-screen-parity tbody td.screen-month-cell, table.installments-screen-parity tbody td.screen-extra-cell, table.installments-screen-parity tbody td.screen-status-cell, table.installments-screen-parity tbody td.screen-idx-cell { background: #ffffff !important; }
       table.installments-screen-parity tbody td.screen-notes-cell { background: #fffbeb !important; }
        table.installments-screen-parity tbody tr.total-row > td, table.installments-screen-parity tbody tr.total-row > td * { background: #e0f2fe !important; color: #000000 !important; border: 1px solid #000000 !important; border-color: #000000 !important; font-weight: 900 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
       table.installments-screen-parity tbody tr.notes-status-red > td { background: #fecaca !important; }
       table.installments-screen-parity tbody tr.notes-status-yellow > td { background: #fef08a !important; }
       table.installments-screen-parity tbody tr.notes-status-green > td { background: #bbf7d0 !important; }
       table.installments-screen-parity tbody tr.notes-status-orange > td { background: #fed7aa !important; }
       table.installments-screen-parity tbody tr.notes-status-blue > td { background: #e0f2fe !important; }
       table.installments-screen-parity tbody tr.notes-status-emerald > td { background: #ecfdf5 !important; }
       table.installments-screen-parity tbody tr.notes-status-red > td, table.installments-screen-parity tbody tr.notes-status-yellow > td,
       table.installments-screen-parity tbody tr.notes-status-green > td, table.installments-screen-parity tbody tr.notes-status-orange > td,
       table.installments-screen-parity tbody tr.notes-status-blue > td, table.installments-screen-parity tbody tr.notes-status-emerald > td {
         -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       /* Detailed installments report: enforce black cell borders and black text
          in browser preview, direct printing, and standalone PDF output. */
       table.installments-report-table,
       table.installments-report-table th,
       table.installments-report-table td {
         border: 1px solid #000000 !important;
         border-color: #000000 !important;
         color: #000000 !important;
       }
       table.installments-report-table th *,
       table.installments-report-table td * {
         color: #000000 !important;
       }
       table.installments-report-table tbody tr.total-row > th,
       table.installments-report-table tbody tr.total-row > td {
         background: #e0f2fe !important;
         border: 1px solid #000000 !important;
         border-color: #000000 !important;
         color: #000000 !important;
         font-weight: 900 !important;
         -webkit-print-color-adjust: exact !important;
         print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.total-row > th *,
       table.installments-report-table tbody tr.total-row > td * {
         color: #000000 !important;
       }
        table.installments-report-table.installments-screen-parity thead th,
        table.installments-report-table.installments-screen-parity tbody td {
          border: 1px solid #000000 !important;
          border-color: #000000 !important;
        }
        table.installments-report-table.installments-screen-parity tbody tr.total-row > th,
        table.installments-report-table.installments-screen-parity tbody tr.total-row > td,
        table.installments-report-table.installments-screen-parity tbody tr.total-row > th *,
        table.installments-report-table.installments-screen-parity tbody tr.total-row > td * {
          background: #e0f2fe !important;
          color: #000000 !important;
          border: 1px solid #000000 !important;
          border-color: #000000 !important;
          font-weight: 900 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
    `,se=`
      ${t.showHeader?`<div class="doc-header">
        <div class="title">
          <h1>المجلس اليمني للاختصاصات الطبية — صعدة</h1>
          <h2>تقرير الأقساط والمدفوعات للعام ${e}م</h2>
        </div>
        <div class="meta">
          <span>التاريخ: ${O(s)}</span>
          <span>عدد السجلات: ${(a||[]).length}</span>
        </div>
      </div>`:``}
      <table class="installments-report-table${e===2026?` installments-screen-parity`:``}">
         ${ne}
        <thead>${re}</thead>
        <tbody>${ie}${ae}</tbody>
      </table>
      <div class="doc-foot">
        <span>إعداد: قسم الشؤون المالية</span>
        <span>التوقيع: ________________</span>
      </div>
    `;if(n.download){await ke({title:`تقرير_الأقساط_والمدفوعات_${e}_${Ne}`,body:se,css:oe,pageSize:t.pageSize,orientation:t.orientation,marginMm:t.margin===`narrow`?1:t.margin===`wide`?12:6,fileName:`${Te(`اقساط-${e}-تفصيلي-${Ne}`)}.pdf`}),_.success(`تم فتح واجهة تصدير PDF لتقرير الأقساط لعام ${e}`);return}await ue({title:`تقرير الأقساط والمدفوعات للعام ${e}`,reportDateLabel:s,tableHtml:se,contentCss:oe,finalCss:`
          #tableContainer table.installments-table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; direction: rtl !important; }
           #tableContainer table.installments-table td.numeric-cell,
           #tableContainer table.installments-table th.numeric-cell,
           #tableContainer table.installments-table td.numeric-cell *,
           #tableContainer table.installments-table th.numeric-cell * {
             white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important;
             direction: ltr !important; unicode-bidi: isolate !important; font-variant-numeric: tabular-nums !important;
           }
           #tableContainer table.installments-table th[data-col-key="notes"],
           #tableContainer table.installments-table td[data-col-key="notes"] {
             width: 1% !important; max-width: 10% !important; white-space: normal !important; overflow-wrap: anywhere !important;
           }
          #tableContainer table.installments-table th { background: ${v.head} !important; color: ${v.headText} !important; font-weight: 900 !important; }
          #tableContainer table.installments-table td { background-clip: padding-box !important; color: #000 !important; }
          #tableContainer table.installments-table tr.total-row td { background: #0871ce !important; color: #fff !important; font-weight: 900 !important; }
          #tableContainer table.installments-table tr.total-row td * { color: #fff !important; }
          #tableContainer table.installments-table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
          #tableContainer .doc-header, #tableContainer .doc-foot { font-family: "IBM Plex Sans Arabic", "Noto Sans Arabic", "Noto Naskh Arabic", "Cairo", Tahoma, Arial, sans-serif !important; }
          /* Match the actual detailed report class (not the live screen table class). */
          #tableContainer table.installments-report-table th,
          #tableContainer table.installments-report-table td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            color: #000000 !important;
          }
          #tableContainer table.installments-report-table th *,
          #tableContainer table.installments-report-table td * {
            color: #000000 !important;
          }
          #tableContainer table.installments-report-table tbody tr.total-row > th,
          #tableContainer table.installments-report-table tbody tr.total-row > td {
            background: #e0f2fe !important;
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            color: #000000 !important;
            font-weight: 900 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #tableContainer table.installments-report-table tbody tr.total-row > th *,
          #tableContainer table.installments-report-table tbody tr.total-row > td * {
            color: #000000 !important;
          }
          #tableContainer table.installments-report-table.installments-screen-parity thead th,
          #tableContainer table.installments-report-table.installments-screen-parity tbody td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
          }
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > th,
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > td,
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > th *,
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > td * {
            background: #e0f2fe !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            font-weight: 900 !important;
          }
          @media print {
            #tableContainer table.installments-report-table th,
            #tableContainer table.installments-report-table td {
              border: 1px solid #000000 !important;
              color: #000000 !important;
            }
            #tableContainer table.installments-report-table tbody tr.total-row > th,
            #tableContainer table.installments-report-table tbody tr.total-row > td {
              border: 1px solid #000000 !important;
              color: #000000 !important;
              background: #e0f2fe !important;
            }
          }
        `,defaultOrientation:t.orientation,defaultPageSize:t.pageSize,defaultMarginMm:t.margin===`narrow`?1:t.margin===`wide`?12:6,fitToContent:!1,preopenedWindow:r})?_.success(`تم فتح معاينة التقرير — يمكنك الطباعة أو الحفظ بصيغة PDF`):_.error(`تعذّر فتح نافذة معاينة الطباعة، يرجى السماح بالنوافذ المنبثقة`)}catch(e){r&&!r.closed&&r.close(),console.error(`Installments print preview error:`,e),_.error(`فشل إنشاء معاينة الطباعة؛ أعد المحاولة`)}},wn=t=>{if(t.preventDefault(),z){if(z.year===2025){let e=[...d||[]],t={...B,remaining:Math.max(0,D(B.fees)-D(B.totalPaid))};e[z.index]=t,bn(e)}else{let t=[...e||[]],n={...B,remaining:Math.max(0,D(B.prevDue)+D(B.fees)-D(B.totalPaid))};t[z.index]=n,$(t)}_.success(`تم تحديث البيانات بنجاح`),Ft(null)}},Tn=e=>{if(e.preventDefault(),Rt.trim()){if(H.some(e=>e.name===Rt))return _.error(`اسم العمود موجود مسبقاً`);je([...H,{name:Rt,type:Bt,options:Bt===`select`?Ht.split(`,`).map(e=>e.trim()):[],formula:Bt===`formula`?Wt:``}]),_.success(`تم إضافة العمود: ${Rt}`),Lt(!1),zt(``),Vt(`text`),Ut(``),Gt(``)}},En=t=>{if(t.preventDefault(),!U)return;if(U.name!==U.oldName&&H.some(e=>e.name===U.name))return _.error(`اسم العمود موجود مسبقاً`);let n=H.map(e=>e.name===U.oldName?{name:U.name,type:U.type,options:U.type===`select`?U.options.split(`,`).map(e=>e.trim()):[],formula:U.type===`formula`?U.formula:``}:e);if(U.oldName!==U.name){let t=[...e||[]];t.forEach(e=>{e.customData&&e.customData[U.oldName]!==void 0&&(e.customData[U.name]=e.customData[U.oldName],delete e.customData[U.oldName])}),$(t)}je(n),W(null),_.success(`تم تعديل العمود بنجاح`)},Dn=e=>{confirm(`هل أنت متأكد من حذف العمود "${e}"؟`)&&(je(H.filter(t=>t.name!==e)),W(null),_.success(`تم حذف العمود`))},On=e=>{let t={...e.payments||{}},n=T.reduce((e,n)=>e+(Number(t[n])||0),0);return{...e,payments:t,totalPaid:n,remaining:Math.max(0,D(e.prevDue)+D(e.fees)-n)}},kn=(t,n,r)=>{if(t<0)return;let i=[...e||[]],a={...i[t]},o=[`prevDue`,`fees`,`totalPaid`,`remaining`].includes(n)?D(r):r;i[t]=n===`prevDue`||n===`fees`?On({...a,[n]:o}):{...a,[n]:o},$(i)},An=(t,n,r)=>{if(t<0)return;let i=[...e||[]],a={...i[t],payments:{...i[t]?.payments||{}}};a.payments[n]=D(r),i[t]=On(a),$(i)},jn=(t,n,r)=>{let i=[...e||[]],a={...i[t],customData:{...i[t]?.customData||{}}};a.customData[n]=r,i[t]=a,$(i)},Mn=(t,n)=>{t<0||confirm(`هل أنت متأكد من حذف صف المتدرب "${n}" من جدول 2026؟`)&&($((e||[]).filter((e,n)=>n!==t)),_.success(`تم حذف الصف`))},Nn=t=>{if(t.preventDefault(),!K.name)return _.error(`يرجى إدخال اسم المتدرب`);let n=T.reduce((e,t)=>({...e,[t]:0}),{}),r={name:K.name,batch:K.batch,specialty:K.specialty,fees:Number(K.fees)||0,prevDue:Number(K.prevDue)||0,totalPaid:0,remaining:Math.max(0,(Number(K.prevDue)||0)+(Number(K.fees)||0)),notes:``,phone:``,payments:n,customData:{}};$([...e||[],r]),_.success(`تم إضافة الصف بنجاح`),Zt(!1),Qt({name:``,batch:``,specialty:``,prevDue:0,fees:0})},Pn=t=>{if(t.preventDefault(),!N||!Fe)return _.error(`يرجى إدخال المبلغ`);let n=Number(Fe)||0;if(n<=0)return _.error(`مبلغ غير صحيح`);let r=[...e||[]].map(e=>{if(e!==N.row)return e;let t={...e.payments,[N.month]:(Number(e.payments[N.month])||0)+n},r=T.reduce((e,n)=>e+(Number(t[n])||0),0);return{...e,payments:t,totalPaid:r,remaining:Math.max(0,D(e.prevDue)+D(e.fees)-r)}});$(r),_.success(`تم تسجيل دفعة ${b(n)}`),Pe(null),Ie(``)},Fn=t=>{if(t.preventDefault(),!ze||!Ve||!Ue)return _.error(`يرجى إدخال جميع البيانات`);let n=Number(Ve)||0;if(n<=0)return _.error(`مبلغ غير صحيح`);let r=[...e||[]],i=r.filter(e=>e.name===ze);if(i.length>1)return _.error(`يوجد أكثر من سجل بهذا الاسم. استخدم زر إضافة دفعة من صف المتدرب المطلوب لتجنب تعديل سجل آخر.`);let a=i[0];if(a){let e=r.map(e=>{if(e!==a)return e;let t={...e.payments,[Ue]:(Number(e.payments[Ue])||0)+n},r=T.reduce((e,n)=>e+(Number(t[n])||0),0);return{...e,payments:t,totalPaid:r,remaining:Math.max(0,D(e.prevDue)+D(e.fees)-r)}});$(e)}else{let e=T.reduce((e,t)=>({...e,[t]:t===Ue?n:0}),{}),t={name:ze,batch:``,specialty:``,fees:0,prevDue:0,totalPaid:n,remaining:Math.max(0,0-n),notes:``,phone:``,payments:e};$([...r,t])}_.success(`تم إضافة دفعة ${b(n)}`),Re(!1),Be(``),He(``),We(``)},In=t=>{if(t.preventDefault(),!P||!Ke)return;let n=Number(Ke)||0,r=[...e||[]].map(e=>{if(e!==P.row)return e;let t={...e.payments,[P.month]:n},r=T.reduce((e,n)=>e+(Number(t[n])||0),0);return{...e,payments:t,totalPaid:r,remaining:Math.max(0,D(e.prevDue)+D(e.fees)-r)}});$(r),_.success(`تم تعديل القسط`),Ge(null),qe(``)},Ln=(t,n)=>{if(!confirm(`حذف قسط شهر ${n}؟`))return;let r=[...e||[]].map(e=>{if(e!==t)return e;let r={...e.payments,[n]:0},i=T.reduce((e,t)=>e+(Number(r[t])||0),0);return{...e,payments:r,totalPaid:i,remaining:Math.max(0,D(e.prevDue)+D(e.fees)-i)}});$(r),_.success(`تم حذف قسط شهر ${n}`),P&&Ge(null)},Rn=async(e,t)=>{let n=e.target,r=n.files?.[0];if(!r)return;if(F!==null){n.value=``,_.error(`هناك عملية استيراد أخرى قيد التنفيذ.`);return}tt(t);let i=_.loading(`جارٍ فحص ملف الأقساط لعام ${t}…`);try{let e=await de(r,t);if(!e?.length){let e=`لم يتم العثور على أسماء متدربين في الملف — تأكد من وجود عمود «اسم المتدرب» في الصف الأول.`;et(e),_.error(e);return}t===2025?(re.setState({installments2025:e}),rt(1)):(re.setState({installments:e}),at(1)),_.success(`تم استيراد ${e.length} سجلاً للعام ${t} بنجاح!`),et(null)}catch(e){console.error(`[Excel] Installments ${t} import failed`,e);let n=e instanceof Error?e.message:String(e);et(`حدث خطأ في قراءة الملف: ${n}`),_.error(n||`فشل استيراد الملف`)}finally{_.dismiss(i),tt(null),n.value=``}},zn=e=>e<=0?{text:`له`,color:`text-emerald-800`,bg:`bg-emerald-50`}:{text:`عليه`,color:`text-rose-800`,bg:`bg-rose-50`},Bn=(e,t)=>{let n=t===2025?w:T,r=D(e?.fees),i=D(e?.prevDue),a=n.reduce((t,n)=>t+(Number(e?.payments?.[n])||0),0),o=t===2026?i+0:r,s=String(e?.batch??``).trim().replace(/[ًٌٍَُِّْـ]/g,``).replace(/[إأآ]/g,`ا`).replace(/\s+/g,``).replace(/^الدفعة/,``).replace(/^دفعة/,``),c=t===2026&&[`السادسة`,`سادسة`,`السادس`,`سادس`,`6`,`٦`].includes(s),l=c?a-r:o-a,u=Te(e.name),d=n.map(t=>{let n=Number(e?.payments?.[t])||0;return n<=0?``:`
          <tr class="installments-statement-row row-paid">
            <td class="lbl">قسط شهر ${O(t)}</td>
            <td class="num">${O(b(n))}</td>
          </tr>`}).join(``),f=(e,t)=>`<div class="info-box">
        <div class="info-lbl">${O(e)}</div>
        <div class="info-val">${O(t||`—`)}</div>
      </div>`,p=t===2026?`<tr class="installments-statement-row row-due-old">
            <td class="lbl">متبقي من العام 2025 (مدور)</td>
            <td class="num">${O(b(i))}</td>
          </tr>`:``,m=c?l>0?`الرصيد الإضافي (له)`:l<0?`الرصيد المتبقي (عليه)`:`الحالة: تم السداد بالكامل`:l>0?`الرصيد المتبقي (عليه)`:l<0?`الرصيد الإضافي (له)`:`الحالة: تم السداد بالكامل`,ee=`
      ${se}
      * { 
        box-sizing: border-box; 
        font-family: ${y} !important; 
      }
      html, body { 
        margin: 0; 
        padding: 0; 
        width: 100%;
        min-height: auto;
        background: #fff;
        color: #000;
        direction: rtl;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .container {
        width: 100%;
        min-height: 0;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .page-frame {
        width: 100%;
        min-height: 0;
        border: 2px solid #0f766e;
        border-radius: 0;
        background: #fff;
        padding: 4mm;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        box-sizing: border-box;
      }
      .statement-title {
        text-align: center;
        font-size: 20px;
        font-weight: 900;
        color: #0f766e;
        margin: 0 0 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #0f766e;
      }
      .info-grid {
        display: grid;
     grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 14px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .info-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        border: 1.5px solid #0f172a;
        background: #dbeafe;
        padding: 2.5mm 2mm;
        min-height: 16mm;
        border-radius: 2mm;
        text-align: center;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .info-box:nth-child(1) {
        background: #dbeafe !important;
        border-color: #2563eb !important;
      }
      .info-box:nth-child(2) {
        background: #fef3c7 !important;
        border-color: #d97706 !important;
      }
      .info-box:nth-child(3) {
        background: #ede9fe !important;
        border-color: #7c3aed !important;
      }
      .info-box:nth-child(4) {
        background: #d1fae5 !important;
        border-color: #059669 !important;
      }
      .info-lbl {
        width: 100%;
        font-size: 19px;
        line-height: 1.35;
        font-weight: 900 !important;
        color: #172554 !important;
        margin: 0;
        text-align: center !important;
      }
      .info-val {
        width: 100%;
        font-size: 22px;
        line-height: 1.4;
        font-weight: 900 !important;
        color: #000000 !important;
        text-align: center !important;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .table-wrapper {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
      }
      table {
      table-layout: auto;
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
      }
      th, td {
        border: 1.5px solid #0f766e;
        text-align: center;
        vertical-align: middle;
        padding: 8px 12px;
      }
      th {
        background: #0f766e !important;
        color: #ffffff !important;
        font-weight: 900;
        font-size: 17px;
      }
      td {
        color: #000000 !important;
        font-size: 20px;
      }
      .report-page-content .page-frame th,
      .report-page-content .page-frame td {
        font-family: ${y} !important;
        font-size: 20px !important;
        line-height: 1.4 !important;
      }
      .report-page-content .page-frame .info-lbl,
      .report-page-content .page-frame .info-val,
      .report-page-content .page-frame .statement-title,
      .report-page-content .page-frame .foot {
        font-family: ${y} !important;
        font-size: 20px !important;
      }
      .lbl {
        font-weight: 800;
        text-align: center;
        padding-right: 16px;
        font-weight: 900;
      }
      .num {
        font-weight: 900;
        font-size: 20px;
        direction: ltr;
        text-align: center;
        padding-left: 16px;
        font-variant-numeric: tabular-nums;
      }
      .row-fees td {
 background: #eff6ff !important; 
      }
      .row-due-old td { background: #fef3c7 !important;
        
      }
      .row-total-due td { background: ${t===2026?`#fecaca`:`#fee2e2`} !important; font-weight: 900; }
      .row-paid td { background: ${t===2026?`#dcfce7`:`#f0fdf4`} !important; font-weight: 800; }
      .row-unpaid td { background: #f8fafc !important; color: #64748b !important; }
      .row-total-paid td { background: ${t===2026?`#a7f3d0`:`#d1fae5`} !important; font-weight: 900; }
      .row-final td {
        background: ${t===2026?`#0f766e`:`#f1f5f9`} !important;
        ${t===2026?`color: #ffffff !important;`:``}
        font-size: 20px;
        font-weight: 900;
        border-top: 2.5px solid #0f766e !important;
      }
      /* استعادة التنسيق الأصلي لكشف حساب المتدرب وعزله عن القالب العام للتقارير. */
      .page-frame table.trainee-account-statement {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        direction: rtl !important;
        margin-top: 4px !important;
      }
      .page-frame table.trainee-account-statement th,
      .page-frame table.trainee-account-statement td {
        border: 1.5px solid #0f766e !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 8px 12px !important;
        font-family: ${y} !important;
        font-size: 20px !important;
        line-height: 1.4 !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .page-frame table.trainee-account-statement thead th {
        background: #0f766e !important;
        background-image: none !important;
        color: #ffffff !important;
        font-size: 17px !important;
        font-weight: 900 !important;
      }
      .page-frame table.trainee-account-statement tbody tr.row-fees > td { background: #eff6ff !important; color: #000000 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-due-old > td { background: #fef3c7 !important; color: #000000 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-total-due > td { background: ${t===2026?`#fecaca`:`#fee2e2`} !important; color: #000000 !important; font-weight: 900 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-paid > td { background: ${t===2026?`#dcfce7`:`#f0fdf4`} !important; color: #000000 !important; font-weight: 800 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-unpaid > td { background: #f8fafc !important; color: #64748b !important; }
      .page-frame table.trainee-account-statement tbody tr.row-total-paid > td { background: ${t===2026?`#a7f3d0`:`#d1fae5`} !important; color: #000000 !important; font-weight: 900 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-final > td {
        background: ${t===2026?`#0f766e`:`#f1f5f9`} !important;
        color: ${t===2026?`#ffffff`:`#000000`} !important;
        font-size: 20px !important;
        font-weight: 900 !important;
        border-top: 2.5px solid #0f766e !important;
      }
      .page-frame table.trainee-account-statement tbody tr.installments-statement-row > td * {
        background: transparent !important;
        color: inherit !important;
      }
      .foot {
        margin-top: 10px;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
        font-weight: 800;
        color: #000000;
        border-top: 1.5px dashed #0f766e;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      @media print {
        body { margin: 0; padding: 0; }
        .print-toolbar { display: none !important; }
        .page-frame { min-height: 0; border-radius: 0; }
        .info-box, th, td, .statement-title {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,h=`
      <div class="container">
        <div class="page-frame">
          <h2 class="statement-title">كشف حساب متدرب — للعام ${t}م</h2>
          <div class="info-grid">
            ${f(`اسم المتدرب`,e.name)}
            ${f(`الدفعة`,e.batch)}
            ${f(`المساق`,e.specialty)}
            ${f(`رقم الهاتف`,e.phone)}
          </div>
<div class="table-wrapper">
<table class="trainee-account-statement">
              <colgroup><col style="width:65%"><col style="width:35%"></colgroup>
              <thead>
                <tr>
                  <th>البيان</th>
                  <th style="width: 35%">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr class="installments-statement-row row-fees"><td class="lbl">إجمالي الرسوم المستحقة</td><td class="num">${O(b(r))}</td></tr>
                ${p}
                <tr class="installments-statement-row row-total-due"><td class="lbl">إجمالي المبلغ المطلوب</td><td class="num">${O(b(o))}</td></tr>
                ${d}
                <tr class="installments-statement-row row-total-paid"><td class="lbl">إجمالي المسدد (له)</td><td class="num">${O(b(a))}</td></tr>
                <tr class="installments-statement-row row-final"><td class="lbl">${O(m)}</td><td class="num">${O(b(Math.abs(l)))}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="foot">
            <span>تاريخ التقرير: ${O(M)}</span>
   <span>التوقيع: ________________</span>
          </div>
        </div>
      </div>
    `;return{title:`كشف_حساب_${u}_${t}_${Ne}`,body:h,css:ee}},Vn=ge,Hn=e=>{let t=e=>String(e??``).trim().replace(/[ًٌٍَُِّْـ]/g,``).replace(/[إأآ]/g,`ا`).replace(/ى/g,`ي`).replace(/ة/g,`ه`).replace(/\s+/g,` `).toLocaleLowerCase(`ar`),n=t(e.name),r=0,i=0;(l||[]).forEach(e=>{if(t(e.name)!==n)return;let a=new Date(e.notifyDate||e.date||``);if(!Number.isFinite(a.getTime())||a.getFullYear()<2022)return;let o=D(e.notifyAmount);o<=0||(oe(e.description)?r+=o:/امتحان|اختبار/.test(String(e.description||``))&&(i+=o))}),ft(!1),mt(!0),gt(!1),vt(!1),bt(!1),St(1e4),wt(3e4),ut({name:String(e.name||``),registrationPaid:r,examPaid:i})},Un=()=>{if(!I)return;let e=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]||e),t=String(I.name||``).trim(),n=[{label:`رسوم القيد والتسجيل`,amount:dt&&I.registrationPaid<=0?Math.max(0,xt):0},{label:`رسوم امتحان الكتابي الأول`,amount:pt&&I.examPaid<=0?Math.max(0,Ct):0},{label:`رسوم امتحان الكتابي النهائي`,amount:ht?3e4:0},{label:`رسوم امتحان العلمي الشفوي`,amount:_t?1e5:0},{label:`رسوم امتحان شفوي/سريري`,amount:yt?3e4:0}].filter(e=>e.amount>0);if(!n.length){_.info(`لا توجد رسوم مستحقة غير مسددة لهذا المتدرب`);return}let r=n.map(e=>e.label+` (`+e.amount.toLocaleString(`en-US`)+` ريال)`).join(` و`),i=`مطالبة مالية بسداد الرسوم - `+t,a=`<article class="fee-demand-letter" dir="rtl" style="text-align: center; font-size: 18px; line-height: 2.2; font-family: &quot;IBM Plex Sans Arabic&quot;, &quot;Noto Sans Arabic&quot;, &quot;Noto Naskh Arabic&quot;, Cairo, sans-serif;"><h1 style="font-size: 20px; font-weight: bold; margin-bottom: 25px;">مطالبة مالية بسداد الرسوم</h1><p class="letter-date" style="text-align: right; font-size: 16px;">التاريخ: `+e(M)+`</p><p class="salutation" style="margin: 18px 0; font-size: 20px; text-align: right;">الأخ-الدكتور// <strong>`+e(t)+`</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; المحتــرم</p><p style="margin: 15px 0; text-align: center;">تحية طيبة وبعد،</p><p style="margin: 15px 0;text-align: center;text-decoration: underline; font-weight: bold; color: red;"><strong>الموضوع: مطالبة بسداد `+e(r)+`</strong></p><p style="margin: 15px 0; text-align: center;font-size: 18px">بالإشارة إلى الموضوع أعلاه، نرجو منكم المبادرة إلى سداد الرسوم المحددة في هذه المطالبة وغير المسددة، ومراجعة الإدارة المالية لإتمام إجراءات السداد وتوثيقه.</p><p style="margin: 15px 0;text-align: center;font-weight: bold; color: #000;">نأمل منكم سرعة سداد المستحقات المالية التي عليكم. وفي حال عدم السداد، سيتم اتخاذ الإجراءات اللازمة وفق الأنظمة واللوائح المعمول بها.</p><p class="thanks" style="margin: 30px 0;text-align: center">شاكرين لكم حسن تعاونكم، وتفضلوا بقبول خالص الشكر والتقدير،،،،</p><div class="letter-signatures" style="display: flex; justify-content: space-between; margin-top: 60px; text-align: center; font-size: 16px;"><div style="flex: 1;"><label style="display: block; font-weight: bold; margin-bottom: 8px;">الصندوق</label><strong style="display: block; margin-bottom: 15px;">`+e(Tt.department)+`</strong><span style="display: block; border-bottom: 1px dotted #000; width: 80%; margin: 0 auto;"></span></div><div style="flex: 1;"><label style="display: block; font-weight: bold; margin-bottom: 8px;">الشؤون المالية</label><strong style="display: block; margin-bottom: 15px;">`+e(Tt.director)+`</strong><span style="display: block; border-bottom: 1px dotted #000; width: 80%; margin: 0 auto;"></span></div><div style="flex: 1;"><label style="display: block; font-weight: bold; margin-bottom: 8px;">رئيس فرع المجلس </label><strong style="display: block; margin-bottom: 15px;">`+e(Tt.signer)+`</strong><span style="display: block; border-bottom: 1px dotted #000; width: 80%; margin: 0 auto;"></span></div></div></article>`;ue({title:i,reportDateLabel:M,tableHtml:a,contentCss:_e,finalCss:`@page { size:A4 portrait; margin:18mm; }
#tableContainer .fee-demand-letter { width:100%; min-height:245mm; margin:0 auto; color:#111; font-family:'IBM Plex Sans Arabic','Noto Sans Arabic','Noto Naskh Arabic',Cairo,Tahoma,Arial,sans-serif; font-size:16px; line-height:2; }
#tableContainer .fee-demand-letter h1 { margin:0 0 10mm; padding:0 0 4mm; border-bottom:2px solid #17324d; color:#17324d; text-align:center; font-size:22px; font-weight:900; }
#tableContainer .fee-demand-letter p { margin:0 0 5mm; text-align:justify; }
#tableContainer .fee-demand-letter .letter-date { text-align:left; }
#tableContainer .fee-demand-letter .salutation { margin-top:10mm; }
#tableContainer .fee-demand-letter .thanks { margin-top:8mm; }
#tableContainer .letter-signatures { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8mm; margin-top:22mm; text-align:center; }
#tableContainer .letter-signatures > div { display:flex; min-height:32mm; flex-direction:column; align-items:center; gap:3mm; }
#tableContainer .letter-signatures label { font-weight:800; }
#tableContainer .letter-signatures strong { min-height:8mm; }
#tableContainer .letter-signatures span { width:75%; height:8mm; margin-top:2mm; border-bottom:1px dotted #333; }`,defaultOrientation:`portrait`,defaultPageSize:`A4`,defaultMarginMm:18})||_.error(`تعذر فتح معاينة المطالبة، تحقق من السماح بالنوافذ المنبثقة`)},Wn=async(e,t)=>{let{title:n,body:r,css:i}=Bn(e,t);try{await Vn({title:n,body:r,css:i,fileName:`${n}.pdf`,pageSize:`A4`,orientation:`portrait`,marginMm:0,fitToContent:!0}),_.success(`تم فتح واجهة الطباعة؛ اختر «حفظ كملف PDF» لإتمام التصدير`)}catch(e){console.error(`Account statement PDF error:`,e),_.error(`تعذّر فتح واجهة تصدير كشف الحساب`)}},Gn=(e,t)=>{let{title:n,body:r,css:i}=Bn(e,t);ue({title:n,reportDateLabel:M,tableHtml:r,contentCss:i,defaultOrientation:`portrait`,defaultPageSize:`A4`,defaultMarginMm:0,fitToContent:!0,finalCss:`
        html body #tableContainer table.trainee-account-statement { width:100% !important; max-width:100% !important; table-layout:fixed !important; border-collapse:collapse !important; }
        html body #tableContainer table.trainee-account-statement th,
        html body #tableContainer table.trainee-account-statement td { border:1.5px solid #0f766e !important; padding:8px 12px !important; font-family:"IBM Plex Sans Arabic", "Noto Sans Arabic", "Noto Naskh Arabic", "Cairo", Tahoma, Arial, sans-serif !important; font-size:20px !important; line-height:1.4 !important; text-align:center !important; vertical-align:middle !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
        html body #tableContainer table.trainee-account-statement thead th { background:#0f766e !important; background-image:none !important; color:#fff !important; font-size:17px !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-fees > td { background:#eff6ff !important; color:#000 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-due-old > td { background:#fef3c7 !important; color:#000 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-total-due > td { background:${t===2026?`#fecaca`:`#fee2e2`} !important; color:#000 !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-paid > td { background:${t===2026?`#dcfce7`:`#f0fdf4`} !important; color:#000 !important; font-weight:800 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-unpaid > td { background:#f8fafc !important; color:#64748b !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-total-paid > td { background:${t===2026?`#a7f3d0`:`#d1fae5`} !important; color:#000 !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-final > td { background:${t===2026?`#0f766e`:`#f1f5f9`} !important; color:${t===2026?`#fff`:`#000`} !important; font-size:20px !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.installments-statement-row > td * { background:transparent !important; color:inherit !important; }
      `})||_.error(`تم منع فتح نافذة المعاينة، يرجى السماح بالنوافذ المنبثقة في كروم`)},Kn=e=>String(e||``).toLowerCase().replace(/[ًٌٍَُِّْـ]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/[ؤ]/g,`و`).replace(/[ئ]/g,`ي`).replace(/ى/g,`ي`).replace(/[ـ.,،؛;:()\[\]{}"'ـ_-]/g,` `).replace(/[^\p{L}\p{N}\s]/gu,` `).replace(/\s+/g,` `).trim(),qn=(e,t)=>{let n=[...new Set(Kn(e).split(` `).filter(Boolean))].sort(),r=[...new Set(Kn(t).split(` `).filter(Boolean))].sort();return n.length>0&&n.length===r.length&&n.every((e,t)=>e===r[t])},Jn=e=>{let t=String(e?.name||``).trim();if(!t)return _.error(`اسم المتدرب غير محدد`);let n=(l||[]).flatMap(e=>{let n=String(e?.name||``).trim(),r=e?.notifyDate?new Date(String(e.notifyDate)):null,i=D(e?.notifyAmount),a=String(e?.description||``).trim().replace(/[ًٌٍَُِّْـ]/g,``).replace(/[إأآ]/g,`ا`).replace(/\s+/g,` `),o=/(امتحان|اختبار)/.test(a),s=oe(e?.description);return!qn(t,n)||!r||Number.isNaN(r.getTime())||r.getFullYear()<2022||i<=0||!o&&!s?[]:[{date:r,year:r.getFullYear(),month:r.getMonth(),category:o?`رسوم الامتحانات`:`رسوم القيد والتسجيل`,hafizaNo:String(e.hafizaNo||``),notifyNo:String(e.notifyNo||``),description:String(e.description||`رسوم امتحانات`).trim(),amount:i}]}).sort((e,t)=>e.date.getTime()-t.date.getTime());if(!n.length){_.error(`لا توجد حوافظ توريد لرسوم الامتحانات أو القيد والتسجيل لهذا المتدرب منذ عام 2022`);return}let r=e=>String(e.getDate()).padStart(2,`0`)+`/`+String(e.getMonth()+1).padStart(2,`0`)+`/`+e.getFullYear(),i=new Map,a=new Map,o=new Map;n.forEach(e=>{let t=e.category+`|`+e.year+`-`+e.month,n=e.date.toLocaleDateString(`ar`,{month:`long`}),r=i.get(t);r?r.amount+=e.amount:i.set(t,{category:e.category,label:n+` `+e.year,amount:e.amount});let s=e.category+`|`+e.year,c=a.get(s);c?c.amount+=e.amount:a.set(s,{category:e.category,year:e.year,amount:e.amount}),o.set(e.category,(o.get(e.category)||0)+e.amount)});let s=n.reduce((e,t)=>e+t.amount,0),c=Te(t),u=n.map(e=>`<tr class="row-paid`+(e.category===`رسوم القيد والتسجيل`?` row-registration`:``)+(e.year===2026?` installments-statement-row row-paid-2026`:``)+`"><td>`+e.year+`</td><td class="num">`+r(e.date)+`</td><td>`+O(e.hafizaNo||`—`)+`</td><td>`+O(e.notifyNo||`—`)+`</td><td class="lbl">`+O(e.description)+`</td><td class="num">`+O(b(e.amount))+`</td></tr>`).join(``),d=Array.from(i.values()).map(e=>`<tr class="row-period`+(e.label.endsWith(`2026`)?` installments-statement-row row-period-2026`:``)+`"><td colspan="5">إجمالي `+O(e.category)+` لشهر `+O(e.label)+`</td><td class="num">`+O(b(e.amount))+`</td></tr>`).join(``),f=Array.from(a.values()).sort((e,t)=>e.year-t.year||e.category.localeCompare(t.category,`ar`)).map(e=>`<tr class="row-year`+(e.year===2026?` installments-statement-row row-year-2026`:``)+`"><td colspan="5">إجمالي `+O(e.category)+` لعام `+e.year+`</td><td class="num">`+O(b(e.amount))+`</td></tr>`).join(``),p=Array.from(o.entries()).map(([e,t])=>`<tr class="row-category-total"><td colspan="5">الإجمالي الكلي لـ `+O(e)+`</td><td class="num">`+O(b(t))+`</td></tr>`).join(``),m=(e,t)=>`<div class="info-box"><div class="info-lbl">`+O(e)+`</div><div class="info-val">`+O(t||`—`)+`</div></div>`,ee=[`<div class="container"><div class="page-frame">`,`<h2 class="statement-title">كشف سداد رسوم الامتحانات والقيد والتسجيل</h2><div class="info-grid">`,m(`اسم المتدرب`,t),m(`الدفعة`,String(e.batch||`—`)),m(`المساق`,String(e.specialty||`—`)),m(`الفترة`,`من عام 2022 وحتى آخر توريد مسجل`),`</div><table class="statement-table"><colgroup><col style="width:6%"><col style="width:12%"><col style="width:10%"><col style="width:10%"><col style="width:48%"><col style="width:14%"></colgroup><thead><tr><th>السنة</th><th>تاريخ التوريد</th><th>رقم الحافظة</th><th>رقم الإشعار</th><th>البيان الأصلي</th><th>مبلغ التوريد</th></tr></thead><tbody>`,u,d,f,p,`<tr class="installments-statement-row row-final"><td colspan="5">الإجمالي الكلي لرسوم الامتحانات والقيد والتسجيل</td><td class="num">`+O(b(s))+`</td></tr></tbody></table>`,`<div class="foot"><span>تاريخ التقرير: `+O(M)+`</span><span>التوقيع: ________________</span></div></div></div>`].join(``),h=`كشف_سداد_رسوم_الامتحانات_والقيد_والتسجيل_`+c+`_من_2022_`+Ne;ue({title:h,reportDateLabel:M,tableHtml:ee,contentCss:` * { box-sizing: border-box; font-family: "IBM Plex Sans Arabic", "Noto Sans Arabic", "Noto Naskh Arabic", Cairo, Tahoma, Arial, sans-serif !important; }
html, body { margin: 0; padding: 0; width: 100%; background: #fff; color: #000; direction: rtl; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.container { width: 100%; margin: 0; padding: 0; }
.page-frame { width: 100%; border: 2px solid #0f766e; background: #fff; padding: 4mm; }
.statement-title { text-align: center; font-size: 20px; font-weight: 900; color: #0f766e; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #0f766e; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.info-box { border: 1px solid #000; background: #CDD5AE; padding: 2mm 1.5mm; min-height: 12mm; text-align: center; }
.info-lbl { font-size: 16px; font-weight: 700; color: #0f766e; margin-bottom: 2px; }
.info-val { font-size: 18px; font-weight: 900; color: #000; }
.statement-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 4px; }
.statement-table th, .statement-table td { border: 1.5px solid #0f766e; text-align: center; vertical-align: middle; padding: 2px; font-size: 12px; white-space: nowrap; }
th { background: #0f766e !important; color: #fff !important; font-weight: 900; }
td { color: #000 !important; font-weight: 800; }
.lbl { font-weight: 900; } .num { direction: ltr; white-space: nowrap; font-variant-numeric: tabular-nums; }
.row-paid td { background: #f0fdf4 !important; } .row-period td { background: #e0f2fe !important; font-weight: 900; }
.row-year td { background: #dbeafe !important; font-weight: 900; } .row-registration td { background: #DDEBFF !important; } .row-category-total td { background: #e0f2fe !important; font-weight: 900; }
.row-paid-2026 td { background: #dcfce7 !important; color: #14532d !important; font-weight: 900; }
.row-period-2026 td { background: #bfdbfe !important; color: #1e3a8a !important; font-weight: 900; }
.row-year-2026 td { background: #1d4ed8 !important; color: #ffffff !important; font-weight: 900; }
.row-final td { background: #0437bb !important; color: #fff !important; font-size: 17px; font-weight: 900; }
.foot { margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1.5px dashed #0f766e; }`,defaultOrientation:`landscape`,defaultPageSize:`A4`,defaultMarginMm:5,fitToContent:!1})||_.error(`تم منع فتح نافذة المعاينة، يرجى السماح بالنوافذ المنبثقة في كروم`)},Yn=[{label:`إجمالي الرسوم التقديرية`,value:b(Z.fees),bgClass:`bg-white`,borderClass:`border-sky-100`,accentClass:`bg-sky-500`},{label:`إجمالي الأقساط المسددة`,value:b(Z.paid),bgClass:`bg-emerald-50/70`,borderClass:`border-emerald-100`,accentClass:`bg-emerald-500`},{label:`إجمالي المتبقي`,value:b(Z.remaining),bgClass:`bg-orange-50/70`,borderClass:`border-orange-100`,accentClass:`bg-orange-500`}],Xn=[{label:`المدور (متبقي 2025)`,value:b(Q.prevDue),bgClass:`bg-white`,borderClass:`border-sky-100`,accentClass:`bg-sky-600`},{label:`إجمالي مسدد 2026`,value:b(Q.paid),bgClass:`bg-emerald-50/70`,borderClass:`border-emerald-100`,accentClass:`bg-emerald-500`},{label:`صافي الرصيد المتبقي`,value:b(Q.remaining),bgClass:`bg-orange-50/70`,borderClass:`border-orange-100`,accentClass:`bg-orange-500`}],Zn=async()=>{if(!ct){if(!J.length)_.error(`لا توجد بيانات للتصدير`);else{lt(!0);try{await Cn(2026,{...he},{download:!0})}finally{lt(!1)}}}},Qn=[{label:`استيراد Excel`,onSelect:()=>void 0,content:(0,S.jsxDEV)(`label`,{className:`flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100`,children:[(0,S.jsxDEV)(`span`,{children:F===2025?`جارٍ الاستيراد…`:`استيراد Excel`},void 0,!1,{fileName:C,lineNumber:3269,columnNumber:11},this),(0,S.jsxDEV)(`input`,{type:`file`,accept:`.xlsx,.xls`,disabled:F!==null,onChange:e=>Rn(e,2025),className:`absolute h-0 w-0 opacity-0 overflow-hidden`},void 0,!1,{fileName:C,lineNumber:3270,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:3268,columnNumber:11},this)},{label:`تصدير Excel التفصيلي`,icon:r,onSelect:()=>xn(2025)},{label:`طباعة تفصيلية`,icon:t,onSelect:()=>st(2025)}],$n=[{label:G.length?`تنسيق نشط (${G.length})`:`تنسيق شرطي`,icon:n,onSelect:()=>qt(!0)},{label:`طالب جديد`,icon:g,onSelect:()=>Zt(!0)},{label:`عمود جديد`,icon:g,onSelect:()=>Lt(!0)},{label:`إضافة قسط`,icon:g,onSelect:()=>Re(!0)},{label:`استيراد Excel`,onSelect:()=>void 0,content:(0,S.jsxDEV)(`label`,{className:`flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100`,children:[(0,S.jsxDEV)(`span`,{children:F===2026?`جارٍ الاستيراد…`:`استيراد Excel`},void 0,!1,{fileName:C,lineNumber:3313,columnNumber:11},this),(0,S.jsxDEV)(`input`,{type:`file`,accept:`.xlsx,.xls`,disabled:F!==null,onChange:e=>Rn(e,2026),className:`absolute h-0 w-0 opacity-0 overflow-hidden`},void 0,!1,{fileName:C,lineNumber:3314,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:3312,columnNumber:11},this)},{label:`تصدير Excel التفصيلي`,icon:r,onSelect:()=>xn(2026)},{label:`طباعة تفصيلية`,icon:t,onSelect:()=>st(2026)},{label:ct?`جارٍ التحضير…`:`تصدير PDF التفصيلي`,icon:a,onSelect:Zn,disabled:ct}];return(0,S.jsxDEV)(`div`,{className:`mizan-installments-tab w-full space-y-4 sm:space-y-6 p-0`,dir:`rtl`,children:[(0,S.jsxDEV)(`div`,{className:`w-full bg-gradient-to-b from-sky-50/60 to-white shadow-lg border border-sky-100 rounded-2xl overflow-hidden`,children:[(0,S.jsxDEV)(`div`,{className:`bg-gradient-to-l from-sky-800 via-sky-600 to-sky-600 px-2 sm:px-6 py-2.5 sm:py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center flex-wrap gap-2`,children:[(0,S.jsxDEV)(`div`,{className:`min-w-0`,children:[(0,S.jsxDEV)(`h2`,{className:`${De} text-white`,children:`📊 أقساط ومستندات العام 2025`},void 0,!1,{fileName:C,lineNumber:3349,columnNumber:13},this),(0,S.jsxDEV)(`p`,{className:`text-lg text-sky-100`,children:`يشمل جميع الدفعات لعامي 2024 و 2025`},void 0,!1,{fileName:C,lineNumber:3354,columnNumber:2},this)]},void 0,!0,{fileName:C,lineNumber:3348,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`installments-controls-2025 w-full grid grid-cols-2 gap-2 items-center`,children:[(0,S.jsxDEV)(`div`,{className:`installments-search-2025 relative col-span-2 w-full sm:w-auto`,children:[(0,S.jsxDEV)(c,{className:`w-8 h-4 absolute right-2.5 top-2.5 text-sky-500`},void 0,!1,{fileName:C,lineNumber:3358,columnNumber:1},this),(0,S.jsxDEV)(`input`,{type:`text`,placeholder:`بحث (الاسم، الدفعة، المساق)...`,value:Dt,onChange:e=>{Ot(e.target.value),rt(1)},className:`pl-3 pr-8 py-2 rounded-lg text-sm border border-sky-300 outline-none focus:ring-2 focus:ring-sky-300 w-full sm:w-48 text-slate-800 shadow-sm`},void 0,!1,{fileName:C,lineNumber:3359,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:3357,columnNumber:2},this),(0,S.jsxDEV)(`label`,{"aria-label":`استيراد ملف أقساط 2025`,className:`installments-action-2025 installments-action-2025--import relative w-full cursor-pointer ${F===null?``:`opacity-60 pointer-events-none`}`,children:[(0,S.jsxDEV)(ee,{className:`h-5 w-5`,"aria-hidden":`true`},void 0,!1,{fileName:C,lineNumber:3371,columnNumber:3},this),(0,S.jsxDEV)(`span`,{children:F===2025?`جارٍ الاستيراد…`:`استيراد الملف`},void 0,!1,{fileName:C,lineNumber:3372,columnNumber:3},this),(0,S.jsxDEV)(`input`,{type:`file`,accept:`.xlsx,.xls`,disabled:F!==null,onChange:e=>Rn(e,2025),className:`absolute h-0 w-0 opacity-0 overflow-hidden`},void 0,!1,{fileName:C,lineNumber:3373,columnNumber:3},this)]},void 0,!0,{fileName:C,lineNumber:3367,columnNumber:1},this),(0,S.jsxDEV)(`div`,{className:`installments-direct-actions-2025`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>xn(2025),className:`installments-action-2025 installments-action-2025--export`,title:`تصدير أقساط 2025 إلى Excel`,children:[(0,S.jsxDEV)(r,{className:`h-5 w-5`,"aria-hidden":`true`},void 0,!1,{fileName:C,lineNumber:3389,columnNumber:5},this),(0,S.jsxDEV)(`span`,{children:`تصدير Excel`},void 0,!1,{fileName:C,lineNumber:3390,columnNumber:5},this)]},void 0,!0,{fileName:C,lineNumber:3383,columnNumber:3},this),(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>st(2025),className:`installments-action-2025 installments-action-2025--detailed-print`,title:`إعدادات وطباعة تفصيلية لأقساط 2025`,children:[(0,S.jsxDEV)(t,{className:`h-5 w-5`,"aria-hidden":`true`},void 0,!1,{fileName:C,lineNumber:3398,columnNumber:5},this),(0,S.jsxDEV)(`span`,{children:`طباعة تفصيلية`},void 0,!1,{fileName:C,lineNumber:3399,columnNumber:5},this)]},void 0,!0,{fileName:C,lineNumber:3392,columnNumber:3},this)]},void 0,!0,{fileName:C,lineNumber:3382,columnNumber:1},this),(0,S.jsxDEV)(pe,{title:`أقساط العام 2025`,rows:d||[],columns:[{key:`name`,label:`اسم المتدرب`},{key:`batch`,label:`الدفعة`},{key:`specialty`,label:`المساق`},{key:`fees`,label:`الرسوم`},{key:`totalPaid`,label:`المسدد`},{key:`remaining`,label:`المتبقي`}],fileName:`اقساط-2025`,numericKeys:[`fees`,`totalPaid`,`remaining`],onClear:()=>p(`2025`),printLabel:`الأقساط/إجمالي`,pdfLayout:`wide-centered`,pdfOrientation:`portrait`,pdfMarginMm:1,pdfCss:Oe,additionalWebActions:Qn,className:`installments-tab-actions-2025`},void 0,!1,{fileName:C,lineNumber:3403,columnNumber:1},this)]},void 0,!0,{fileName:C,lineNumber:3356,columnNumber:1},this)]},void 0,!0,{fileName:C,lineNumber:3347,columnNumber:9},this),$e&&(0,S.jsxDEV)(`div`,{className:`bg-red-50 border-b border-red-200 p-3 flex gap-2`,children:[(0,S.jsxDEV)(s,{className:`w-5 h-5 text-red-600`},void 0,!1,{fileName:C,lineNumber:3430,columnNumber:1},this),(0,S.jsxDEV)(`p`,{className:`text-sm text-red-700`,children:$e},void 0,!1,{fileName:C,lineNumber:3431,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:3429,columnNumber:2},this),(0,S.jsxDEV)(`div`,{className:`p-1 sm:p-3`,children:[(0,S.jsxDEV)(Ae,{stats:Yn,columns:3},void 0,!1,{fileName:C,lineNumber:3436,columnNumber:1},this),(0,S.jsxDEV)(`div`,{className:`flex items-center justify-between gap-2 px-2 py-2 text-xs text-slate-700`,"aria-live":`polite`,children:[(0,S.jsxDEV)(`span`,{children:[`عرض `,q.length?(Y-1)*E+1:0,`–`,Math.min(Y*E,q.length),` من `,q.length,` سجل`]},void 0,!0,{fileName:C,lineNumber:3438,columnNumber:3},this),(0,S.jsxDEV)(`div`,{className:`flex items-center gap-2`,children:[(0,S.jsxDEV)(`button`,{type:`button`,disabled:Y<=1,onClick:()=>rt(e=>Math.max(1,e-1)),className:`rounded border px-2 py-1 disabled:opacity-40`,children:`السابق`},void 0,!1,{fileName:C,lineNumber:3440,columnNumber:5},this),(0,S.jsxDEV)(`span`,{children:[Y,` / `,fn]},void 0,!0,{fileName:C,lineNumber:3441,columnNumber:5},this),(0,S.jsxDEV)(`button`,{type:`button`,disabled:Y>=fn,onClick:()=>rt(e=>Math.min(fn,e+1)),className:`rounded border px-2 py-1 disabled:opacity-40`,children:`التالي`},void 0,!1,{fileName:C,lineNumber:3442,columnNumber:5},this)]},void 0,!0,{fileName:C,lineNumber:3439,columnNumber:3},this)]},void 0,!0,{fileName:C,lineNumber:3437,columnNumber:1},this),(0,S.jsxDEV)(`div`,{className:`overflow-auto max-h-[72vh] rounded-lg border border-slate-200 shadow-sm relative`,children:(0,S.jsxDEV)(`table`,{className:`installments-table installments-table-2025 min-w-max table-auto text-sm sm:text-base font-semibold`,children:[(0,S.jsxDEV)(`thead`,{className:`bg-gradient-to-b from-sky-700 to-sky-800 font-bold border-b-2 border-sky-900  [&>tr>th]:!text-white sticky top-0 z-20 shadow-md`,children:(0,S.jsxDEV)(`tr`,{children:[(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:`#`},void 0,!1,{fileName:C,lineNumber:3449,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`installments-2025-name-cell text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onClick:()=>gn(`name`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`اسم المتدرب `,(0,S.jsxDEV)(j,{sortConfig:L,columnKey:`name`},void 0,!1,{fileName:C,lineNumber:3455,columnNumber:35},this)]},void 0,!0,{fileName:C,lineNumber:3454,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3450,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onClick:()=>gn(`batch`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`الدفعة `,(0,S.jsxDEV)(j,{sortConfig:L,columnKey:`batch`},void 0,!1,{fileName:C,lineNumber:3463,columnNumber:30},this)]},void 0,!0,{fileName:C,lineNumber:3462,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3458,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onClick:()=>gn(`specialty`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`المساق `,(0,S.jsxDEV)(j,{sortConfig:L,columnKey:`specialty`},void 0,!1,{fileName:C,lineNumber:3471,columnNumber:30},this)]},void 0,!0,{fileName:C,lineNumber:3470,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3466,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onClick:()=>gn(`fees`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`الرسوم `,(0,S.jsxDEV)(j,{sortConfig:L,columnKey:`fees`},void 0,!1,{fileName:C,lineNumber:3479,columnNumber:30},this)]},void 0,!0,{fileName:C,lineNumber:3478,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3474,columnNumber:19},this),w.map(e=>(0,S.jsxDEV)(`th`,{className:`text-center border-l border-white/25 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:e},e,!1,{fileName:C,lineNumber:3483,columnNumber:21},this)),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onClick:()=>gn(`totalPaid`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`المسدد `,(0,S.jsxDEV)(j,{sortConfig:L,columnKey:`totalPaid`},void 0,!1,{fileName:C,lineNumber:3495,columnNumber:30},this)]},void 0,!0,{fileName:C,lineNumber:3494,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3490,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onClick:()=>gn(`remaining`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`المتبقي `,(0,S.jsxDEV)(j,{sortConfig:L,columnKey:`remaining`},void 0,!1,{fileName:C,lineNumber:3503,columnNumber:31},this)]},void 0,!0,{fileName:C,lineNumber:3502,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3498,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:`إجراءات`},void 0,!1,{fileName:C,lineNumber:3506,columnNumber:19},this)]},void 0,!0,{fileName:C,lineNumber:3448,columnNumber:17},this)},void 0,!1,{fileName:C,lineNumber:3447,columnNumber:15},this),(0,S.jsxDEV)(`tbody`,{children:q.length===0?(0,S.jsxDEV)(`tr`,{children:(0,S.jsxDEV)(`td`,{colSpan:8+w.length,className:`text-center text-slate-400 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap`,children:`لا توجد بيانات (يرجى التأكد من استيراد الملف أو تعديل البحث)`},void 0,!1,{fileName:C,lineNumber:3512,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3511,columnNumber:19},this):(0,S.jsxDEV)(S.Fragment,{children:[mn.map((e,n)=>{let r=un.get(e)??-1;return(0,S.jsxDEV)(`tr`,{className:`border-t border-slate-200 hover:bg-slate-50/80 transition-colors`,children:[(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:(Y-1)*E+n+1},void 0,!1,{fileName:C,lineNumber:3525,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`installments-2025-name-cell text-center font-semibold text-black bg-sky-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:e.name},void 0,!1,{fileName:C,lineNumber:3528,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap bg-cyan-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:e.batch||`—`},void 0,!1,{fileName:C,lineNumber:3531,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap bg-sky-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:e.specialty||`—`},void 0,!1,{fileName:C,lineNumber:3534,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono font-semibold text-black whitespace-nowrap bg-blue-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:b(e.fees)},void 0,!1,{fileName:C,lineNumber:3537,columnNumber:27},this),w.map(t=>{let n=Number(e.payments?.[t])||0;return(0,S.jsxDEV)(`td`,{className:`numeric-cell text-center bg-slate-50/50 border-l border-slate-200 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:n>0?(0,S.jsxDEV)(`span`,{className:`text-black font-bold numeric-cell font-mono`,children:b(n)},void 0,!1,{fileName:C,lineNumber:3548,columnNumber:35},this):(0,S.jsxDEV)(`span`,{className:`text-slate-300`,children:`—`},void 0,!1,{fileName:C,lineNumber:3552,columnNumber:35},this)},t,!1,{fileName:C,lineNumber:3543,columnNumber:31},this)}),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black font-bold bg-emerald-50/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:b(e.totalPaid)},void 0,!1,{fileName:C,lineNumber:3557,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black font-bold bg-rose-50/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:b(e.remaining)},void 0,!1,{fileName:C,lineNumber:3560,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap flex justify-center gap-1 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:[(0,S.jsxDEV)(`button`,{onClick:()=>{V(e),Ft({year:2025,row:e,index:r})},className:`p-1 bg-sky-50 text-amber-600 rounded border border-amber-200 hover:bg-amber-500 hover:text-white transition-colors`,title:`تعديل الصف`,children:(0,S.jsxDEV)(m,{className:k},void 0,!1,{fileName:C,lineNumber:3572,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:3564,columnNumber:29},this),(0,S.jsxDEV)(`button`,{onClick:()=>Gn(e,2025),className:`p-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-500 hover:text-white transition-colors`,title:`طباعة الكشف`,children:(0,S.jsxDEV)(t,{className:k},void 0,!1,{fileName:C,lineNumber:3579,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:3574,columnNumber:29},this),(0,S.jsxDEV)(`button`,{onClick:()=>Wn(e,2025),className:`p-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-colors`,title:`تصدير PDF (متوافق مع شاومي)`,children:(0,S.jsxDEV)(i,{className:k},void 0,!1,{fileName:C,lineNumber:3586,columnNumber:35},this)},void 0,!1,{fileName:C,lineNumber:3581,columnNumber:33},this)]},void 0,!0,{fileName:C,lineNumber:3563,columnNumber:27},this)]},n,!0,{fileName:C,lineNumber:3521,columnNumber:25},this)}),(0,S.jsxDEV)(`tr`,{className:`border-t-2 border-sky-800 bg-sky-100/80 font-extrabold`,children:[(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,colSpan:4,children:`الإجماليات`},void 0,!1,{fileName:C,lineNumber:3593,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:b(Z.fees)},void 0,!1,{fileName:C,lineNumber:3596,columnNumber:23},this),w.map(e=>(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black border-l border-slate-200 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:Z.months[e]>0?b(Z.months[e]):`—`},e,!1,{fileName:C,lineNumber:3600,columnNumber:25},this)),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:b(Z.paid)},void 0,!1,{fileName:C,lineNumber:3607,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:b(Z.remaining)},void 0,!1,{fileName:C,lineNumber:3610,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`},void 0,!1,{fileName:C,lineNumber:3613,columnNumber:23},this)]},void 0,!0,{fileName:C,lineNumber:3592,columnNumber:21},this)]},void 0,!0,{fileName:C,lineNumber:3517,columnNumber:19},this)},void 0,!1,{fileName:C,lineNumber:3509,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:3446,columnNumber:13},this)},void 0,!1,{fileName:C,lineNumber:3445,columnNumber:1},this)]},void 0,!0,{fileName:C,lineNumber:3435,columnNumber:2},this)]},void 0,!0,{fileName:C,lineNumber:3346,columnNumber:7},this),(0,S.jsxDEV)(`div`,{className:`w-full bg-gradient-to-b from-sky-50/60 to-white shadow-lg border border-sky-100 rounded-2xl overflow-hidden`,children:[(0,S.jsxDEV)(`div`,{className:`bg-gradient-to-l from-sky-800 via-sky-600 to-sky-600 px-4 sm:px-6 py-4 flex flex-col gap-4`,children:[(0,S.jsxDEV)(`div`,{className:`min-w-0`,children:[(0,S.jsxDEV)(`h2`,{className:`text-xl font-extrabold text-white`,children:`📊 سجل أقساط العام الحالي 2026`},void 0,!1,{fileName:C,lineNumber:3628,columnNumber:7},this),(0,S.jsxDEV)(`p`,{className:`text-lg sm:text-sm font-bold text-white/90 mt-1`,children:`بيانات المسدد والرصيد المدور لعام 2026`},void 0,!1,{fileName:C,lineNumber:3631,columnNumber:7},this)]},void 0,!0,{fileName:C,lineNumber:3627,columnNumber:5},this),(0,S.jsxDEV)(`div`,{className:`installments-controls-2026 grid grid-cols-2 gap-2 w-full`,children:[(0,S.jsxDEV)(`div`,{className:`installments-search-2026 relative w-full col-span-2 sm:col-span-2`,children:[(0,S.jsxDEV)(c,{className:`w-15 h-5 absolute right-2.5 top-2 text-yellow-700 pointer-events-none`},void 0,!1,{fileName:C,lineNumber:3641,columnNumber:5},this),(0,S.jsxDEV)(`input`,{type:`text`,placeholder:`بحث (الاسم، الدفعة، المساق)...`,value:kt,onChange:e=>{At(e.target.value),at(1)},className:`pl-3 pr-8 py-1.5 rounded-lg text-sm border border-black outline-none focus:ring-2 focus:ring-sky-300 w-full text-white shadow-sm placeholder:text-white/70`},void 0,!1,{fileName:C,lineNumber:3642,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3640,columnNumber:7},this),(0,S.jsxDEV)(`button`,{onClick:()=>qt(!0),className:`apk-only-actions installment-action-btn installment-action-format w-full px-2 py-1.5 rounded-md text-sm font-extrabold shadow transition-colors flex items-center justify-center gap-1 ${G.length?`bg-yellow-900 text-yellow-900 animate-pulse`:`bg-white/20 text-black hover:bg-white/30`}`,title:`تلوين الصفوف حسب نص معين`,children:[(0,S.jsxDEV)(n,{className:k},void 0,!1,{fileName:C,lineNumber:3660,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:G.length?`تنسيق نشط (${G.length})`:`تنسيق شرطي`},void 0,!1,{fileName:C,lineNumber:3661,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3651,columnNumber:7},this),(0,S.jsxDEV)(`button`,{onClick:()=>Zt(!0),className:`apk-only-actions installment-action-btn installment-action-student w-full px-2 py-1.5 bg-blue-900 text-white rounded-md text-sm sm:text-sm font-bold shadow hover:bg-blue-800 transition-colors flex items-center justify-center gap-1`,children:[(0,S.jsxDEV)(g,{className:k},void 0,!1,{fileName:C,lineNumber:3673,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:`طالب جديد`},void 0,!1,{fileName:C,lineNumber:3674,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3669,columnNumber:7},this),(0,S.jsxDEV)(`button`,{onClick:()=>Lt(!0),className:`apk-only-actions installment-action-btn installment-action-column w-full px-2 py-1.5 bg-amber-800 text-white rounded-md text-xs sm:text-sm font-bold shadow hover:bg-amber-700 transition-colors flex items-center justify-center gap-1`,children:[(0,S.jsxDEV)(g,{className:k},void 0,!1,{fileName:C,lineNumber:3681,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:`عمود جديد`},void 0,!1,{fileName:C,lineNumber:3682,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3677,columnNumber:7},this),(0,S.jsxDEV)(`button`,{onClick:()=>Re(!0),className:`apk-only-actions installment-action-btn installment-action-payment w-full px-2 py-1.5 bg-red-700 text-white rounded-md text-sm font-bold shadow hover:bg-red-800 transition-colors flex items-center justify-center gap-1 truncate`,children:[(0,S.jsxDEV)(g,{className:k,"aria-hidden":`true`},void 0,!1,{fileName:C,lineNumber:3690,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:`إضافة قسط`},void 0,!1,{fileName:C,lineNumber:3691,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3686,columnNumber:7},this),(0,S.jsxDEV)(`label`,{className:`apk-only-actions installment-action-btn installment-action-import relative w-full px-2 py-1.5 bg-white text-sky-700 rounded-md text-sm font-bold cursor-pointer shadow hover:bg-sky-50 transition-colors flex items-center justify-center gap-1 text-center ${F===null?``:`opacity-60 pointer-events-none`}`,children:[(0,S.jsxDEV)(ee,{className:k,"aria-hidden":`true`},void 0,!1,{fileName:C,lineNumber:3695,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:F===2026?`جارٍ الاستيراد…`:`استيراد`},void 0,!1,{fileName:C,lineNumber:3696,columnNumber:9},this),(0,S.jsxDEV)(`input`,{type:`file`,accept:`.xlsx,.xls`,disabled:F!==null,onChange:e=>Rn(e,2026),className:`absolute h-0 w-0 opacity-0 overflow-hidden`},void 0,!1,{fileName:C,lineNumber:3697,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3694,columnNumber:7},this),(0,S.jsxDEV)(`button`,{onClick:()=>xn(2026),className:`installment-action-btn installment-action-excel w-full ${Ee} bg-green-100 text-green-900 rounded-md font-bold shadow hover:bg-green-200 transition-colors flex items-center justify-center gap-1 text-sm`,children:[(0,S.jsxDEV)(r,{className:k},void 0,!1,{fileName:C,lineNumber:3711,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:`تصدير Excel`},void 0,!1,{fileName:C,lineNumber:3712,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3707,columnNumber:7},this),(0,S.jsxDEV)(`button`,{onClick:()=>st(2026),className:`installment-action-btn installment-action-print w-full ${Ee} bg-green-800 text-black rounded-md font-bold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-1 text-sm`,children:[(0,S.jsxDEV)(t,{className:k},void 0,!1,{fileName:C,lineNumber:3719,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:`طباعة تفصيلية`},void 0,!1,{fileName:C,lineNumber:3720,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3715,columnNumber:7},this),(0,S.jsxDEV)(pe,{title:`أقساط العام 2026`,rows:(e||[]).map(e=>{let t={...e.customData};return H.forEach(n=>{n.type===`formula`&&(t[n.name]=tn(n.formula||``,e))}),{...e,...t}}),columns:[{key:`name`,label:`اسم المتدرب`},{key:`batch`,label:`الدفعة`},{key:`specialty`,label:`المساق`},{key:`prevDue`,label:`المتبقي من 2025`},{key:`fees`,label:`الرسوم`},{key:`totalPaid`,label:`المسدد`},{key:`remaining`,label:`المتبقي`},{key:`notes`,label:`الملاحظات`},...H.map(e=>({key:e.name,label:e.name}))],fileName:`اقساط-2026`,numericKeys:[`prevDue`,`fees`,`totalPaid`,`remaining`],onClear:()=>p(),printLabel:`الأقساط/إجمالي`,pdfLayout:`wide-centered`,pdfOrientation:`landscape`,pdfMarginMm:1,pdfCss:Oe,pdfFinalCss:`
          #tableContainer table.installments-summary-2026 thead th,
          #tableContainer table.installments-summary-2026 tbody td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
          }
          #tableContainer table.installments-summary-2026 tbody tr.total-row > td,
          #tableContainer table.installments-summary-2026 tbody tr.total-row > td * {
            color: #000000 !important;
            background: #e0f2fe !important;
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            font-weight: 900 !important;
          }
        `,printRowStyle:nn,printTableClassName:`installments-summary-2026`,additionalWebActions:$n,className:`installments-summary-actions col-span-full grid grid-cols-2 gap-2 w-full 
[&>button]:w-auto 
[&>button]:min-w-auto
[&>button]:justify-center 
[&>button]:px-2 
[&>button]:py-1.5 [&>button]:text-xs [&>button]:font-bold [&>button]:rounded-md [&>button]:shadow`},void 0,!1,{fileName:C,lineNumber:3724,columnNumber:7},this),(0,S.jsxDEV)(`button`,{className:`apk-only-actions installment-action-btn installment-action-pdf min-w-auto flex-items-center justify-center gap-1 px-3 py-2 bg-[#10528e] text-white rounded-md text-sm font-bold shadow-sm hover:bg-[#0d4272] active:scale-95 transition-all disabled:opacity-50`,type:`button`,onClick:Zn,disabled:ct,title:`تصدير تقرير الأقساط التفصيلي لعام 2026`,children:[(0,S.jsxDEV)(a,{className:`${k} ${ct?`animate-pulse`:``}`},void 0,!1,{fileName:C,lineNumber:3787,columnNumber:9},this),(0,S.jsxDEV)(`span`,{children:ct?`جارٍ التحضير…`:`تصدير PDF تفصيلي`},void 0,!1,{fileName:C,lineNumber:3792,columnNumber:9},this)]},void 0,!0,{fileName:C,lineNumber:3780,columnNumber:7},this)]},void 0,!0,{fileName:C,lineNumber:3637,columnNumber:5},this)]},void 0,!0,{fileName:C,lineNumber:3624,columnNumber:3},this),(0,S.jsxDEV)(`div`,{className:`p-1 sm:p-3`,children:[(0,S.jsxDEV)(Ae,{stats:Xn,columns:3},void 0,!1,{fileName:C,lineNumber:3798,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`flex items-center justify-between gap-2 px-2 py-2 text-xs text-slate-700`,"aria-live":`polite`,children:[(0,S.jsxDEV)(`span`,{children:[`عرض `,J.length?(X-1)*E+1:0,`–`,Math.min(X*E,J.length),` من `,J.length,` سجل`]},void 0,!0,{fileName:C,lineNumber:3800,columnNumber:13},this),(0,S.jsxDEV)(`div`,{className:`flex items-center gap-2`,children:[(0,S.jsxDEV)(`button`,{type:`button`,disabled:X<=1,onClick:()=>at(e=>Math.max(1,e-1)),className:`rounded border px-2 py-1 disabled:opacity-40`,children:`السابق`},void 0,!1,{fileName:C,lineNumber:3802,columnNumber:15},this),(0,S.jsxDEV)(`span`,{children:[X,` / `,pn]},void 0,!0,{fileName:C,lineNumber:3803,columnNumber:15},this),(0,S.jsxDEV)(`button`,{type:`button`,disabled:X>=pn,onClick:()=>at(e=>Math.min(pn,e+1)),className:`rounded border px-2 py-1 disabled:opacity-40`,children:`التالي`},void 0,!1,{fileName:C,lineNumber:3804,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:3801,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:3799,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`overflow-auto max-h-[72vh] rounded-lg border border-slate-200 shadow-sm relative`,children:[(0,S.jsxDEV)(`style`,{children:`
              .installments-table-2026 tbody td[data-col-key="fees"] { background-color: #eaf2ff !important; }
              .installments-table-2026 tbody td[data-col-key="prevDue"] { background-color: #f3e8ff !important; }
              .installments-table-2026 tbody td[data-col-key="totalPaid"] { background-color: #e6f7ee !important; }
              .installments-table-2026 tbody td[data-col-key="remaining"] { background-color: #fff0f1 !important; }
              .installments-table-2026 tbody tr[data-notes-tone="red"] > td { background-color: #fecaca !important; }
              .installments-table-2026 tbody tr[data-notes-tone="yellow"] > td { background-color: #fef08a !important; }
              .installments-table-2026 tbody tr[data-notes-tone="green"] > td { background-color: #bbf7d0 !important; }
              .installments-table-2026 tbody tr[data-notes-tone="orange"] > td { background-color: #fed7aa !important; }
              .installments-table-2026 tbody tr[data-notes-tone="blue"] > td { background-color: #e0f2fe !important; }
              .installments-table-2026 tbody tr[data-notes-tone="emerald"] > td { background-color: #ecfdf5 !important; }
            `},void 0,!1,{fileName:C,lineNumber:3808,columnNumber:13},this),(0,S.jsxDEV)(`table`,{className:`installments-table installments-table-2026 w-auto min-w-auto table-auto text-xs sm:text-base font-semibold`,children:[(0,S.jsxDEV)(`thead`,{className:`bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 font-extrabold border-b-2 border-sky-700 text-black sticky top-0 z-20 shadow-md`,children:(0,S.jsxDEV)(`tr`,{children:[(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-xl sm:!text-base text-white border-l border-sky-700/30`,children:`#`},void 0,!1,{fileName:C,lineNumber:3823,columnNumber:2},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-white border-l border-sky-700/30`,onClick:()=>_n(`name`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`اسم المتدرب `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`name`},void 0,!1,{fileName:C,lineNumber:3829,columnNumber:35},this)]},void 0,!0,{fileName:C,lineNumber:3828,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3824,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,onClick:()=>_n(`batch`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`دفعة `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`batch`},void 0,!1,{fileName:C,lineNumber:3837,columnNumber:28},this)]},void 0,!0,{fileName:C,lineNumber:3836,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3832,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,onClick:()=>_n(`specialty`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`المساق `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`specialty`},void 0,!1,{fileName:C,lineNumber:3845,columnNumber:30},this)]},void 0,!0,{fileName:C,lineNumber:3844,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3840,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,onClick:()=>_n(`prevDue`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`المتبقي من 2025 `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`prevDue`},void 0,!1,{fileName:C,lineNumber:3853,columnNumber:39},this)]},void 0,!0,{fileName:C,lineNumber:3852,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3848,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,onClick:()=>_n(`fees`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`الرسوم `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`fees`},void 0,!1,{fileName:C,lineNumber:3861,columnNumber:30},this)]},void 0,!0,{fileName:C,lineNumber:3860,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3856,columnNumber:19},this),T.map(e=>(0,S.jsxDEV)(`th`,{className:`text-center border-l border-sky-700/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black`,children:e.trim()},e,!1,{fileName:C,lineNumber:3865,columnNumber:21},this)),H.map(e=>(0,S.jsxDEV)(`th`,{className:`text-center border-l border-sky-700/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black`,children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[e.name,(0,S.jsxDEV)(`button`,{onClick:()=>W({oldName:e.name,name:e.name,type:e.type,options:e.options?.join(`,`)||``,formula:e.formula||``}),className:`p-0.5 bg-black/10 hover:bg-black/20 rounded transition-all`,title:`تعديل أو حذف العمود`,children:(0,S.jsxDEV)(u,{className:k},void 0,!1,{fileName:C,lineNumber:3892,columnNumber:27},this)},void 0,!1,{fileName:C,lineNumber:3879,columnNumber:25},this)]},void 0,!0,{fileName:C,lineNumber:3877,columnNumber:2},this)},e.name,!1,{fileName:C,lineNumber:3873,columnNumber:21},this)),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,onClick:()=>_n(`totalPaid`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`مسدد 2026 `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`totalPaid`},void 0,!1,{fileName:C,lineNumber:3902,columnNumber:33},this)]},void 0,!0,{fileName:C,lineNumber:3901,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3897,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,onClick:()=>_n(`remaining`),children:(0,S.jsxDEV)(`div`,{className:`flex items-center justify-center gap-1`,children:[`الرصيد المتبقي `,(0,S.jsxDEV)(j,{sortConfig:R,columnKey:`remaining`},void 0,!1,{fileName:C,lineNumber:3910,columnNumber:38},this)]},void 0,!0,{fileName:C,lineNumber:3909,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3905,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,children:`الملاحظات`},void 0,!1,{fileName:C,lineNumber:3913,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30`,children:`حالة`},void 0,!1,{fileName:C,lineNumber:3914,columnNumber:19},this),(0,S.jsxDEV)(`th`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black`,children:`إجراءات`},void 0,!1,{fileName:C,lineNumber:3915,columnNumber:19},this)]},void 0,!0,{fileName:C,lineNumber:3822,columnNumber:17},this)},void 0,!1,{fileName:C,lineNumber:3821,columnNumber:1},this),(0,S.jsxDEV)(`tbody`,{children:J.length===0?(0,S.jsxDEV)(`tr`,{children:(0,S.jsxDEV)(`td`,{colSpan:11+T.length+H.length,className:`text-center text-slate-400 !px1 !py-1 !text-sm sm:!text-base whitespace-nowrap`,children:`لا توجد بيانات (يرجى التأكد من استيراد الملف أو تعديل البحث)`},void 0,!1,{fileName:C,lineNumber:3921,columnNumber:21},this)},void 0,!1,{fileName:C,lineNumber:3920,columnNumber:19},this):(0,S.jsxDEV)(S.Fragment,{children:[hn.map((e,n)=>{let i=zn(e.remaining),a=dn.get(e)??-1,s=sn(e),c=an(e.notes);return(0,S.jsxDEV)(`tr`,{"data-notes-tone":c||void 0,className:`border-t border-slate-200 transition-colors ${s}`,children:[(0,S.jsxDEV)(`td`,{className:`text-center text-black font-mono whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(X-1)*E+n+1},void 0,!1,{fileName:C,lineNumber:3942,columnNumber:1},this),(0,S.jsxDEV)(`td`,{className:`text-center font-bold text-black whitespace-nowrap bg-fuchsia-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(0,S.jsxDEV)(`input`,{value:e.name||``,onChange:e=>kn(a,`name`,e.target.value),className:`w-auto min-w-max bg-transparent text-center text-black font-bold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`},void 0,!1,{fileName:C,lineNumber:3946,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:3945,columnNumber:1},this),(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap bg-sky-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(0,S.jsxDEV)(`input`,{value:e.batch||``,onChange:e=>kn(a,`batch`,e.target.value),className:`w-full min-w-0 bg-transparent text-center text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`,placeholder:`—`},void 0,!1,{fileName:C,lineNumber:3955,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:3954,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap bg-sky-50/60 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(0,S.jsxDEV)(`input`,{value:e.specialty||``,onChange:e=>kn(a,`specialty`,e.target.value),className:`w-full min-w-0 bg-transparent text-center text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`,placeholder:`—`},void 0,!1,{fileName:C,lineNumber:3965,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:3964,columnNumber:27},this),(0,S.jsxDEV)(`td`,{"data-col-key":`prevDue`,className:`text-center numeric-cell font-mono text-black font-semibold bg-sky-50/40 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(0,S.jsxDEV)(`input`,{type:`text`,inputMode:`decimal`,value:b(D(e.prevDue)),onChange:e=>kn(a,`prevDue`,e.target.value),className:`w-full min-w-0 bg-transparent text-center font-mono text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`},void 0,!1,{fileName:C,lineNumber:3975,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:3974,columnNumber:27},this),(0,S.jsxDEV)(`td`,{"data-col-key":`fees`,className:`text-center numeric-cell font-mono text-black font-semibold whitespace-nowrap bg-sky-50/50 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(0,S.jsxDEV)(`input`,{type:`text`,inputMode:`decimal`,value:b(D(e.fees)),onChange:e=>kn(a,`fees`,e.target.value),className:`w-full min-w-0 bg-transparent text-center font-mono text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`},void 0,!1,{fileName:C,lineNumber:3986,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:3985,columnNumber:27},this),T.map(t=>{let n=Number(e.payments?.[t])||0,r=`${e.name}-${t}`;return(0,S.jsxDEV)(`td`,{className:`numeric-cell text-center relative bg-white/40 border-l border-slate-200 hover:bg-yellow-50 cursor-pointer group transition-colors whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,onMouseEnter:()=>Qe(r),onMouseLeave:()=>Qe(null),children:(0,S.jsxDEV)(`input`,{type:`text`,inputMode:`decimal`,value:n>0?b(n):``,onChange:e=>An(a,t,e.target.value),className:`w-full min-w-0 bg-transparent text-center numeric-cell font-mono text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`,placeholder:`—`},void 0,!1,{fileName:C,lineNumber:4006,columnNumber:33},this)},t,!1,{fileName:C,lineNumber:4e3,columnNumber:31},this)}),H.map(t=>(0,S.jsxDEV)(`td`,{className:`border-l border-slate-200 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap`,children:t.type===`select`?(0,S.jsxDEV)(`select`,{className:`w-full min-w-0 text-center text-black font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1 !text-sm sm:!text-base`,value:e.customData?.[t.name]||``,onChange:e=>jn(a,t.name,e.target.value),children:[(0,S.jsxDEV)(`option`,{value:``,children:`- اختر -`},void 0,!1,{fileName:C,lineNumber:4030,columnNumber:35},this),t.options?.map((e,t)=>(0,S.jsxDEV)(`option`,{value:e,children:e},t,!1,{fileName:C,lineNumber:4032,columnNumber:37},this))]},void 0,!0,{fileName:C,lineNumber:4023,columnNumber:33},this):t.type===`formula`?(0,S.jsxDEV)(`div`,{className:`text-center min-w-0 numeric-cell font-mono !text-sm sm:!text-base font-semibold text-yellow-700 bg-white/50 px-1 rounded`,children:b(Number(tn(t.formula||``,e)||0))},void 0,!1,{fileName:C,lineNumber:4038,columnNumber:33},this):(0,S.jsxDEV)(`input`,{type:`text`,className:`w-full min-w-0 text-center text-black font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1 !text-sm sm:!text-base`,value:e.customData?.[t.name]||``,onChange:e=>jn(a,t.name,e.target.value),placeholder:`—`},void 0,!1,{fileName:C,lineNumber:4042,columnNumber:33},this)},t.name,!1,{fileName:C,lineNumber:4021,columnNumber:29},this)),(0,S.jsxDEV)(`td`,{"data-col-key":`totalPaid`,className:`text-center numeric-cell font-mono text-black font-bold bg-emerald-50/50 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:b(Number(e.totalPaid||0))},void 0,!1,{fileName:C,lineNumber:4055,columnNumber:27},this),(0,S.jsxDEV)(`td`,{"data-col-key":`remaining`,className:`text-center numeric-cell font-mono text-black font-bold bg-rose-50/40 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:b(Number(e.remaining||0))},void 0,!1,{fileName:C,lineNumber:4058,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center bg-amber-50/40 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200 whitespace-nowrap`,children:(0,S.jsxDEV)(`input`,{type:`text`,value:e.notes||``,onChange:e=>kn(a,`notes`,e.target.value),className:`w-full min-w-0 bg-transparent text-center text-black font-medium !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1`,placeholder:`—`},void 0,!1,{fileName:C,lineNumber:4062,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:4061,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200`,children:(0,S.jsxDEV)(`span`,{className:`px-2 py-0.5 rounded-full !text-xs sm:!text-sm font-bold ${i.bg} ${i.color}`,children:i.text},void 0,!1,{fileName:C,lineNumber:4074,columnNumber:29},this)},void 0,!1,{fileName:C,lineNumber:4073,columnNumber:27},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap flex justify-center gap-1 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`,children:[(0,S.jsxDEV)(`button`,{onClick:()=>{V(e),Ft({year:2026,row:e,index:a})},className:`p-1 bg-sky-50 text-amber-600 rounded border border-amber-200 hover:bg-amber-500 hover:text-white transition-colors`,title:`تعديل الصف`,children:(0,S.jsxDEV)(m,{className:k},void 0,!1,{fileName:C,lineNumber:4089,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:4081,columnNumber:29},this),(0,S.jsxDEV)(`button`,{onClick:()=>Gn(e,2026),className:`p-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-500 hover:text-white transition-colors`,title:`طباعة الكشف`,children:(0,S.jsxDEV)(t,{className:k},void 0,!1,{fileName:C,lineNumber:4096,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:4091,columnNumber:29},this),(0,S.jsxDEV)(`button`,{onClick:()=>Hn(e),className:`p-1 bg-sky-50 text-sky-700 rounded border border-sky-200 hover:bg-sky-600 hover:text-white transition-colors`,title:`إعداد مطالبة مالية للمتدرب`,children:(0,S.jsxDEV)(o,{className:k},void 0,!1,{fileName:C,lineNumber:4103,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:4098,columnNumber:29},this),(0,S.jsxDEV)(`button`,{onClick:()=>Jn(e),className:`p-1 bg-violet-50 text-violet-700 rounded border border-violet-200 hover:bg-violet-600 hover:text-white transition-colors`,title:`معاينة كشف سداد رسوم الامتحانات والقيد والتسجيل`,children:(0,S.jsxDEV)(r,{className:k},void 0,!1,{fileName:C,lineNumber:4110,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:4105,columnNumber:29},this),(0,S.jsxDEV)(`button`,{onClick:()=>Mn(a,e.name),className:`p-1 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-500 hover:text-white transition-colors`,title:`حذف الصف`,children:(0,S.jsxDEV)(te,{className:k},void 0,!1,{fileName:C,lineNumber:4117,columnNumber:31},this)},void 0,!1,{fileName:C,lineNumber:4112,columnNumber:29},this)]},void 0,!0,{fileName:C,lineNumber:4080,columnNumber:27},this)]},n,!0,{fileName:C,lineNumber:3937,columnNumber:25},this)}),(0,S.jsxDEV)(`tr`,{className:`total-row border-t-2 border-black bg-sky-100 font-extrabold !text-black`,children:[(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,colSpan:4,children:`الإجماليات`},void 0,!1,{fileName:C,lineNumber:4124,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:b(Number(Q.prevDue||0))},void 0,!1,{fileName:C,lineNumber:4127,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:b(Number(Q.fees||0))},void 0,!1,{fileName:C,lineNumber:4130,columnNumber:23},this),T.map(e=>(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:Q.months[e]>0?b(Number(Q.months[e])):`—`},e,!1,{fileName:C,lineNumber:4135,columnNumber:25},this)),H.map(e=>(0,S.jsxDEV)(`td`,{className:`text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:`—`},e.name,!1,{fileName:C,lineNumber:4143,columnNumber:25},this)),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:b(Number(Q.paid||0))},void 0,!1,{fileName:C,lineNumber:4150,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:b(Number(Q.remaining||0))},void 0,!1,{fileName:C,lineNumber:4153,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`,children:`—`},void 0,!1,{fileName:C,lineNumber:4156,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300`},void 0,!1,{fileName:C,lineNumber:4157,columnNumber:23},this),(0,S.jsxDEV)(`td`,{className:`text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base`},void 0,!1,{fileName:C,lineNumber:4158,columnNumber:23},this)]},void 0,!0,{fileName:C,lineNumber:4123,columnNumber:21},this)]},void 0,!0,{fileName:C,lineNumber:3929,columnNumber:19},this)},void 0,!1,{fileName:C,lineNumber:3918,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:3820,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:3807,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:3797,columnNumber:1},this)]},void 0,!0,{fileName:C,lineNumber:3623,columnNumber:1},this),(0,S.jsxDEV)(A,{title:`🎨 التنسيق الشرطي للصفوف`,isOpen:Kt,onClose:()=>qt(!1),children:(0,S.jsxDEV)(`div`,{className:`space-y-20`,children:[(0,S.jsxDEV)(`p`,{className:`text-xs text-slate-500`,children:`سيتم تلوين الصف بالكامل إذا كان يحتوي على النص الذي تدخله أدناه في أي عمود.`},void 0,!1,{fileName:C,lineNumber:4177,columnNumber:11},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`النص المطلوب البحث عنه (الشرط)`},void 0,!1,{fileName:C,lineNumber:4182,columnNumber:13},this),(0,S.jsxDEV)(`input`,{type:`text`,value:Jt.text,onChange:e=>Yt({...Jt,text:e.target.value}),className:`w-full p-2 border rounded-md focus:ring-2 focus:ring-sky-300 outline-none text-sm`,placeholder:`مثال: معتمد, منسحب, مجاني...`},void 0,!1,{fileName:C,lineNumber:4185,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4181,columnNumber:11},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-2`,children:`اختر لون تمييز الصف`},void 0,!1,{fileName:C,lineNumber:4195,columnNumber:13},this),(0,S.jsxDEV)(`div`,{className:`flex gap-2`,children:[{name:`أصفر`,class:`bg-sky-100 hover:bg-sky-100`},{name:`أخضر`,class:`bg-green-100 hover:bg-green-100`},{name:`أحمر`,class:`bg-red-100 hover:bg-red-100`},{name:`أزرق`,class:`bg-blue-100 hover:bg-blue-100`},{name:`بنفسجي`,class:`bg-sky-100 hover:bg-sky-100`}].map(e=>(0,S.jsxDEV)(`button`,{onClick:()=>Yt({...Jt,color:e.class}),className:`w-8 h-8 rounded-full border-2 ${Jt.color===e.class?`border-slate-800 scale-110`:`border-transparent`} ${e.class}`,title:e.name},e.class,!1,{fileName:C,lineNumber:4206,columnNumber:17},this))},void 0,!1,{fileName:C,lineNumber:4198,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4194,columnNumber:11},this),G.length>0&&(0,S.jsxDEV)(`div`,{className:`space-y-2 border-t pt-3`,children:[(0,S.jsxDEV)(`div`,{className:`text-xs font-bold text-slate-700`,children:`القواعد الحالية`},void 0,!1,{fileName:C,lineNumber:4222,columnNumber:15},this),G.map((e,t)=>(0,S.jsxDEV)(`div`,{className:`flex items-center justify-between gap-2 bg-slate-50 border rounded-md p-2`,children:[(0,S.jsxDEV)(`span`,{className:`px-2 py-1 rounded text-xs ${e.color}`,children:e.text},void 0,!1,{fileName:C,lineNumber:4228,columnNumber:19},this),(0,S.jsxDEV)(`button`,{onClick:()=>ln(t),className:`text-red-600 hover:text-red-800 text-xs font-bold`,children:`حذف`},void 0,!1,{fileName:C,lineNumber:4229,columnNumber:19},this)]},`${e.text}-${t}`,!0,{fileName:C,lineNumber:4224,columnNumber:17},this))]},void 0,!0,{fileName:C,lineNumber:4221,columnNumber:13},this),(0,S.jsxDEV)(`div`,{className:`flex justify-between items-center pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{onClick:()=>{Yt({text:``,color:`bg-sky-100`}),Me([]),qt(!1)},className:`px-3 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-100`,children:`إلغاء التنسيق تماماً`},void 0,!1,{fileName:C,lineNumber:4241,columnNumber:13},this),(0,S.jsxDEV)(`div`,{className:`flex gap-2`,children:[(0,S.jsxDEV)(`button`,{onClick:cn,className:`px-3 py-1 bg-amber-500 text-white rounded-md font-bold text-sm`,children:`إضافة قاعدة`},void 0,!1,{fileName:C,lineNumber:4252,columnNumber:15},this),(0,S.jsxDEV)(`button`,{onClick:()=>qt(!1),className:`px-3 py-1 bg-sky-700 text-white rounded-md font-bold text-sm`,children:`إغلاق`},void 0,!1,{fileName:C,lineNumber:4258,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4251,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4240,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:4176,columnNumber:9},this)},void 0,!1,{fileName:C,lineNumber:4171,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`⚙️ تعديل العمود: ${U?.oldName}`,isOpen:!!U,onClose:()=>W(null),children:U&&(0,S.jsxDEV)(`form`,{onSubmit:En,className:`space-y-3`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`اسم العمود`},void 0,!1,{fileName:C,lineNumber:4277,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:U.name,onChange:e=>W({...U,name:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4278,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4276,columnNumber:13},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`نوع العمود`},void 0,!1,{fileName:C,lineNumber:4288,columnNumber:15},this),(0,S.jsxDEV)(`select`,{value:U.type,onChange:e=>W({...U,type:e.target.value}),className:`w-full p-2 border rounded-md text-sm`,children:[(0,S.jsxDEV)(`option`,{value:`text`,children:`نص أو رقم حر (إدخال يدوي)`},void 0,!1,{fileName:C,lineNumber:4294,columnNumber:17},this),(0,S.jsxDEV)(`option`,{value:`select`,children:`قائمة منسدلة (خيارات محددة)`},void 0,!1,{fileName:C,lineNumber:4295,columnNumber:17},this),(0,S.jsxDEV)(`option`,{value:`formula`,children:`معادلة رياضية دالة (حساب تلقائي)`},void 0,!1,{fileName:C,lineNumber:4296,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4289,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4287,columnNumber:13},this),U.type===`select`&&(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الخيارات (افصل بينها بفاصلة)`},void 0,!1,{fileName:C,lineNumber:4302,columnNumber:17},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:U.options,onChange:e=>W({...U,options:e.target.value}),className:`w-full p-2 border rounded-md text-sm`,placeholder:`مثال: معتمد, غير معتمد`},void 0,!1,{fileName:C,lineNumber:4305,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4301,columnNumber:15},this),U.type===`formula`&&(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المعادلة (استخدم المتغيرات الإنجليزية)`},void 0,!1,{fileName:C,lineNumber:4318,columnNumber:17},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:U.formula,onChange:e=>W({...U,formula:e.target.value}),className:`w-full p-2 border rounded-md text-left text-sm`,dir:`ltr`},void 0,!1,{fileName:C,lineNumber:4321,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4317,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`flex justify-between items-center pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Dn(U.oldName),className:`px-3 py-1 bg-red-100 text-red-700 rounded-md flex items-center gap-1 font-bold text-sm`,children:[(0,S.jsxDEV)(te,{className:k},void 0,!1,{fileName:C,lineNumber:4338,columnNumber:17},this),` حذف العمود`]},void 0,!0,{fileName:C,lineNumber:4333,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`flex gap-2`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>W(null),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4341,columnNumber:17},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-sm`,children:`حفظ التعديل`},void 0,!1,{fileName:C,lineNumber:4348,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4340,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4332,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4275,columnNumber:11},this)},void 0,!1,{fileName:C,lineNumber:4269,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`✏️ تعديل بيانات المتدرب (${z?.year})`,isOpen:!!z,onClose:()=>Ft(null),children:(0,S.jsxDEV)(`form`,{onSubmit:wn,className:`space-y-3`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`اسم المتدرب`},void 0,!1,{fileName:C,lineNumber:4367,columnNumber:13},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:B?.name||``,onChange:e=>V({...B,name:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4368,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4366,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`grid grid-cols-2 gap-2`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الدفعة`},void 0,!1,{fileName:C,lineNumber:4378,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,value:B?.batch||``,onChange:e=>V({...B,batch:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4379,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4377,columnNumber:13},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المساق`},void 0,!1,{fileName:C,lineNumber:4387,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,value:B?.specialty||``,onChange:e=>V({...B,specialty:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4388,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4386,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4376,columnNumber:11},this),z?.year===2025&&(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الرسوم الكلية`},void 0,!1,{fileName:C,lineNumber:4398,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`number`,value:B?.fees||0,onChange:e=>V({...B,fees:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4401,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4397,columnNumber:13},this),z?.year===2026&&(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المتبقي من 2025 (المدور)`},void 0,!1,{fileName:C,lineNumber:4411,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`number`,value:B?.prevDue||0,onChange:e=>V({...B,prevDue:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4414,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4410,columnNumber:13},this),(0,S.jsxDEV)(`div`,{className:`flex justify-end gap-2 pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Ft(null),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4423,columnNumber:13},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-amber-600 text-white rounded-md font-bold text-sm`,children:`حفظ التعديلات`},void 0,!1,{fileName:C,lineNumber:4430,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4422,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:4365,columnNumber:9},this)},void 0,!1,{fileName:C,lineNumber:4360,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`➕ إضافة عمود جديد (2026)`,isOpen:It,onClose:()=>Lt(!1),children:(0,S.jsxDEV)(`form`,{onSubmit:Tn,className:`space-y-3`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`اسم العمود`},void 0,!1,{fileName:C,lineNumber:4447,columnNumber:13},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:Rt,onChange:e=>zt(e.target.value),className:`w-full p-2 border rounded-md text-sm`,autoFocus:!0,placeholder:`مثل: حالة الاعتماد، الخصم...`},void 0,!1,{fileName:C,lineNumber:4448,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4446,columnNumber:11},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`نوع العمود`},void 0,!1,{fileName:C,lineNumber:4460,columnNumber:13},this),(0,S.jsxDEV)(`select`,{value:Bt,onChange:e=>Vt(e.target.value),className:`w-full p-2 border rounded-md text-sm`,children:[(0,S.jsxDEV)(`option`,{value:`text`,children:`نص أو رقم حر (إدخال يدوي)`},void 0,!1,{fileName:C,lineNumber:4466,columnNumber:15},this),(0,S.jsxDEV)(`option`,{value:`select`,children:`قائمة منسدلة (خيارات محددة)`},void 0,!1,{fileName:C,lineNumber:4467,columnNumber:15},this),(0,S.jsxDEV)(`option`,{value:`formula`,children:`معادلة رياضية دالة (حساب تلقائي)`},void 0,!1,{fileName:C,lineNumber:4468,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4461,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4459,columnNumber:11},this),Bt===`select`&&(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الخيارات (افصل بينها بفاصلة)`},void 0,!1,{fileName:C,lineNumber:4474,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:Ht,onChange:e=>Ut(e.target.value),className:`w-full p-2 border rounded-md text-sm`,placeholder:`مثال: معتمد, غير معتمد, قيد المراجعة`},void 0,!1,{fileName:C,lineNumber:4477,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4473,columnNumber:13},this),Bt===`formula`&&(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المعادلة (استخدم المتغيرات الإنجليزية)`},void 0,!1,{fileName:C,lineNumber:4490,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:Wt,onChange:e=>Gt(e.target.value),className:`w-full p-2 border rounded-md text-left text-sm`,dir:`ltr`,placeholder:`مثال: fees - totalPaid`},void 0,!1,{fileName:C,lineNumber:4493,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4489,columnNumber:13},this),(0,S.jsxDEV)(`div`,{className:`flex justify-end gap-2 pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Lt(!1),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4506,columnNumber:13},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-amber-600 text-white rounded-md font-bold text-sm`,children:`إضافة العمود`},void 0,!1,{fileName:C,lineNumber:4513,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4505,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:4445,columnNumber:9},this)},void 0,!1,{fileName:C,lineNumber:4440,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`➕ إضافة طالب جديد لعام 2026`,isOpen:Xt,onClose:()=>Zt(!1),children:(0,S.jsxDEV)(`form`,{onSubmit:Nn,className:`space-y-3`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`اسم المتدرب *`},void 0,!1,{fileName:C,lineNumber:4527,columnNumber:13},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,value:K.name,onChange:e=>Qt({...K,name:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4528,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4526,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`grid grid-cols-2 gap-2`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الدفعة`},void 0,!1,{fileName:C,lineNumber:4538,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,value:K.batch,onChange:e=>Qt({...K,batch:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4539,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4537,columnNumber:13},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المساق`},void 0,!1,{fileName:C,lineNumber:4547,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`text`,value:K.specialty,onChange:e=>Qt({...K,specialty:e.target.value}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4548,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4546,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4536,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`grid grid-cols-2 gap-2`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الرسوم الكلية`},void 0,!1,{fileName:C,lineNumber:4560,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`number`,value:K.fees,onChange:e=>Qt({...K,fees:Number(e.target.value)}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4563,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4559,columnNumber:13},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المتبقي من 2025`},void 0,!1,{fileName:C,lineNumber:4573,columnNumber:15},this),(0,S.jsxDEV)(`input`,{type:`number`,value:K.prevDue,onChange:e=>Qt({...K,prevDue:Number(e.target.value)}),className:`w-full p-2 border rounded-md text-sm`},void 0,!1,{fileName:C,lineNumber:4576,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4572,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4558,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`flex justify-end gap-2 pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Zt(!1),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4587,columnNumber:13},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-sm`,children:`إضافة المتدرب`},void 0,!1,{fileName:C,lineNumber:4594,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4586,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:4525,columnNumber:9},this)},void 0,!1,{fileName:C,lineNumber:4520,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`➕ إضافة قسط جديد - 2026`,isOpen:Le,onClose:()=>Re(!1),children:(0,S.jsxDEV)(`form`,{onSubmit:Fn,className:`space-y-3`,children:[(0,S.jsxDEV)(`div`,{className:`relative`,children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`اسم المتدرب *`},void 0,!1,{fileName:C,lineNumber:4608,columnNumber:13},this),(0,S.jsxDEV)(`input`,{type:`text`,required:!0,placeholder:`ابحث عن الاسم`,value:ze,onChange:e=>yn(e.target.value),onFocus:()=>ze.length>0&&Ze(!0),className:`w-full p-2 border rounded-md text-sm outline-none`},void 0,!1,{fileName:C,lineNumber:4609,columnNumber:13},this),Xe&&Je.length>0&&(0,S.jsxDEV)(`div`,{className:`absolute top-full right-0 left-0 bg-white border rounded-b-md shadow-xl z-50 max-h-32 overflow-y-auto text-sm`,children:Je.map((e,t)=>(0,S.jsxDEV)(`div`,{onClick:()=>{Be(e),Ze(!1)},className:`p-2 hover:bg-sky-50 cursor-pointer text-slate-800`,children:e},t,!1,{fileName:C,lineNumber:4621,columnNumber:19},this))},void 0,!1,{fileName:C,lineNumber:4619,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4607,columnNumber:11},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المبلغ المالي *`},void 0,!1,{fileName:C,lineNumber:4636,columnNumber:13},this),(0,S.jsxDEV)(`input`,{type:`number`,required:!0,value:Ve,onChange:e=>He(e.target.value),className:`w-full p-2 border rounded-md text-sm`,min:`0`,step:`0.01`},void 0,!1,{fileName:C,lineNumber:4639,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4635,columnNumber:11},this),(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`الشهر المستهدف *`},void 0,!1,{fileName:C,lineNumber:4650,columnNumber:13},this),(0,S.jsxDEV)(`select`,{required:!0,value:Ue,onChange:e=>We(e.target.value),className:`w-full p-2 border rounded-md text-sm`,children:[(0,S.jsxDEV)(`option`,{value:``,children:`-- اختر الشهر --`},void 0,!1,{fileName:C,lineNumber:4659,columnNumber:15},this),T.map(e=>(0,S.jsxDEV)(`option`,{value:e,children:e.trim()},e,!1,{fileName:C,lineNumber:4661,columnNumber:17},this))]},void 0,!0,{fileName:C,lineNumber:4653,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4649,columnNumber:11},this),(0,S.jsxDEV)(`div`,{className:`flex justify-end gap-2 pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Re(!1),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4668,columnNumber:13},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-sky-700 text-white rounded-md font-bold text-sm`,children:`حفظ`},void 0,!1,{fileName:C,lineNumber:4675,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4667,columnNumber:11},this)]},void 0,!0,{fileName:C,lineNumber:4606,columnNumber:9},this)},void 0,!1,{fileName:C,lineNumber:4601,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`💵 تسجيل دفعة مالية`,isOpen:!!N,onClose:()=>Pe(null),children:N&&(0,S.jsxDEV)(S.Fragment,{children:[(0,S.jsxDEV)(`div`,{className:`bg-emerald-50 border border-emerald-200 rounded-md p-3 text-slate-800 text-sm`,children:[(0,S.jsxDEV)(`p`,{children:[(0,S.jsxDEV)(`b`,{children:`المتدرب:`},void 0,!1,{fileName:C,lineNumber:4694,columnNumber:17},this),` `,N.row.name]},void 0,!0,{fileName:C,lineNumber:4693,columnNumber:15},this),(0,S.jsxDEV)(`p`,{children:[(0,S.jsxDEV)(`b`,{children:`شهر:`},void 0,!1,{fileName:C,lineNumber:4697,columnNumber:17},this),` `,N.month]},void 0,!0,{fileName:C,lineNumber:4696,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4692,columnNumber:13},this),(0,S.jsxDEV)(`form`,{onSubmit:Pn,className:`space-y-3 mt-3`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المبلغ المدفوع *`},void 0,!1,{fileName:C,lineNumber:4702,columnNumber:17},this),(0,S.jsxDEV)(`input`,{type:`number`,required:!0,value:Fe,onChange:e=>Ie(e.target.value),className:`w-full p-2 border rounded-md text-sm`,autoFocus:!0,min:`0`,step:`0.01`},void 0,!1,{fileName:C,lineNumber:4705,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4701,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`flex justify-end gap-2 pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Pe(null),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4717,columnNumber:17},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-emerald-600 text-white rounded-md font-bold text-sm`,children:`تأكيد التوريد`},void 0,!1,{fileName:C,lineNumber:4724,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4716,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4700,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4691,columnNumber:11},this)},void 0,!1,{fileName:C,lineNumber:4685,columnNumber:7},this),(0,S.jsxDEV)(A,{title:`✏️ مراجعة وتعديل القسط`,isOpen:!!P,onClose:()=>Ge(null),children:P&&(0,S.jsxDEV)(S.Fragment,{children:[(0,S.jsxDEV)(`div`,{className:`bg-blue-50 border border-blue-200 rounded-md p-3 text-slate-800 text-sm`,children:[(0,S.jsxDEV)(`p`,{className:`font-bold`,children:P.row.name},void 0,!1,{fileName:C,lineNumber:4744,columnNumber:15},this),(0,S.jsxDEV)(`p`,{children:[`بيان شهر: `,P.month]},void 0,!0,{fileName:C,lineNumber:4745,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4743,columnNumber:13},this),(0,S.jsxDEV)(`form`,{onSubmit:In,className:`space-y-3 mt-3`,children:[(0,S.jsxDEV)(`div`,{children:[(0,S.jsxDEV)(`label`,{className:`block text-xs font-semibold text-slate-700 mb-1`,children:`المبلغ المعدل *`},void 0,!1,{fileName:C,lineNumber:4749,columnNumber:17},this),(0,S.jsxDEV)(`input`,{type:`number`,required:!0,value:Ke,onChange:e=>qe(e.target.value),className:`w-full p-2 border rounded-md text-sm`,min:`0`,step:`0.01`},void 0,!1,{fileName:C,lineNumber:4752,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4748,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`flex justify-end gap-2 pt-3 border-t mt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Ge(null),className:`px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm`,children:`إلغاء`},void 0,!1,{fileName:C,lineNumber:4763,columnNumber:17},this),(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>Ln(P.row,P.month),className:`px-3 py-1 bg-red-600 text-white rounded-md text-sm`,children:`🗑️ حذف القسط`},void 0,!1,{fileName:C,lineNumber:4770,columnNumber:17},this),(0,S.jsxDEV)(`button`,{type:`submit`,className:`px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-sm`,children:`حفظ التعديل`},void 0,!1,{fileName:C,lineNumber:4777,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4762,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4747,columnNumber:13},this)]},void 0,!0,{fileName:C,lineNumber:4742,columnNumber:11},this)},void 0,!1,{fileName:C,lineNumber:4736,columnNumber:7},this),I&&(()=>{let e=I.registrationPaid<=0,n=I.examPaid<=0,r=[{label:`رسوم القيد والتسجيل`,amount:dt&&e?Math.max(0,xt):0},{label:`رسوم امتحان الكتابي الأول`,amount:pt&&n?Math.max(0,Ct):0},{label:`رسوم امتحان الكتابي النهائي`,amount:ht?3e4:0},{label:`رسوم امتحان العلمي الشفوي`,amount:_t?1e5:0},{label:`رسوم امتحان شفوي/سريري`,amount:yt?3e4:0}].filter(e=>e.amount>0);return(0,S.jsxDEV)(`div`,{className:`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3`,role:`presentation`,onMouseDown:e=>{e.target===e.currentTarget&&ut(null)},children:(0,S.jsxDEV)(`section`,{className:`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`installment-fee-demand-title`,dir:`rtl`,children:[(0,S.jsxDEV)(`div`,{className:`mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3`,children:[(0,S.jsxDEV)(`h2`,{id:`installment-fee-demand-title`,className:`text-lg font-black text-slate-900`,children:`مطالبة مالية للمتدرب`},void 0,!1,{fileName:C,lineNumber:4804,columnNumber:17},this),(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>ut(null),className:`rounded-lg p-2 text-slate-600 hover:bg-slate-100`,"aria-label":`إغلاق`,children:(0,S.jsxDEV)(f,{className:`h-5 w-5`},void 0,!1,{fileName:C,lineNumber:4805,columnNumber:161},this)},void 0,!1,{fileName:C,lineNumber:4805,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4803,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-right`,children:[(0,S.jsxDEV)(`h3`,{className:`mb-2 font-black text-slate-800`,children:`تحديد الرسوم المطلوب إدراجها في المطالبة`},void 0,!1,{fileName:C,lineNumber:4808,columnNumber:17},this),(0,S.jsxDEV)(`div`,{className:`grid gap-3 sm:grid-cols-2`,children:[e&&(0,S.jsxDEV)(`label`,{className:`flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800`,children:[(0,S.jsxDEV)(`input`,{type:`checkbox`,checked:dt,onChange:e=>ft(e.target.checked)},void 0,!1,{fileName:C,lineNumber:4810,columnNumber:134},this),(0,S.jsxDEV)(`span`,{className:`flex-1`,children:`رسوم القيد والتسجيل`},void 0,!1,{fileName:C,lineNumber:4810,columnNumber:274},this),(0,S.jsxDEV)(`input`,{type:`number`,min:`0`,value:xt,onChange:e=>St(Math.max(0,Number(e.target.value)||0)),className:`w-24 rounded border border-slate-300 px-2 py-1 text-center`,"aria-label":`مبلغ رسوم القيد والتسجيل`},void 0,!1,{fileName:C,lineNumber:4810,columnNumber:325},this),(0,S.jsxDEV)(`span`,{children:`ريال`},void 0,!1,{fileName:C,lineNumber:4810,columnNumber:600},this)]},void 0,!0,{fileName:C,lineNumber:4810,columnNumber:42},this),n&&(0,S.jsxDEV)(`label`,{className:`flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800`,children:[(0,S.jsxDEV)(`input`,{type:`checkbox`,checked:pt,onChange:e=>mt(e.target.checked)},void 0,!1,{fileName:C,lineNumber:4811,columnNumber:126},this),(0,S.jsxDEV)(`span`,{className:`flex-1`,children:`رسوم امتحان الكتابي الأول`},void 0,!1,{fileName:C,lineNumber:4811,columnNumber:250},this),(0,S.jsxDEV)(`input`,{type:`number`,min:`0`,value:Ct,onChange:e=>wt(Math.max(0,Number(e.target.value)||0)),className:`w-24 rounded border border-slate-300 px-2 py-1 text-center`,"aria-label":`مبلغ رسوم امتحان الكتابي الأول`},void 0,!1,{fileName:C,lineNumber:4811,columnNumber:307},this),(0,S.jsxDEV)(`span`,{children:`ريال`},void 0,!1,{fileName:C,lineNumber:4811,columnNumber:572},this)]},void 0,!0,{fileName:C,lineNumber:4811,columnNumber:34},this),(0,S.jsxDEV)(`label`,{className:`flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800`,children:[(0,S.jsxDEV)(`input`,{type:`checkbox`,checked:ht,onChange:e=>gt(e.target.checked)},void 0,!1,{fileName:C,lineNumber:4812,columnNumber:111},this),(0,S.jsxDEV)(`span`,{className:`flex-1`,children:`رسوم امتحان الكتابي النهائي`},void 0,!1,{fileName:C,lineNumber:4812,columnNumber:251},this),(0,S.jsxDEV)(`strong`,{className:`whitespace-nowrap`,children:`30,000 ريال`},void 0,!1,{fileName:C,lineNumber:4812,columnNumber:310},this)]},void 0,!0,{fileName:C,lineNumber:4812,columnNumber:19},this),(0,S.jsxDEV)(`label`,{className:`flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800`,children:[(0,S.jsxDEV)(`input`,{type:`checkbox`,checked:_t,onChange:e=>vt(e.target.checked)},void 0,!1,{fileName:C,lineNumber:4813,columnNumber:111},this),(0,S.jsxDEV)(`span`,{className:`flex-1`,children:`رسوم امتحان العلمي الشفوي`},void 0,!1,{fileName:C,lineNumber:4813,columnNumber:255},this),(0,S.jsxDEV)(`strong`,{className:`whitespace-nowrap`,children:`100,000 ريال`},void 0,!1,{fileName:C,lineNumber:4813,columnNumber:312},this)]},void 0,!0,{fileName:C,lineNumber:4813,columnNumber:19},this),(0,S.jsxDEV)(`label`,{className:`flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800`,children:[(0,S.jsxDEV)(`input`,{type:`checkbox`,checked:yt,onChange:e=>bt(e.target.checked)},void 0,!1,{fileName:C,lineNumber:4814,columnNumber:111},this),(0,S.jsxDEV)(`span`,{className:`flex-1`,children:`رسوم امتحان شفوي/سريري`},void 0,!1,{fileName:C,lineNumber:4814,columnNumber:251},this),(0,S.jsxDEV)(`strong`,{className:`whitespace-nowrap`,children:`30,000 ريال`},void 0,!1,{fileName:C,lineNumber:4814,columnNumber:305},this)]},void 0,!0,{fileName:C,lineNumber:4814,columnNumber:19},this)]},void 0,!0,{fileName:C,lineNumber:4809,columnNumber:17},this),(0,S.jsxDEV)(`p`,{className:`mt-2 text-xs text-slate-600`,children:`يُدرج في المطالبة ما تختاره فقط من الرسوم غير المسددة، ويمكن تعديل مبلغ كل رسم قبل الطباعة. الخيار الافتراضي هو رسوم امتحان الكتابي الأول فقط.`},void 0,!1,{fileName:C,lineNumber:4816,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4807,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`space-y-3 text-sm leading-8 text-slate-900 text-center`,children:[(0,S.jsxDEV)(`p`,{className:`text-left`,children:[`التاريخ: `,M]},void 0,!0,{fileName:C,lineNumber:4819,columnNumber:17},this),(0,S.jsxDEV)(`p`,{children:[`الأخ الدكتور/ `,(0,S.jsxDEV)(`strong`,{children:I.name},void 0,!1,{fileName:C,lineNumber:4820,columnNumber:34},this),`\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0المحترم،`]},void 0,!0,{fileName:C,lineNumber:4820,columnNumber:17},this),(0,S.jsxDEV)(`p`,{children:`تحية طيبة وبعد،`},void 0,!1,{fileName:C,lineNumber:4821,columnNumber:17},this),r.length?(0,S.jsxDEV)(S.Fragment,{children:[(0,S.jsxDEV)(`p`,{children:(0,S.jsxDEV)(`strong`,{children:`الموضوع: مطالبة بسداد الرسوم غير المسددة`},void 0,!1,{fileName:C,lineNumber:4822,columnNumber:44},this)},void 0,!1,{fileName:C,lineNumber:4822,columnNumber:41},this),(0,S.jsxDEV)(`ul`,{className:`list-disc space-y-1 pr-6`,children:r.map(e=>(0,S.jsxDEV)(`li`,{children:[e.label,`: `,(0,S.jsxDEV)(`strong`,{children:[e.amount.toLocaleString(`en-US`),` ريال`]},void 0,!0,{fileName:C,lineNumber:4822,columnNumber:205},this)]},e.label,!0,{fileName:C,lineNumber:4822,columnNumber:172},this))},void 0,!1,{fileName:C,lineNumber:4822,columnNumber:105},this),(0,S.jsxDEV)(`p`,{children:`نرجو المبادرة إلى سداد الرسوم المستحقة المحددة أعلاه وغير المسددة أو المتأخرة، ومراجعة الإدارة المالية بالمجلس اليمني للاختصاصات الطبية – فرع صعدة لتوثيق السداد.`},void 0,!1,{fileName:C,lineNumber:4822,columnNumber:275},this),(0,S.jsxDEV)(`p`,{children:`وفي حال عدم السداد، سيتم اتخاذ الإجراءات اللازمة وفقاً للوائح والأنظمة المعمول بها.`},void 0,!1,{fileName:C,lineNumber:4822,columnNumber:443},this)]},void 0,!0,{fileName:C,lineNumber:4822,columnNumber:39},this):(0,S.jsxDEV)(`p`,{className:`rounded-lg bg-emerald-50 p-3 font-bold text-emerald-800`,children:`لا توجد رسوم مستحقة غير مسددة على هذا المتدرب، لذا لا يمكن إصدار مطالبة مالية له.`},void 0,!1,{fileName:C,lineNumber:4822,columnNumber:539},this),(0,S.jsxDEV)(`p`,{children:`شاكرين لكم حسن تعاونكم، وتفضلوا بقبول خالص الشكر والتقدير.`},void 0,!1,{fileName:C,lineNumber:4823,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4818,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`mt-5 grid gap-3 sm:grid-cols-3`,children:[[`department`,`الصندوق`],[`director`,`الشؤون المالية`],[`signer`,`رئيس المجلس اليمني للاختصاصات الطبية / فرع صعدة`]].map(([e,t])=>(0,S.jsxDEV)(`label`,{className:`flex flex-col gap-1 text-xs font-bold text-slate-700 text-center`,children:[t,(0,S.jsxDEV)(`input`,{type:`text`,value:Tt[e],onChange:t=>{let n={...Tt,[e]:t.target.value};Et(n);try{localStorage.setItem(`reports-fee-demand-signatures-v1`,JSON.stringify(n))}catch{}},className:`min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 text-center`,placeholder:`أدخل `+t},void 0,!1,{fileName:C,lineNumber:4829,columnNumber:21},this),(0,S.jsxDEV)(`span`,{className:`mt-3 h-5 border-b border-dotted border-slate-500`},void 0,!1,{fileName:C,lineNumber:4834,columnNumber:21},this)]},e,!0,{fileName:C,lineNumber:4827,columnNumber:19},this))},void 0,!1,{fileName:C,lineNumber:4825,columnNumber:15},this),(0,S.jsxDEV)(`div`,{className:`mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4`,children:[(0,S.jsxDEV)(`button`,{type:`button`,onClick:()=>ut(null),className:`rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50`,children:`إغلاق`},void 0,!1,{fileName:C,lineNumber:4839,columnNumber:17},this),(0,S.jsxDEV)(`button`,{type:`button`,disabled:!r.length,onClick:Un,className:`inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400`,children:[(0,S.jsxDEV)(t,{className:`h-4 w-4`},void 0,!1,{fileName:C,lineNumber:4840,columnNumber:266},this),` معاينة وطباعة المطالبة`]},void 0,!0,{fileName:C,lineNumber:4840,columnNumber:17},this)]},void 0,!0,{fileName:C,lineNumber:4838,columnNumber:15},this)]},void 0,!0,{fileName:C,lineNumber:4802,columnNumber:13},this)},void 0,!1,{fileName:C,lineNumber:4801,columnNumber:11},this)})(),(0,S.jsxDEV)(me,{open:ot!==null,year:ot??2026,columnOptions:Sn(ot??2026),onClose:()=>st(null),onPrint:e=>Cn(ot??2026,e)},void 0,!1,{fileName:C,lineNumber:4846,columnNumber:7},this)]},void 0,!0,{fileName:C,lineNumber:3343,columnNumber:5},this)}export{je as default};