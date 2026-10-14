# شرح المرحلة 2 — UI/UX & React Foundation

> كُتب هذا الملف بأثر رجعي في 2026-10-14 (D-25)، اعتمادًا على الكود الموجود حاليًا في `src/`.
> أُعيد تشغيل `npm run lint` و`npm run build` ومقارنة مفاتيح الترجمة في جلسة 2026-10-14، والنتائج في القسم 7.

---

## 1. ملخص المرحلة

**الهدف:** هيكل واجهة يعمل فعلًا: متجاوب، وثنائي اللغة (عربي RTL وإنجليزي LTR)، فيه تنقّل بين الصفحات ومكوّنات UI قابلة لإعادة الاستخدام، لكن **دون أي منطق بيانات حقيقي**.

**ما أُنجز فعليًا** (P2-T01 إلى P2-T10):
- `docs/DESIGN_SYSTEM.md`: الألوان والخطوط والمسافات وقواعد RTL ومخططات الشاشات.
- مشروع Vite 8 + React 19، مع Tailwind CSS 4 وESLint 10 والاختصار `@/` لمجلد `src/`.
- نظام ترجمة داخلي (`src/lib/i18n/`) وزر تبديل اللغة، والاختيار يُحفظ.
- React Router 8: ثماني صفحات، وصفحة 404، وتحويل `/` إلى `/dashboard`، وتحميل صفحة Analytics عند الحاجة فقط (lazy).
- تخطيطان: `AppLayout` (قائمة جانبية على الشاشات الكبيرة وشريط سفلي على الجوال) و`AuthLayout` لشاشات الحساب.
- تسعة مكوّنات UI و`ErrorBoundary`.
- الـ skill `.claude/skills/feature-development/SKILL.md`.

### الحقيقي مقابل التجريبي (مهم جدًا)
**حقيقي ويعمل:**
- التنقّل بين الصفحات، وصفحة 404، والتحويل من `/`.
- تبديل اللغة والاتجاه وحفظ الاختيار.
- كل مكوّنات UI (Dialog، Toast، Button...) وسلوكها مع لوحة المفاتيح.
- التخطيط المتجاوب.

**تجريبي (Mock / Sample) — ليس بيانات حقيقية:**
- أرقام اللوحة والمهام والتحليلات مكتوبة **يدويًا** في `src/pages/preview/sampleData.js`. نسبة `67%` مثلًا ليست محسوبة.
- نماذج الدخول والتسجيل لا ترسل شيئًا. تعرض Toast فقط (`usePreviewSubmit`).
- لا يمكن إضافة مهمة أو إنجازها أو حذفها. علامة الإنجاز في `TaskItem` شكل فقط.
- يظهر تنبيه "معاينة" في كل صفحة تجريبية حتى لا تُفهم البيانات على أنها حقيقية (D-22).

---

## 2. الملفات والمجلدات

### الإعداد (جذر المشروع)
- `package.json`: الاعتماديات والأوامر `dev` و`build` و`lint` و`preview`.
- `vite.config.js`: يفعّل React وTailwind، ويعرّف الاختصار `@` → `src/`.
- `jsconfig.json`: يعرّف نفس الاختصار لـ VS Code حتى يعمل الإكمال التلقائي.
- `eslint.config.js`: قواعد ESLint (flat config) مع قواعد React Hooks.
- `index.html`: نقطة الدخول. يحمّل خط IBM Plex Sans Arabic، وفيه سكربت صغير يطبّق اللغة المحفوظة قبل أول رسم.

### `src/app/` — تجميع التطبيق
- `main.jsx` (في `src/`): يركّب `<App />` داخل `#root`.
- `App.jsx`: يجمع `AppProviders` و`ScrollToTop` و`AppRoutes`.
- `AppProviders.jsx`: يغلّف التطبيق بالـ providers بالترتيب.
- `AppRoutes.jsx`: جدول المسارات.
- `ErrorBoundary.jsx`: شاشة استعادة بدل صفحة بيضاء عند خطأ غير متوقع.

