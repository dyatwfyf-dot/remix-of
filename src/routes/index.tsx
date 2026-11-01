import { lazy, Suspense, startTransition, useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";

// استيراد الأيقونات التوضيحية لكل تبويب في النظام المالي
import {
  WalletCards,
  FileBox,
  FileSpreadsheet,
  BookOpenText,
  PieChart,
  TrendingUp,
  ReceiptText,
  DownloadCloud,
  BarChart3,
} from "lucide-react";

// تحميل ملفات التبويبات عند فتحها فقط لتقليل حجم التشغيل الأول.
import { useFiscalYear, getAvailableYears } from "@/lib/fiscalYear";
const HafizaTab = lazy(() => import("@/components/HafizaTab"));
const AccountTab = lazy(() => import("@/components/AccountTab"));
const JournalTab = lazy(() => import("@/components/JournalTab"));
const InstallmentsTab = lazy(() => import("@/components/InstallmentsTab"));
const MonthlyStatementTab = lazy(() => import("@/components/MonthlyStatementTab"));
const RevenueTab = lazy(() => import("@/components/RevenueTab"));
const ExpensesTab = lazy(() => import("@/components/ExpensesTab"));
const ReportsTab = lazy(() => import("@/components/ReportsTab"));
const AppTabs = lazy(() => import("@/components/AppTabs"));

// استيراد وظائف الـ PWA
import { canInstall, onInstallAvailability, promptInstall } from "@/lib/pwa";
import { installAndroidBackButton } from "@/lib/capacitorNavigation";

// إعداد مسار التوجيه والبيانات التعريفية للمتصفح
export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "مِيزان | النظام المالي" },
      {
        name: "description",
        content:
          "مِيزان — نظام مالي عصري لإدارة القيود والحوافظ والأقساط والتقارير",
      },
      { property: "og:title", content: "مِيزان | النظام المالي" },
      {
        property: "og:description",
        content: "إدارة القيود اليومية والحوافظ والأقساط والتقارير المالية بسهولة ووضوح.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#2e6b8a" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
});

type Tab =
  | "installments"
  | "hafiza"
  | "account"
  | "journal"
  | "monthly"
  | "revenue"
  | "expenses-table"
  | "reports"
  | "general-expenses-ledger";

type TabItem = {
  value: Tab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  activeClass: string;
};

// تعريف قائمة التبويبات مع بياناتها (التعديل: لكل تبويب لون مميز عند التفعيل)
const tabs: TabItem[] = [
  {
    value: "installments",
    label: "كشف الأقساط",
    shortLabel: "أقساط",
    icon: <WalletCards className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#2e6b8a] to-[#6ba3c8]",
  },
  {
    value: "hafiza",
    label: "حوافظ التوريد",
    shortLabel: "حوافظ",
    icon: <FileBox className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#166b4e] to-[#3fa270]",
  },
  {
    value: "account",
    label: "الحساب الجاري",
    shortLabel: "حساب",
    icon: <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#1f5f7a] to-[#4b8db0]",
  },
  {
    value: "journal",
    label: "القيود اليومية",
    shortLabel: "قيود",
    icon: <BookOpenText className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#6b3d9c] to-[#b77ac1]",
  },
  {
    value: "monthly",
    label: "كشف شهري",
    shortLabel: "شهري",
    icon: <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#b96b00] to-[#f0a54a]",
  },
  {
    value: "revenue",
    label: "الإيرادات",
    shortLabel: "إيرادات",
    icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#1f7a2e] to-[#6bc97a]",
  },
  {
    value: "expenses-table",
    label: "المصروفات",
    shortLabel: "مصروفات",
    icon: <ReceiptText className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#9c3d3d] to-[#d67b7b]",
  },
  {
    value: "reports",
    label: "التقارير",
    shortLabel: "تقارير",
    icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#2e5e9a] to-[#5f8fd0]",
  },
  {
    value: "general-expenses-ledger",
    label: "سجل النفقات",
    shortLabel: "السجل",
    icon: <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />,
    activeClass: "bg-gradient-to-b from-[#4b2e6a] to-[#7a58a0]",
  },
];

const isTabValue = (value: string | null): value is Tab =>
  value !== null && tabs.some((tab) => tab.value === value);

const getInitialTab = (): Tab => {
  if (typeof window === "undefined") return "installments";
  const tab = new URLSearchParams(window.location.search).get("tab");
  return isTabValue(tab) ? tab : "installments";
};

