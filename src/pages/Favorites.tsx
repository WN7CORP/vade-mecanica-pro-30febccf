
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2, Bookmark, PieChart } from "lucide-react";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFavorites = () => {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
      setIsLoading(false);
    };
    
    loadFavorites();
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary-300">
            Seus Favoritos
          </h1>
          
          <div className="neomorph p-3 text-primary-300">
            <PieChart size={20} />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4" />
            <p className="text-gray-400">Carregando seus favoritos...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            {favorites.map((fav, index) => (
              <button
                key={index}
                onClick={() => navigate(`/lei/${encodeURIComponent(fav.lawName)}`)}
                className="w-full p-4 neomorph flex items-center justify-between hover:scale-[1.02] transition-all duration-300"
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
          </div>
        ) : (
          <div className="text-center py-8 neomorph">
            <Bookmark className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-primary-100 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-400">
              Favorite artigos para encontrá-los facilmente aqui.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Favorites;
