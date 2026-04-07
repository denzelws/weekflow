/* ─────────────────────────────────────────────────────────────────────────────
   WeekFlow · Domain Types
   Based on Business Rules Document v1.0 — Section 04 (Data Model)
   ─────────────────────────────────────────────────────────────────────────── */

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TaskStatus =
  | 'pending'       // No backlog, não alocada
  | 'today'         // Selecionada para hoje
  | 'completed'     // Concluída
  | 'carried_over'  // Carregada do dia anterior

export type WeekStatus =
  | 'active'
  | 'completed'
  | 'abandoned'

export type AppScreen =
  | 'brain-dump'    // Tela 1 — Input semanal
  | 'week-kickoff'  // Tela 2 — Reveal das tarefas
  | 'backlog'       // Tela 3 — Backlog view + seleção diária
  | 'focus'         // Tela 4 — Focus mode
  | 'day-summary'   // Tela 5 — Resumo do dia

// ── Core Entities ─────────────────────────────────────────────────────────────

export interface Task {
  id:           string           // UUID v4
  weekId:       string           // FK → Week.id
  title:        string           // Máx 120 chars (RN-02)
  status:       TaskStatus
  dayAssigned:  string | null    // ISO date 'YYYY-MM-DD'
  completedAt:  string | null    // ISO datetime
  order:        number           // Ordem no brain dump
  dayOrder:     number | null    // Posição na seleção diária (1 | 2 | 3)
}

export interface Week {
  id:               string
  startDate:        string       // ISO date — domingo de início
  endDate:          string       // ISO date — sábado de fim
  status:           WeekStatus
  totalTasks:       number
  completedTasks:   number
  createdAt:        string       // ISO datetime
}

export interface DaySession {
  id:               string
  weekId:           string
  date:             string       // ISO date 'YYYY-MM-DD'
  selectedTasks:    string[]     // IDs das 3 tarefas (RN-08: exatamente 3)
  completedCount:   number       // 0–3
  xpEarned:         number
  isPerfectDay:     boolean      // true se completedCount === 3
  closedAt:         string | null
}

export interface UserProfile {
  id:               string
  name:             string
  totalXP:          number
  level:            number       // floor(totalXP / 100) + 1
  currentStreak:    number
  longestStreak:    number
  totalPerfectDays: number
  createdAt:        string
}

// ── App State (global) ────────────────────────────────────────────────────────

export interface AppState {
  screen:         AppScreen
  currentWeek:    Week | null
  tasks:          Task[]
  todaySession:   DaySession | null
  profile:        UserProfile
  activeFocusIdx: number         // Qual das 3 tarefas do dia está em foco (0 | 1 | 2)
}

// ── XP Events ────────────────────────────────────────────────────────────────

export interface XPEvent {
  amount:   number
  reason:   string
  at:       string               // ISO datetime
}

// ── Utility ───────────────────────────────────────────────────────────────────

export type Nullable<T> = T | null

export type DayOfWeek =
  | 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
