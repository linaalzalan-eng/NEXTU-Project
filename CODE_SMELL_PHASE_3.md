# تحليل Code Smells — ميزة إدارة المهام (Phase 3)

> التاريخ: 2026-10-16 · الفرع: `phase/04-dashboard-analytics` (آخر commit: `367fd4d`)
> نوع العمل: **تحليل فقط**. ما تعدّل أي ملف كود أو اختبار أو إعدادات.
> كل ملاحظة هون مبنية على كود موجود فعلًا، ومعها رقم السطر. الاختبارات **ما انشغّلت** خلال هذا التحليل، فالتقرير ما بيحكي إشي عن نتيجتها.

---

## 1. شو فحصت (حدود الميزة)

**طبقة البيانات (State + Actions)**
- `src/features/tasks/TasksProvider.jsx`: بيحمّل قائمة المهام كاملة، وفيه الـ optimistic updates والـ rollback و`busyIds`.
- `src/features/tasks/TasksContext.js` و`src/features/tasks/useTasks.js`: الـ context والـ hook اللي بيقراه.
- `src/features/tasks/useTaskActions.js`: بيغلّف الـ actions بالـ toasts وزر "Try again".

**Pure logic**
- `src/features/tasks/lib/taskSelectors.js`: الفلترة والترتيب والمتأخّر (BR-09).
- `src/features/tasks/lib/taskValidation.js`: VR-03، VR-04، BR-14.

**Services**
- `src/services/index.js`: بيختار الـ implementation حسب `VITE_DATA_SOURCE`.
- `src/services/errors.js`: `ServiceError` ومعه الـ codes.
- `src/services/mock/mockTasksService.js`: تخزين على localStorage تحت `nextu.tasks`.

**Utilities مشتركة**
- `src/lib/errorMessageKey.js`، `src/lib/useToday.js`، `src/lib/dates.js`.

**UI**
- `src/pages/TasksPage.jsx`.
- `src/features/tasks/components/`:
  - `TaskForm`، `TaskEditDialog`، `DeleteTaskDialog`.
  - `TaskList`، `TaskItem`، `OverdueSection`.
  - `StatusFilter`، `DateNavigator`.
  - `TaskListSkeleton`، `TasksLoadError`.

**Tests**
- `TasksProvider.test.jsx` و`mockTasksService.test.js`.
- `taskSelectors.test.js` و`taskValidation.test.js`.
- `TasksPage.test.jsx`.
- اختبار لكل component: `TaskForm`، `TaskEditDialog`، `DeleteTaskDialog`، `TaskItem`، `OverdueSection`، `StatusFilter`، `DateNavigator`.

**الانطباع العام:** الكود مرتّب ونظيف.
- الطبقات واضحة: UI ← hooks ← `@/services`.
- الـ business rules موجودة كـ pure functions، والـ effect فيه cleanup صحيح.
- التعليقات بتشرح السبب مش بس الشغلة.

المشاكل اللي لقيتها أغلبها **edge cases** ونقاط رح تصير مهمّة لما ندخل Supabase، مش أخطاء بتبيّن بالاستخدام العادي اليوم.

---

## 2. النتائج حسب الفئة

### الفئة 1: Code Duplication

#### D-1: قاعدة BR-12 وشكل الـ Task مكتوبين بمكانين — **Low**
- **وين:**
  - `TasksProvider.jsx:79-90` (المهمة المؤقتة) و`:106-110` (الـ toggle المتفائل).
  - `mockTasksService.js:75-85` (`createTask`) و`:110-116` (`setTaskCompletion`).
- **ليش smell:** القاعدة "completed ⇒ `completedAt = now`، وpending ⇒ `null`" (BR-12)، وشكل المهمة الجديدة، مكتوبين مرتين بنفس الطريقة. إذا تغيّرت القاعدة لازم تتذكّري المكانين.
- **الأثر:** محدود. نسخة الـ provider مؤقتة، ورد الـ service بيستبدلها بسرعة. بس لو تغيّر الشكل بمكان واحد، رح تشوفي "وميض" لقيمة غلط.
- **الحل:** دالة pure صغيرة بـ `features/tasks/lib/` يستعملها الطرفين:

