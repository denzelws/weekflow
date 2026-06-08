import type {
  AppScreen,
  AppState,
  DaySession,
  Obligation,
  ObligationStatus,
  Task,
  TaskStatus,
  UserProfile,
  Week,
  WeekStatus,
} from "@/types";

const STORAGE_VERSION = 2;
const LEGACY_STORAGE_VERSION = 1;

const KEYS = {
  APP_STATE: "wf_app_state",
  WEEK: "wf_current_week",
  TASKS: "wf_tasks",
  SESSION: "wf_day_session",
  PROFILE: "wf_user_profile",
  HISTORY: "wf_week_history",
} as const;

type LegacyTask = Omit<Task, "sourceObligationId">;
type LegacyAppState = Omit<AppState, "tasks" | "obligations"> & {
  tasks: LegacyTask[];
};

interface PersistedAppStateV1 {
  version: typeof LEGACY_STORAGE_VERSION;
  state: LegacyAppState;
}

interface PersistedAppStateV2 {
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

const OBLIGATION_STATUSES: ObligationStatus[] = [
  "backlog",
  "scheduled",
  "completed",
  "discarded",
];

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

const isObligationStatus = (value: unknown): value is ObligationStatus =>
  isString(value) && OBLIGATION_STATUSES.includes(value as ObligationStatus);

const isAppScreen = (value: unknown): value is AppScreen =>
  isString(value) && APP_SCREENS.includes(value as AppScreen);

const readStoredValue = (key: string): unknown | null => {
  const localStorage = getLocalStorage();
  if (!localStorage) return null;

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
};

const readJson = <T>(key: string, validate: (value: unknown) => value is T) => {
  const parsed = readStoredValue(key);
  return validate(parsed) ? parsed : null;
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

const isLegacyTask = (value: unknown): value is LegacyTask => {
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

const isTask = (value: unknown): value is Task => {
  if (!isRecord(value) || !isLegacyTask(value)) return false;

  const task = value as LegacyTask & { sourceObligationId?: unknown };
  return isNullableString(task.sourceObligationId);
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

const isObligation = (value: unknown): value is Obligation => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.title) &&
    isObligationStatus(value.status) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isNullableString(value.completedAt) &&
    isNullableString(value.discardedAt)
  );
};

const isLegacyAppState = (value: unknown): value is LegacyAppState => {
  if (!isRecord(value)) return false;

  return (
    isAppScreen(value.screen) &&
    (value.currentWeek === null || isWeek(value.currentWeek)) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isLegacyTask) &&
    (value.todaySession === null || isDaySession(value.todaySession)) &&
    isUserProfile(value.profile) &&
    isNumber(value.activeFocusIdx)
  );
};

const isAppState = (value: unknown): value is AppState => {
  if (!isRecord(value)) return false;

  return (
    isAppScreen(value.screen) &&
    (value.currentWeek === null || isWeek(value.currentWeek)) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isTask) &&
    Array.isArray(value.obligations) &&
    value.obligations.every(isObligation) &&
    (value.todaySession === null || isDaySession(value.todaySession)) &&
    isUserProfile(value.profile) &&
    isNumber(value.activeFocusIdx)
  );
};

const isPersistedAppStateV1 = (
  value: unknown,
): value is PersistedAppStateV1 => {
  if (!isRecord(value)) return false;

  return value.version === LEGACY_STORAGE_VERSION && isLegacyAppState(value.state);
};

const isPersistedAppStateV2 = (
  value: unknown,
): value is PersistedAppStateV2 => {
  if (!isRecord(value)) return false;

  return value.version === STORAGE_VERSION && isAppState(value.state);
};

const migrateV1State = (state: LegacyAppState): AppState => ({
  ...state,
  tasks: state.tasks.map((task) => ({
    ...task,
    sourceObligationId: null,
  })),
  obligations: [],
});

const legacyTask = (value: unknown): Task | null => {
  if (isTask(value)) return value;
  if (isLegacyTask(value)) {
    return {
      ...value,
      sourceObligationId: null,
    };
  }
  return null;
};

const isLegacyTaskArray = (value: unknown): value is Array<Task | LegacyTask> => {
  if (!Array.isArray(value)) return false;

  return value.every((item) => legacyTask(item) !== null);
};

const migrateLegacyTasks = (value: unknown): Task[] | null => {
  if (!isLegacyTaskArray(value)) return null;

  return value.map((item) => legacyTask(item)).filter((item): item is Task =>
    item !== null,
  );
};

const legacyState = (): Partial<AppState> | null => {
  const currentWeek = readJson(KEYS.WEEK, isWeek);
  const tasks = migrateLegacyTasks(readStoredValue(KEYS.TASKS));
  const todaySession = readJson(KEYS.SESSION, isDaySession);
  const profile = readJson(KEYS.PROFILE, isUserProfile);

  if (!currentWeek && !tasks && !todaySession && !profile) return null;

  return {
    currentWeek,
    tasks: tasks ?? [],
    obligations: [],
    todaySession,
    profile: profile ?? undefined,
  };
};

export const storage = {
  getState: (): AppState | null => {
    const persisted = readStoredValue(KEYS.APP_STATE);

    if (isPersistedAppStateV2(persisted)) return persisted.state;
    if (isPersistedAppStateV1(persisted)) return migrateV1State(persisted.state);

    const legacy = legacyState();
    if (!legacy || !legacy.profile) return null;

    return {
      screen: "brain-dump",
      currentWeek: legacy.currentWeek ?? null,
      tasks: legacy.tasks ?? [],
      obligations: legacy.obligations ?? [],
      todaySession: legacy.todaySession ?? null,
      profile: legacy.profile,
      activeFocusIdx: 0,
    };
  },

  saveState: (state: AppState): void => {
    writeJson<PersistedAppStateV2>(KEYS.APP_STATE, {
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
