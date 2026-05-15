export type TaskStatus = "pending" | "today" | "completed" | "carried_over";

export type WeekStatus = "active" | "completed" | "abandoned";

export type AppScreen =
  | "brain-dump" // Tela 1 — Input semana
  | "week-kickoff" // Tela 2 — Reveal das tarefas
  | "backlog" // Tela 3 — Backlog view + seleção diária
  | "focus" // Tela 4 — Focus mode
  | "day-summary"; // Tela 5 — Resumo do dia

export interface Task {
  id: string;
  weekId: string;
  title: string;
  status: TaskStatus;
  dayAssigned: string | null;
  completedAt: string | null;
  order: number;
  dayOrder: number | null;
}

export interface Week {
  id: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export interface DaySession {
  id: string;
  weekId: string;
  date: string;
  selectedTasks: string[];
  completedCount: number;
  xpEarned: number;
  isPerfectDay: boolean;
  closedAt: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalPerfectDays: number;
  createdAt: string;
}

export interface AppState {
  screen: AppScreen;
  currentWeek: Week | null;
  tasks: Task[];
  todaySession: DaySession | null;
  profile: UserProfile;
  activeFocusIdx: number;
}

export interface XPEvent {
  amount: number;
  reason: string;
  at: string;
}

export type Nullable<T> = T | null;

export type DayOfWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