```js
// قبل (TasksProvider.jsx:106 و mockTasksService.js:111)
{ ...task, status: completed ? 'completed' : 'pending', completedAt: completed ? now : null }

// بعد — features/tasks/lib/taskCompletion.js
export function applyCompletion(task, completed, timestamp) {
  return { ...task, status: completed ? 'completed' : 'pending', completedAt: completed ? timestamp : null }
}
```

#### D-2: الـ comparator مكرّر وما فيه `id` كـ tie-breaker — **Low**
- **وين:** `taskSelectors.js:13-14` و`mockTasksService.js:8-9`. الاتنين بيعرّفوا `byDateThenCreation` بنفس الشكل.
- **ليش smell:** نسختين من نفس المنطق. وكمان `API_CONTRACTS.md:131` بيطلب ترتيب حتمي `task_date, created_at, id`، وما في ولا نسخة منهم بتستعمل `id`.
- **الأثر:** اليوم ما في مشكلة، لأن `Array.prototype.sort` stable. بس لو مهمتين إلهم نفس `createdAt` (ممكن مع Supabase أو بالاختبارات)، الترتيب بيعتمد على ترتيب الوصول.
- **الحل:** export واحد من `taskSelectors.js` يستورده الـ mock، وفيه `|| a.id.localeCompare(b.id)`.

#### D-3: منطق الـ form مكرّر بين `TaskForm` و`TaskEditDialog`، وسلوك الأخطاء مش متطابق — **Low**
- **وين:**
  - `TaskForm.jsx:25-30` و`TaskEditDialog.jsx:42-47`: نفس الخطوات (validate، setErrors، focus على أول حقل غلط).
  - `TaskForm.jsx:55,72` و`TaskEditDialog.jsx:96,108`: نفس الـ mapping لنص الخطأ.
- **ليش smell:** التكرار بحدّ ذاته صغير، بس **السلوك اختلف**:
  - `TaskForm` بيمسح خطأ الحقل أول ما تكتبي فيه (`:53` و`:70`).
  - `TaskEditDialog` بيخلّي الخطأ ظاهر لحد ما تضغطي Save مرة تانية.
- **الأثر:** تجربة مختلفة لنفس الحقلين. وأي تعديل على الـ validation UX لازم ينعمل مرتين.
- **الحل:** ما في داعي لـ abstraction كبير. يكفي توحيد السلوك (امسحي الخطأ عند الكتابة بالمكانين)، وممكن helper صغير:

```js
// بعد — مثال
const fieldError = (t, field, code) => code && t(`validation.${field}.${code}`)
```

#### D-4: قاعدة "المهمة مقفولة" محسوبة بمكانين — **Low**
- **وين:**
  - `TaskItem.jsx:24`: `const locked = busy || isTempTask(task)`.
  - `OverdueSection.jsx:41`: `disabled={isTempTask(task) || (busyIds?.has(task.id) ?? false)}`.
  - وكمان `busyIds?.has(task.id) ?? false` مكرّرة بـ `TaskList.jsx:20`.
- **ليش smell:** نفس القاعدة بمكانين. لو صار في سبب جديد لقفل المهمة (مثلًا offline)، رح ينتسى زر "Move to today".
- **الحل:** دالة واحدة:

```js
// taskSelectors.js
export const isTaskLocked = (task, busyIds) => isTempTask(task) || Boolean(busyIds?.has(task.id))
```

---

### الفئة 2: Large Components

