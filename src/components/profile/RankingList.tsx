
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Medal, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingListProps {
  rankings: Array<{
    id?: string;
    full_name: string | null;
    total_points: number | null;
    weekly_points?: number | null;
    global_rank: number | null;
    position?: number;
    activity_points?: number | null;
    streak_points?: number | null;
    streak_change?: number | null;
  }>;
  currentUserId?: string;
  userRank?: number;
}

interface CurrentUserData {
  id?: string;
  full_name: string | null;
  total_points: number | null;
  weekly_points?: number | null;
  streak_change?: number | null;
}

export function RankingList({ rankings, currentUserId, userRank }: RankingListProps) {
  const [showAllRankings, setShowAllRankings] = useState(false);
  const [activeTab, setActiveTab] = useState<'total' | 'weekly'>('total');
  const isMobile = useIsMobile();
  
  const getPositionColor = (position: number) => {
    if (position === 1) return "text-amber-500"; // Ouro
    if (position === 2) return "text-gray-400"; // Prata
    if (position === 3) return "text-amber-700"; // Bronze
    return "text-primary-300";
  };

  const sortedRankings = useMemo(() => {
    return [...rankings].sort((a, b) => {
      const pointsA = activeTab === 'total' ? (a.total_points || 0) : (a.weekly_points || 0);
      const pointsB = activeTab === 'total' ? (b.total_points || 0) : (b.weekly_points || 0);
      return pointsB - pointsA;
    });
  }, [rankings, activeTab]);

  const displayedRankings = showAllRankings ? sortedRankings.slice(0, 100) : sortedRankings.slice(0, 20);
  
  // Check if current user is in the displayed rankings
  const isUserInRankings = currentUserId ? displayedRankings.some(rank => rank.id === currentUserId) : false;
  
  // Get current user data from rankings
  const currentUserData: CurrentUserData | undefined = currentUserId ?
    rankings.find(rank => rank.id === currentUserId) : undefined;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary-300" />
          Ranking da Justiça
        </CardTitle>
        <div className="flex gap-4 mt-2">
          <Button
            variant={activeTab === 'total' ? "default" : "ghost"}
            onClick={() => setActiveTab('total')}
            size="sm"
          >
            Ranking Total
          </Button>
          <Button
            variant={activeTab === 'weekly' ? "default" : "ghost"}
            onClick={() => setActiveTab('weekly')}
            size="sm"
          >
            Ranking Semanal
          </Button>
        </div>
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
                      <span>{activeTab === 'total' ? (rank.total_points || 0) : (rank.weekly_points || 0)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {!isUserInRankings && currentUserData && userRank && userRank > (showAllRankings ? 100 : 20) && (
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
                          {currentUserData.full_name}
                        </span>
                        <span className={`${isMobile ? "ml-1" : "ml-2"} px-1.5 py-0.5 text-xs rounded bg-primary-300/20 text-primary-300`}>
                          Você
                        </span>
                        {currentUserData.streak_change && currentUserData.streak_change < 0 && (
                          <span className={`${isMobile ? "ml-1" : "ml-2"} px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500`}>
                            {currentUserData.streak_change} pts
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right ${isMobile ? "py-2 px-1" : ""}`}>
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4 text-primary-300" />
                        <span>{activeTab === 'total' ? (currentUserData.total_points || 0) : (currentUserData.weekly_points || 0)}</span>
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
