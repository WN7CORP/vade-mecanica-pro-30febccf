
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FloatingTimerProps {
  studyTimeMinutes: number;
  isActive: boolean;
  onToggle: () => void;
}

export const FloatingTimer = ({ studyTimeMinutes, isActive, onToggle }: FloatingTimerProps) => {
  const [progress, setProgress] = useState(0);
  
  // Update progress every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive) {
        setProgress((prev) => (prev + 1.67) % 100); // Complete circle every hour
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 right-4 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary-900/90 backdrop-blur-sm p-3 rounded-full shadow-lg cursor-pointer"
            onClick={onToggle}
          >
            <div className="relative">
              <Timer className="w-5 h-5 text-primary-300" />
              <div className="absolute -top-1 -right-1 -left-1 -bottom-1">
                <Progress value={progress} className="h-7 w-7 rounded-full" />
              </div>
            </div>
            <span className="text-primary-300 font-medium min-w-[3ch]">
              {studyTimeMinutes}m
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