#### L-1: `TasksPage` شايلة مسؤوليات كتير — **Medium**
- **وين:** `src/pages/TasksPage.jsx:27-148`.
- **شو بتعمل لحالها:**
  - الـ state: اليوم المختار، الفلتر، المهمة اللي بتنعدّل، والمهمة اللي بتنحذف.
  - الـ selectors.
  - تنسيق عنوان اليوم.
  - إدارة الـ focus بعد الـ actions، بأربع wrappers.
  - تفريعات loading/error/ready.
  - الـ grid layout.
  - اختيار نوع الـ empty state، بـ ternary متداخل (`:107-118`).
  - وصل الحوارين.
- **ليش smell:** الصفحة بتخلط بين الـ "orchestration" (مين بيفتح شو) وتفاصيل عرض قسم اليوم. أي ميزة جديدة لقسم اليوم بتكبّر نفس الملف.
- **الأثر:** القراءة لسا مقبولة (148 سطر). بس الملف هو أول مرشّح يصير صعب مع الوقت.
- **الحل:** استخراج `DayTasksSection` جوّا `features/tasks/components/`، وهو بيملك:
  - `filter`.
  - `DateNavigator`.
  - عنوان اليوم.
  - `TaskForm`.
  - القائمة والـ empty state.

  والصفحة بتضل مسؤولة عن الحوارين والـ layout بس.

```jsx
// بعد — TasksPage (مختصر)
<div className="grid gap-8 lg:grid-cols-3">
  <OverdueSection … />
  <DayTasksSection date={date} today={today} tasks={tasks} busyIds={busyIds}
    actions={actions} onDateChange={…} onEdit={setEditingTask} onDelete={setDeletingTask} />
</div>
```

باقي الـ components صغيرة ومركّزة (أكبرها `TaskEditDialog` بـ 113 سطر، وهو form واحد). **ما لقيت فيها مشكلة.**

---

### الفئة 3: Complex Functions

**ما لقيت مشكلة مؤكّدة.**

الدوال الأكتر حساسية مشروحة كويس وقصيرة:
- `withBusy` و`setTaskCompletion` بـ `TasksProvider.jsx`.
- `validateTaskInput` (`taskValidation.js:45`).
- `isValidDateString` (`dates.js:38`).

منطق الـ retry بـ `useTaskActions.js:36-70` كثيف شوي، لأن كل دالة بتستدعي حالها جوّا الـ retry. بس مفهوم. مشكلته الحقيقية مش بالتعقيد، مشكلته بالبيانات القديمة (شوفي E-1).

---

### الفئة 4: Poor Naming

#### N-1: أسماء ممكن تتلخبط — **Low**
- **`status` بمعنيين:** بـ `TasksPage.jsx:30`، `status` هو حالة التحميل (`'loading' | 'ready' | 'error'`). بنفس الملف، `task.status` وقيم `filter` بتعني `pending/completed`. اسم زي `loadStatus` بـ `useTasks` بيشيل الالتباس.
- **`toggle(task, completed)` مش toggle فعلًا:** `useTaskActions.js:41` بياخد القيمة الجديدة بشكل صريح. `setCompleted(task, completed)` أوضح.
- **API تانين بأسماء قريبة:**
  - `useTasks()` بيرجّع `deleteTask` و`setTaskCompletion`. هدول بيرموا error وما بيعرضوا toast.
  - `useTaskActions()` بيرجّع `remove` و`toggle`، ومعهم feedback.
  - component جديد ممكن بالغلط يستعمل `useTasks().deleteTask`، ويطلع عنده unhandled rejection بدون أي رسالة للمستخدم.
  - **الحل:** اكتبي بالـ JSDoc تبع `useTasks.js:5` إنه الـ UI لازم يستعمل `useTaskActions`. أو سمّي الـ raw actions بأسماء بتبيّن إنها داخلية.
- **`TEMP_ID_PREFIX` بـ `taskSelectors.js:6`:** هاد تفصيل تبع الـ provider، وقاعد بملف الـ selectors. مقبول، بس المكان الطبيعي إله `TasksProvider` أو ملف `taskIds.js`.

---

### الفئة 5: Separation of Concerns

