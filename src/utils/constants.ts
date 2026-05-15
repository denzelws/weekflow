export const TASK = {
  MAX_PER_WEEK: 21,
  MAX_PER_DAY: 3,
  MAX_CARRY_OVER: 1,
  MIN_TITLE_LEN: 3,
  MAX_TITLE_LEN: 120,
} as const;

export const XP = {
  PER_TASK: 10,
  PERFECT_DAY: 20,
  PERFECT_WEEK: 50,
  STREAK_3_MULT: 1.2,
  STREAK_7_MULT: 1.5,
  PER_LEVEL: 100,
} as const;

export const TIMER = {
  POMODORO_SECS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
} as const;

export const ANIMATION = {
  STAGGER_STEP_MS: 50,
  BLOOM_DURATION: 600,
  XP_POP_DURATION: 1200,
  SCREEN_ENTER: 400,
} as const;

export const STORAGE_KEYS = {
  WEEK: "wf_current_week",
  TASKS: "wf_tasks",
  SESSION: "wf_day_session",
  PROFILE: "wf_user_profile",
  HISTORY: "wf_week_history",
} as const;

export const DAY_LABELS_PT = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;
