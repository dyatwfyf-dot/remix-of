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
import YearSelector from "@/components/YearSelector";

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
      { name: "theme-color", content: "#337799" },
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
  navTintClass: string;
};

// تعريف قائمة التبويبات مع بياناتها
const tabs: TabItem[] = [
  {
    value: "installments",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "كشف الأقساط",
    shortLabel: "أقساط",
    icon: <WalletCards className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "hafiza",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "حوافظ التوريد",
    shortLabel: "حوافظ",
    icon: <FileBox className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "account",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "الحساب الجاري",
    shortLabel: "حساب",
    icon: <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "journal",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "القيود اليومية",
    shortLabel: "قيود",
    icon: <BookOpenText className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "monthly",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "كشف شهري",
    shortLabel: "شهري",
    icon: <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "revenue",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "الإيرادات",
    shortLabel: "إيرادات",
    icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "expenses-table",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "المصروفات",
    shortLabel: "مصروفات",
    icon: <ReceiptText className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "reports",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "التقارير",
    shortLabel: "تقارير",
    icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
  {
    value: "general-expenses-ledger",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "سجل النفقات",
    shortLabel: "السجل",
    icon: <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
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
  const activeTabRef = useRef(activeTab);
  const tabHistoryRef = useRef<Tab[]>([getInitialTab()]);
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);

  // حماية الإقلاع الأولي: لا تُرسم التبويبات الثقيلة على الخادم، بل بعد تحميل المتصفح فقط.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleStorageError = () => {
      toast.error("تعذر الوصول إلى التخزين المحلي. تحقق من مساحة الجهاز ولا تغلق التطبيق قبل حفظ نسخة احتياطية.");
    };
    window.addEventListener("mizan:storage-error", handleStorageError);
    return () => window.removeEventListener("mizan:storage-error", handleStorageError);
  }, []);

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
      className="apk-tabs-ui w-full min-h-[100dvh] bg-[#e8f0ff] selection:bg-[#6ba3c8]/30 text-base"
      dir="rtl"
    >
      {/* قسم الهيدر العلوي */}
      <div className="app-header relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] px-2.5 py-2 sm:gap-3 sm:px-5 sm:py-3 border-b border-[#b8d4e8] shadow-sm text-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#b8d4e8,#e8f0f8,#b8d4e8)] opacity-80" />

        {/* الشعار واسم المجلس، وشريط السنة المالية بحجم مدمج في يسار الاسم */}
        <div className="flex min-w-0 flex-nowrap items-center gap-2">
          <div className="app-brand-logo relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/35 bg-white/15 p-1 shadow-lg shadow-[#102f46]/20 sm:h-11 sm:w-11">
            <img src="/app-logo.png" alt="شعار مِيزان" className="h-full w-full object-contain" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h1 className="app-brand-title truncate whitespace-nowrap text-[clamp(0.72rem,2.35vw,1.2rem)] font-black tracking-normal text-white leading-tight">
                المجلس اليمني للاختصاصات الطبية
              </h1>
              <p className="hidden min-w-0 items-center gap-1.5 truncate text-[clamp(0.62rem,1.45vw,0.75rem)] font-medium leading-snug text-[#e8f0f8] sm:flex">
                <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8d4e8]"></span>
                <span className="truncate">
                  النظام المالي — المجلس اليمني للاختصاصات الطبية
                </span>
              </p>
            </div>
            {isMounted && <div className="shrink-0"><YearSelector /></div>}
          </div>
        </div>

        {/* الجزء الأيسر: زر تثبيت التطبيق */}
        <div className="flex items-center gap-2 shrink-0">
          {pwaInstallable && (
            <button
              onClick={handlePWAInstall}
              className="app-install-btn flex items-center gap-1.5 bg-white text-[#2e6b8a] hover:bg-[#e8f0f8] font-bold text-[13px] px-3 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap active:scale-[0.97]"
            >
              <DownloadCloud className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
            </button>
          )}
        </div>
      </div>

      {/* شريط التنقل الرئيسي: ثابت أعلى المحتوى لسهولة الوصول إلى جميع الأقسام */}
      <nav
        className="app-main-nav sticky top-0 z-[60] border-b border-[#c7dbe9] bg-white/95 shadow-[0_4px_14px_rgba(46,107,138,0.10)] backdrop-blur-xl"
        dir="rtl"
        aria-label="التنقل الرئيسي"
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center px-2 py-2 sm:px-4">
          <div className="app-tab-nav-items flex w-full flex-nowrap gap-2 overflow-x-auto px-0.5 py-0.5 sm:gap-2.5 lg:flex-wrap lg:justify-center lg:overflow-visible">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.label}
                  className={`app-tab-nav-item relative flex min-h-[56px] min-w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6ba3c8] focus:ring-offset-2 sm:min-w-[112px] sm:flex-row sm:gap-2 sm:px-4 lg:min-w-0 lg:flex-1 ${isActive
                    ? `${tab.activeClass} border-transparent text-white shadow-md shadow-[#2e6b8a]/20`
                    : `${tab.navTintClass} hover:brightness-[0.97]`
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${isActive ? "border-white/30 bg-white/15 text-white shadow-inner" : `${tab.navTintClass} shadow-sm`}`} aria-hidden="true">{tab.icon}</span>
                  <span className="whitespace-nowrap text-xs font-extrabold leading-tight sm:text-sm">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-[3px] rounded-full bg-white/90 sm:hidden" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* محتوى التبويب النشط */}
      <div className="app-tab-content w-full min-w-0 bg-[#f4f9fd] p-0 sm:p-0 md:p-0 min-h-[calc(100dvh-140px)]">
        {!isMounted ? (
          <div
            className="flex min-h-[35vh] items-center justify-center p-6 text-xs font-semibold text-[#2e6b8a]"
            role="status"
            aria-live="polite"
          >
            جارٍ تجهيز النظام…
          </div>
        ) : (
          <Suspense
            fallback={
              <div
                className="flex min-h-[35vh] items-center justify-center rounded-2xl border border-[#b8d4e8] bg-gold/95 p-6 text-xs font-semibold text-[#2e6b8a]"
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
        )}
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default Index;