### `src/lib/` — أدوات عامة
- `cx.js`: يدمج أسماء الـ classes ويتجاهل القيم الفارغة.
- `i18n/`: `I18nProvider.jsx` (الحالة)، و`I18nContext.js`، و`useI18n.js` (الـ hook)، و`translate.js` (دالة pure للبحث والتعويض)، و`ar.js` و`en.js` (القواميس).

### `src/components/ui/` — مكوّنات عامة لا تعرف شيئًا عن المهام
- `Button.jsx` و`buttonStyles.js` (الأشكال، ويُستخدم أيضًا لتنسيق `Link` كزر).
- `Input.jsx`، و`Card.jsx`، و`Dialog.jsx`، و`ProgressBar.jsx`، و`EmptyState.jsx`، و`Spinner.jsx`، و`Alert.jsx`.
- `ToastProvider.jsx` و`ToastContext.js` و`useToast.js`: نظام الإشعارات.
- `textLink.js`: تنسيق الروابط النصية (مسطّرة دائمًا).

### `src/components/layout/` — الهيكل والتنقّل
- `AppLayout.jsx` و`AuthLayout.jsx`: التخطيطان.
- `SideNav.jsx` و`BottomNav.jsx` و`navItems.js`: القائمتان ومصدر واحد لعناصرهما.
- `LanguageSwitch.jsx`، و`BrandMark.jsx` (الشعار)، و`PageHeader.jsx` و`AuthHeader.jsx` (العناوين + `<title>`).
- `SkipLink.jsx`، و`PageLoader.jsx`، و`ScrollToTop.jsx`.

### `src/features/` — مكوّنات خاصة بميزة
- `tasks/components/`: `TaskList.jsx` و`TaskItem.jsx`.
- `dashboard/components/`: `TodaySummary.jsx` و`MotivationMessage.jsx` و`OverdueBanner.jsx`.
- `analytics/components/`: `WeekComparison.jsx` و`PersonalBest.jsx` و`CalculationInfo.jsx`.

### `src/pages/` — شاشات المسارات
- `DashboardPage`، و`TasksPage`، و`AnalyticsPage`، و`LoginPage`، و`RegisterPage`، و`ForgotPasswordPage`، و`ResetPasswordPage`، و`NotFoundPage`.
- `UiGalleryPage.jsx`: معرض المكوّنات على `/ui`، في وضع التطوير فقط.
- `preview/`: **كود مؤقت** للمعاينة (`sampleData.js`، و`usePreviewState.js`، و`usePreviewSubmit.js`، و`PreviewNotice.jsx`). سيُحذف تدريجيًا في المراحل 3–5.

### التنسيق
- `src/index.css`: `@import "tailwindcss"` ورموز التصميم داخل `@theme`.

---

## 3. التقنيات والمكتبات

### Vite 8
- **ما هو:** أداة تشغيل وبناء. في التطوير يخدم الملفات فورًا مع تحديث لحظي، وفي `build` يجمعها في ملفات صغيرة للإنتاج.
- **في المشروع:** `npm run dev` و`npm run build`. والميزة `import.meta.env.DEV` تسمح بكود يعمل في التطوير فقط (مثل `/ui`).

### Tailwind CSS v4
- **ما الجديد عن v3:** لا يوجد `tailwind.config.js`. الإعداد كله داخل CSS بـ `@theme`.
- **في المشروع:** حذفنا الألوان الافتراضية كلها، وعرّفنا ألواننا فقط:

```css
/* src/index.css */
@theme {
  --color-*: initial;          /* يمسح لوحة ألوان Tailwind الافتراضية */
  --color-paper: #f6f4ef;
  --color-ink: #1b1a17;
  --color-pine-600: #1e5a47;   /* اللون الأساسي */
  --color-ember-600: #c2551f;  /* لون "أفضل أداء" */
  ...
}
```

