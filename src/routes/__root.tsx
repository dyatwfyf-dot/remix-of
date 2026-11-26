import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { initPwa } from "@/lib/pwa";
import { ReportDateProvider } from "@/lib/reportDate";
import OfflineStatus from "@/components/OfflineStatus";

function NotFoundComponent() {
  const router = useRouter();

  // تحويل فوري وتلقائي إلى الصفحة الرئيسية عند طلب /index أو أي مسار غير معرّف
  useEffect(() => {
    router.navigate({ to: "/", replace: true });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">جاري التوجيه...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          يتم نقلك الآن إلى الصفحة الرئيسية للنظام تلقائياً.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            الذهاب للرئيسية مباشرة
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          لم يتم تحميل الصفحة
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حدث خطأ غير متوقع، يمكنك إعادة المحاولة أو الرجوع للصفحة الرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes, maximum-scale=5",
      },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "format-detection", content: "telephone=no" },
      { title: "المجلس الطبي" },
      { name: "description", content: "المجلس الطبي — النظام الإداري والمالي للمجلس اليمني للاختصاصات الطبية" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "المجلس الطبي" },
      { property: "og:description", content: "إدارة القيود اليومية والحوافظ والأقساط والتقارير المالية بسهولة ووضوح." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "المجلس الطبي" },
      { name: "twitter:description", content: "إدارة القيود اليومية والحوافظ والأقساط والتقارير المالية بسهولة ووضوح." },
      {
        property: "og:image",
        content:
          "/app-splash.svg",
      },
      {
        name: "twitter:image",
        content:
          "/app-splash.svg",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const isCapacitorSpa =
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("apk-compact") || Capacitor.isNativePlatform());

  if (isCapacitorSpa) {
    return <>{children}</>;
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initPwa();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReportDateProvider>
        <OfflineStatus />
        <Outlet />
      </ReportDateProvider>
    </QueryClientProvider>
  );
}
