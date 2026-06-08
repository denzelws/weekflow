import { useState, useCallback, useEffect } from "react";
import type { AppState, AppScreen, Task, DaySession } from "@/types";
import {
  today,
  now,
  parseTasksFromText,
  createWeek,
  createDaySession,
  createProfile,
  createObligation,
  createTaskFromObligation,
  calcDayXP,
  calcLevel,
  calcLevelProgress,
} from "@/utils";
import { storage } from "@/utils/storage";

const initState = (): AppState => {
  const savedState = storage.getState();

  if (savedState) {
    return normalizeState(savedState);
  }

  return normalizeState({
    screen: "brain-dump",
    currentWeek: null,
    tasks: [],
    obligations: [],
    todaySession: null,
    profile: createProfile(),
    activeFocusIdx: 0,
  });
};

const normalizeState = (state: AppState): AppState => {
  const currentWeek = state.currentWeek;
  const obligations = state.obligations;
  const obligationIds = new Set(obligations.map((obligation) => obligation.id));
  const tasks = currentWeek
    ? state.tasks
        .filter((task) => task.weekId === currentWeek.id)
        .map((task) => ({
          ...task,
          sourceObligationId:
            task.sourceObligationId && obligationIds.has(task.sourceObligationId)
              ? task.sourceObligationId
              : null,
        }))
    : [];
  const activeLinkedObligationIds = new Set(
    tasks
      .filter((task) => task.sourceObligationId && task.status !== "completed")
      .map((task) => task.sourceObligationId),
  );
  const normalizedObligations = obligations.map((obligation) => {
    if (
      obligation.status === "scheduled" &&
      !activeLinkedObligationIds.has(obligation.id)
    ) {
      return {
        ...obligation,
        status: "backlog" as const,
      };
    }

    return obligation;
  });
  const taskIds = new Set(tasks.map((task) => task.id));
  const session =
    currentWeek &&
    state.todaySession &&
    state.todaySession.weekId === currentWeek.id
      ? {
          ...state.todaySession,
          selectedTasks: state.todaySession.selectedTasks.filter((taskId) =>
            taskIds.has(taskId),
          ),
        }
      : null;

  const completedCount = session
    ? Math.max(
        0,
        Math.min(session.completedCount, session.selectedTasks.length),
      )
    : 0;
  const todaySession = session ? { ...session, completedCount } : null;
  const activeFocusIdx = todaySession
    ? Math.max(
        0,
        Math.min(state.activeFocusIdx, todaySession.selectedTasks.length - 1),
      )
    : 0;

  const normalized: AppState = {
    ...state,
    currentWeek,
    tasks,
    obligations: normalizedObligations,
    todaySession,
    activeFocusIdx,
  };

  return {
    ...normalized,
    screen: resolveScreen(normalized),
  };
};

