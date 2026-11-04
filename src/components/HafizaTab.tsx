import React, { useMemo, useState } from "react";
import { useStore, type Trainee } from "@/lib/store";
import { fmt, today } from "@/lib/format";
import { DESCRIPTIONS } from "@/lib/accounts";
import { toast } from "sonner";
import ImportButton from "./ImportButton";
import { useTableControls, sortIndicator } from "@/hooks/useTableControls";
import {
  X,
  Plus,
  Trash2,
  Save,
  Eraser,
  CheckSquare,
  Calendar,
  Hash,
  FileText,
  User,
  Sparkles,
  Wallet,
  CreditCard,
  ScrollText,
} from "lucide-react";
import TabActions, { greenPrintHeaderCss } from "./TabActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// تدرجات الألوان العصرية
const PALETTE = ["#4f46e5", "#0284c7", "#059669", "#d97706", "#e11d48"];

const COLS = [
  { key: "name", label: "الاسم" },
  { key: "batch", label: "الدفعة" },
  { key: "specialty", label: "التخصص" },
  { key: "date", label: "التاريخ" },
  { key: "hafizaNo", label: "رقم الحافظة" },
  { key: "description", label: "البيان" },
  { key: "hafizaAmount", label: "مبلغ الحافظة" },
  { key: "notifyDate", label: "تاريخ التوريد" },
  { key: "notifyNo", label: "رقم الاشعار" },
  { key: "notifyAmount", label: "مبلغ التوريد" },
];

type Form = {
  name: string;
  batch: string;
  specialty: string;
  date: string;
  hafizaNo: string;
  description: string;
  hafizaAmount: string;
  notifyDate: string;
  notifyNo: string;
  notifyAmount: string;
};

const empty: Form = {
  name: "",
  batch: "",
  specialty: "",
  date: today(),
  hafizaNo: "",
  description: "",
  hafizaAmount: "",
  notifyDate: "",
  notifyNo: "",
  notifyAmount: "",
};

