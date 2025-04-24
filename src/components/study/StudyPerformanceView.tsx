
import { PerformanceChart } from "@/components/study/PerformanceChart";

interface PerformanceData {
  theme: string;
  correct: number;
  total: number;
}

interface StudyPerformanceViewProps {
  performanceData: PerformanceData[];
}

export const StudyPerformanceView = ({ performanceData }: StudyPerformanceViewProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-primary-100 mb-3">
        Desempenho por Tema
      </h3>
      <div className="neomorph p-4">
        {performanceData.length > 0 ? (
          <PerformanceChart data={performanceData} />
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
