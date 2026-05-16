import { useEffect } from "react";
import { today } from "@/utils";
import type { UserProfile, DaySession } from "@/types";

interface UseStreakOptions {
  profile: UserProfile;
  lastSession: DaySession | null;
  onStreakReset: () => void;
}

export function useStreakGuard({
  profile,
  lastSession,
  onStreakReset,
}: UseStreakOptions) {
  useEffect(() => {
    if (!lastSession?.closedAt) return;

    const lastClose = lastSession.closedAt.split("T")[0];
    const todayStr = today();

    const lastDate = new Date(lastClose);
    const todayDate = new Date(todayStr);
    const diffMs = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && profile.currentStreak > 0) {
      onStreakReset();
    }
  }, [lastSession, onStreakReset, profile.currentStreak]);
}
