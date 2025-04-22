
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Medal, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className={isMobile ? "w-12 text-xs" : "w-16"}>Pos.</TableHead>
                <TableHead className={isMobile ? "text-xs" : ""}>Nome</TableHead>
                <TableHead className={`text-right ${isMobile ? "text-xs" : ""}`}>Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRankings.map((rank, index) => (
                <TableRow 
                  key={index} 
                  className={rank.id === currentUserId ? "bg-primary-50/10" : ""}
                >
                  <TableCell className={`font-semibold ${isMobile ? "py-2 px-1" : ""}`}>
                    <span className={`flex items-center ${getPositionColor(index + 1)}`}>
                      {index < 3 && <Medal className="h-4 w-4 mr-1" />}
                      {rank.position || index + 1}
                    </span>
                  </TableCell>
                  <TableCell className={`font-medium ${isMobile ? "py-2 px-1 max-w-[120px] truncate" : ""}`}>
                    <div className={`flex items-center ${isMobile ? "flex-wrap" : ""}`}>
                      <span className={isMobile ? "truncate max-w-[80px]" : ""}>
                        {rank.full_name}
                      </span>
                      {rank.id === currentUserId && (
                        <span className={`${isMobile ? "ml-1" : "ml-2"} px-1.5 py-0.5 text-xs rounded bg-primary-300/20 text-primary-300`}>
                          Você
                        </span>
                      )}
                      {rank.streak_change && rank.streak_change < 0 && (
                        <span className={`${isMobile ? "ml-1" : "ml-2"} px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500`}>
                          {rank.streak_change} pts
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right ${isMobile ? "py-2 px-1" : ""}`}>
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-4 w-4 text-primary-300" />
                      <span>{rank.total_points || 0}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Mostrar o usuário atual mesmo que não esteja nos primeiros colocados */}
              {!isUserInRankings && currentUser && userRank && userRank > (showAllRankings ? 100 : 20) && (
                <>
                  <TableRow className="border-t-2 border-dashed border-gray-700/20">
                    <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-1">
                      . . .
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary-50/10">
                    <TableCell className={`font-semibold ${isMobile ? "py-2 px-1" : ""}`}>
                      <span className="flex items-center text-primary-300">
                        {userRank}
                      </span>
                    </TableCell>
                    <TableCell className={`font-medium ${isMobile ? "py-2 px-1" : ""}`}>
                      <div className={`flex items-center ${isMobile ? "flex-wrap" : ""}`}>
                        <span className={isMobile ? "truncate max-w-[80px]" : ""}>
                          {currentUser.full_name}
                        </span>
                        <span className={`${isMobile ? "ml-1" : "ml-2"} px-1.5 py-0.5 text-xs rounded bg-primary-300/20 text-primary-300`}>
                          Você
                        </span>
                        {currentUser.streak_change && currentUser.streak_change < 0 && (
                          <span className={`${isMobile ? "ml-1" : "ml-2"} px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500`}>
                            {currentUser.streak_change} pts
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right ${isMobile ? "py-2 px-1" : ""}`}>
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
