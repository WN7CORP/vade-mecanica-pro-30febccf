
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { RankingList } from "@/components/profile/RankingList";
import { ActivityChart } from "@/components/profile/ActivityChart";
import { useRankings, useLoginStreak, useUserRank } from "@/hooks/useRankings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/BackButton";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { data: rankings } = useRankings();
  const [userId, setUserId] = useState<string>();
  const { recordLogin, calculateStreakLoss } = useLoginStreak(userId);
  const { data: userRank } = useUserRank(userId);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);

  const { data: stats = {
    totalSearches: 0,
    totalReads: 0,
    lastLogin: null
  } } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async (): Promise<UserStats> => {
      if (!userId) throw new Error('No user ID');

      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('action_type, created_at')
        .eq('user_id', userId);

      if (!statsData) return {
        totalSearches: 0,
        totalReads: 0,
        lastLogin: null
      };
      
      // Encontrar o último login
      const loginData = statsData
        .filter(s => s.action_type === 'login')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const lastLogin = loginData.length > 0 ? new Date(loginData[0].created_at) : null;

      return {
        totalSearches: statsData.filter(s => s.action_type === 'search').length,
        totalReads: statsData.filter(s => s.action_type === 'read').length,
        lastLogin
      };
    },
    enabled: !!userId,
    refetchInterval: 15000 // Atualiza a cada 15 segundos
  });

  // Registrar login ao carregar a página
  useEffect(() => {
    if (!userId || hasShownWelcomeToast) return;
    
    const registerLoginAndCheckStreak = async () => {
      await recordLogin();
      await calculateStreakLoss();
      
      // Invalidar as queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['user-stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['user-rank', userId] });
      
      // Mostrar toast de boas-vindas - apenas uma vez por sessão
      toast({
        title: "Bem-vindo(a) de volta!",
        description: "Você ganhou +20 pontos por acessar hoje!",
      });
      
      setHasShownWelcomeToast(true);
    };
    
    registerLoginAndCheckStreak();
    
  }, [userId, recordLogin, calculateStreakLoss, queryClient, hasShownWelcomeToast]);

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
          queryClient.invalidateQueries({ queryKey: ['user-rank', userId] });
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl font-heading font-bold text-primary-300">
              Meu Perfil
            </h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <ActivityChart />
          </div>
          <div className="order-1 md:order-2">
            {rankings && (
              <RankingList 
                rankings={rankings} 
                currentUserId={userId} 
                userRank={userRank || undefined}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