الفصل بين الطبقات **ممتاز بشكل عام**:
- ما في component بيستورد `@/services` مباشرة.
- الـ business rules كلها pure، و`today` بيوصلها كـ parameter.
- `TasksPage` ما بيحكي مع التخزين.

#### S-1: الـ service بيعتمد على مجلد feature — **Low (مقصود وموثّق)**
- **وين:** `mockTasksService.js:1` بيستورد من `@/features/tasks/lib/taskValidation.js`.
- **ليش ممكن يعتبر smell:** اتجاه الاعتماد صار `services → features`، مع إنه الطبيعي يكون العكس.
- **ليش مش مشكلة هلّق:** `API_CONTRACTS.md` (Notes بـ §4) بيطلب صراحة إنه الـ services تستعمل نفس الـ validators. فهاد قرار موثّق.
- **اقتراح اختياري:** لو صار في feature تاني بيحتاجها، انقلي `taskValidation.js` لـ `src/lib/`. **ما بنصح بتغيير الآن.**

(تقسيم معالجة الأخطاء بين 3 أماكن مشروح تحت **E-2**.)

---

### الفئة 6: State Management

#### ST-1: فلتر مخفي بيضل شغّال وبيخبّي المهمة الجديدة — **Low**
- **وين:** `TasksPage.jsx:34` (`filter`) و`:98` (`{dayTasks.length > 0 && <StatusFilter …/>}`).
- **السيناريو:**
  1. بيوم فيه مهام، اختاري فلتر "Completed".
  2. روحي ليوم فاضي. الفلتر بيختفي، بس قيمته بتضل `'completed'`.
  3. ضيفي مهمة جديدة. بتكون `pending`، فما بتظهر بالقائمة.
  4. بيرجع الفلتر يبيّن على "Completed"، ومعه رسالة "ما في مهام منجزة".
- **ليش smell:** state بيأثّر على العرض بينما الـ control تبعه مخفي.
- **الأثر:** المستخدم بيضيف مهمة وما بيشوفها مباشرة. هاد عكس فكرة الـ quick add (US-07).
- **الحل (سطر واحد):** خلّي الفلتر ظاهر إذا كان مش `'all'`، أو رجّعيه لـ `'all'` إذا اليوم فاضي.

```jsx
// قبل
{dayTasks.length > 0 && <StatusFilter value={filter} onChange={setFilter} />}
// بعد
{(dayTasks.length > 0 || filter !== 'all') && <StatusFilter value={filter} onChange={setFilter} />}
```

#### ST-2: كل تغيير بيعيد رسم كل مستهلكي الـ context — **Low (ما بنصح بإجراء الآن)**
- **وين:** `TasksProvider.jsx:153-156`. الـ `value` واحد وفيه `tasks` و`busyIds` والـ actions.
- **السبب:** كل toggle بيعمل 3 تحديثات (التغيير المتفائل، و`busyIds` add، و`busyIds` remove، وبعدها رد الـ service). كل تحديث بيعيد رسم الصفحة وكل `TaskItem`، لأنه ما في `memo`.
- **الأثر الحالي:** صغير. بس صفحة وحدة بتكون mounted بنفس الوقت، وقائمة اليوم قصيرة.
- **متى يصير مهم:** إذا قائمة المتأخر صارت طويلة جدًا. ساعتها بيصير منطقي نفصل contextين (state وactions) أو نستعمل `memo(TaskItem)`. **قيسي قبل ما تغيّري.**

**أنماط فحصتها ولقيتها سليمة:**
- `DeleteTaskDialog.jsx:13-14` و`TaskEditDialog.jsx:31-40`: هاد نمط "adjusting state when a prop changes" الموصى فيه بتوثيق React. مش smell.
- `loadCount` كـ trigger للـ reload (`TasksProvider.jsx:25,63-67`): نمط صحيح ومعه cleanup.
- `TaskForm key={date}` (`TasksPage.jsx:97`): طريقة نظيفة لعمل reset للـ form.

---

### الفئة 7: React Best Practices

