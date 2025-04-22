
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, BookOpen } from "lucide-react";
import { RankingList } from "@/components/profile/RankingList";
import { ActivityChart } from "@/components/profile/ActivityChart";
import { useRankings } from "@/hooks/useRankings";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UserStats {
  totalSearches: number;
  totalReads: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { data: rankings } = useRankings();
  const [userId, setUserId] = useState<string>();

  const { data: stats = {
    totalSearches: 0,
    totalReads: 0
  } } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async (): Promise<UserStats> => {
      if (!userId) throw new Error('No user ID');

      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('action_type')
        .eq('user_id', userId);

      if (!statsData) return {
        totalSearches: 0,
        totalReads: 0
      };

      return {
        totalSearches: statsData.filter(s => s.action_type === 'search').length,
        totalReads: statsData.filter(s => s.action_type === 'read').length
      };
    },
    enabled: !!userId,
    refetchInterval: 15000 // Atualiza a cada 15 segundos
  });

  // Configurar um ouvinte de mudanças em tempo real para atualizações
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_statistics',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Atualizar os dados quando houver alterações
          queryClient.invalidateQueries({ queryKey: ['user-stats', userId] });
          queryClient.invalidateQueries({ queryKey: ['user-activity', userId] });
          queryClient.invalidateQueries({ queryKey: ['rankings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUserProfile(profile);
    };

    loadUserData();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header />
      
      <main className="flex-1 container max-w-screen-lg mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-heading font-bold mb-6 text-primary-300">
          Perfil e Estatísticas
        </h1>

        {userProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {userProfile.full_name}</p>
                <p><strong>Email:</strong> {userProfile.username}</p>
                <p><strong>Pontos Totais:</strong> {userProfile.points || 0}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <ActivityChart />
          {rankings && <RankingList rankings={rankings} currentUserId={userId} />}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Buscas</p>
                  <p className="text-2xl font-bold">{stats.totalSearches}</p>
                </div>
                <Search className="h-6 w-6 text-primary-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Leituras</p>
                  <p className="text-2xl font-bold">{stats.totalReads}</p>
                </div>
                <BookOpen className="h-6 w-6 text-primary-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