function Index() {
  const [activeTab, setActiveTab] = useState<Tab>(() => getInitialTab());
  const fiscalYear = useFiscalYear((s) => s.year);
  const setFiscalYear = useFiscalYear((s) => s.setYear);
  const activeTabRef = useRef(activeTab);
  const tabHistoryRef = useRef<Tab[]>([getInitialTab()]);
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const nextTab = new URLSearchParams(window.location.search).get("tab");
      const tab = isTabValue(nextTab) ? nextTab : "installments";
      const historyStack = tabHistoryRef.current;

      if (historyStack.length > 1 && historyStack[historyStack.length - 2] === tab) {
        tabHistoryRef.current = historyStack.slice(0, -1);
      } else {
        tabHistoryRef.current = [tab];
      }
      activeTabRef.current = tab;
      startTransition(() => setActiveTab(tab));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goBackWithinApp = useCallback(() => {
    if (activeTabRef.current === "installments") return false;

    const historyStack = tabHistoryRef.current;
    if (historyStack.length > 1) {
      tabHistoryRef.current = historyStack.slice(0, -1);
      window.history.back();
      return true;
    }

    activeTabRef.current = "installments";
    tabHistoryRef.current = ["installments"];
    startTransition(() => setActiveTab("installments"));
    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    window.history.replaceState(
      { tab: "installments" },
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    return true;
  }, []);

  useEffect(() => {
    return installAndroidBackButton(() => goBackWithinApp());
  }, [goBackWithinApp]);

  useEffect(() => {
    setPwaInstallable(canInstall());
    const unsubscribe = onInstallAvailability((available) => {
      setPwaInstallable(available);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTabRef.current) return;

    activeTabRef.current = tab;
    tabHistoryRef.current = [...tabHistoryRef.current, tab];
    startTransition(() => setActiveTab(tab));
    const url = new URL(window.location.href);
    if (tab === "installments") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);

    window.history.pushState({ tab }, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const handlePWAInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success("يتم الآن تثبيت النظام على جهازك.");
      setPwaInstallable(false);
    }
  };

  return (
    <div
      className="apk-tabs-ui w-full min-h-screen bg-[#e8f0ff] selection:bg-[#6ba3c8]/30 text-[13px]"
      dir="rtl"
    >
      {/* الهيدر العلوي */}
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] px-2.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#b8d4e8] shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#b8d4e8,#e8f0f8,#b8d4e8)] opacity-80" />

        <div className="flex min-w-0 items-center gap-2">
          <div className="relative shrink-0 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/35 bg-white/15 p-1 shadow-md shadow-[#102f46]/25 sm:h-12 sm:w-12">
            <img src="/app-logo.png" alt="شعار مِيزان" className="h-full w-full object-contain" />
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate text-[1rem] font-black leading-tight tracking-[0.04em] text-white sm:text-[1.2rem]">
              المجلس اليمني للاختصاصات الطبية
            </h1>
            <p className="flex min-w-0 items-center gap-1 text-[10.5px] font-medium leading-snug text-[#e8f0f8] sm:text-[11.5px]">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8d4e8]"></span>
              <span className="truncate">النظام المالي</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <label className="flex items-center gap-1 rounded-lg bg-white/15 px-1.5 py-1 text-[10.5px] font-bold text-white sm:text-[11.5px]">
            <span>السنة</span>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              className="rounded-md bg-white px-1 py-0.5 text-[#2e6b8a] font-black"
              aria-label="السنة المالية"
            >
              {getAvailableYears([fiscalYear]).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          {pwaInstallable && (
            <button
              onClick={handlePWAInstall}
              className="flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[10.5px] font-bold text-[#2e6b8a] shadow-sm transition-all hover:bg-[#e8f0f8] active:scale-[0.98] sm:px-2.5 sm:py-1.5 sm:text-[11.5px]"
            >
              <DownloadCloud className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span>تثبيت</span>
            </button>
          )}
        </div>
      </div>

      {/* محتوى التبويب النشط */}
      <div className="app-tab-content min-h-[calc(100vh-120px)] w-full min-w-0 bg-[#f4f9fd] p-0 pb-24 sm:pb-24">
        <Suspense
          fallback={
            <div
              className="flex min-h-[35vh] items-center justify-center rounded-xl border border-[#b8d4e8] bg-[#f9f2d6] p-4 text-[11px] font-semibold text-[#2e6b8a]"
              role="status"
              aria-live="polite"
            >
              جارٍ فتح التبويب…
            </div>
          }
        >
          {activeTab === "installments" && <InstallmentsTab />}
          {activeTab === "hafiza" && <HafizaTab />}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "journal" && <JournalTab />}
          {activeTab === "monthly" && <MonthlyStatementTab />}
          {activeTab === "revenue" && <RevenueTab />}
          {activeTab === "expenses-table" && <ExpensesTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "general-expenses-ledger" && <AppTabs />}
        </Suspense>
      </div>

      {/* شريط التبويبات السفلي */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#b8d4e8] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(46,107,138,0.12)]"
        dir="rtl"
        aria-label="التنقل الرئيسي"
      >
        <div className="flex w-full gap-1 overflow-x-auto px-0 py-1.5 sm:gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[42px] min-w-[58px] shrink-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-center transition-colors duration-150 focus:outline-none ${
                  isActive
                    ? `${tab.activeClass} text-white shadow-md`
                    : "text-[#4e6b80] hover:bg-[#e8f0f8]"
                }`}
              >
                <span className={isActive ? "scale-105" : "scale-100"}>{tab.icon}</span>
                <span className="text-[10.5px] font-bold leading-tight whitespace-nowrap sm:hidden">
                  {tab.shortLabel}
                </span>
                <span className="hidden text-[10.5px] font-bold leading-tight whitespace-nowrap sm:inline">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default Index;
