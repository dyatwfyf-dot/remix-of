import type { Installment } from "./store";
import type { ImportKind } from "./exportImport";
import type { ExcelWorkerRequest } from "@/workers/excelImportWorker";
import ExcelImportWorker from "../workers/excelImportWorker?worker";
import { MAX_INSTALLMENT_IMPORT_BYTES } from "./installmentImportLimits";

type WorkerSuccess<T> = { ok: true; data: T };
type WorkerFailure = { ok: false; error: string };
type WorkerResponse<T> = WorkerSuccess<T> | WorkerFailure;

const WORKER_TIMEOUT_MS = 60_000;
const MAX_MAIN_THREAD_FALLBACK_BYTES = 256 * 1024;

class WorkerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerUnavailableError";
  }
}

function runWorker<T>(request: ExcelWorkerRequest, transfer: ArrayBuffer): Promise<T> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new ExcelImportWorker();
    } catch (error) {
      reject(
        new WorkerUnavailableError(
          error instanceof Error ? error.message : "تعذر تشغيل عامل استيراد Excel",
        ),
      );
      return;
    }

    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      worker.terminate();
      callback();
    };
    const timeoutId = setTimeout(() => {
      finish(() =>
        reject(
          new Error(
            "استغرق تحليل ملف الأقساط وقتاً أطول من المتوقع. تم إيقاف المهمة لحماية التطبيق؛ جرّب حفظ الورقة المطلوبة فقط أو تقسيم الملف.",
          ),
        ),
      );
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<WorkerResponse<T>>) => {
      finish(() => {
        if (event.data?.ok) resolve(event.data.data);
        else reject(new Error(event.data?.error || "تعذر تحليل ملف Excel"));
      });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish(() =>
        reject(
          new WorkerUnavailableError(event.message || "توقف عامل قراءة Excel قبل إكمال المهمة"),
        ),
      );
    };
    worker.onmessageerror = () => {
      finish(() => reject(new Error("تعذر نقل نتيجة تحليل Excel إلى التطبيق")));
    };

    try {
      worker.postMessage(request, [transfer]);
    } catch (error) {
      finish(() => reject(error instanceof Error ? error : new Error(String(error))));
    }
  });
}

async function runWithFallback<T>(
  file: File,
  request: (buffer: ArrayBuffer) => ExcelWorkerRequest,
  fallback: (buffer: ArrayBuffer) => Promise<T>,
  options: { maxFileBytes?: number; maxFallbackBytes?: number } = {},
): Promise<T> {
  const maxFileBytes = options.maxFileBytes;
  const maxFallbackBytes = options.maxFallbackBytes ?? MAX_MAIN_THREAD_FALLBACK_BYTES;
  if (maxFileBytes !== undefined && file.size > maxFileBytes) {
    throw new Error(
      `حجم الملف يتجاوز الحد الآمن (${Math.round(maxFileBytes / (1024 * 1024))} ميجابايت). قسّم الملف ثم أعد الاستيراد.`,
    );
  }

  // نقرأ الملف مرة واحدة فقط. لا نعيد تحميله كاملاً إلى الذاكرة عند فشل Worker.
  const buffer = await file.arrayBuffer();
  if (typeof Worker === "undefined") {
    if (buffer.byteLength <= maxFallbackBytes) return fallback(buffer);
    throw new Error("متصفح الجهاز لا يدعم عامل Excel اللازم لاستيراد هذا الملف بأمان.");
  }

  try {
    return await runWorker<T>(request(buffer), buffer);
  } catch (error) {
    // لا نعيد تحليل الملفات الكبيرة على الخيط الرئيسي؛ ذلك كان يجمّد WebView.
    // يسمح بالمسار التوافقي فقط عند فشل بدء Worker وللملفات الصغيرة جداً.
    if (error instanceof WorkerUnavailableError && buffer.byteLength <= maxFallbackBytes) {
      console.warn("[Excel] Worker unavailable; using bounded small-file fallback", error);
      return fallback(buffer);
    }
    if (error instanceof WorkerUnavailableError) {
      throw new Error(
        "تعذر تشغيل محلل Excel بالخلفية. حدّث Android System WebView ثم أعد المحاولة.",
      );
    }
    throw error;
  }
}

export function importExcelInWorker(file: File, kind: ImportKind) {
  return runWithFallback(
    file,
    (buffer) => ({ mode: "shared", buffer, name: file.name, kind }),
    async (buffer) => {
      const { importFromExcel } = await import("./exportImport");
      return importFromExcel(buffer, kind, file.name);
    },
  );
}

export function importUsageInWorker(file: File, importMonthId: number) {
  return runWithFallback(
    file,
    (buffer) => ({ mode: "usage", buffer, importMonthId }),
    async (buffer) => {
      const { parseUsageExcel } = await import("./parseUsageExcel");
      return parseUsageExcel(buffer, importMonthId);
    },
  );
}

export function importInstallmentsInWorker(file: File, year: 2025 | 2026) {
  return runWithFallback(
    file,
    (buffer) => ({ mode: "installments", buffer, year }),
    async (buffer) => {
      const { parseInstallmentsExcel } = await import("./parseInstallmentsExcel");
      return parseInstallmentsExcel(buffer, year);
    },
    {
      maxFileBytes: MAX_INSTALLMENT_IMPORT_BYTES,
      maxFallbackBytes: 256 * 1024,
    },
  ) as Promise<Installment[]>;
}
