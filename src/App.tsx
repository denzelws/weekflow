import {
  BrainDump,
  WeekKickoff,
  BacklogView,
  FocusMode,
  DaySummary,
} from "@/components/screens";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const store = useAppStore();

  const { screen } = store.state;

  return (
    <>
      {screen === "brain-dump" && <BrainDump store={store} />}
      {screen === "week-kickoff" && <WeekKickoff store={store} />}
      {screen === "backlog" && <BacklogView store={store} />}
      {screen === "focus" && <FocusMode store={store} />}
      {screen === "day-summary" && <DaySummary store={store} />}
    </>
  );
}
