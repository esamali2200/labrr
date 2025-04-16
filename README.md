# نظام إدارة المختبر الطبي

نظام إدارة متكامل للمختبرات الطبية يتيح إدارة المستخدمين والمواعيد والفحوصات الطبية.

## المميزات

- واجهة إدارة سهلة الاستخدام
- إدارة المستخدمين (إضافة، تعديل، حذف)
- إدارة المواعيد
- إدارة الفحوصات الطبية
- تقارير وإحصائيات
- واجهة مستخدم متجاوبة

## المتطلبات

- Node.js (الإصدار 14 أو أحدث)
- MongoDB
- npm أو yarn

## التثبيت

1. استنساخ المستودع:
```bash
git clone https://github.com/esamali2200/labrr.git
cd labrr
```

2. تثبيت التبعيات:
```bash
npm install
```

3. إنشاء ملف `.env` وإضافة المتغيرات البيئية:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lab-db
JWT_SECRET=your-secret-key
```

4. تشغيل الخادم:
```bash
npm start
```

## هيكل المشروع

```
labrr/
├── public/          # الملفات الثابتة
│   ├── css/        # ملفات CSS
│   ├── js/         # ملفات JavaScript
│   └── pages/      # صفحات HTML
├── src/            # الكود المصدري
│   ├── controllers/ # المتحكمات
│   ├── models/     # النماذج
│   ├── routes/     # المسارات
│   └── utils/      # الأدوات المساعدة
├── .env            # متغيرات البيئة
├── .gitignore      # ملفات Git المستثناة
├── package.json    # تبعيات المشروع
└── README.md       # وثائق المشروع
```

## المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. عمل Fork للمشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. عمل Commit للتغييرات (`git commit -m 'إضافة ميزة جديدة'`)
4. رفع التغييرات (`git push origin feature/amazing-feature`)
5. فتح طلب Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل. 