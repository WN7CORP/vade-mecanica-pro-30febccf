import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Star, Search, BookOpen } from "lucide-react";
import { RankingList } from "@/components/profile/RankingList";
import { ActivityChart } from "@/components/profile/ActivityChart";
import { useRankings } from "@/hooks/useRankings";

interface UserStats {
  totalSearches: number;
  totalFavorites: number;
  totalNotes: number;
  totalReads: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    totalSearches: 0,
    totalFavorites: 0,
    totalNotes: 0,
    totalReads: 0
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const { data: rankings } = useRankings();

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Carregar perfil do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUserProfile(profile);

      // Carregar estatísticas
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('action_type')
        .eq('user_id', session.user.id);

      if (statsData) {
        const searchCount = statsData.filter(s => s.action_type === 'search').length;
        const favoriteCount = statsData.filter(s => s.action_type === 'favorite').length;
        const noteCount = statsData.filter(s => s.action_type === 'note').length;
        const readCount = statsData.filter(s => s.action_type === 'read').length;

        setStats({
          totalSearches: searchCount,
          totalFavorites: favoriteCount,
          totalNotes: noteCount,
          totalReads: readCount
        });
      }
    };

    loadUserData();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Header />
      
      <main className="flex-1 container max-w-screen-lg mx-auto px-4 py-8">
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
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <ActivityChart />
          {rankings && <RankingList rankings={rankings} />}
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
                  <p className="text-sm text-muted-foreground">Favoritos</p>
                  <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                </div>
                <Star className="h-6 w-6 text-primary-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Anotações</p>
                  <p className="text-2xl font-bold">{stats.totalNotes}</p>
                </div>
                <FileText className="h-6 w-6 text-primary-300" />
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
