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
    <div className="w-full min-h-screen p-4 bg-gray-100 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* الهيدر الرئيسي وتبيان التبويب */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-gray-800">إدارة الحوافظ والتوريد</h1>
                <p className="text-xs text-slate-500 mt-0.5">تسجيل ومتابعة الحوافظ المالية والإشعارات</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                <ImportButton kind="hafiza" />
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearHafiza}
                disabled={hafiza.length === 0}
                className="h-9 font-medium text-xs rounded-lg"
              >
                <Trash2 className="w-4 h-4 ml-1 inline-block" />
                مسح الكل
              </Button>
            </div>
          </div>

          {/* نموذج الإضافة: حقلين وزرين في صف واحد بالشاشات الكبيرة */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">إضافة حافظة جديدة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              
              {/* الحقل الأول */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                <div className="relative">
                  <Input
                    value={nameQuery}
                    onChange={(e) => {
                      setNameQuery(e.target.value);
                      setForm({ ...form, name: e.target.value });
                      setShowSugg(true);
                    }}
                    onFocus={() => setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 200)}
                    placeholder="ابحث أو اكتب الاسم..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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

              {/* الحقل الثاني */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدفعة</label>
                <Input
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  placeholder="الدفعة..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل الثالث */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                <Input
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="التخصص..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل الرابع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل الخامس */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحافظة *</label>
                <Input
                  value={form.hafizaNo}
                  onChange={(e) => setForm({ ...form, hafizaNo: e.target.value })}
                  placeholder="رقم الحافظة..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل السادس */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ الحافظة</label>
                <Input
                  type="number"
                  value={form.hafizaAmount}
                  onChange={(e) => setForm({ ...form, hafizaAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل السابع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البيان</label>
                <Input
                  list="hafiza-descriptions"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اختر أو اكتب البيان..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <datalist id="hafiza-descriptions">
                  {Array.from(new Set([...DESCRIPTIONS, ...hafiza.map((h) => h.description).filter(Boolean)])).map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              {/* الحقل الثامن */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التوريد</label>
                <Input
                  type="date"
                  value={form.notifyDate}
                  onChange={(e) => setForm({ ...form, notifyDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل التاسع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الاشعار</label>
                <Input
                  value={form.notifyNo}
                  onChange={(e) => setForm({ ...form, notifyNo: e.target.value })}
                  placeholder="رقم الاشعار..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* الحقل العاشر */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ التوريد</label>
                <Input
                  type="number"
                  value={form.notifyAmount}
                  onChange={(e) => setForm({ ...form, notifyAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* زر الحفظ */}
              <div>
                <Button onClick={submit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors shadow-sm">
                  <Save className="w-4 h-4 ml-1.5" /> حفظ السجل
                </Button>
              </div>

              {/* زر إعادة التعيين */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(empty);
                    setNameQuery("");
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg px-4 py-2 text-sm transition-colors border-0"
                >
                  <Eraser className="w-4 h-4 ml-1.5" /> مسح الحقول
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* جدول كشف القيود */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-800">كشف القيود الحالية</h2>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                {filtered.length} سجل
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TabActions title="حوافظ التوريد" rows={hafiza} columns={COLS} fileName="حوافظ-التوريد" pdfLayout="wide-centered" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              value={filters.name || ""}
              onChange={(e) => setFilter("name", e.target.value)}
              placeholder="بحث سريع بالاسم..."
              className="flex-1 px-3 py-2 h-9 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {Object.values(filters).some(Boolean) && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="h-9 px-3 text-xs font-bold text-slate-600">
                <X className="w-3.5 h-3.5 ml-1" />
                إلغاء الفلترة
              </Button>
            )}
          </div>

          {/* الجدول مع منع الالتفاف للأرقام والتاريخ وضبط العرض تلقائياً */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <Table className="w-full table-auto border-collapse text-right">
              <TableHeader>
                <tr className="border-b bg-emerald-50 text-emerald-900">
                  <th className="px-4 py-3 text-sm font-semibold text-center whitespace-nowrap w-auto">#</th>
                  {COLS.map((c) => {
                    const isNumOrDate = ["date", "hafizaNo", "hafizaAmount", "notifyDate", "notifyNo", "notifyAmount"].includes(c.key);
                    return (
                      <th key={c.key} className={`px-4 py-3 text-sm font-semibold ${isNumOrDate ? "whitespace-nowrap w-auto" : ""}`}>
                        <div className="flex flex-col gap-1.5 py-1">
                          <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 hover:text-emerald-700 transition-colors">
                            <span>{c.label}</span>
                            {sortIndicator(sortKey === c.key, sortDir)}
                          </button>
                          <input
                            value={filters[c.key] || ""}
                            onChange={(e) => setFilter(c.key, e.target.value)}
                            placeholder="فلتر..."
                            className="w-full px-2 py-1 rounded text-xs border border-gray-300 text-gray-800 focus:outline-none focus:border-emerald-500 bg-white"
                          />
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-4 py-3 text-sm font-semibold text-center whitespace-nowrap w-auto">إجراءات</th>
                </tr>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200 bg-white">
                {filtered.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="text-center text-gray-500 whitespace-nowrap">{idx + 1}</TableCell>
                    {COLS.map((c) => {
                      const isEditing = activeCell?.rowId === row.id && activeCell?.colKey === c.key;
                      const val = (row as any)[c.key];
                      const isMoney = c.key === "hafizaAmount" || c.key === "notifyAmount";
                      const isNumOrDate = ["date", "hafizaNo", "hafizaAmount", "notifyDate", "notifyNo", "notifyAmount"].includes(c.key);

                      return (
                        <TableCell 
                          key={c.key} 
                          onClick={() => !isEditing && handleCellClick(row.id, c.key, val)} 
                          className={`cursor-pointer ${isNumOrDate ? "whitespace-nowrap w-auto" : ""}`}
                        >
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onBlur={() => handleCellSave(row as Record<string, unknown> & { id: string })}
                              onKeyDown={(e) => e.key === "Enter" && handleCellSave(row as Record<string, unknown> & { id: string })}
                              className="h-8 text-sm bg-white text-center border-emerald-500 ring-2 ring-emerald-100"
                            />
                          ) : (
                            <span className={`block min-w-[4rum] ${isMoney ? "font-mono font-medium text-gray-800" : "text-gray-700"}`}>
                              {isMoney ? fmt(Number(val) || 0) : String(val ?? "—")}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center whitespace-nowrap">
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
                    </TableCell>
                  </TableRow>
                ))}
                
                {filtered.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={COLS.length + 2} className="h-32 text-center text-gray-500">
                        لا توجد بيانات مطابقة
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>

              {filtered.length > 0 && (
                <TableFooter className="bg-gray-50 border-t border-gray-200">
                  <TableRow>
                    <TableCell className="text-center font-bold text-gray-700 whitespace-nowrap">∑</TableCell>
                    <TableCell className="font-bold text-gray-700 whitespace-nowrap" colSpan={5}>إجمالي النتائج الحالية</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-700 whitespace-nowrap">{fmt(totalHafizaAmount)}</TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell className="font-mono font-bold text-emerald-700 whitespace-nowrap">{fmt(totalNotifyAmount)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}