النتيجة: `bg-pine-600` يعمل، أما `bg-blue-500` فلا يعمل، وهذا يفرض الالتزام بنظام التصميم.

### React Router 8 (declarative mode)
- **ما هو:** يربط الـ URL بمكوّن React دون إعادة تحميل الصفحة.
- **المفاهيم:** `<Routes>`/`<Route>` للجدول، و`<Outlet>` لمكان الصفحة داخل التخطيط، و`<Link>`/`<NavLink>` للتنقّل، و`useLocation`/`useSearchParams` لقراءة الـ URL.
- **ملاحظة:** في الإصدار 8 الاستيراد من `react-router`، لا من `react-router-dom`.

### Lucide React
- أيقونات SVG كمكوّنات: `<Sun />` و`<ListChecks />`. كلها `aria-hidden="true"` لأن النص المجاور يكفي قارئ الشاشة.

### ESLint 10
- يكشف الأخطاء قبل التشغيل، خصوصًا قواعد الـ Hooks (`eslint-plugin-react-hooks`). قالب Vite أصبح يأتي بـ oxlint، فاستبدلناه بـ ESLint كما ينص الـ stack (D-23).

### ميزات React 19 التي استخدمناها
- `<title>` داخل المكوّن: React 19 ينقله تلقائيًا إلى `<head>` (في `PageHeader` و`AuthHeader`).
- `lazy` و`Suspense` لتحميل صفحة التحليلات عند الحاجة.
- `useId` لربط `label` بالحقل و`aria-labelledby` بالعنوان دون تعارض في المعرّفات.

---

## 4. شرح الكود

### 4.1 شجرة الـ Providers

```jsx
// src/app/AppProviders.jsx
<I18nProvider>
  <ErrorBoundary>
    <BrowserRouter>
      <ToastProvider>{children}</ToastProvider>
    </BrowserRouter>
  </ErrorBoundary>
</I18nProvider>
```

لماذا هذا الترتيب؟
- `I18nProvider` في الخارج، لأن `ErrorBoundary` نفسه يحتاج `t()` ليعرض رسالة الخطأ بلغة المستخدم.
- `BrowserRouter` قبل `ToastProvider` والصفحات، لأن أي `Link` يحتاج الـ Router.
- في المرحلة 3 يُضاف `TasksProvider`، وفي المرحلة 5 `AuthProvider`، هنا تحديدًا.

### 4.2 نظام الترجمة (Context + custom hook)

ثلاث قطع، ولكل قطعة وظيفة:

**أ) `translate.js` — دالة pure (بلا React):**

```js
export function translate(lang, key, params) {
  let text = lookup(dictionaries[lang], key)          // 'dashboard.title' → dictionary.dashboard.title
  if (typeof text !== 'string') {
    if (import.meta.env.DEV) console.warn(`[i18n] Missing "${key}" for "${lang}"`)
    text = lookup(dictionaries.en, key)               // fallback للإنجليزية
  }
  ...
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
}
```

مثال: `t('tasks.overdueHeading', { count: 2 })` مع النص `'من أيام سابقة ({count})'` ينتج `من أيام سابقة (2)`.

**ب) `I18nProvider.jsx` — يملك الحالة:**

```jsx
const [lang, setLang] = useState(readStoredLanguage)   // يقرأ localStorage مرة واحدة عند البدء

useEffect(() => {
  document.documentElement.lang = lang
  document.documentElement.dir = DIRECTIONS[lang]      // 'rtl' أو 'ltr'
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
}, [lang])
```

والقيمة التي يوزّعها: `{ lang, dir, t, setLanguage, formatDate }`، داخل `useMemo` حتى لا تتغير إلا عند تغيّر اللغة.

**ج) `useI18n.js` — طريقة الاستخدام:**

```js
const { t } = useI18n()   // في أي مكوّن
```

