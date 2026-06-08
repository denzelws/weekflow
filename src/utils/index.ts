/* ─────────────────────────────────────────────────────────────────────────────
   WeekFlow · Utility Functions
   ─────────────────────────────────────────────────────────────────────────── */

import { v4 as uuidv4 } from 'uuid'
import type { Task, Week, DaySession, UserProfile, Obligation } from '@/types'

// ── Date Helpers ──────────────────────────────────────────────────────────────

/** ISO date string for today */
export const today = (): string =>
  new Date().toISOString().split('T')[0]

/** ISO datetime string for now */
export const now = (): string => new Date().toISOString()

/** Format date to display string (e.g. "Monday, 6 Apr") */
export const formatDate = (isoDate: string): string =>
  new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

/** Short day label (e.g. "Seg", "Ter") */
export const shortDayLabel = (isoDate: string): string =>
  new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
    .toUpperCase()
    .slice(0, 3)

/** Get the Sunday (start) of the week containing a given date */
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get the Saturday (end) of the week */
export const getWeekEnd = (start: Date): Date => {
  const d = new Date(start)
  d.setDate(d.getDate() + 6)
  return d
}

/** All 7 ISO date strings for the week (Sun–Sat) */
export const getWeekDays = (start: Date): string[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

// ── Task Parsing (RN-02) ──────────────────────────────────────────────────────

/**
 * Parse free-form brain-dump text into Task objects.
 * Splits by comma, newline, or semicolon.
 * Ignores fragments with < 3 characters.
 */
export const parseTasksFromText = (
  rawText: string,
  weekId: string,
): Task[] => {
  return rawText
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3)
    .slice(0, 21) // RN-03: max 21 tasks per week
    .map((title, idx) => ({
      id:          uuidv4(),
      weekId,
      sourceObligationId: null,
      title,
      status:      'pending' as const,
      dayAssigned: null,
      completedAt: null,
      order:       idx,
      dayOrder:    null,
    }))
}

// ── XP Calculations (Section 05) ─────────────────────────────────────────────

export const XP = {
  PER_TASK:       10,
  PERFECT_DAY:    20,
  PERFECT_WEEK:   50,
  STREAK_3_MULT:  1.2,
  STREAK_7_MULT:  1.5,
} as const

export const calcDayXP = (
  completedCount: number,
  streak: number,
): number => {
  const base = completedCount * XP.PER_TASK
  const bonus = completedCount === 3 ? XP.PERFECT_DAY : 0
  const mult =
    streak >= 7 ? XP.STREAK_7_MULT :
    streak >= 3 ? XP.STREAK_3_MULT : 1
  return Math.round((base + bonus) * mult)
}

export const calcLevel = (totalXP: number): number =>
  Math.floor(totalXP / 100) + 1

export const calcLevelProgress = (totalXP: number): number =>
  (totalXP % 100) / 100

// ── Factory Functions ─────────────────────────────────────────────────────────

export const createWeek = (): Week => {
  const start = getWeekStart()
  const end   = getWeekEnd(start)
  return {
    id:             uuidv4(),
    startDate:      start.toISOString().split('T')[0],
    endDate:        end.toISOString().split('T')[0],
    status:         'active',
    totalTasks:     0,
    completedTasks: 0,
    createdAt:      now(),
  }
}

export const createDaySession = (weekId: string, date: string): DaySession => ({
  id:             uuidv4(),
  weekId,
  date,
  selectedTasks:  [],
  completedCount: 0,
  xpEarned:       0,
  isPerfectDay:   false,
  closedAt:       null,
})

export const createProfile = (name = 'Usuário'): UserProfile => ({
  id:               uuidv4(),
  name,
  totalXP:          0,
  level:            1,
  currentStreak:    0,
  longestStreak:    0,
  totalPerfectDays: 0,
  createdAt:        now(),
})

export const createObligation = (title: string): Obligation => {
  const timestamp = now()
  return {
    id:           uuidv4(),
    title,
    status:       'backlog',
    createdAt:    timestamp,
    updatedAt:    timestamp,
    completedAt:  null,
    discardedAt:  null,
  }
}

export const createTaskFromObligation = (
  weekId: string,
  obligation: Obligation,
  order: number,
): Task => ({
  id:                 uuidv4(),
  weekId,
  sourceObligationId: obligation.id,
  title:              obligation.title,
  status:             'pending',
  dayAssigned:        null,
  completedAt:        null,
  order,
  dayOrder:           null,
})

// ── clsx-compatible class merger ──────────────────────────────────────────────

export { clsx as cn } from 'clsx'
