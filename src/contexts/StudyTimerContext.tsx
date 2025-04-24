
import { createContext, useContext, useState, useEffect } from "react";

interface StudyTimerContextType {
  studyTimeMinutes: number;
  isActive: boolean;
  toggleTimer: () => void;
}

const StudyTimerContext = createContext<StudyTimerContextType | undefined>(undefined);

export function StudyTimerProvider({ children }: { children: React.ReactNode }) {
  const [studyTimeMinutes, setStudyTimeMinutes] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        setStudyTimeMinutes(prev => prev + 1);
      }, 60000); // Update every minute
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive(prev => !prev);

  return (
    <StudyTimerContext.Provider value={{ studyTimeMinutes, isActive, toggleTimer }}>
      {children}
    </StudyTimerContext.Provider>
  );
}

export function useStudyTimer() {
  const context = useContext(StudyTimerContext);
  if (context === undefined) {
    throw new Error("useStudyTimer must be used within a StudyTimerProvider");
  }
  return context;
}
