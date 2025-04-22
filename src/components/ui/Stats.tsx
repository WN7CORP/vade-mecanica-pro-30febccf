
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ChartBar, Book, BookOpen, Star, ScrollText } from "lucide-react";
import { getUserStats, UserStats } from "@/services/statsService";
import { Skeleton } from "./skeleton";

const Stats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const userStats = await getUserStats();
      setStats(userStats);
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
    </div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBar className="h-5 w-5" />
          Suas Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="neomorph flex items-center gap-3 p-4">
            <Book className="text-primary-300" />
            <div>
              <p className="text-sm text-muted-foreground">Artigos Vistos</p>
              <p className="text-2xl font-bold text-primary-300">
                {stats?.totalArticlesViewed || 0}
              </p>
            </div>
          </div>

          <div className="neomorph flex items-center gap-3 p-4">
            <BookOpen className="text-primary-300" />
            <div>
              <p className="text-sm text-muted-foreground">Explicações</p>
              <p className="text-2xl font-bold text-primary-300">
                {stats?.totalExplanations || 0}
              </p>
            </div>
          </div>

          <div className="neomorph flex items-center gap-3 p-4">
            <Star className="text-primary-300" />
            <div>
              <p className="text-sm text-muted-foreground">Favoritos</p>
              <p className="text-2xl font-bold text-primary-300">
                {stats?.totalFavorites || 0}
              </p>
            </div>
          </div>

          <div className="neomorph flex items-center gap-3 p-4">
            <ScrollText className="text-primary-300" />
            <div>
              <p className="text-sm text-muted-foreground">Anotações</p>
              <p className="text-2xl font-bold text-primary-300">
                {stats?.totalNotes || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="neomorph p-4 text-center">
          <h3 className="font-bold text-lg text-primary-300 mb-2">Pontuação Total</h3>
          <p className="text-3xl font-bold text-primary-300">{stats?.points || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Você está em {stats?.rank || 0}º lugar no ranking
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Stats;
