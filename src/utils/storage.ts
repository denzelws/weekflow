/* ─────────────────────────────────────────────────────────────────────────────
   WeekFlow · Persistence Layer (localStorage — MVP)
   Section 06 of Business Rules Document
   ─────────────────────────────────────────────────────────────────────────── */

import type { Week, Task, DaySession, UserProfile } from '@/types'

const KEYS = {
  WEEK:    'wf_current_week',
  TASKS:   'wf_tasks',
  SESSION: 'wf_day_session',
  PROFILE: 'wf_user_profile',
  HISTORY: 'wf_week_history',
} as const

// ── Generic helpers ───────────────────────────────────────────────────────────

const get = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const set = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[WeekFlow] Storage error:', e)
  }
}

const remove = (key: string): void => localStorage.removeItem(key)

// ── Week ─────────────────────────────────────────────────────────────────────

export const storage = {
  // Week
  getWeek:    ()           => get<Week>(KEYS.WEEK),
  saveWeek:   (w: Week)    => set(KEYS.WEEK, w),
  clearWeek:  ()           => remove(KEYS.WEEK),

  // Tasks
  getTasks:   ()             => get<Task[]>(KEYS.TASKS) ?? [],
  saveTasks:  (t: Task[])    => set(KEYS.TASKS, t),
  clearTasks: ()             => remove(KEYS.TASKS),

  // Day Session
  getSession:   ()               => get<DaySession>(KEYS.SESSION),
  saveSession:  (s: DaySession)  => set(KEYS.SESSION, s),
  clearSession: ()               => remove(KEYS.SESSION),

  // User Profile
  getProfile:   ()                  => get<UserProfile>(KEYS.PROFILE),
  saveProfile:  (p: UserProfile)    => set(KEYS.PROFILE, p),

  // History — array of past weeks (for future History screen)
  getHistory:   ()           => get<Week[]>(KEYS.HISTORY) ?? [],
  pushHistory:  (w: Week)    => {
    const h = get<Week[]>(KEYS.HISTORY) ?? []
    set(KEYS.HISTORY, [...h, w])
  },

  // Full reset (new week)
  resetWeek: () => {
    remove(KEYS.WEEK)
    remove(KEYS.TASKS)
    remove(KEYS.SESSION)
  },
}
