
import { Book } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StudyProgressProps {
  lawName?: string;
  studyTimeMinutes?: number;
  currentIndex: number;
  totalCards: number;
}

export const StudyProgress = ({ 
  lawName, 
  studyTimeMinutes, 
  currentIndex, 
  totalCards 
}: StudyProgressProps) => {
  return (
    <div className="neomorph p-3 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center text-primary-200">
          <Book className="mr-2" size={16} />
          <span className="text-sm">{lawName ? decodeURIComponent(lawName) : "Estudo Geral"}</span>
        </div>
        
        {studyTimeMinutes > 0 && (
          <div className="flex items-center text-gray-400">
            <span className="text-sm">
              {studyTimeMinutes} {studyTimeMinutes === 1 ? "minuto" : "minutos"}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1 mt-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Progresso</span>
          <span className="text-primary-100">
            {totalCards > 0 
              ? `${currentIndex + 1}/${totalCards} cartões`
              : "0/0 cartões"}
          </span>
        </div>
        <Progress 
          value={totalCards > 0 
            ? ((currentIndex + 1) / totalCards * 100) 
            : 0} 
          className="h-1.5" 
        />
      </div>
    </div>
  );
};
