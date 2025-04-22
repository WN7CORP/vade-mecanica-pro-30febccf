
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartLine } from "lucide-react";

interface ActivityData {
  name: string;
  points: number;
}

const mockData: ActivityData[] = [
  { name: "Dom", points: 240 },
  { name: "Seg", points: 300 },
  { name: "Ter", points: 200 },
  { name: "Qua", points: 278 },
  { name: "Qui", points: 189 },
  { name: "Sex", points: 239 },
  { name: "Sab", points: 349 },
];

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-primary-300" />
          Atividade Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer 
            config={{
              points: {
                theme: {
                  light: "var(--primary)",
                  dark: "var(--primary)",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={ChartTooltip} />
                <Bar
                  dataKey="points"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