ويرمي خطأ واضحًا إن استُخدم خارج الـ Provider. نفس النمط بالضبط في `useToast`، وسيتكرر في `useTasks` و`useAuth`.

**`formatDate`:** يستخدم `Intl.DateTimeFormat` مع `'ar-u-nu-latn'`، أي تاريخ عربي بأرقام لاتينية (D-02).

### 4.3 جدول المسارات و`<Outlet>`

```jsx
// src/app/AppRoutes.jsx
<Routes>
  <Route element={<AppLayout />}>                         {/* مسار بلا path = تخطيط فقط */}
    <Route index element={<Navigate to="/dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="analytics" element={<AnalyticsPage />} />  {/* lazy */}
    {UiGalleryPage && <Route path="ui" element={<UiGalleryPage />} />}
    <Route path="*" element={<NotFoundPage />} />
  </Route>
  <Route element={<AuthLayout />}>
    <Route path="login" element={<LoginPage />} />
    ...
  </Route>
</Routes>
```

وفي `AppLayout.jsx`، الصفحة المطابقة تظهر مكان `<Outlet />`:

```jsx
<main id="main" tabIndex={-1} ...>
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
</main>
```

- `Suspense` يعرض `PageLoader` أثناء تنزيل كود صفحة التحليلات.
- `UiGalleryPage` قيمته `null` في الإنتاج (`import.meta.env.DEV ? lazy(...) : null`)، فلا يدخل كوده في الـ build أصلًا.

### 4.4 التنقّل: مصدر واحد لقائمتين

```js
// src/components/layout/navItems.js
export const NAV_ITEMS = [
  { to: '/dashboard', labelKey: 'nav.today', icon: Sun },
  { to: '/tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { to: '/analytics', labelKey: 'nav.analytics', icon: ChartNoAxesColumn },
]
```

`SideNav` (من `lg` فما فوق) و`BottomNav` (أصغر من `lg`) يقرآن نفس المصفوفة. `NavLink` يعطي `isActive` تلقائيًا ويضيف `aria-current="page"`:

```jsx
<NavLink to={to} className={({ isActive }) => cx('...', isActive ? 'text-pine-700' : 'text-ink-3')}>
```

### 4.5 مكوّنات UI: أهم الـ props

- **`Button`:** `variant` (`primary` | `secondary` | `ghost` | `danger`)، و`size`، و`icon`، و`iconOnly`، و`loading`. في حالة `loading` يبقى الزر قابلًا للتركيز ويتجاهل النقر، ويُعلن `aria-busy`.
- **`Input`:** `label`، و`hint`، و`error`. يربط النص الإرشادي ورسالة الخطأ بالحقل عبر `aria-describedby`، ويضع `aria-invalid` عند الخطأ:

```jsx
const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
```

- **`ProgressBar`:** `value` من 0 إلى 100 **أو `null`**. عند `null` لا يرسم شيئًا ويُعلن `emptyText` بدل "0%"، وهذا تطبيق BR-06 في الواجهة.
- **`Dialog`:** مبني على `<dialog>` الأصلي في المتصفح. `showModal()` يحبس التركيز داخله، وEscape يغلقه، والتركيز يعود للزر الذي فتحه، كل ذلك من المتصفح دون مكتبة.

```jsx
useEffect(() => {
  if (open && !dialog.open) dialog.showModal()
  if (!open && dialog.open) { closingFromProp.current = true; dialog.close() }
}, [open])
```

  الـ ref المسمّى `closingFromProp` يمنع استدعاء `onClose` مرتين عندما يغلقه الأب نفسه.
