
import { PerformanceChart } from "@/components/study/PerformanceChart";

interface PerformanceData {
  theme: string;
  correct: number;
  total: number;
}

interface StudyPerformanceViewProps {
  performanceData: PerformanceData[];
}

export const StudyPerformanceView = ({ performanceData = [] }: StudyPerformanceViewProps) => {
  // Ensure we always have a valid array
  const safePerformanceData = Array.isArray(performanceData) ? performanceData : [];
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-primary-100 mb-3">
        Desempenho por Tema
      </h3>
      <div className="neomorph p-4">
        {safePerformanceData.length > 0 ? (
          <PerformanceChart data={safePerformanceData} />
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">
              Estude alguns flashcards para ver seu desempenho aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
