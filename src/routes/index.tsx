import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ContactRound,
  Plus,
  Bell,
  X,
} from "lucide-react";

// تحميل ملفات التبويبات عند فتحها فقط لتقليل حجم التشغيل الأول.
const HafizaTab = memo(lazy(() => import("@/components/HafizaTab")));
const AccountTab = memo(lazy(() => import("@/components/AccountTab")));
const JournalTab = memo(lazy(() => import("@/components/JournalTab")));
const InstallmentsTab = memo(lazy(() => import("@/components/InstallmentsTab")));
const TraineeFinancialDataTab = memo(lazy(() => import("@/components/TraineeFinancialDataTab")));
const MonthlyStatementTab = memo(lazy(() => import("@/components/MonthlyStatementTab")));
const RevenueTab = memo(lazy(() => import("@/components/RevenueTab")));
const ExpensesTab = memo(lazy(() => import("@/components/ExpensesTab")));
const ReportsTab = memo(lazy(() => import("@/components/ReportsTab")));
const AppTabs = memo(lazy(() => import("@/components/AppTabs")));

// استيراد وظائف الـ PWA
import { canInstall, onInstallAvailability, promptInstall } from "@/lib/pwa";
import { installAndroidBackButton } from "@/lib/capacitorNavigation";
import YearSelector from "@/components/YearSelector";
import { tagSerialColumns } from "@/lib/reportsCompactColumnsCss";
import { useStore } from "@/lib/store";
import { buildTraineeFeeNotifications } from "@/lib/traineeFeeNotifications";

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
  | "trainee-data"
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
    value: "trainee-data",
    navTintClass: "bg-secondary border-border text-secondary-foreground",
    label: "بيانات المتدربين",
    shortLabel: "بيانات المتدربين",
    icon: <ContactRound className="w-5 h-5 sm:w-6 sm:h-6" />,
    activeClass: "bg-primary",
  },
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

 // تحميل مكوّن التبويب مسبقاً عند الاقتراب من زرّه، حتى يبدأ تنزيل الشيفرة قبل النقر.
 // يستفيد الاستيراد الكسول من ذاكرة وحدات JavaScript نفسها ولا ينشئ نسخة ثانية من المكوّن.
const tabPreloaders: Record<Tab, () => Promise<unknown>> = {
  "trainee-data": () => import("@/components/TraineeFinancialDataTab"),
  installments: () => import("@/components/InstallmentsTab"),
  hafiza: () => import("@/components/HafizaTab"),
  account: () => import("@/components/AccountTab"),
  journal: () => import("@/components/JournalTab"),
  monthly: () => import("@/components/MonthlyStatementTab"),
  revenue: () => import("@/components/RevenueTab"),
  "expenses-table": () => import("@/components/ExpensesTab"),
  reports: () => import("@/components/ReportsTab"),
  "general-expenses-ledger": () => import("@/components/AppTabs"),
};

const preloadedTabs = new Set<Tab>();
const preloadTab = (tab: Tab) => {
  if (preloadedTabs.has(tab)) return;
  preloadedTabs.add(tab);
  void tabPreloaders[tab]().catch(() => {
    // عند فشل التحميل الأول، نسمح بمحاولة جديدة عند النقر أو التركيز التالي.
    preloadedTabs.delete(tab);
  });
};

const isTabValue = (value: string | null): value is Tab =>
  value !== null && tabs.some((tab) => tab.value === value);

const getInitialTab = (): Tab => {
  if (typeof window === "undefined") return "installments";
  const tab = new URLSearchParams(window.location.search).get("tab");
  return isTabValue(tab) ? tab : "installments";
};

// ابدأ تحميل التبويب الافتتاحي فور تحميل الوحدة في المتصفح لتقليل زمن الإقلاع.
if (typeof window !== "undefined") {
  preloadTab(getInitialTab());
}

