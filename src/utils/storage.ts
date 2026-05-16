import type {
  AppScreen,
  AppState,
  DaySession,
  Task,
  TaskStatus,
  UserProfile,
  Week,
  WeekStatus,
} from "@/types";

const STORAGE_VERSION = 1;

const KEYS = {
  APP_STATE: "wf_app_state",
  WEEK: "wf_current_week",
  TASKS: "wf_tasks",
  SESSION: "wf_day_session",
  PROFILE: "wf_user_profile",
  HISTORY: "wf_week_history",
} as const;

interface PersistedAppState {
  version: typeof STORAGE_VERSION;
  state: AppState;
}

const APP_SCREENS: AppScreen[] = [
  "brain-dump",
  "week-kickoff",
  "backlog",
  "focus",
  "day-summary",
];

const TASK_STATUSES: TaskStatus[] = [
  "pending",
  "today",
  "completed",
  "carried_over",
];

const WEEK_STATUSES: WeekStatus[] = ["active", "completed", "abandoned"];

const getLocalStorage = (): Storage | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string";

const isNullableString = (value: unknown): value is string | null =>
  value === null || isString(value);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const isTaskStatus = (value: unknown): value is TaskStatus =>
  isString(value) && TASK_STATUSES.includes(value as TaskStatus);

const isWeekStatus = (value: unknown): value is WeekStatus =>
  isString(value) && WEEK_STATUSES.includes(value as WeekStatus);

const isAppScreen = (value: unknown): value is AppScreen =>
  isString(value) && APP_SCREENS.includes(value as AppScreen);

const readJson = <T>(key: string, validate: (value: unknown) => value is T) => {
  const localStorage = getLocalStorage();
  if (!localStorage) return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeJson = <T>(key: string, value: T): void => {
  const localStorage = getLocalStorage();
  if (!localStorage) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("[WeekFlow] Storage error:", e);
  }
};

const remove = (key: string): void => {
  const localStorage = getLocalStorage();
  if (!localStorage) return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage removal errors. Reset should be best-effort.
  }
};

const isTask = (value: unknown): value is Task => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.weekId) &&
    isString(value.title) &&
    isTaskStatus(value.status) &&
    isNullableString(value.dayAssigned) &&
    isNullableString(value.completedAt) &&
    isNumber(value.order) &&
    (value.dayOrder === null || isNumber(value.dayOrder))
  );
};

const isWeek = (value: unknown): value is Week => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.startDate) &&
    isString(value.endDate) &&
    isWeekStatus(value.status) &&
    isNumber(value.totalTasks) &&
    isNumber(value.completedTasks) &&
    isString(value.createdAt)
  );
};

const isDaySession = (value: unknown): value is DaySession => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.weekId) &&
    isString(value.date) &&
    isStringArray(value.selectedTasks) &&
    isNumber(value.completedCount) &&
    isNumber(value.xpEarned) &&
    isBoolean(value.isPerfectDay) &&
    isNullableString(value.closedAt)
  );
};

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.name) &&
    isNumber(value.totalXP) &&
    isNumber(value.level) &&
    isNumber(value.currentStreak) &&
    isNumber(value.longestStreak) &&
    isNumber(value.totalPerfectDays) &&
    isString(value.createdAt)
  );
};

const isAppState = (value: unknown): value is AppState => {
  if (!isRecord(value)) return false;

  return (
    isAppScreen(value.screen) &&
    (value.currentWeek === null || isWeek(value.currentWeek)) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isTask) &&
    (value.todaySession === null || isDaySession(value.todaySession)) &&
    isUserProfile(value.profile) &&
    isNumber(value.activeFocusIdx)
  );
};

const isPersistedAppState = (value: unknown): value is PersistedAppState => {
  if (!isRecord(value)) return false;

  return value.version === STORAGE_VERSION && isAppState(value.state);
};

const legacyState = (): Partial<AppState> | null => {
  const currentWeek = readJson(KEYS.WEEK, isWeek);
  const tasks = readJson(KEYS.TASKS, (value): value is Task[] => {
    return Array.isArray(value) && value.every(isTask);
  });
  const todaySession = readJson(KEYS.SESSION, isDaySession);
  const profile = readJson(KEYS.PROFILE, isUserProfile);

  if (!currentWeek && !tasks && !todaySession && !profile) return null;

  return {
    currentWeek,
    tasks: tasks ?? [],
    todaySession,
    profile: profile ?? undefined,
  };
};

export const storage = {
  getState: (): AppState | null => {
    const persisted = readJson(KEYS.APP_STATE, isPersistedAppState);
    if (persisted) return persisted.state;

    const legacy = legacyState();
    if (!legacy || !legacy.profile) return null;

    return {
      screen: "brain-dump",
      currentWeek: legacy.currentWeek ?? null,
      tasks: legacy.tasks ?? [],
      todaySession: legacy.todaySession ?? null,
      profile: legacy.profile,
      activeFocusIdx: 0,
    };
  },

  saveState: (state: AppState): void => {
    writeJson<PersistedAppState>(KEYS.APP_STATE, {
      version: STORAGE_VERSION,
      state,
    });
  },

  resetWeek: (): void => {
    remove(KEYS.APP_STATE);
    remove(KEYS.WEEK);
    remove(KEYS.TASKS);
    remove(KEYS.SESSION);
  },

  resetAll: (): void => {
    Object.values(KEYS).forEach(remove);
  },

  pushHistory: (week: Week): void => {
    const history = readJson(KEYS.HISTORY, (value): value is Week[] => {
      return Array.isArray(value) && value.every(isWeek);
    });
    writeJson(KEYS.HISTORY, [...(history ?? []), week]);
  },
};
