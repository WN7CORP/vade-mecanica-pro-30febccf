
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2, Bookmark, PieChart } from "lucide-react";
import { useUserActivity } from "@/hooks/useUserActivity";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/BackButton";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const {
    logUserActivity
  } = useUserActivity(userId);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const favoritedArticles = localStorage.getItem('favoritedArticles');
        if (favoritedArticles) {
          const parsed = JSON.parse(favoritedArticles);
          const favoritesList = Object.entries(parsed).map(([key, value]) => {
            const [lawName, articleNumber] = key.split('-');
            return {
              ...(value as any),
              lawName,
              articleNumber
            };
          });
          setFavorites(favoritesList);
        }
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
        toast({
          description: "Erro ao carregar favoritos. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  // Function to navigate to an article with highlighting
  const navigateToArticle = (lawName: string, articleNumber: string) => {
    navigate(`/lei/${encodeURIComponent(lawName)}?artigo=${articleNumber}`);
    
    if (userId) {
      logUserActivity('favorite_view', lawName, articleNumber);
    }
  };

  return <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl font-heading font-bold text-primary-300">
              Seus Favoritos
            </h1>
          </div>
        </div>
        
        {isLoading ? <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4" />
            <p className="text-gray-400">Carregando seus favoritos...</p>
          </div> : favorites.length > 0 ? <div className="space-y-4 animate-fade-in">
            {favorites.map((fav, index) => (
              <button 
                key={index} 
                onClick={() => navigateToArticle(fav.lawName, fav.articleNumber)} 
                className="w-full p-4 neomorph flex items-center justify-between hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Bookmark size={18} className="text-primary-300 fill-current" />
                  <div className="text-left">
                    <h3 className="text-primary-200 font-medium">{fav.lawName}</h3>
                    <p className="text-sm text-gray-400">Art. {fav.articleNumber}</p>
                  </div>
                </div>
              </button>
            ))}
          </div> : <div className="text-center py-8 neomorph">
            <Bookmark className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-primary-100 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-400">
              Favorite artigos para encontrá-los facilmente aqui.
            </p>
          </div>}
      </main>
      
      <Footer />
    </div>;
};

export default Favorites;