- **`Card`:** إن أُعطي `title` يصبح `<section>` مع `<h2>` مرتبط بـ `aria-labelledby`، وإلا يبقى `<div>`.
- **`Alert`:** `variant="danger"` فقط يأخذ `role="alert"` ليُقرأ فورًا.
- **`ToastProvider`:** يحفظ قائمة الإشعارات (3 كحد أقصى)، ويعرضها في منطقة `aria-live="polite"`. الإشعار العادي يختفي بعد 5 ثوانٍ، ويتوقف المؤقت عند المرور بالفأرة أو التركيز. إشعار الخطر يبقى حتى يُغلق.

### 4.6 مكوّنات الميزات تستقبل بيانات جاهزة

مثال `TodaySummary`:

```jsx
export function TodaySummary({ completed, total, rate }) { ... }
```

المكوّن **لا يحسب** النسبة، بل يعرض ما يصله فقط. اليوم يصله من `sampleData.js`، وفي المرحلتين 3–4 سيصله من دوال `lib/` المختبرة. لذلك لن نحتاج إلى إعادة كتابته.

استثناء صغير معروف: `TodaySummary` يحسب `total - completed` للعرض، و`TasksPage` يرتّب المهام بـ `STATUS_ORDER`. هذا حساب مؤقت للمعاينة وسيُستبدل بدوال `lib/` في المرحلتين 3/4.

### 4.7 كود المعاينة المؤقت

```js
// src/pages/preview/usePreviewState.js
export function usePreviewState() {
  const [searchParams] = useSearchParams()
  return searchParams.get('preview') === 'empty' ? 'empty' : 'sample'
}
```

```jsx
// src/pages/DashboardPage.jsx
const today = usePreviewState() === 'empty' ? EMPTY_TODAY : SAMPLE_TODAY
```

حالة "فارغ أو تجريبي" مخزّنة في الـ URL نفسه، لا في `useState`، فيمكن مشاركة الرابط وإعادة تحميله دون أن تضيع.

---

## 5. طريقة عمل المرحلة: تدفق الأحداث خطوة بخطوة

### أ) تبديل اللغة
1. الضغط على `LanguageSwitch` يستدعي `setLanguage('en')`.
2. `setLanguage` يتحقق من القيمة ثم ينفّذ `setLang('en')`، فتتغيّر حالة `I18nProvider`.
3. `useMemo` ينشئ قيمة Context جديدة فيها `t` جديدة.
4. كل مكوّن يستدعي `useI18n()` يُعاد رسمه بالنصوص الإنجليزية.
5. `useEffect` يغيّر `<html lang="en" dir="ltr">` ويحفظ `'en'` في `localStorage` تحت المفتاح `mind.lang`.
6. لأن الـ classes منطقية (`ps-`، `start-0`، `border-e`)، تنتقل القائمة الجانبية تلقائيًا من اليمين إلى اليسار دون أي شرط في الكود.
7. عند إعادة التحميل، السكربت في `index.html` يطبّق `dir="ltr"` **قبل** تحميل React، فلا تظهر الصفحة بالعربية لحظة ثم تنقلب.

### ب) التنقّل بين الصفحات
1. الضغط على "المهام" في `BottomNav`، وهو `NavLink` إلى `/tasks`.
2. React Router يغيّر الـ URL دون إعادة تحميل.
3. `<Routes>` يطابق `tasks` داخل مسار `AppLayout`، فيبقى التخطيط ويتغيّر محتوى `<Outlet />` فقط.
4. `NavLink` يحسب `isActive` من جديد، فيتلوّن الرابط الجديد ويأخذ `aria-current="page"`.
5. `ScrollToTop` يلاحظ تغيّر `pathname` وينفّذ `window.scrollTo(0, 0)`.
6. `PageHeader` يضع `<title>المهام · NEXTU</title>`.

### ج) عرض الحالة الفارغة
1. `PreviewNotice` يعرض `Link` إلى `?preview=empty` مع `replace` (حتى لا تمتلئ سجلات زر الرجوع).
2. `usePreviewState()` يقرأ `searchParams` ويُرجع `'empty'`.
3. الصفحة تختار `EMPTY_TODAY`، فيظهر `EmptyState`، ويعرض `ProgressBar` القيمة `null` بشكل "لا توجد مهام بعد".