export default function HafizaTab() {
  const { trainees, hafiza, addHafiza, deleteHafiza, clearHafiza, addTrainee, updateHafiza } =
    useStore();
  const [form, setForm] = useState<Form>(empty);
  const [nameQuery, setNameQuery] = useState("");
  const [showSugg, setShowSugg] = useState(false);

  const [activeCell, setActiveCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [cellValue, setCellValue] = useState("");

  const [showForm, setShowForm] = useState(true);

  const { rows: filtered, sortKey, sortDir, toggleSort, filters, setFilter, clearFilters } =
    useTableControls(hafiza, COLS.map((c) => c.key));

  const totalHafizaAmount = useMemo(
    () => filtered.reduce((sum, item) => sum + (Number(item.hafizaAmount) || 0), 0),
    [filtered],
  );

  const totalNotifyAmount = useMemo(
    () => filtered.reduce((sum, item) => sum + (Number(item.notifyAmount) || 0), 0),
    [filtered],
  );

  const nameSuggestions = useMemo(() => {
    const q = nameQuery.trim();
    if (!q) return trainees.slice(0, 8);
    return trainees.filter((t) => t.name.includes(q)).slice(0, 8);
  }, [trainees, nameQuery]);

  const pickName = (t: Trainee) => {
    setForm((f) => ({ ...f, name: t.name, batch: t.batch, specialty: t.specialty }));
    setNameQuery(t.name);
    setShowSugg(false);
  };

  const submit = () => {
    const amount = Number(form.hafizaAmount) || 0;
    const notifyAmt = Number(form.notifyAmount) || 0;

    if (!form.name || !form.hafizaNo) {
      toast.error("يرجى إدخال الاسم ورقم الحافظة على الأقل");
      return;
    }

    addHafiza({
      name: form.name,
      batch: form.batch,
      specialty: form.specialty,
      date: form.date,
      hafizaNo: form.hafizaNo,
      description: form.description,
      hafizaAmount: amount,
      notifyDate: form.notifyDate,
      notifyNo: form.notifyNo,
      notifyAmount: notifyAmt,
    });

    if (!trainees.find((t) => t.name === form.name)) {
      addTrainee({ name: form.name, batch: form.batch, specialty: form.specialty });
    }

    toast.success("تم حفظ الحافظة وترحيل البيانات بنجاح");
    setForm(empty);
    setNameQuery("");
    setShowForm(false);
  };

  const handleClearHafiza = () => {
    if (hafiza.length === 0) {
      toast.info("لا توجد سجلات حوافظ لمسحها");
      return;
    }
    if (!confirm("هل أنت متأكد من مسح جميع سجلات الحوافظ؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    clearHafiza();
    setActiveCell(null);
    toast.success("تم مسح جميع سجلات الحوافظ بنجاح");
  };

  const handleCopyAmountsToNotify = () => {
    if (filtered.length === 0) {
      toast.error("لا توجد سجلات حالية لنقل مبالغها");
      return;
    }
    filtered.forEach((row) => {
      updateHafiza(row.id, { ...row, notifyAmount: Number(row.hafizaAmount) || 0 });
    });
    toast.success(`تمت تسوية ونسخ المبالغ لـ (${filtered.length}) سجل بنجاح!`);
  };

  const handleCellClick = (rowId: string, colKey: string, currentVal: unknown) => {
    setActiveCell({ rowId, colKey });
    setCellValue(String(currentVal ?? ""));
  };

  const handleCellSave = (row: Record<string, unknown> & { id: string }) => {
    if (!activeCell) return;

    const { colKey, rowId } = activeCell;
    let finalVal: string | number = cellValue;

    if (colKey === "hafizaAmount" || colKey === "notifyAmount") {
      finalVal = Number(cellValue) || 0;
    }

    updateHafiza(rowId, { ...row, [colKey]: finalVal });
    setActiveCell(null);
    toast.success("تم تحديث الخلية تلقائياً");
  };

  return (
    <div
      className="mizan-hafiza-tab w-full min-h-auto p-2 sm:p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50/40 text-slate-800"
      dir="rtl"
    >
      {/* الترويسة الرئيسية */}
<div className="rounded-2xl p-3.5 mb-3.5 bg-[#FFC194] border border-black shadow-xs">
        <div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-500/30">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
<h1 className="text-lg font-extrabold text-[#4D0000]">تبويب حــوافـظ
التوريـد</h1>
  <p className="text-[15px] sm:text-xs text-slate-600">إدارة وتدقيق حوافظ التوريد</p>
          </div>
        </div>
      </div>

      {/* شريط الأزرار الرئيسي - كل سطر يحتوي على زرين */}
      <div className="mb-3.5 backdrop-blur-md p-3 rounded-2xl border border-black shadow-md">
        <div className="grid grid-cols-2 gap-2.5">
          {/* السطر 1: زر النموذج وزر نسخ المبالغ */}
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-[#FFD7D7] bg-[#290B8E] shadow-xs shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40 active:scale-95 transition-all"
          >
 <Plus className="w-4 h-4" />
     {showForm ? "إخفاء النموذج" : "إضافة حافظة"}
          </button>

          <button
            type="button"
            onClick={handleCopyAmountsToNotify}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border border-black text-white bg-[#870808] shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/40 active:scale-95 transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            نسخ للإشعار
          </button>

          {/* السطر 2: زر الاستيراد وزر مسح الكل */}
          <div className="flex items-center justify-center rounded-xl overflow-hidden bg-[#255706] text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg active:scale-95 transition-all">
            <ImportButton kind="hafiza" />
          </div>

          <button
            type="button"
            onClick={handleClearHafiza}
            disabled={hafiza.length === 0}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#255706] shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/40 active:scale-95 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            مسح السجلات
          </button>
        </div>
      </div>

      {/* نموذج إضافة حافظة */}
      <div className={`transition-all duration-300 ${showForm ? "max-h-[1400px] mb-3.5 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
<Card className="border border-black rounded-2xl shadow-lg overflow-hidden">
  <CardHeader className="p-3.5 pb-2 border border-black bg-[hsla(214,92%,47%,1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
     <div className="w-8 h-8 rounded-lg bg-[#ffffff] text-black flex items-center justify-center font-bold">
   <Plus className="w-4 h-4" />
            </div>
   <div>
     <CardTitle className="text-xl font-bold text-white ">إدخال حافظة توريد جديدة</CardTitle>
<CardDescription className="text-[11px] text-gold">لادخال حافظة توريد جديدة بشكل سريع وسهل
</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4">
 <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 bg-teal/700 border border-black">
              {/* السطر 1: الاسم الكامل | الدفعة */}
<div className="relative text -center ">
<label className="text-sm font-bold text-slate-800 block mb-1">الاسم الكامل *</label>
<div className="relative">
 <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <Input
                    value={nameQuery}
                    onChange={(e) => {
                      setNameQuery(e.target.value);
                      setForm({ ...form, name: e.target.value });
                      setShowSugg(true);
                    }}
                    onFocus={() => setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 200)}
                    placeholder="ابحث أو اكتب..."
                    className="pr-8 bg-white text-slate-900 border border-black rounded-xl h-9 text-xs sm:text-sm shadow-xs focus:ring-2 focus:ring-sky-400 focus:border-sky-500"
                  />
                </div>

                {showSugg && nameSuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-silver border border-slate-200 rounded-xl shadow-2xl max-h-44 overflow-auto">
                    {nameSuggestions.map((t) => (
                      <li key={t.name + t.batch}>
<button type="button"onMouseDown={() => pickName(t)}
className="w-full text-center px-3 py-2 hover:bg-sky-50 text-xs sm:text-xs flex flex-col border border-black last:border-b-0"
                        >
                          <span className="font-bold text-slate-900">{t.name}</span>
                          <span className="text-[11px] text-slate-500">{t.specialty} — {t.batch}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <FieldDark label="الدفعة" icon={<Sparkles className="w-3.5 h-3.5 text-sky-600" />} v={form.batch} on={(v) => setForm({ ...form, batch: v })} />

              {/* السطر 2: التخصص | التاريخ */}
              <FieldDark label="التخصص" icon={<FileText className="w-3.5 h-3.5 text-indigo-600" />} v={form.specialty} on={(v) => setForm({ ...form, specialty: v })} />
              <FieldDark label="التاريخ" type="date" icon={<Calendar className="w-3.5 h-3.5 text-emerald-600" />} v={form.date} on={(v) => setForm({ ...form, date: v })} />

              {/* السطر 3: رقم الحافظة | مبلغ الحافظة */}
              <FieldDark label="رقم الحافظة *" icon={<Hash className="w-3.5 h-3.5 text-amber-600" />} v={form.hafizaNo} on={(v) => setForm({ ...form, hafizaNo: v })} />
              <FieldDark label="مبلغ الحافظة" type="number" icon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />} v={form.hafizaAmount} on={(v) => setForm({ ...form, hafizaAmount: v })} />

              {/* السطر 4: البيان | تاريخ التوريد */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">البيان</label>
                <div className="relative">
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400">
                    <ScrollText className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <Input
                    list="hafiza-descriptions"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="اكتب أو اختر..."
                    className="pr-8 bg-white text-slate-900 border border-1-black rounded-xl h-9 text-xs sm:text-sm shadow-sm focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <datalist id="hafiza-descriptions">
                  {Array.from(new Set([...DESCRIPTIONS, ...hafiza.map((h) => h.description).filter(Boolean)])).map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <FieldDark label="تاريخ التوريد" type="date" icon={<Calendar className="w-3.5 h-3.5 text-teal-600" />} v={form.notifyDate} on={(v) => setForm({ ...form, notifyDate: v })} />

              {/* السطر 5: رقم الاشعار | مبلغ التوريد */}
              <FieldDark label="رقم الاشعار" icon={<Hash className="w-3.5 h-3.5 text-blue-600" />} v={form.notifyNo} on={(v) => setForm({ ...form, notifyNo: v })} />
              <FieldDark label="مبلغ التوريد" type="number" icon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />} v={form.notifyAmount} on={(v) => setForm({ ...form, notifyAmount: v })} />
            </div>

            {/* أزرار الحفظ والمسح - سطر يحتوي على زرين */}
            <div className="mt-4 pt-3.5 border border-black grid grid-cols-2 gap-3 bg-#00b4d8">
 <button type="button"onClick={submit} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-900 to-teal-100 shadow-md shadow-emerald-600/30 hover:shadow-lg active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" /> حفظ الحافظة
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(empty);
                  setNameQuery("");
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-slate-200 to-slate-500 shadow-md shadow-slate-600/30 hover:shadow-lg active:scale-95 transition-all"
              >
                <Eraser className="w-4 h-4" /> مسح المدخلات
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول كشف القيود والحوافظ */}
      <Card className="border border-black rounded-2xl bg-[hsla(97,56%, 42%,1)] backdrop-blur-md shadow-lg overflow-hidden">
<CardHeader className="p-3.5 border border-black bg-sky-500/200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-sky-5,00 text-black-700 flex items-center justify-center font-bold border border-black">
                <FileText className="w-4 h-4" />
              </div>
              <div>
<CardTitle className="text-lg sm:text-base font-bold text-slate-900">كشف قيود الحوافظ</CardTitle>
<CardDescription className="text-[13px] text-slate-900">كشف 
حوافظ التوريد وسجلاتها
</CardDescription>
              </div>
<Badge className="bg-sky-600 hover:bg-sky-700 text-white font-mono text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
                {filtered.length} سجل
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={filters.name || ""}
                onChange={(e) => setFilter("name", e.target.value)}
 placeholder="بحث بالاسم..."
 className="px-3 py-1.5 rounded-xl text-xm bg-[#E0DA92] border border-black shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-400 w-full"/>
{Object.values(filters).some(Boolean) && (
 <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-white-1000 hover:bg-green-50 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              )}
 <TabActions title="حوافظ التوريد" rows={hafiza} columns={COLS} fileName="حوافظ-التوريد" pdfLayout="wide-centered" pdfOrientation="portrait" pdfCss={greenPrintHeaderCss} />
            </div>
          </div>
        </CardHeader>

  <CardContent className="p-0">
<div className="w-auto overflow-auto max-h-[72vh]">
<Table className="w-auto table-auto text-center border-collapse border border-black">
 <TableHeader className="sticky top-0 z-10 border-b border-slate-200 whitespace-normal">
                <TableRow>
<TableHead className="w-auto text-center font-bold text-slate-800 bg-[#faedcd]">م</TableHead>
                  {COLS.map((c) => (
<TableHead key={c.key} className="text-center font-bold text-emlod-600 text-xs px-2 py-2">
<div className="flex flex-col items-center">
                        <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 hover:text-sky-600 transition-colors">
                          <span>{c.label}</span>
                          {sortIndicator(sortKey === c.key, sortDir)}
                        </button>
                        <input
                          value={filters[c.key] || ""}
                          onChange={(e) => setFilter(c.key, e.target.value)}
                          placeholder="فلتر..."
className="mt-0 px-1.5 py-0.5 rounded-md text-[10px] w-8 text-center bg-white border border-1-black focus:outline-none focus:ring-1 focus:ring-sky-400 font-normal"/>
</div>
                    </TableHead>
                  ))}
<TableHead className="w-auto max-w-auto text-center font-bold text-slate-700">حذف</TableHead>
                </TableRow>
              </TableHeader>

<TableBody>
 {filtered.length === 0 ? (
                  <TableRow>
<TableCell colSpan={COLS.length + 2} className="text-center py-8 text-slate-400 text-xs sm:text-sm w-auto min-w-auto"> لا توجد بيانات حوافظ مطابقة
      </TableCell>
</TableRow>
) : (
filtered.map((row, idx) => (
<TableRow key={row.id} className="border-b border-black-100 hover:bg-amber-50/40 transition-colors">

<TableCell className="text-center text-xs font-mono text-slate-500">{idx + 1}</TableCell>
                      {COLS.map((c) => {
                        const isEditing = activeCell?.rowId === row.id && activeCell?.colKey === c.key;
                        const val = (row as any)[c.key];
                        const isMoney = c.key === "hafizaAmount" || c.key === "notifyAmount";

                        return (
                          <TableCell
                            key={c.key}
                            onClick={() => !isEditing && handleCellClick(row.id, c.key, val)}
                            className="text-center text-xs p-2 cursor-pointer"
                          >
                            {isEditing ? (
                              <Input
                                autoFocus
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onBlur={() => handleCellSave(row as Record<string, unknown> & { id: string })}
                                onKeyDown={(e) => e.key === "Enter" && handleCellSave(row as Record<string, unknown> & { id: string })}
                                className="h-7 text-xs bg-white text-center border-2 border-sky-400 rounded-md"
                              />
                            ) : (
                              <span className={`inline-block px-1 ${isMoney ? "font-mono font-bold text-slate-800" : "text-slate-700"}`}>
                                {isMoney ? fmt(Number(val) || 0) : String(val ?? "")}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center p-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا السجل؟")) deleteHafiza(row.id);
                          }}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {filtered.length > 0 && (
                <TableFooter className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <TableRow>
                    <TableCell className="text-center font-bold">∑</TableCell>
                    <TableCell className="font-bold text-xs">الإجمالي</TableCell>
                    <TableCell colSpan={5}></TableCell>
<TableCell className="text-center font-mono font-extrabold text-xs text-emerald-1000">
                      {fmt(totalHafizaAmount)}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-center font-mono font-extrabold text-xs text-sky-700">
                      {fmt(totalNotifyAmount)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FieldDark({
  label,
  v,
  on,
  type = "text",
  icon,
  className = "",
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
<div className="w-full">
      <label className="text-xs font-bold text-slate-800 mb-1 block">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400">
            {icon}
          </div>
        )}
        <Input
          type={type}
          value={v}
          onChange={(e) => on(e.target.value)}
          className={`${icon ? "pr-8" : "px-2.5"} bg-white text-slate-900 border border-slate-300 rounded-xl h-9 text-xs sm:text-sm shadow-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-500 ${className}`}
        />
      </div>
    </div>
  );
}
