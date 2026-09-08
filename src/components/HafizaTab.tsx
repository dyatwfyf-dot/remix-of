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
  Calendar,
  Hash,
  FileText,
  User,
  Sparkles,
  Wallet,
  CreditCard,
  ScrollText,
} from "lucide-react";
import TabActions from "./TabActions";
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

// تم تخفيف الألوان قليلاً لتكون أكثر هدوءاً وتناسقاً
const PALETTE = ["#4A3B69", "#2A75A3", "#74A822", "#E5B632", "#E0484D"];

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
      className="w-full min-h-screen p-2 sm:p-4"
      dir="rtl"
      style={{
        background: `linear-gradient(180deg, ${PALETTE[0]}15 0%, ${PALETTE[1]}10 100%)`, // خلفية أكثر هدوءاً
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* الهيدر الرئيسي */}
      <div className="rounded-xl p-4 mb-4 bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-800">لوحة الحوافظ والتوريد</h1>
              <p className="text-xs text-slate-500 mt-0.5">إدارة سريعة ومتوافقة مع الهواتف</p>
            </div>
          </div>

          {/* الأزرار العلوية: زرين في صف واحد */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-64">
            <div className="flex items-center justify-center w-full h-9 rounded-md bg-white border border-slate-300 hover:bg-slate-50 transition-colors overflow-hidden">
              <ImportButton kind="hafiza" />
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearHafiza}
              disabled={hafiza.length === 0}
              className="w-full h-9 rounded-md font-bold text-xs"
            >
              <Trash2 className="w-4 h-4 ml-1 inline-block" />
              مسح الكل
            </Button>
          </div>
        </div>
      </div>

      {/* نموذج إضافة حافظة */}
      <div className={`transition-all duration-300 ${showForm ? "max-h-[1400px]" : "max-h-0 overflow-hidden"}`}>
        <Card className="mb-4 bg-white border-slate-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 p-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">إضافة حافظة جديدة</h3>
              <p className="text-xs text-slate-500">الحقول مرتبة كزوجين في كل صف</p>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              
              {/* الصف الأول */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">الاسم الكامل *</label>
                <div className="relative">
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-md text-slate-500">
                    <User className="w-4 h-4" />
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
                    className="pr-10 h-10 text-sm border-slate-300 focus-visible:ring-indigo-500"
                  />
                </div>

                {showSugg && nameSuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {nameSuggestions.map((t) => (
                      <li key={t.name + t.batch}>
                        <button type="button" onMouseDown={() => pickName(t)} className="w-full text-right px-3 py-2 hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0">
                          <span className="font-bold text-sm text-slate-800">{t.name}</span>
                          <span className="text-xs text-slate-500">{t.specialty} — {t.batch}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <FieldDark label="الدفعة" icon={<Sparkles className="w-4 h-4" />} v={form.batch} on={(v) => setForm({ ...form, batch: v })} />

              {/* الصف الثاني */}
              <FieldDark label="التخصص" icon={<FileText className="w-4 h-4" />} v={form.specialty} on={(v) => setForm({ ...form, specialty: v })} />
              <FieldDark label="التاريخ" type="date" icon={<Calendar className="w-4 h-4" />} v={form.date} on={(v) => setForm({ ...form, date: v })} />

              {/* الصف الثالث */}
              <FieldDark label="رقم الحافظة" icon={<Hash className="w-4 h-4" />} v={form.hafizaNo} on={(v) => setForm({ ...form, hafizaNo: v })} />
              <FieldDark label="مبلغ الحافظة" type="number" icon={<CreditCard className="w-4 h-4" />} v={form.hafizaAmount} on={(v) => setForm({ ...form, hafizaAmount: v })} />

              {/* الصف الرابع */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">البيان</label>
                <div className="relative">
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-md text-slate-500">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <Input
                    list="hafiza-descriptions"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="اكتب أو اختر..."
                    className="pr-10 h-10 text-sm border-slate-300 focus-visible:ring-indigo-500"
                  />
                </div>
                <datalist id="hafiza-descriptions">
                  {Array.from(new Set([...DESCRIPTIONS, ...hafiza.map((h) => h.description).filter(Boolean)])).map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <FieldDark label="تاريخ التوريد" type="date" icon={<Calendar className="w-4 h-4" />} v={form.notifyDate} on={(v) => setForm({ ...form, notifyDate: v })} />

              {/* الصف الخامس */}
              <FieldDark label="رقم الاشعار" icon={<Hash className="w-4 h-4" />} v={form.notifyNo} on={(v) => setForm({ ...form, notifyNo: v })} />
              <FieldDark label="مبلغ التوريد" type="number" icon={<CreditCard className="w-4 h-4" />} v={form.notifyAmount} on={(v) => setForm({ ...form, notifyAmount: v })} />
            </div>

            {/* أزرار الحفظ والمسح: زرين في صف واحد */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <Button onClick={submit} className="w-full h-10 font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg">
                <Save className="w-4 h-4 ml-1.5" /> حفظ السجل
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(empty);
                  setNameQuery("");
                }}
                className="w-full h-10 font-bold text-slate-600 border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                <Eraser className="w-4 h-4 ml-1.5" /> مسح الحقول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول كشف القيود */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-800">كشف القيود</CardTitle>
                <CardDescription className="text-xs text-slate-500">عرض وتدقيق كافة حوافظ التوريد</CardDescription>
              </div>
              <Badge variant="secondary" className="mr-3 bg-slate-100 text-slate-700 hover:bg-slate-200">{filtered.length} سجل</Badge>
            </div>
          </div>

          {/* عناصر التحكم في الجدول: كل عنصرين في صف */}
          <div className="grid grid-cols-2 gap-2">
            <input
              value={filters.name || ""}
              onChange={(e) => setFilter("name", e.target.value)}
              placeholder="بحث بالاسم..."
              className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="w-full flex items-center justify-center h-9 mt-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 transition-colors overflow-hidden">
               <ImportButton kind="hafiza" />
            </div>

            {Object.values(filters).some(Boolean) ? (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full h-9 text-xs font-bold text-slate-600">
                <X className="w-3.5 h-3.5 ml-1" />
                تفريغ الفلتر
              </Button>
            ) : (
              <div />
            )}

            <div className="w-full">
              <TabActions title="حوافظ التوريد" rows={hafiza} columns={COLS} fileName="حوافظ-التوريد" pdfLayout="wide-centered" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-auto max-h-[65vh]">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="text-slate-700 font-bold text-xs text-center border-b border-slate-200">#</TableHead>
                  {COLS.map((c) => (
                    <TableHead key={c.key} className="text-slate-700 font-bold text-xs border-b border-slate-200">
                      <div className="flex flex-col items-center py-2">
                        <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 text-xs hover:text-teal-600 transition-colors">
                          <span>{c.label}</span>
                          {sortIndicator(sortKey === c.key, sortDir)}
                        </button>
                        <div className="mt-2 w-full">
                          <input
                            value={filters[c.key] || ""}
                            onChange={(e) => setFilter(c.key, e.target.value)}
                            placeholder="فلتر..."
                            className="w-full px-2 py-1 rounded text-xs border border-slate-200 text-slate-800 text-center focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-slate-700 font-bold text-xs text-center border-b border-slate-200">إجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                    <TableCell className="text-center text-slate-500">{idx + 1}</TableCell>
                    {COLS.map((c) => {
                      const isEditing = activeCell?.rowId === row.id && activeCell?.colKey === c.key;
                      const val = (row as any)[c.key];
                      const isMoney = c.key === "hafizaAmount" || c.key === "notifyAmount";

                      return (
                        <TableCell key={c.key} onClick={() => !isEditing && handleCellClick(row.id, c.key, val)} className="cursor-pointer">
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onBlur={() => handleCellSave(row as Record<string, unknown> & { id: string })}
                              onKeyDown={(e) => e.key === "Enter" && handleCellSave(row as Record<string, unknown> & { id: string })}
                              className="h-8 text-sm bg-white text-center border-teal-500 ring-2 ring-teal-100"
                            />
                          ) : (
                            <span className={`block min-w-[4rem] text-center ${isMoney ? "font-mono font-medium text-slate-800" : "text-slate-600"}`}>
                              {isMoney ? fmt(Number(val) || 0) : String(val ?? "—")}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا السجل؟")) deleteHafiza(row.id);
                          }}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filtered.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={COLS.length + 2} className="h-32 text-center text-slate-500">
                        لا توجد بيانات مطابقة
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>

              {filtered.length > 0 && (
                <TableFooter className="bg-slate-50 border-t border-slate-200">
                  <TableRow>
                    <TableCell className="text-center font-bold text-slate-700">∑</TableCell>
                    <TableCell className="font-bold text-slate-700 whitespace-nowrap">إجمالي الصفحة</TableCell>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell className="text-center font-mono font-bold text-teal-700">{fmt(totalHafizaAmount)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-center font-mono font-bold text-teal-700">{fmt(totalNotifyAmount)}</TableCell>
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
      <label className="text-sm font-semibold text-slate-700 block mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-md text-slate-500 z-10">
            {icon}
          </div>
        )}
        <Input
          type={type}
          value={v}
          onChange={(e) => on(e.target.value)}
          className={`${icon ? "pr-10" : "px-3"} h-10 text-sm border-slate-300 focus-visible:ring-indigo-500 ${className}`}
        />
      </div>
    </div>
  );
}
