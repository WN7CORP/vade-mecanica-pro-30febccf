
import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
  data: {
    theme: string;
    correct: number;
    total: number;
  }[];
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const { theme } = useTheme();

  // Make sure we have data with valid numbers
  const chartData = data
    .filter(item => item.total > 0) // Only include items with attempts
    .map(item => ({
      theme: item.theme,
      'Taxa de Acerto': ((item.correct / item.total) * 100).toFixed(1)
    }));

  return (
    <div className="w-full h-64 mt-4">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="theme" 
              stroke={theme === 'dark' ? '#fff' : '#000'}
              fontSize={12}
            />
            <YAxis
              stroke={theme === 'dark' ? '#fff' : '#000'}
              fontSize={12}
            />
            <Tooltip />
            <Bar
              dataKey="Taxa de Acerto"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Ainda não há dados de desempenho disponíveis
        </div>
      )}
    </div>
  );
};