### د) إرسال نموذج الدخول (تجريبي)
1. الضغط على "تسجيل الدخول" يطلق `onSubmit`.
2. `usePreviewSubmit` ينفّذ `event.preventDefault()` فلا تُرسل البيانات.
3. يستدعي `showToast({ message: t('auth.previewToast') })`.
4. `ToastProvider` يضيف الإشعار للقائمة، ومنطقة `aria-live` تجعل قارئ الشاشة يقرأه.
5. بعد 5 ثوانٍ، `setTimeout` داخل `Toast` يستدعي `onDismiss` ويختفي الإشعار.

---

## 6. القرارات التقنية

- **D-21 — خط IBM Plex Sans Arabic:** حروفه العربية واللاتينية متناسقة، وهذا مهم لعناوين مهام تخلط اللغتين. يُحمَّل بـ `<link>` دون حزمة npm.
- **D-22 — بيانات تجريبية موسومة:** كان المطلوب مراجعة واجهة مكتملة الشكل قبل منطق المراحل 3–5. الحل: بيانات يدوية مع تنبيه "معاينة" ظاهر، و`?preview=empty`، ومعرض `/ui` للتطوير فقط.
- **D-23 — الإصدارات الحالية:** Vite 8 وReact 19 وReact Router 8 وTailwind 4 وESLint 10. أبقينا `@types/react` للإكمال التلقائي في المحرر فقط، والمشروع يبقى JavaScript.
- **D-24 — الاسم NEXTU:** "Mind AI" اسم البرنامج التدريبي لا المنتج.
- **قرارات صغيرة داخل الكود:**
  - حذف ألوان Tailwind الافتراضية (`--color-*: initial`) لفرض نظام التصميم.
  - `<dialog>` الأصلي بدل مكتبة modal: إدارة التركيز وEscape مجانًا من المتصفح.
  - `buttonStyles()` دالة منفصلة عن `<Button>` حتى يأخذ `<Link>` شكل الزر دون أن يصبح `<button>` (الرابط للتنقّل، والزر للأفعال).
  - أسهم الاتجاه تُعكس في RTL بـ `rtl:-scale-x-100`.

---

## 7. الاختبارات

### ما تم التحقق منه في جلسة 2026-10-14 (هذه الجلسة)
- `npm run lint`: لا أخطاء ولا تحذيرات.
- `npm run build`: ناجح. الملف الرئيسي 306.92 kB (97.43 kB gzip)، وصفحة التحليلات ملف منفصل 6.36 kB.
- مفاتيح `ar.js` و`en.js`: 140 مفتاحًا في كل منهما، دون أي مفتاح ناقص في أي جهة.

### ما سُجّل في `docs/PROGRESS.md` بتاريخ 2026-10-11 (لم يُعَد في هذه الجلسة)
- فحص يدوي في Chrome: لا تمرير أفقي عند 360 و390 و768 و1280 px باللغتين، والتحويل من `/`، وصفحة 404، وثبات اللغة بعد إعادة التحميل، و`aria-current`، وأن `SkipLink` أول عنصر قابل للتركيز، وسلوك الـ Dialog مع التركيز وEscape.
- مراجعة `code-reviewer`: 0 حرجة، و5 مهمة (أُصلحت كلها)، و16 بسيطة (أُصلح معظمها).

### لا توجد اختبارات آلية بعد
Vitest يبدأ في P3-T01. سيُكتب حينها CT-09 لاختبار `LanguageSwitch` من هذه المرحلة.