**ما لقيت مشكلة مؤكّدة.** فحصت التالي:
- **Effects:**
  - `TasksProvider.jsx:43-61` فيه `ignore` flag ضد الـ race conditions.
  - `useToday.js:19-43` بينظّف الـ timer والـ listeners.
  - ما في effects ملهاش داعي، والـ derived values محسوبة بـ `useMemo` مش بـ effect.
- **Dependencies:** كل الـ `useCallback` و`useMemo` بـ `TasksProvider` و`useTaskActions` الـ deps تبعها كاملة.
- **Keys:** `task.id` بالقوائم. بالـ skeleton الـ index مستعمل لعناصر ثابتة، وهاد مقبول.
- **Accessibility:** checkbox حقيقي، و`aria-disabled` بدل `disabled` عشان يحافظ على الـ focus، وإدارة focus بعد الحذف أو النقل.

---

### الفئة 8: Error Handling

#### E-1: الـ Retry بيستعمل نسخة قديمة من المهمة — **Medium**
- **وين:**
  - `useTaskActions.js:41-43` (`toggle`) و`:45-50` (`remove`)، وكل واحدة فيهم بتمسك `task` وقت أول محاولة.
  - الـ rollback بـ `TasksProvider.jsx:117` (`replaceTask(task.id, task)`) و`:132` (`[...current, task]`).
  - `ToastProvider.jsx:81`: toast الخطأ ما بيختفي لحاله، فزر "Try again" ممكن ينضغط بعد دقايق.
- **السيناريو:**
  1. toggle على مهمة بيفشل بسبب انقطاع النت، فبيظهر toast فيه Retry.
  2. المستخدمة بتعدّل عنوان نفس المهمة، والتعديل بينجح.
  3. بتضغط Retry، فبيرجع العنوان القديم مؤقتًا (`{...staleTask, status}`).
  4. إذا فشل الـ Retry كمان، الـ rollback بيرجّع **النسخة القديمة كلها**، والشاشة بتضل مختلفة عن المخزّن لحد reload.
- **ليش smell:** التعليق بـ `TasksProvider.jsx:17-19` بيقول إنه الـ restore "can never overwrite a newer change". هاد صحيح داخل طلب واحد، بس الـ Retry بيكسر هالضمان.
- **الحل:** الـ rollback يرجّع **الحقول اللي تغيّرت بس** على النسخة الحالية، بدل ما يرجّع النسخة كلها:

```js
// قبل — TasksProvider.jsx:117
else replaceTask(task.id, task)

// بعد
else setTasks((current) => current.map((item) =>
  item.id === task.id ? { ...item, status: task.status, completedAt: task.completedAt } : item))
```

  وبالنسبة لـ `remove`، الـ Retry يدوّر على المهمة بالـ `id` من القائمة الحالية بدل ما يستعمل النسخة المحفوظة.

#### E-2: عقد الـ Promises ومعالجة الأخطاء مش موحّدين — **Medium**
- **وين:**
  - `useTaskActions.js:11-12`: الكل "never reject" ما عدا `update`.
  - `useTaskActions.js:38`: `create` بيرجّع المهمة لما ينجح و`undefined` لما يفشل.
  - `TaskForm.jsx:32-39` بيعتمد على هالـ `undefined` الضمني (`Promise.resolve(onCreate(...)).then((saved) => …)`).
  - `TaskEditDialog.jsx:59-66`: بيعالج `NOT_FOUND` بنفسه وبيعرض نفس toast `errors.notFound` الموجود بـ `useTaskActions.js:21-24`.
- **ليش smell:**
  - كل action إله عقد مختلف: واحد بيرجّع قيمة، واحد بيرجّع `undefined`، وواحد بيرمي error.
  - منطق "المهمة انحذفت من مكان تاني" موزّع على 3 أماكن: الـ provider والـ hook والـ dialog.
  - لازم تقري التعليقات عشان تعرفي كيف تستعملي كل وحدة.
