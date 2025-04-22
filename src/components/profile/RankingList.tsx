
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";

interface RankingListProps {
  rankings: Array<{
    full_name: string | null;
    total_points: number | null;
    global_rank: number | null;
  }>;
}

export function RankingList({ rankings }: RankingListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary-300" />
          Ranking Global
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.map((rank, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-primary-300">
                  #{rank.global_rank}
                </span>
                <span className="font-medium">{rank.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-300" />
                <span>{rank.total_points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