### خطوات الاختبار الذاتي
1. `npm install` ثم `npm run dev`، وفتح `http://localhost:5173`.
2. التحقق من أن `/` يحوّل إلى `/dashboard`.
3. فتح `/abc`: يجب أن تظهر صفحة 404.
4. الضغط على زر "English": يجب أن ينقلب الاتجاه وتنتقل القائمة إلى اليسار. ثم إعادة التحميل (F5): يجب أن تبقى الإنجليزية.
5. الضغط على "عرض الحالة الفارغة" في تنبيه المعاينة.
6. فتح `/ui` وتجربة الأزرار والـ Dialog (Escape يغلقه) والـ Toast.
7. أدوات المطوّر (F12) ثم وضع الجوال بعرض 360px: يجب أن يظهر الشريط السفلي بدل القائمة الجانبية.
8. ضغط Tab من أول الصفحة: يجب أن يظهر رابط "الانتقال إلى المحتوى" أولًا.
9. في `/login` ملء النموذج والضغط على الزر: يجب أن يظهر إشعار "للمعاينة فقط".
10. `npm run lint` و`npm run build`.

---

## 8. المشاكل والحلول

- **وميض الاتجاه عند التحميل:** مستخدم اختار الإنجليزية كان يرى الصفحة RTL لحظة قبل أن يعمل React. **الحل:** سكربت صغير في `<head>` داخل `index.html` يقرأ `mind.lang` ويضبط `dir` قبل أول رسم.
- **موضع التمرير ينتقل بين الصفحات:** الانتقال من أسفل صفحة طويلة يفتح الصفحة التالية من الأسفل، لأن الـ declarative mode لا يعيد التمرير تلقائيًا. **الحل:** `ScrollToTop.jsx`. التحقق المسجّل: من 889 إلى 0 px.
- **`Dialog` يستدعي `onClose` مرتين:** عند إغلاقه من الأب كان حدث `close` يطلق `onClose` أيضًا. **الحل:** الـ ref `closingFromProp`. وأُضيف أن النقر على الخلفية يغلقه فقط إذا بدأ الضغط وانتهى عليها، حتى لا يُغلق عند تحديد نص داخله.
- **الإشعار يختفي قبل قراءته:** **الحل:** إيقاف المؤقت عند المرور أو التركيز، وإشعارات الخطر لا تختفي تلقائيًا (WCAG 2.2.1).
- **زر إغلاق الإشعار صغير (32px):** **الحل:** 44×44 (`size-11`)، الحد الأدنى المريح للمس.
- **ترتيب القراءة لقسم المتأخرات:** على سطح المكتب يظهر في العمود الجانبي، لكن ترتيب الـ DOM يجب أن يطابق ترتيب القراءة. **الحل:** وضعه أولًا في الـ DOM وتحريكه بصريًا بـ `lg:col-start-3 lg:row-start-1`.
- **حلقة التركيز غير مرئية على اللوحة الداكنة في `AuthLayout`:** **الحل:** `focus-visible:outline-paper` لـ `BrandMark` المعكوس.
- **قالب Vite جاء بـ oxlint:** **الحل:** استبداله بـ ESLint (D-23).
- **مخطط الجوال في `DESIGN_SYSTEM.md` لا يطابق الترتيب المبني:** **الحل:** تصحيح الوثيقة.

---

## 9. ما الذي لم يُنفذ بعد؟

- **المرحلة 3 (المهام):**
  - `useTasks()` و`TasksContext` بدل `sampleData.js` في صفحتي المهام واللوحة.
  - إنشاء المهام وتعديلها وحذفها وإنجازها، بحيث تصبح علامة `TaskItem` checkbox حقيقيًا.
  - `src/lib/dates.js` و`useToday.js`، وطبقة `services/` مع mock في `localStorage`.
  - تنقّل التاريخ وفلتر الحالة وزر "نقل إلى اليوم".
  - Vitest وأول الاختبارات الآلية.
- **المرحلة 4 (التحليلات):** حساب النسب والمقارنات وأفضل أداء بدوال `lib/`، ورسوم Recharts بدل ملاحظة "تأتي في المرحلة الرابعة".
- **المرحلة 5 (الحسابات):**
  - ربط نماذج الدخول والتسجيل والاستعادة بـ Supabase، والتحقق VR-xx.
  - `ProtectedRoute`.
  - تحويل رابط "تسجيل الدخول" في `SideNav` إلى "تسجيل الخروج".
