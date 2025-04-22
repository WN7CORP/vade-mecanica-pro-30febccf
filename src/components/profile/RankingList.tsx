
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Medal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RankingListProps {
  rankings: Array<{
    full_name: string | null;
    total_points: number | null;
    global_rank: number | null;
    position?: number;
  }>;
  currentUserId?: string;
}

export function RankingList({ rankings, currentUserId }: RankingListProps) {
  // Função para determinar a cor com base na posição
  const getPositionColor = (position: number) => {
    if (position === 1) return "text-amber-500"; // Ouro
    if (position === 2) return "text-gray-400"; // Prata
    if (position === 3) return "text-amber-700"; // Bronze
    return "text-primary-300";
  };

  // Verificar se o usuário atual está na lista de rankings
  const isUserInRankings = rankings.some(rank => rank.id === currentUserId);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary-300" />
          Classificação Global
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[280px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((rank, index) => (
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-4 w-4 text-primary-300" />
                      <span>{rank.total_points || 0}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
