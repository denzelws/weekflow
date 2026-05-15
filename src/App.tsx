import {
  BrainDump,
  WeekKickoff,
  BacklogView,
  FocusMode,
  DaySummary,
} from "@/components/screens";

import { ScreenTransition } from "@/components/layout";
import { useApp } from "./store/AppContext";

export default function App() {
  const store = useApp();
  const { screen } = store.state;

  return (
    <ScreenTransition screen={screen}>
      {screen === "brain-dump" && <BrainDump />}
      {screen === "week-kickoff" && <WeekKickoff />}
      {screen === "backlog" && <BacklogView />}
      {screen === "focus" && <FocusMode />}
      {screen === "day-summary" && <DaySummary />}
    </ScreenTransition>
  );
}
