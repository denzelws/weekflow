import { createContext, useContext, type ReactNode } from "react";
import { useAppStore, type AppStore } from "@/store/useAppStore";
import { useStreakGuard } from "@/hooks/useStreak";

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();

  useStreakGuard({
    profile: store.state.profile,
    lastSession: store.state.todaySession,
    onStreakReset: store.resetCurrentStreak,
  });

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
