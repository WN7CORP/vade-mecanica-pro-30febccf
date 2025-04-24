
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

  const chartData = data.map(item => ({
    theme: item.theme,
    'Taxa de Acerto': (item.correct / item.total * 100).toFixed(1)
  }));

  return (
    <div className="w-full h-64 mt-4">
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
    </div>
  );
};
