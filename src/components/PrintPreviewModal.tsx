import React, { useState, useRef, useEffect } from "react";
import { Printer, X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { printReportHtml } from "@/lib/nativePrinter";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reportDateLabel?: string;
  htmlContent: string;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  title,
  reportDateLabel = "",
  htmlContent,
}: PrintPreviewModalProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // إعادة ضبط التكبير عند فتح التقرير
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // إغلاق النافذة بزر Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 180));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
  const handleZoomReset = () => setZoom(100);

  const handlePrintNow = () => {
    // إرسال كود الـ HTML الكامل للطباعة
    const printDocHtml = `<!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); }, 250);
            };
          </script>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>`;
    printReportHtml(printDocHtml, `${title} - ${reportDateLabel}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* شريط الأدوات العلوي */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-[#0d2a3a] px-4 py-2.5 text-white shadow-md border-b border-[#1f5f7a]/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f5f7a]/40 text-sky-300">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sky-100 sm:text-base leading-tight">
              معاينة الطباعة: {title}
            </h2>
            {reportDateLabel && (
              <span className="text-xs text-sky-300/80 font-medium">{reportDateLabel}</span>
            )}
          </div>
        </div>

        {/* أدوات التحكم والتكبير وزر الطباعة والإغلاق */}
        <div className="flex items-center gap-2">
          {/* أزرار التكبير والتصغير */}
          <div className="hidden sm:flex items-center bg-[#153e54] rounded-lg p-0.5 border border-sky-400/20 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-sky-500/20 rounded transition-colors text-sky-200"
              title="تصغير"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono font-bold text-sky-200 min-w-[45px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-sky-500/20 rounded transition-colors text-sky-200"
              title="تكبير"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 hover:bg-sky-500/20 rounded transition-colors text-sky-300 border-r border-sky-400/20 mr-0.5"
              title="إعادة ضبط 100%"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* زر ملء الشاشة */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden md:flex p-2 rounded-lg bg-[#153e54] text-sky-200 hover:bg-sky-500/20 border border-sky-400/20 transition-colors"
            title={isFullscreen ? "تصغير النافذة" : "ملء الشاشة"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* زر تأكيد وإرسال للطباعة */}
          <button
            onClick={handlePrintNow}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/40 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة الآن</span>
          </button>

          {/* زر الإغلاق */}
          <button
            onClick={onClose}
            className="flex items-center justify-center p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white active:scale-95 transition-all cursor-pointer mr-1"
            title="إغلاق المعاينة (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* منطقة محاكاة ورقة A4 داخل المعاينة */}
      <main className="flex-1 overflow-auto bg-slate-800/90 p-3 sm:p-6 flex justify-center items-start">
        <div
          className="transition-transform duration-150 origin-top flex justify-center w-full"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div
            className={`bg-white text-black shadow-2xl rounded-sm border border-slate-300 overflow-hidden ${
              isFullscreen ? "w-full max-w-[1200px]" : "w-full max-w-[960px]"
            } min-h-[900px]`}
          >
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title={`معاينة: ${title}`}
              className="w-full h-[95vh] border-0 bg-white"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