- **المرحلة 6:** `vercel.json`، والسكربت المضمَّن في `index.html` سيحتاج hash إن أُضيف CSP.
- **ملاحظة مفتوحة:** مفتاح حفظ اللغة ما زال `mind.lang` من الاسم القديم. لا يؤثر على المستخدم، وتغييره يعني أن اختيار اللغة المحفوظ سيضيع مرة واحدة. لم يُتخذ قرار بشأنه بعد.

---

## 10. ماذا تعلمت؟

### المفاهيم الأساسية
1. **Context + custom hook:** الـ Provider يملك الحالة، والـ hook يقدّم واجهة آمنة لاستخدامها (`useI18n`، `useToast`). هذا هو النمط الذي سنبني به `useTasks` و`useAuth`.
2. **فصل المنطق عن React:** `translate.js` دالة pure يمكن اختبارها دون رسم أي مكوّن. نفس الفكرة ستُطبّق على كل قواعد العمل.
3. **Nested routes و`<Outlet>`:** التخطيط يُكتب مرة واحدة، والصفحات تتبدّل داخله.
4. **Logical CSS:** `ms-` و`ps-` و`start-` تعني "بداية السطر"، وهي يمين في العربية ويسار في الإنجليزية. لا حاجة إلى شروط `if (rtl)`.
5. **Code splitting:** `lazy(() => import(...))` و`Suspense` يجعلان كود صفحة لا تُزار لا يُنزَّل مبكرًا.
6. **Presentational components:** مكوّن يعرض props جاهزة (`TodaySummary`) يمكن إعادة استخدامه مع أي مصدر بيانات، تجريبيًا كان أو حقيقيًا.
7. **الوصولية من البداية:** `label` مرتبط بالحقل، و`aria-describedby` للخطأ، و`aria-live` للإشعارات، و`<dialog>` الأصلي، ورابط تخطٍّ، ونص بديل لكل حالة تُعرض بالألوان فقط.

### أمثلة عملية للتجربة
- إضافة مفتاح ترجمة جديد في `ar.js` فقط ثم استخدامه بـ `t()`: في الإنجليزية سيظهر المفتاح نفسه نصًّا، مع تحذير في الـ console. هذا هو الـ fallback في `translate.js`.
- تغيير `ps-4` إلى `pl-4` في أي مكوّن ثم التبديل للعربية: المسافة ستكون في الجهة الخطأ. لهذا القاعدة صارمة.
- تشغيل `npm run build` ثم `npm run preview`، وفتح تبويب Network في أدوات المطوّر على `/dashboard`، ثم الانتقال إلى "التحليلات": سيُحمَّل الملف `AnalyticsPage-….js` في تلك اللحظة فقط. هذا هو الـ code splitting.

### أسئلة لمراجعة الفهم
1. لماذا `I18nProvider` خارج `ErrorBoundary` في `AppProviders.jsx` وليس داخله؟
2. ما الفرق بين `Link` و`NavLink`؟ ولماذا تستخدم القوائم `NavLink`؟
3. لماذا حالة "فارغ أو تجريبي" في الـ URL (`?preview=empty`) وليست في `useState`؟
4. ماذا يعرض `ProgressBar` عندما `value={null}`؟ وأي قاعدة عمل يطبّق ذلك؟
5. لماذا يحتاج `index.html` إلى سكربت خاص باللغة رغم أن `I18nProvider` يضبط `dir`؟
6. أي جزء من صفحة اللوحة سيتغيّر في المرحلة 3، وأي جزء سيبقى كما هو؟
7. لماذا `buttonStyles()` دالة منفصلة بدل استخدام `<Button>` في كل مكان؟
