# تحويل التطبيق إلى تطبيق أندرويد

## المتطلبات (على جهازك)
- Node.js 20+ و pnpm
- Android Studio (يتضمن JDK 21 و Android SDK)

## الخطوات
1. صدّر المشروع إلى GitHub ثم انسخه: `git clone <رابط المستودع>` ثم `cd` إلى المجلد.
2. ثبّت الحزم: `pnpm install`
3. نسخة تجريبية (APK):
   `pnpm run build:android:debug`
   الملف: `android/app/build/outputs/apk/debug/app-debug.apk`
4. نسخة نهائية للنشر:
   `pnpm run build:android`
   (تحتاج توقيع الملف بمفتاح keystore من Android Studio: Build > Generate Signed Bundle/APK)
5. للفتح في Android Studio: `npx cap open android`

## بعد أي تعديل في التطبيق
`git pull` ثم `pnpm run build:android:debug`

## ما تم ضبطه للأداء
- تسريع رسومي وذاكرة أكبر للجداول الكبيرة.
- لوحة المفاتيح لا تغطي حقول الإدخال.
- حماية مكونات Capacitor من الحذف عند تصغير النسخة النهائية.
- التطبيق يعمل بدون إنترنت (ملفات مدمجة داخل الـ APK).
