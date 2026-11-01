import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { useAvailableYears, useSelectedYear, useStore } from "@/lib/store";

// قائمة «السنة المالية»: تحفظ آخر اختيار، وتتيح إضافة السنة التالية بضغطة واحدة.
export default function YearSelector() {
  const years = useAvailableYears();
  const selectedYear = useSelectedYear();
  const setSelectedYear = useStore((s) => s.setSelectedYear);
  const startNewYear = useStore((s) => s.startNewYear);

  const nextYear = years[years.length - 1] + 1;

  const handleAddYear = () => {
    if (!confirm(`إنشاء السنة المالية ${nextYear}؟\nسيتم نسخ المتدربين وترحيل المتبقي، وتبقى بيانات السنوات السابقة كما هي.`)) {
      return;
    }
    startNewYear(nextYear);
    toast.success(`تم إنشاء السنة المالية ${nextYear}`);
  };

  return (
    <div className="flex items-center gap-1.5" dir="rtl">
      <label className="text-[12px] font-bold text-white/90 whitespace-nowrap">السنة المالية</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="rounded-lg border border-white/40 bg-white/15 px-2 py-1 text-[13px] font-extrabold text-white outline-none focus:ring-2 focus:ring-white/60"
        aria-label="السنة المالية"
      >
        {years.map((y) => (
          <option key={y} value={y} className="text-slate-900">
            {y}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAddYear}
        className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[12px] font-bold text-[#2e6b8a] shadow-sm active:scale-[0.97]"
        title={`إضافة سنة ${nextYear}`}
      >
        <CalendarPlus className="h-4 w-4 shrink-0" />
        <span>{nextYear}</span>
      </button>
    </div>
  );
}