- **الأثر:** لما يجي Supabase رح تيجي errors جديدة (`UNAUTHENTICATED`، `RATE_LIMITED`). كل مكان من الـ 3 لازم يتعدّل لحاله، وسهل ينتسى واحد.
- **الحل:** عقد واحد مكتوب: كل action بـ `useTaskActions` بيرجّع `saved | null` وما بيرمي أبدًا. والـ dialog اللي بدّه يعرض الخطأ جوّاه بيطلب هالشي بشكل صريح. والـ toast تبع `NOT_FOUND` بيطلع من helper واحد.

```js
// قبل
async function update(task, changes) { const saved = await updateTask(task, changes) /* قد يرمي */ … }

// بعد — اسم وعقد صريحين
/** للحوار فقط: يرمي الخطأ ليعرضه داخل الحوار؛ NOT_FOUND يُبلَّغ هنا مرة واحدة. */
async function saveEdit(task, changes) {
  try { return await updateTask(task, changes) }
  catch (error) { if (error.code === 'NOT_FOUND') notifyGone(); throw error }
}
```

**أشياء فحصتها ولقيتها سليمة:**
- الـ loading والـ empty والـ error states موجودة كلها بـ `TasksPage.jsx:64-123`.
- الـ backend messages ما بتوصل للمستخدم أبدًا (`errorMessageKey.js`).
- `ServiceError` بيحوّل أي code مش معروف لـ `UNKNOWN`.
- قراءة وكتابة الـ localStorage محميّة (`mockTasksService.js:25-49`).
- الـ validation بيصير بالـ UI وكمان بالـ service.

---

### الفئة 9: Maintainability (الاستعداد لـ Supabase)

#### M-1: `TasksProvider` ما بيعرف مين المستخدم — **High (خطر على Phase 5، مش bug اليوم)**
- **وين:**
  - `TasksProvider.jsx:43-61`: التحميل بيصير مرة وحدة عند الـ mount، والـ deps هي `[loadCount]` بس.
  - `AppProviders.jsx:7,14`: `AuthProvider` رح ينضاف **فوق** `TasksProvider` بدون ما يبعتله أي إشي.
- **ليش smell:** الـ state مربوط بعمر الـ component، مش بالمستخدم. اليوم في مستخدم واحد ثابت (`DEMO_USER`)، فما في مشكلة.
- **الأثر بـ Phase 5:**
  - إذا مستخدم عمل sign out وواحد تاني عمل sign in بدون reload، رح تضل **مهام المستخدم الأول بالذاكرة وتنعرض للتاني**. هاد تسريب خصوصية بالـ UI. الـ RLS بتحمي قاعدة البيانات، بس ما بتحمي الـ state اللي بالمتصفح.
  - وكمان التحميل رح يبلّش قبل ما الـ session تجهز، ورح يرجع `UNAUTHENTICATED`.
- **الحل (وقت Phase 5، مش هلّق):**

```jsx
// AppProviders.jsx — أبسط حل: state جديد لكل مستخدم
<AuthProvider>
  <TasksProvider key={user?.id ?? 'signed-out'}>{children}</TasksProvider>
</AuthProvider>

// TasksProvider.jsx — لا تحمّل بدون مستخدم
useEffect(() => {
  if (!userId) { setTasks([]); setStatus('ready'); return }
  …
}, [userId, loadCount])
```

#### M-2: الترتيب بيعتمد على مقارنة نصوص التاريخ — **Low (تحقّقي منها بـ Phase 5)**
- **وين:** `taskSelectors.js:13` و`mockTasksService.js:9`: `createdAt.localeCompare(...)`.
- **ليش smell:** المقارنة النصية بتشتغل صح بس إذا كل الـ timestamps بنفس الصيغة بالضبط. اليوم كلها من `toISOString()` (`…sssZ`). أما Postgres فممكن يرجّع صيغة تانية (عدد خانات كسور مختلف و`+00:00`). وبين ما يوصل رد الـ service، المهمة المؤقتة بتكون بصيغة `Z`.
- **الحل:** الـ mapper بـ `supabaseTasksService.js` يوحّد الصيغة (`new Date(row.created_at).toISOString()`)، أو الـ comparator يقارن أرقام (`Date.parse`). ولازم تتأكّدي من الصيغة الفعلية بـ Phase 5 قبل ما تعتمدي على أي فرضية.

