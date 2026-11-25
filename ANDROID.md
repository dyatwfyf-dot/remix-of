# تحويل التطبيق إلى تطبيق أندرويد (متوافق مع هواتف شاومي)

## المتطلبات (على جهازك)
- Node.js 20+ و npm
- Android Studio (يتضمن JDK 21 و Android SDK) أو تشغيل workflow `Build Mizan Android APK` على GitHub Actions

## الخطوات
1. صدّر المشروع إلى GitHub ثم انسخه: `git clone <رابط المستودع>` ثم `cd` إلى المجلد.
2. ثبّت الحزم: `npm install`
3. نسخة تجريبية قابلة للتثبيت مباشرة على شاومي (APK):
   `npm run build:android:debug`
   الملف الناتج: `android/app/build/outputs/apk/debug/app-debug.apk`
4. نسخة نهائية للنشر:
   `npm run build:android`
   (تحتاج توقيع الملف بمفتاح keystore من Android Studio: Build > Generate Signed Bundle/APK)
5. للفتح في Android Studio: `npx cap open android`

## بعد أي تعديل في التطبيق
`git pull` ثم `npm run build:android:debug`

## ما تم ضبطه للعمل بدون إنترنت وعلى هواتف شاومي
- العمل الكامل دون اتصال بالإنترنت: جميع الأصول والخطوط العربية وبيانات التخزين المحلي مدمجة وتعمل من داخل الحزمة دون إظهار تنبيهات انقطاع الشبكة.
- تثبيت مقياس الخط داخل WebView (`setTextZoom(100)`) ومنع التمدد الزائد (`OVER_SCROLL_NEVER`) لتفادي تشوّه الجداول عند تكبير خط النظام في MIUI/HyperOS.
- حماية الواجهة من تداخل شريط الحالة والحواف في Android 15/16 (`windowOptOutEdgeToEdgeEnforcement`) على أجهزة شاومي الحديثة.
- تعطيل تأثيرات `backdrop-filter` الثقيلة في وضع APK وتقسيم حزم JavaScript لتقليل زمن الإقلاع ومنع التعليق.
- دعم الطباعة وتصدير PDF وملفات Excel مباشرة عبر نظام أندرويد ومشاركتها أو حفظها من داخل الهاتف دون إنترنت.
