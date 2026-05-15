import { useState, useCallback, useEffect } from "react";
import type { AppState, AppScreen, Task, DaySession } from "@/types";
import {
  today,
  now,
  parseTasksFromText,
  createWeek,
  createDaySession,
  createProfile,
  calcDayXP,
  calcLevel,
  calcLevelProgress,
} from "@/utils";
import { storage } from "@/utils/storage";

const initState = (): AppState => {
  const week = storage.getWeek();
  const tasks = storage.getTasks();
  const session = storage.getSession();
  const profile = storage.getProfile() ?? createProfile();

  let screen: AppScreen = "brain-dump";
  if (week) {
    if (
      session &&
      !session.closedAt &&
      session.completedCount < session.selectedTasks.length
    ) {
      screen = "focus";
    } else if (session && session.closedAt) {
      screen = "backlog";
    } else if (session && session.selectedTasks.length === 3) {
      screen = "focus";
    } else {
      screen = "backlog";
    }
  }

  return {
    screen,
    currentWeek: week,
    tasks,
    todaySession: session,
    profile,
    activeFocusIdx: 0,
  };
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(initState);

  useEffect(() => {
    if (state.currentWeek) storage.saveWeek(state.currentWeek);
    storage.saveTasks(state.tasks);
    if (state.todaySession) storage.saveSession(state.todaySession);
    storage.saveProfile(state.profile);
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

      const updatedTasks: Task[] = s.tasks.map((t) =>
        t.id === activeTaskId
          ? { ...t, status: "completed", completedAt: now() }
          : t,
      );

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

  const resetForNewWeek = useCallback(() => {
    storage.resetWeek();
    setState((s) => ({
      ...s,
      screen: "brain-dump",
      currentWeek: null,
      tasks: [],
      todaySession: null,
      activeFocusIdx: 0,
    }));
  }, []);

  const todayTasks = state.tasks.filter(
    (t) => t.dayAssigned === today() && t.status !== "completed",
  );
  const activeTasks = state.todaySession?.selectedTasks
    .map((id) => state.tasks.find((t) => t.id === id))
    .filter(Boolean) as Task[];
  const activeTask = activeTasks?.[state.activeFocusIdx] ?? null;
  const levelProgress = calcLevelProgress(state.profile.totalXP);

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
    resetForNewWeek,
    // Selectors
    todayTasks,
    activeTasks,
    activeTask,
    levelProgress,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