function Index() {
  const [activeTab, setActiveTab] = useState<Tab>(() => getInitialTab());
  // احتفظ بالتبويبات التي فُتحت مرة واحدة لتجنب فكّها وإعادة بنائها عند كل انتقال.
  const [mountedTabs, setMountedTabs] = useState<Set<Tab>>(() => new Set([getInitialTab()]));
  const activeTabRef = useRef(activeTab);
  const tabHistoryRef = useRef<Tab[]>([getInitialTab()]);
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);
  const [feeNotificationsOpen, setFeeNotificationsOpen] = useState(false);
  const traineeFinancialRecords = useStore((state) => state.traineeFinancialRecords);
  const hafiza = useStore((state) => state.hafiza);
  const feeNotifications = useMemo(
    () => buildTraineeFeeNotifications(traineeFinancialRecords || [], hafiza || []),
    [traineeFinancialRecords, hafiza],
  );
  const notificationDateLabel = new Date().toLocaleDateString("ar-YE");

  // حماية الإقلاع الأولي: لا تُرسم التبويبات الثقيلة على الخادم، بل بعد تحميل المتصفح فقط.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // حمّل بقية التبويبات تدريجياً في وقت الخمول بعد الرسم الأولي ليكون التنقل بينها فورياً.
    const remaining = tabs.map((t) => t.value).filter((t) => !preloadedTabs.has(t));
    if (remaining.length === 0) return;

    let cancelled = false;
    let timerId: number | null = null;
    let idleId: number | null = null;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idx = 0;
    const scheduleNext = () => {
      if (cancelled || idx >= remaining.length) return;
      const run = () => {
        if (cancelled || idx >= remaining.length) return;
        preloadTab(remaining[idx++]);
        scheduleNext();
      };
      if (typeof win.requestIdleCallback === "function") {
        idleId = win.requestIdleCallback(run, { timeout: 600 });
      } else {
        timerId = window.setTimeout(run, 120);
      }
    };

    timerId = window.setTimeout(scheduleNext, 250);
    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
    };
  }, []);

  // Tag only tables affected by DOM insertions; batch work to one animation frame.
  // Avoid rescanning every table in the document after unrelated React updates.
  useEffect(() => {
    const pendingRoots = new Set<ParentNode>();
    let frameId: number | null = null;

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          const element = node instanceof Element ? node : node.parentElement;
          if (!element) return;

          const table = element.matches("table")
            ? element
            : element.closest("table") ?? element.querySelector("table");

          if (table) {
            pendingRoots.add(table.parentElement ?? document);
          } else if (element.querySelector("table")) {
            pendingRoots.add(element);
          }
        });
      });

      if (pendingRoots.size === 0 || frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        pendingRoots.forEach((root) => tagSerialColumns(root));
        pendingRoots.clear();
        frameId = null;
      });
    });

    tagSerialColumns(document);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      pendingRoots.clear();
    };
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
      setMountedTabs((current) => current.has(tab) ? current : new Set(current).add(tab));
      setActiveTab(tab);
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
    setMountedTabs((current) => current.has("installments") ? current : new Set(current).add("installments"));
    setActiveTab("installments");
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

    preloadTab(tab);
    setMountedTabs((current) => current.has(tab) ? current : new Set(current).add(tab));
    activeTabRef.current = tab;
    tabHistoryRef.current = [...tabHistoryRef.current, tab];
    setActiveTab(tab);
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
      className="apk-tabs-ui w-full min-h-[100dvh] bg-[#F5EFE6] selection:bg-[#d5b35b]/30 text-base"
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
          <button
            type="button"
            onClick={() => setFeeNotificationsOpen(true)}
            className="relative inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-gradient-to-b from-red-500 to-red-700 px-2.5 py-2 text-xs font-black text-white shadow-[0_4px_12px_rgba(185,28,28,.32)] transition hover:from-red-600 hover:to-red-800 active:scale-95 sm:gap-2 sm:px-3 sm:text-sm"
            aria-label={`إشعارات الرسوم غير المسددة: ${feeNotifications.length} متدرب`}
          >
            <Bell className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">إشعارات الرسوم</span>
            <span className="min-w-5 rounded-full bg-white px-1.5 py-0.5 text-center text-[10px] font-black text-red-700">{feeNotifications.length}</span>
          </button>
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
        className="app-main-nav sticky top-0 z-[60] border-b border-[#d8c49a] bg-[#F5EFE6]/95 shadow-[0_8px_22px_rgba(93,67,31,0.12)] backdrop-blur-xl"
        dir="rtl"
        aria-label="التنقل الرئيسي"
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center px-2 py-2 sm:px-4">
          <div className="app-tab-nav-items flex w-full flex-nowrap items-end gap-3 overflow-x-auto px-2 py-3 sm:gap-4 lg:justify-center lg:overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onPointerEnter={() => preloadTab(tab.value)}
                  onPointerDown={() => preloadTab(tab.value)}
                  onFocus={() => preloadTab(tab.value)}
                  onClick={() => handleTabChange(tab.value)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.label}
                  className={`app-tab-nav-item relative flex min-h-[104px] w-[100px] shrink-0 flex-col items-center justify-start gap-2 overflow-hidden rounded-[22px] border-[3px] border-[#c49a3a] px-2 pb-3 pt-2 text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#b88b2c] focus:ring-offset-2 sm:min-h-[116px] sm:w-[116px] ${isActive ? "is-active" : ""}`}
                >
                  <span className="app-tab-medical-strip flex h-6 w-full items-center justify-center rounded-t-[13px]" aria-hidden="true">
                    <Plus className="h-4 w-4 stroke-[3.5] text-white" />
                  </span>
                  <span className="app-tab-ecg" aria-hidden="true" />
                  <span className="app-tab-icon relative z-[2] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 shadow-inner" aria-hidden="true">{tab.icon}</span>
                  <span className="relative z-[2] whitespace-nowrap text-[11px] font-extrabold leading-tight sm:text-xs">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
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
          {mountedTabs.has("trainee-data") && (
            <div style={{ display: activeTab === "trainee-data" ? "block" : "none" }} aria-hidden={activeTab !== "trainee-data"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل بيانات المتدربين…</div>}><TraineeFinancialDataTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("installments") && (
            <div style={{ display: activeTab === "installments" ? "block" : "none" }} aria-hidden={activeTab !== "installments"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل الأقساط…</div>}><InstallmentsTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("hafiza") && (
            <div style={{ display: activeTab === "hafiza" ? "block" : "none" }} aria-hidden={activeTab !== "hafiza"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل الحوافظ…</div>}><HafizaTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("account") && (
            <div style={{ display: activeTab === "account" ? "block" : "none" }} aria-hidden={activeTab !== "account"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل الحساب الجاري…</div>}><AccountTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("journal") && (
            <div style={{ display: activeTab === "journal" ? "block" : "none" }} aria-hidden={activeTab !== "journal"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل القيود اليومية…</div>}><JournalTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("monthly") && (
            <div style={{ display: activeTab === "monthly" ? "block" : "none" }} aria-hidden={activeTab !== "monthly"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل الكشف الشهري…</div>}><MonthlyStatementTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("revenue") && (
            <div style={{ display: activeTab === "revenue" ? "block" : "none" }} aria-hidden={activeTab !== "revenue"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل الإيرادات…</div>}><RevenueTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("expenses-table") && (
            <div style={{ display: activeTab === "expenses-table" ? "block" : "none" }} aria-hidden={activeTab !== "expenses-table"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل المصروفات…</div>}><ExpensesTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("reports") && (
            <div style={{ display: activeTab === "reports" ? "block" : "none" }} aria-hidden={activeTab !== "reports"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل التقارير…</div>}><ReportsTab /></Suspense>
            </div>
          )}
          {mountedTabs.has("general-expenses-ledger") && (
            <div style={{ display: activeTab === "general-expenses-ledger" ? "block" : "none" }} aria-hidden={activeTab !== "general-expenses-ledger"}>
              <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-[#2e6b8a]" role="status">جارٍ تحميل سجل النفقات…</div>}><AppTabs /></Suspense>
            </div>
          )}
        )}
      </div>


      {feeNotificationsOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-2 sm:p-5"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setFeeNotificationsOpen(false); }}
        >
          <section className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="fee-notifications-title" dir="rtl">
            <header className="flex items-center justify-between gap-3 border-b border-red-100 bg-gradient-to-l from-red-800 via-red-700 to-rose-600 px-4 py-3 text-white sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <Bell className="h-6 w-6 shrink-0" />
                <div className="min-w-0">
                  <h2 id="fee-notifications-title" className="truncate text-base font-black sm:text-lg">إشعارات الرسوم غير المسددة</h2>
                  <p className="text-xs font-semibold text-red-100">حالة السداد حتى تاريخ {notificationDateLabel}</p>
                </div>
              </div>
              <button type="button" onClick={() => setFeeNotificationsOpen(false)} className="rounded-lg p-2 text-white transition hover:bg-white/15" aria-label="إغلاق"><X className="h-5 w-5" /></button>
            </header>
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              <span>المتدربون الذين لديهم رسوم غير مسددة</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">{feeNotifications.length} متدرب</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              {feeNotifications.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center font-bold text-emerald-800">لا توجد رسوم غير مسددة للمتدربين النشطين حتى هذا التاريخ.</div>
              ) : (
                <div className="space-y-3">
                  {feeNotifications.map((trainee, index) => (
                    <article key={trainee.name} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-black text-red-700">{index + 1}</span>
                          <h3 className="font-black text-slate-900">{trainee.name}</h3>
                        </div>
                        {trainee.batch && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">الدفعة: {trainee.batch}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trainee.unpaidFees.map((fee) => <span key={fee} className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-800">{fee}</span>)}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <footer className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <button type="button" onClick={() => setFeeNotificationsOpen(false)} className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-bold text-white hover:bg-slate-900">إغلاق</button>
            </footer>
          </section>
        </div>
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default Index;
