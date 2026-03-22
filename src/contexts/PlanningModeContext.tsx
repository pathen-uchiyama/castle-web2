import { createContext, useContext, useState, type ReactNode } from "react";

export type PlanningMode = "strategist" | "concierge";

interface PlanningModeContextValue {
  mode: PlanningMode;
  setMode: (mode: PlanningMode) => void;
}

const PlanningModeContext = createContext<PlanningModeContextValue>({
  mode: "strategist",
  setMode: () => {},
});

export const usePlanningMode = () => useContext(PlanningModeContext);

export const PlanningModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PlanningMode>("strategist");
  return (
    <PlanningModeContext.Provider value={{ mode, setMode }}>
      {children}
    </PlanningModeContext.Provider>
  );
};