const resolveScreen = (state: AppState): AppScreen => {
  if (!state.currentWeek) return "brain-dump";

  const selectedCount = state.todaySession?.selectedTasks.length ?? 0;
  const completedCount = state.todaySession?.completedCount ?? 0;
  const canFocus =
    !!state.todaySession &&
    !state.todaySession.closedAt &&
    selectedCount > 0 &&
    completedCount < selectedCount;
  const canSummarize =
    !!state.todaySession &&
    !state.todaySession.closedAt &&
    selectedCount > 0 &&
    completedCount >= selectedCount;

  switch (state.screen) {
    case "brain-dump":
      return "backlog";
    case "week-kickoff":
      return state.tasks.length > 0 ? "week-kickoff" : "backlog";
    case "focus":
      return canFocus ? "focus" : canSummarize ? "day-summary" : "backlog";
    case "day-summary":
      return canSummarize ? "day-summary" : "backlog";
    case "backlog":
    default:
      return "backlog";
  }
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(initState);

  useEffect(() => {
    storage.saveState(state);
  }, [state]);

  const buildWeek = useCallback((rawText: string) => {
    const week = createWeek();
    const tasks = parseTasksFromText(rawText, week.id);
    const updatedWeek = { ...week, totalTasks: tasks.length };

    setState((s) => ({
      ...s,
      screen: "week-kickoff",
      currentWeek: updatedWeek,
      tasks,
    }));
  }, []);

  const startWeek = useCallback(() => {
    setState((s) => ({ ...s, screen: "backlog" }));
  }, []);

  const toggleTodayTask = useCallback((taskId: string) => {
    setState((s) => {
      const session =
        s.todaySession ?? createDaySession(s.currentWeek!.id, today());
      const isSelected = session.selectedTasks.includes(taskId);

      let updatedSelected: string[];
      if (isSelected) {
        updatedSelected = session.selectedTasks.filter((id) => id !== taskId);
      } else {
        if (session.selectedTasks.length >= 3) return s; // max 3
        updatedSelected = [...session.selectedTasks, taskId];
      }

      const updatedTasks: Task[] = s.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: updatedSelected.includes(taskId) ? "today" : "pending",
            dayAssigned: updatedSelected.includes(taskId) ? today() : null,
            dayOrder: updatedSelected.includes(taskId)
              ? updatedSelected.indexOf(taskId) + 1
              : null,
          };
        }
        return t;
      });

      const updatedSession: DaySession = {
        ...session,
        selectedTasks: updatedSelected,
      };

      return { ...s, tasks: updatedTasks, todaySession: updatedSession };
    });
  }, []);

  const startFocus = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: "focus",
      activeFocusIdx: 0,
    }));
  }, []);

  const completeTask = useCallback(() => {
    setState((s) => {
      if (!s.todaySession) return s;

      const selectedIds = s.todaySession.selectedTasks;
      const activeTaskId = selectedIds[s.activeFocusIdx];
      if (!activeTaskId) return s;

      const completedAt = now();
      const completedTask = s.tasks.find((t) => t.id === activeTaskId);

      const updatedTasks: Task[] = s.tasks.map((t) =>
        t.id === activeTaskId
          ? { ...t, status: "completed", completedAt }
          : t,
      );

      const updatedObligations = completedTask?.sourceObligationId
        ? s.obligations.map((obligation) =>
            obligation.id === completedTask.sourceObligationId
              ? {
                  ...obligation,
                  status: "completed" as const,
                  completedAt,
                  updatedAt: completedAt,
                }
              : obligation,
          )
        : s.obligations;

      const newCompleted = s.todaySession.completedCount + 1;
      const isPerfect = newCompleted === 3;
      const xp = calcDayXP(newCompleted, s.profile.currentStreak);

      const updatedSession: DaySession = {
        ...s.todaySession,
        completedCount: newCompleted,
        xpEarned: xp,
        isPerfectDay: isPerfect,
      };

      const nextIdx = s.activeFocusIdx + 1;
      const isDone = nextIdx >= selectedIds.length;

      return {
        ...s,
        tasks: updatedTasks,
        obligations: updatedObligations,
        todaySession: updatedSession,
        screen: isDone ? "day-summary" : "focus",
        activeFocusIdx: isDone ? s.activeFocusIdx : nextIdx,
      };
    });
  }, []);

  const closeDay = useCallback(() => {
    setState((s) => {
      if (!s.todaySession || !s.currentWeek) return s;

      const xp = s.todaySession.xpEarned;
      const newTotalXP = s.profile.totalXP + xp;
      const newStreak =
        s.todaySession.completedCount > 0 ? s.profile.currentStreak + 1 : 0;

      const updatedProfile = {
        ...s.profile,
        totalXP: newTotalXP,
        level: calcLevel(newTotalXP),
        currentStreak: newStreak,
        longestStreak: Math.max(s.profile.longestStreak, newStreak),
        totalPerfectDays:
          s.profile.totalPerfectDays + (s.todaySession.isPerfectDay ? 1 : 0),
      };

      const closedSession: DaySession = {
        ...s.todaySession,
        closedAt: now(),
      };

      const updatedWeek = {
        ...s.currentWeek,
        completedTasks:
          s.currentWeek.completedTasks + s.todaySession.completedCount,
      };

      return {
        ...s,
        screen: "backlog",
        todaySession: closedSession,
        profile: updatedProfile,
        currentWeek: updatedWeek,
      };
    });
  }, []);

  const carryOver = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: "carried_over", dayAssigned: null, dayOrder: null }
          : t,
      ),
    }));
  }, []);

  const addObligation = useCallback((title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setState((s) => ({
      ...s,
      obligations: [...s.obligations, createObligation(trimmedTitle)],
    }));
  }, []);

  const discardObligation = useCallback((obligationId: string) => {
    const discardedAt = now();

    setState((s) => ({
      ...s,
      obligations: s.obligations.map((obligation) =>
        obligation.id === obligationId && obligation.status === "backlog"
          ? {
              ...obligation,
              status: "discarded",
              discardedAt,
              updatedAt: discardedAt,
            }
          : obligation,
      ),
    }));
  }, []);

  const addObligationToWeek = useCallback((obligationId: string) => {
    setState((s) => {
      if (!s.currentWeek) return s;

      const obligation = s.obligations.find((item) => item.id === obligationId);
      if (!obligation || obligation.status !== "backlog") return s;

      const alreadyScheduled = s.tasks.some(
        (task) =>
          task.sourceObligationId === obligationId &&
          task.status !== "completed",
      );
      if (alreadyScheduled) return s;

      const order =
        s.tasks.length > 0
          ? Math.max(...s.tasks.map((task) => task.order)) + 1
          : 0;
      const task = createTaskFromObligation(s.currentWeek.id, obligation, order);
      const updatedTasks = [...s.tasks, task];
      const updatedAt = now();

      return normalizeState({
        ...s,
        tasks: updatedTasks,
        obligations: s.obligations.map((item) =>
          item.id === obligationId
            ? {
                ...item,
                status: "scheduled",
                updatedAt,
              }
            : item,
        ),
        currentWeek: {
          ...s.currentWeek,
          totalTasks: updatedTasks.length,
        },
      });
    });
  }, []);

  const returnTaskToObligations = useCallback((taskId: string) => {
    setState((s) => {
      const task = s.tasks.find((item) => item.id === taskId);
      if (!task?.sourceObligationId || task.status === "completed") return s;

      const updatedTasks = s.tasks.filter((item) => item.id !== taskId);
      const previousSelectedTasks = s.todaySession?.selectedTasks ?? [];
      const removedIndex = previousSelectedTasks.indexOf(taskId);
      const selectedTasks = previousSelectedTasks.filter((id) => id !== taskId);
      const nextActiveFocusIdx =
        removedIndex >= 0 && removedIndex < s.activeFocusIdx
          ? s.activeFocusIdx - 1
          : s.activeFocusIdx;
      const completedCount = s.todaySession
        ? Math.max(
            0,
            Math.min(s.todaySession.completedCount, selectedTasks.length),
          )
        : 0;
      const updatedAt = now();

      return normalizeState({
        ...s,
        tasks: updatedTasks,
        todaySession: s.todaySession
          ? {
              ...s.todaySession,
              selectedTasks,
              completedCount,
              isPerfectDay: completedCount === 3,
            }
          : null,
        obligations: s.obligations.map((obligation) =>
          obligation.id === task.sourceObligationId
            ? {
                ...obligation,
                status: "backlog",
                updatedAt,
              }
            : obligation,
        ),
        currentWeek: s.currentWeek
          ? {
              ...s.currentWeek,
              totalTasks: updatedTasks.length,
            }
          : null,
        activeFocusIdx:
          selectedTasks.length > 0
            ? Math.max(
                0,
                Math.min(nextActiveFocusIdx, selectedTasks.length - 1),
              )
            : 0,
      });
    });
  }, []);

  const resetCurrentStreak = useCallback(() => {
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        currentStreak: 0,
      },
    }));
  }, []);

  const resetForNewWeek = useCallback(() => {
    storage.resetWeek();
    setState((s) => {
      const updatedAt = now();

      return {
        ...s,
        screen: "brain-dump",
        currentWeek: null,
        tasks: [],
        obligations: s.obligations.map((obligation) => {
          const unfinishedLinkedTask = s.tasks.some(
            (task) =>
              task.sourceObligationId === obligation.id &&
              task.status !== "completed",
          );

          if (
            !unfinishedLinkedTask ||
            obligation.status === "completed" ||
            obligation.status === "discarded"
          ) {
            return obligation;
          }

          return {
            ...obligation,
            status: "backlog",
            updatedAt,
          };
        }),
        todaySession: null,
        activeFocusIdx: 0,
      };
    });
  }, []);

  const todayTasks = state.tasks.filter(
    (t) => t.dayAssigned === today() && t.status !== "completed",
  );
  const activeTasks = state.todaySession?.selectedTasks
    .map((id) => state.tasks.find((t) => t.id === id))
    .filter(Boolean) as Task[];
  const activeTask = activeTasks?.[state.activeFocusIdx] ?? null;
  const levelProgress = calcLevelProgress(state.profile.totalXP);
  const backlogObligations = state.obligations.filter(
    (obligation) => obligation.status === "backlog",
  );
  const scheduledObligations = state.obligations.filter(
    (obligation) => obligation.status === "scheduled",
  );
  const completedObligations = state.obligations.filter(
    (obligation) => obligation.status === "completed",
  );

  return {
    state,
    // Actions
    buildWeek,
    startWeek,
    toggleTodayTask,
    startFocus,
    completeTask,
    closeDay,
    carryOver,
    addObligation,
    discardObligation,
    addObligationToWeek,
    returnTaskToObligations,
    resetCurrentStreak,
    resetForNewWeek,
    // Selectors
    todayTasks,
    activeTasks,
    activeTask,
    levelProgress,
    backlogObligations,
    scheduledObligations,
    completedObligations,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
