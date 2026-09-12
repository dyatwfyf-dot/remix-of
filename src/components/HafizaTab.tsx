import React, { useMemo, useState } from "react";
import { useStore, type Trainee } from "@/lib/store";
import { fmt, today } from "@/lib/format";
import { DESCRIPTIONS } from "@/lib/accounts";
import { toast } from "sonner";
import ImportButton from "./ImportButton";
import { useTableControls, sortIndicator } from "@/hooks/useTableControls";
import {
  X,
  Trash2,
  Save,
  Eraser,
  Wallet,
} from "lucide-react";
import TabActions from "./TabActions";
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

const INPUT_CLS =
  "w-full border-2 border-black rounded-lg px-3 py-2 text-sm bg-white text-black font-bold focus:ring-2 focus:ring-sky-300 focus:border-sky-500 outline-none";
const LABEL_CLS = "block text-sm font-black text-black mb-1";

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
    <div className="w-full min-h-screen p-2 sm:p-4 bg-gradient-to-b from-sky-50 to-white text-black font-sans" dir="rtl">
      <div className="w-full space-y-4">

        {/* HEADER CARD */}
        <div className="p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-black bg-gradient-to-l from-sky-700 via-sky-600 to-sky-500">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-white/20 border-2 border-black flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </span>
              <div>
                <h1 className="text-lg font-black text-white">إدارة الحوافظ والتوريد</h1>
                <p className="text-xs font-bold text-sky-100 mt-0.5">تسجيل ومتابعة الحوافظ المالية والإشعارات</p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              <div className="flex items-center justify-center h-9 px-3 rounded-lg bg-white border-2 border-black hover:bg-sky-50 transition-colors">
                <ImportButton kind="hafiza" />
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearHafiza}
                disabled={hafiza.length === 0}
                className="h-9 font-black text-xs rounded-lg bg-red-600 text-white border-2 border-black hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 ml-1 inline-block" />
                مسح الكل
              </Button>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="p-4 sm:p-6 rounded-2xl shadow-sm border-2 border-black bg-gold">
          <h3 className="text-sm font-black text-black mb-4 pb-2 border-b-2 border-black">إضافة حافظة جديدة</h3>

          <div className="grid grid-cols-2 gap-4">

            {/* NAME */}
            <div className="relative">
              <label className={LABEL_CLS}>الاسم الكامل *</label>
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
                className={INPUT_CLS}
              />
              {showSugg && nameSuggestions.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-lg max-h-48 overflow-auto">
                  {nameSuggestions.map((t) => (
                    <li key={t.name + t.batch}>
                      <button
                        type="button"
                        onMouseDown={() => pickName(t)}
                        className="w-full text-right px-3 py-2 hover:bg-sky-50 flex flex-col border-b border-slate-200 last:border-0"
                      >
                        <span className="font-black text-sm text-black">{t.name}</span>
                        <span className="text-xs font-bold text-slate-600">{t.specialty} — {t.batch}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* BATCH */}
            <div>
              <label className={LABEL_CLS}>الدفعة</label>
              <Input
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
                placeholder="الدفعة..."
                className={INPUT_CLS}
              />
            </div>

            {/* SPECIALTY */}
            <div>
              <label className={LABEL_CLS}>التخصص</label>
              <Input
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                placeholder="التخصص..."
                className={INPUT_CLS}
              />
            </div>

            {/* DATE */}
            <div>
              <label className={LABEL_CLS}>التاريخ</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={INPUT_CLS}
              />
            </div>

            {/* HAFIZA NO */}
            <div>
              <label className={LABEL_CLS}>رقم الحافظة *</label>
              <Input
                value={form.hafizaNo}
                onChange={(e) => setForm({ ...form, hafizaNo: e.target.value })}
                placeholder="رقم الحافظة..."
                className={INPUT_CLS}
              />
            </div>

            {/* HAFIZA AMOUNT */}
            <div>
              <label className={LABEL_CLS}>مبلغ الحافظة</label>
              <Input
                type="number"
                value={form.hafizaAmount}
                onChange={(e) => setForm({ ...form, hafizaAmount: e.target.value })}
                placeholder="0.00"
                className={INPUT_CLS}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className={LABEL_CLS}>البيان</label>
              <Input
                list="hafiza-descriptions"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="اختر أو اكتب البيان..."
                className={INPUT_CLS}
              />
              <datalist id="hafiza-descriptions">
                {Array.from(new Set([...DESCRIPTIONS, ...hafiza.map((h) => h.description).filter(Boolean)])).map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            {/* NOTIFY DATE */}
            <div>
              <label className={LABEL_CLS}>تاريخ التوريد</label>
              <Input
                type="date"
                value={form.notifyDate}
                onChange={(e) => setForm({ ...form, notifyDate: e.target.value })}
                className={INPUT_CLS}
              />
            </div>

            {/* NOTIFY NO */}
            <div>
              <label className={LABEL_CLS}>رقم الاشعار</label>
              <Input
                value={form.notifyNo}
                onChange={(e) => setForm({ ...form, notifyNo: e.target.value })}
                placeholder="رقم الاشعار..."
                className={INPUT_CLS}
              />
            </div>

            {/* NOTIFY AMOUNT */}
            <div>
              <label className={LABEL_CLS}>مبلغ التوريد</label>
              <Input
                type="number"
                value={form.notifyAmount}
                onChange={(e) => setForm({ ...form, notifyAmount: e.target.value })}
                placeholder="0.00"
                className={INPUT_CLS}
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t-2 border-black">
            <Button onClick={submit} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black rounded-lg px-4 py-2 text-sm transition-colors shadow-sm border-2 border-black">
              <Save className="w-4 h-4 ml-1.5" /> حفظ السجل
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setForm(empty);
                setNameQuery("");
              }}
              className="w-full bg-white hover:bg-slate-100 text-black font-black rounded-lg px-4 py-2 text-sm transition-colors border-2 border-black"
            >
              <Eraser className="w-4 h-4 ml-1.5" /> مسح الحقول
            </Button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="p-4 sm:p-6 rounded-2xl shadow-sm border-2 border-black bg-green light">
          <div className="grid grid-cols-2 items-center mb-4 pb-2 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-black">كشف القيود الحالية</h2>
              <Badge variant="secondary" className="bg-sky-600 text-white border-2 border-black font-black">
                {filtered.length} سجل
              </Badge>
            </div>
            <div className="flex items-center gap-0 justify-end">
              <TabActions title="حوافظ التوريد" rows={hafiza} columns={COLS} fileName="حوافظ-التوريد" pdfLayout="wide-centered" />
            </div>
          </div>

          <div className="flex items-center gap-1 mb-0">
            <input
              value={filters.name || ""}
              onChange={(e) => setFilter("name", e.target.value)}
              placeholder="بحث سريع بالاسم..."
              className="flex-0 px-2 py-2 h-9 rounded-lg text-sm font-bold border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            {Object.values(filters).some(Boolean) && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="h-9 px-1 text-xs font-black text-black bg-white border-2 border-black">
                <X className="w-3 h-3.5 ml-1" />
                إلغاء الفلترة
              </Button>
            )}
          </div>

          <div className="overflow-x-auto border-2 border-black rounded-xl bg-white mt-3">
            <Table className="w-auto table-auto border-collapse text-center text-black">
              <TableHeader>
                <tr className="border-b-2 border-black bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 text-black">
                  <th className="px-2 py-2 text-lg font-black text-center whitespace-nowrap">#</th>
                  {COLS.map((c) => {
                    const isNumOrDate = ["date", "hafizaNo", "hafizaAmount", "notifyDate", "notifyNo", "notifyAmount"].includes(c.key);
                    return (
                      <th key={c.key} className={`px-2 py-2 text-lg font-black ${isNumOrDate ? "whitespace-nowrap w-auto" : ""}`}>
                        <div className="flex flex-col gap-1.5 py-1">
                          <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 hover:text-sky-900 transition-colors font-black">
                            <span>{c.label}</span>
                            {sortIndicator(sortKey === c.key, sortDir)}
                          </button>
                          <input
                            value={filters[c.key] || ""}
                            onChange={(e) => setFilter(c.key, e.target.value)}
                            placeholder="فلتر..."
                            className="w-20 px-2 py-1 rounded text-xs font-bold border border-black text-black focus:outline-none focus:border-sky-600 bg-white"
                          />
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-2 py-2 text-lg font-black text-center whitespace-nowrap w-auto">إجراءات</th>
                </tr>
              </TableHeader>

              <TableBody className="divide-y divide-slate-200 bg-white">
                {filtered.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-sky-50 transition-colors">
                    <TableCell className="text-center text-slate-600 font-bold whitespace-nowrap">{idx + 1}</TableCell>
                    {COLS.map((c) => {
                      const isEditing = activeCell?.rowId === row.id && activeCell?.colKey === c.key;
                      const val = (row as any)[c.key];
                      const isMoney = c.key === "hafizaAmount" || c.key === "notifyAmount";
                      const isNumOrDate = ["date", "hafizaNo", "hafizaAmount", "notifyDate", "notifyNo", "notifyAmount"].includes(c.key);

                      return (
                        <TableCell
                          key={c.key}
                          onClick={() => !isEditing && handleCellClick(row.id, c.key, val)}
                          className={`cursor-pointer ${isNumOrDate ? "whitespace-nowrap" : ""}`}>
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onBlur={() => handleCellSave(row as Record<string, unknown> & { id: string })}
                              onKeyDown={(e) => e.key === "Enter" && handleCellSave(row as Record<string, unknown> & { id: string })}
                              className="h-8 text-lg bg-white text-center border-sky-500 ring-2 ring-sky-200 text-black font-bold"
                            />
                          ) : (
                            <span className={`block w-auto ${isMoney ? "font-black text-black" : "font-bold text-black"}`}>
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
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLS.length + 2} className="h-32 text-center text-slate-500 font-bold">
                      لا توجد بيانات مطابقة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              {filtered.length > 0 && (
                <TableFooter className="bg-sky-50 border-t-2 border-black">
                  <TableRow>
                    <TableCell className="text-center font-black text-black whitespace-nowrap">∑</TableCell>
                    <TableCell className="font-black text-black whitespace-nowrap" colSpan={5}>إجمالي النتائج الحالية</TableCell>
                    <TableCell className="font-mono font-black text-black whitespace-nowrap">{fmt(totalHafizaAmount)}</TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell className="font-mono font-black text-black whitespace-nowrap">{fmt(totalNotifyAmount)}</TableCell>
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
