
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2, Bookmark, PieChart, X } from "lucide-react";
import { useUserActivity } from "@/hooks/useUserActivity";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/BackButton";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<any>(null);
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
    loadFavorites();
  }, []);

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
            articleNumber,
            key
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

  // Function to navigate to an article with highlighting
  const navigateToArticle = (lawName: string, articleNumber: string) => {
    navigate(`/lei/${encodeURIComponent(lawName)}?artigo=${articleNumber}`);
    
    if (userId) {
      logUserActivity('favorite_view', lawName, articleNumber);
    }
  };

  // Function to remove favorite
  const removeFavorite = (favorite: any) => {
    setSelectedFavorite(favorite);
    setConfirmDialogOpen(true);
  };

  const confirmRemoveFavorite = () => {
    try {
      const favoritedArticles = localStorage.getItem('favoritedArticles');
      if (favoritedArticles && selectedFavorite) {
        const parsed = JSON.parse(favoritedArticles);
        const key = `${selectedFavorite.lawName}-${selectedFavorite.articleNumber}`;
        
        if (parsed[key]) {
          delete parsed[key];
          localStorage.setItem('favoritedArticles', JSON.stringify(parsed));
          
          // Update state to refresh UI
          setFavorites(favorites.filter(f => f.key !== key));
          
          toast({
            title: "Favorito removido",
            description: "O artigo foi removido dos favoritos",
          });
          
          if (userId) {
            logUserActivity('unfavorite', selectedFavorite.lawName, selectedFavorite.articleNumber);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast({
        description: "Erro ao remover favorito. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setConfirmDialogOpen(false);
      setSelectedFavorite(null);
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
              <motion.div 
                key={index}
                className="w-full p-4 neomorph flex items-center justify-between hover:scale-[1.01] transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div 
                  onClick={() => navigateToArticle(fav.lawName, fav.articleNumber)}
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <Bookmark size={18} className="text-primary-300 fill-current" />
                  <div className="text-left">
                    <h3 className="text-primary-200 font-medium">{fav.lawName}</h3>
                    <p className="text-sm text-gray-400">Art. {fav.articleNumber}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeFavorite(fav)}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <X size={18} />
                </Button>
              </motion.div>
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover favorito</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este artigo dos favoritos?
            </DialogDescription>
          </DialogHeader>
          {selectedFavorite && (
            <div className="p-4 bg-muted/30 rounded-md">
              <p className="font-medium text-primary-200">{selectedFavorite.lawName}</p>
              <p className="text-sm text-gray-400">Art. {selectedFavorite.articleNumber}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmRemoveFavorite}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};

export default Favorites;
