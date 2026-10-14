/**
 * PHASE 2 DESIGN PREVIEW ONLY (D-22).
 * Hand-written sample values so the layouts can be reviewed before real data exists.
 * Nothing here is calculated: rates and deltas are typed in by hand.
 * Removed in Phase 3 (tasks, dashboard) and Phase 4 (analytics).
 */

/** A local Date `days` days before now. Used only to label sample dates. */
export function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Task titles are user content, so they stay as typed in both UI languages
// (mixed on purpose to preview dir="auto").
export const SAMPLE_TODAY = {
  completed: 2,
  total: 3,
  rate: 67,
  motivationKey: 'motivation.close',
  overdueCount: 2,
  tasks: [
    { id: 'sample-1', title: 'قراءة 20 صفحة من كتاب «العادات الذرية»', status: 'pending' },
    { id: 'sample-2', title: 'مراجعة ملاحظات اجتماع الفريق', status: 'completed' },
    { id: 'sample-3', title: 'Morning run — 5 km', status: 'completed' },
  ],
}

export const SAMPLE_OVERDUE = [
  { id: 'sample-4', title: 'الاتصال بالبنك بخصوص البطاقة', status: 'pending', daysAgo: 2 },
  { id: 'sample-5', title: 'Send the project proposal', status: 'pending', daysAgo: 1 },
]

export const SAMPLE_WEEK = {
  current: { completed: 12, total: 15, rate: 80 },
  previous: { completed: 9, total: 14, rate: 64 },
  completedDelta: 3,
  rateDelta: 16,
}

// The best week starts on a Saturday two weeks before this one (BR-03).
const daysSinceSaturday = (new Date().getDay() + 1) % 7

export const SAMPLE_BEST = {
  day: { count: 6, daysAgo: 4 },
  week: { count: 21, daysAgo: daysSinceSaturday + 14 },
}
