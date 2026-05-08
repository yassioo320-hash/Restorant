# مطعم رستورانت - موقع قائمة طعام

موقع قائمة طعام لمطعم بتصميم عربي فاخر، متجاوب، مدعوم بـ Supabase لإدارة البيانات والتحقق.

## هيكل المشروع

```
Restorant/
├── index.html          ← الموقع العام (RTL عربي، متجاوب)
├── styles.css          ← التصميم (مظهر فاخر، حركات انتقال)
├── app.js              ← تحميل البيانات من Supabase، البحث، تصفية الفئات
├── supabase-config.js  ← إعدادات اتصال Supabase
├── supabase-schema.sql ← مخطط قاعدة البيانات
├── data-migration.sql  ← ترحيل البيانات من menu.json إلى Supabase
├── .env.example        ← نموذج متغيرات البيئة
├── data/
│   └── menu.json      ← بيانات القائمة (للترحيل فقط)
├── admin/
│   ├── index.html     ← لوحة التحكم المخصصة
│   ├── app.js         ← منطق لوحة التحكم (CRUD، مصادقة)
│   └── styles.css     ← تصميم لوحة التحكم
├── assets/
│   └── images/        ← صور الأطباق
├── _redirects          ← توجيه Netlify
└── netlify.toml        ← إعدادات بناء Netlify
```

## إعداد Supabase

### 1. إنشاء مشروع Supabase
1. ادخل إلى [Supabase](https://supabase.com) وأنشئ حساباً جديداً
2. أنشئ مشروعاً جديداً (New Project)
3. انتظر حتى يكتمل إعداد المشروع

### 2. تشغيل مخطط قاعدة البيانات
1. اذهب إلى **SQL Editor** في لوحة تحكم Supabase
2. انسخ محتوى ملف `supabase-schema.sql` وشغله
3. هذا سينشئ:
   - جدول `categories` (الفئات)
   - جدول `menu_items` (أصناف القائمة)
   - سياسات الأمان (RLS)
   - سلة تخزين `menu-images` للصور

### 3. إنشاء سلة التخزين (Storage Bucket)
1. اذهب إلى **Storage** في لوحة تحكم Supabase
2. أنشئ سلة جديدة باسم `menu-images`
3. اجعلها **Public** (عامة) لتتمكن الصور من الظهور في الموقع
4. حد حجم الملف: 5MB
5. أنواع الملفات المسموحة: `image/*`

أو شغل هذا في SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images', 'menu-images', true, 5242880,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
```

### 4. ترحيل البيانات
1. اذهب إلى **SQL Editor**
2. انسخ محتوى `data-migration.sql` وشغله لإضافة البيانات الأولية
3. أو اذهب إلى **Table Editor** وأضف البيانات يدوياً

### 5. الحصول على مفاتيح API
1. اذهب إلى **Project Settings → API**
2. انسخ **URL** و **anon public** key
3. أنشئ ملف `.env` من `.env.example`:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. حدّث ملف `supabase-config.js` بمفاتيحك

### 6. إعداد المصادقة (Auth)
1. اذهب إلى **Authentication → Settings**
2. فعّل **Email** provider (مفعل افتراضياً)
3. أضف مستخدمين يدوياً من **Authentication → Users → Add User**
4. أو فعّل **Sign up** للسماح بالتسجيل المفتوح

## الوصول للوحة التحكم

1. انشر الموقع على Netlify (انظر تعليمات النشر أدناه)
2. اذهب إلى `https://your-site.netlify.app/admin/`
3. سجّل الدخول باستخدام البريد الإلكتروني وكلمة المرور
4. إذا نسيت كلمة المرور، اضغط "نسيت كلمة المرور" لإرسال رابط إعادة التعيين

## إدارة القائمة

بعد الدخول، ستجد تبويبين:

### الأصناف (Items)
- **إضافة صنف جديد**: اضغط "+ إضافة صنف جديد"
- **تعديل صنف**: اضغط أيقونة القلم ✏️
- **حذف صنف**: اضغط أيقونة الحذف 🗑️ (تأكيد مطلوب)
- **تغيير الحالة**: اضغط زر "متاح/غير متاح" لتغيير ظهور الصنف في الموقع
- **رفع صورة**: اختر صورة من جهازك (تُرفع إلى Supabase Storage تلقائياً)
- **الوسوم**: اختر الوسوم المناسبة (شائع، حار، جديد، إلخ)

### الفئات (Categories)
- **إضافة فئة**: اضغط "+ إضافة فئة"
- **حذف فئة**: اضغط زر الحذف (لا يمكن الحذف إذا كانت هناك أصناف مرتبطة)

### البحث والتصفية
- استخدم حقل البحث للبحث في الأصناف
- صفِّ حسب الفئة أو حالة التوفر

## الوسوم المتاحة
أضف وسوم للأصناف مثل:
- `popular` / شائع ← يظهر شارة "شائع"
- `best-seller` ← يظهر شارة "الأكثر مبيعاً"
- `new` ← يظهر شارة "جديد"
- `spicy` ← يظهر شارة "حار"
- `chef-special` ← يظهر شارة "خاص"
- `vegetarian`, `vegan`, `gluten-free` ← تظهر كوسوم عادية

## نشر الموقع على Netlify

### خطوات سريعة:
1. ارفع المشروع إلى GitHub/GitLab/Bitbucket
2. ادخل إلى [Netlify](https://netlify.com) واضغط "Add new site"
3. اربط مستودعك (repository)
4. إعدادات البناء:
   - **Build command**: (اتركه فارغاً - موقع ثابت)
   - **Publish directory**: `.` (الجذر)
5. أضف متغيرات البيئة (Environment Variables):
   - `SUPABASE_URL` = رابط مشروع Supabase
   - `SUPABASE_ANON_KEY` = مفتاح anon العام
6. اضغط "Deploy site"

### تفعيل لوحة التحكم:
ليس هناك حاجة لتفعيل Netlify Identity - نستخدم Supabase Auth الآن.
تأكد فقط من رفع الملفات وصحة روابط Supabase في `supabase-config.js`.

## النشر على Vercel (بديل)

1. ادخل إلى [Vercel](https://vercel.com)
2. اضغط "New Project" واربط مستودعك
3. إعدادات:
   - **Framework Preset**: Other
   - **Output Directory**: `.` (الجذر)
4. أضف متغيرات البيئة كما في Netlify
5. اضغط "Deploy"

## ملاحظات تقنية
- البيانات تُحفظ في Supabase (PostgreSQL)
- الصور تُرفع إلى Supabase Storage
- المصادقة تتم عبر Supabase Auth
- الموقع العام يقرأ البيانات مباشرة من Supabase
- لوحة التحكم محمية - تتطلب تسجيل دخول
- الواجهة الأمامية تستخدم CDN لتحميل مكتبة Supabase (لا حاجة لبناء المشروع)

## التقنيات المستخدمة
- HTML5 / CSS3 (بدون إطارات عمل)
- JavaScript (ES6+)
- Supabase (قاعدة بيانات، مصادقة، تخزين)
- Google Fonts (Cairo font)
- Netlify / Vercel (الاستضافة)
# Restorant_Test-3
# Restorant_Test-3
