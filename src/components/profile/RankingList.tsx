
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Medal, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RankingListProps {
  rankings: Array<{
    id?: string;
    full_name: string | null;
    total_points: number | null;
    global_rank: number | null;
    position?: number;
    activity_points?: number | null;
    streak_points?: number | null;
    streak_change?: number | null;
  }>;
  currentUserId?: string;
  userRank?: number;
}

export function RankingList({ rankings, currentUserId, userRank }: RankingListProps) {
  const [showAllRankings, setShowAllRankings] = useState(false);
  
  // Função para determinar a cor com base na posição
  const getPositionColor = (position: number) => {
    if (position === 1) return "text-amber-500"; // Ouro
    if (position === 2) return "text-gray-400"; // Prata
    if (position === 3) return "text-amber-700"; // Bronze
    return "text-primary-300";
  };

  // Verificar se o usuário atual está na lista de rankings
  const isUserInRankings = rankings.some(rank => rank.id === currentUserId);
  const currentUser = rankings.find(rank => rank.id === currentUserId);
  
  // Limitar a lista de rankings exibidos na visualização padrão
  const displayedRankings = showAllRankings ? rankings.slice(0, 100) : rankings.slice(0, 20);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary-300" />
          Ranking da Justiça
        </CardTitle>
        <p className="text-sm text-muted-foreground">Seu esforço começa aqui</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[350px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRankings.map((rank, index) => (
                <TableRow 
                  key={index} 
                  className={rank.id === currentUserId ? "bg-primary-50/10" : ""}
                >
                  <TableCell className="font-semibold">
                    <span className={`flex items-center ${getPositionColor(index + 1)}`}>
                      {index < 3 && <Medal className="h-4 w-4 mr-1" />}
                      {rank.position || index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {rank.full_name}
                    {rank.id === currentUserId && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary-300/20 text-primary-300">
                        Você
                      </span>
                    )}
                    {rank.streak_change && rank.streak_change < 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500">
                        {rank.streak_change} pts
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-4 w-4 text-primary-300" />
                      <span>{rank.total_points || 0}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Mostrar o usuário atual mesmo que não esteja nos 100 primeiros */}
              {!isUserInRankings && currentUser && userRank && userRank > 100 && showAllRankings && (
                <>
                  <TableRow className="border-t-2 border-dashed border-gray-700/20">
                    <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-1">
                      . . .
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary-50/10">
                    <TableCell className="font-semibold">
                      <span className="flex items-center text-primary-300">
                        {userRank}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {currentUser.full_name}
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary-300/20 text-primary-300">
                        Você
                      </span>
                      {currentUser.streak_change && currentUser.streak_change < 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500">
                          {currentUser.streak_change} pts
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4 text-primary-300" />
                        <span>{currentUser.total_points || 0}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllRankings(!showAllRankings)}
            className="gap-1 text-primary-300 border-primary-300/30 hover:bg-primary-300/10"
          >
            {showAllRankings ? "Ver menos" : "Ver top 100"}
            <ChevronDown className={`h-4 w-4 transition-transform ${showAllRankings ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