**نقاط إيجابية للصيانة:**
- `services/index.js` بيبدّل الـ implementation بمتغيّر واحد.
- الـ contract موثّق بـ `API_CONTRACTS.md`.
- `createMockTasksService` قابل للحقن (storage وclock وids)، فبيسهّل اختبار نفس العقد على الـ Supabase service.

---

## 3. جدول الملخّص (مرتّب حسب الخطورة)

| # | الخطورة | الفئة | الملاحظة | المكان |
|---|---|---|---|---|
| M-1 | High | Maintainability | الـ provider مش مربوط بالمستخدم، وممكن يعرض مهام مستخدم سابق بـ Phase 5 | `TasksProvider.jsx:43-61`, `AppProviders.jsx:14` |
| E-1 | Medium | Error Handling | الـ Retry والـ rollback بيستعملوا نسخة قديمة من المهمة | `useTaskActions.js:41-50`, `TasksProvider.jsx:117,132` |
| E-2 | Medium | Error Handling | عقد الـ promises مختلف بين الـ actions، و`NOT_FOUND` بيتعالج بـ 3 أماكن | `useTaskActions.js:11-12,38,60`, `TaskForm.jsx:32-39`, `TaskEditDialog.jsx:59-66` |
| L-1 | Medium | Large Component | `TasksPage` بتجمع orchestration وتفاصيل عرض قسم اليوم | `TasksPage.jsx:27-148` |
| ST-1 | Low | State | فلتر مخفي بيخبّي المهمة الجديدة | `TasksPage.jsx:34,98` |
| D-1 | Low | Duplication | BR-12 وشكل الـ Task بالـ provider والـ mock | `TasksProvider.jsx:79-110`, `mockTasksService.js:75-116` |
| D-2 | Low | Duplication | comparator مكرّر وما فيه `id` | `taskSelectors.js:13-14`, `mockTasksService.js:8-9` |
| D-3 | Low | Duplication | منطق الـ form مكرّر، وسلوك مسح الأخطاء مختلف | `TaskForm.jsx:25-30,53,70`, `TaskEditDialog.jsx:42-47` |
| D-4 | Low | Duplication | قاعدة "مقفولة" بمكانين | `TaskItem.jsx:24`, `OverdueSection.jsx:41` |
| N-1 | Low | Naming | `status` بمعنيين، `toggle`، وAPI تانين بأسماء قريبة | `TasksPage.jsx:30`, `useTaskActions.js:41`, `useTasks.js:5` |
| M-2 | Low | Maintainability | الترتيب بيعتمد على صيغة نص الـ timestamp | `taskSelectors.js:13` |
| S-1 | Low | Separation | `services → features` (موثّق ومقصود) | `mockTasksService.js:1` |
| ST-2 | Low | State | كل تغيير بيعيد رسم كل المستهلكين (ما في إجراء الآن) | `TasksProvider.jsx:153-156` |
| — | — | Complex Functions | ما في مشكلة مؤكّدة | — |
| — | — | React Best Practices | ما في مشكلة مؤكّدة | — |

---

## 4. أهم 3 تحسينات نبدأ فيهم

