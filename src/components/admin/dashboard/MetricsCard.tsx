
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  isLoading: boolean;
  iconColor?: string;
}

export function MetricsCard({ title, value, icon: Icon, isLoading, iconColor = "text-primary" }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Icon className={`h-8 w-8 ${iconColor} opacity-80`} />
          {isLoading ? (
            <Skeleton className="h-12 w-16" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