1. **M-1: ربط `TasksProvider` بالمستخدم.** أعلى خطورة لأنه بيمسّ الخصوصية. الأنسب ينعمل **كجزء من Phase 5** لما ينضاف `AuthProvider`، عن طريق `key={user.id}` وعدم التحميل بدون session. بس لازم ينكتب هلّق كمهمة صريحة بخطة Phase 5 عشان ما ينتسى.
2. **E-1: إصلاح الـ rollback والـ Retry.** تغيير صغير بـ `TasksProvider.jsx` (يرجّع الحقول اللي تغيّرت بس) ومعه اختبار للسيناريو. بيحمي الـ invariant اللي التعليق نفسه بيوعد فيه.
3. **E-2: توحيد عقد الـ actions ومعالجة الأخطاء.** قبل Supabase، لأنه رح تيجي error codes جديدة، ومكان واحد أسهل من 3.

بعدهم بيجي **ST-1** (سطر واحد وبيحسّن الـ quick add)، وبعده **L-1** إذا رح تنضاف ميزات لصفحة المهام.

---

## 5. حالة التنفيذ (2026-10-17، بعد موافقة صاحبة المشروع)

القرار موثّق بـ `docs/DECISIONS.md` تحت **D-29**. ما في commit لسا.

- **E-1 ✅:**
  - الـ toggle لما يفشل بيرجّع `status` و`completedAt` بس، على النسخة الحالية من المهمة.
  - الحذف لما يفشل بيرجّع النسخة اللي كانت على الشاشة.
  - "Try again" بيبلّش من آخر نسخة عن طريق `getTask(id)`.
  - الملفات: `TasksProvider.jsx` و`useTaskActions.js`.
- **E-2 ✅:**
  - عقد واحد: كل action بيرجّع المهمة المحفوظة أو `null`، وما بيرمي error أبدًا.
  - الاستثناء الوحيد `saveEdit`، وهاد بيرمي الخطأ للحوار عشان يعرضه جوّاه.
  - رسالة "المهمة ما عادت موجودة" صارت بتطلع من مكان واحد بس.
  - `TaskEditDialog` ما عاد بيستعمل `useToast`.
- **L-1 ✅:** قسم اليوم صار component لحاله (`DayTasksSection.jsx`). `TasksPage` صارت بتربط البيانات والحوارات بس.
- **ST-1 ✅:** الفلتر بيضل ظاهر طول ما هو مفعّل، حتى بيوم فاضي.
- **D-1 ✅:** صار في `applyCompletion()` بملف `lib/taskCompletion.js`، والـ provider والـ mock بيستعملوه هم الاتنين.
- **D-2 ✅:** صار في `byDateThenCreation()` واحد، وبيستعمل `id` لفك التعادل.
- **D-3 ✅:** حوار التعديل صار بيمسح خطأ الحقل أول ما تكتبي فيه، متل نموذج الإضافة. ما عملت helper مشترك، لأنه التكرار الباقي صغير.
- **D-4 ✅:** صار في `isTaskLocked()`. `TaskList` بيحسبها مرة وحدة، وبيبعتها للصف وللـ `getAction(task, { locked })`.
- **N-1 ✅:**
  - `status` صار اسمه `loadStatus`، و`toggle` صار اسمه `setCompleted`.
  - توثيق `useTasks` صار بيوضّح إنه الـ UI لازم يستعمل `useTaskActions`.
  - `TEMP_ID_PREFIX` بقي بمكانه، لأنه نقله ما بيفيد إشي يُذكر.
- **M-1 و M-2 ⏳:** انكتبوا كمهام صريحة بـ Phase 5 بملف `IMPLEMENTATION_PLAN.md` (P5-T03 وP5-T06).
- **S-1 و ST-2:** ما في تغيير، حسب التوصية.

**الفحص (انشغّل بهالجلسة):**
- `npm run lint`: ما في أخطاء.
- `npm run test:run`: 30 ملف و242 اختبار نجحوا.
  - في تشغيلة سابقة كاملة، فشل اختبار واحد بسبب timeout بـ `AnalyticsPage.test.jsx`، لأنه تحميل الصفحة الكسولة أخد أكتر من 3 ثواني تحت الضغط.
  - لما شغّلت هالملف لحاله نجح، والتشغيلة الكاملة اللي بعدها نجحت كلها.
- `npm run build`: نجح.
