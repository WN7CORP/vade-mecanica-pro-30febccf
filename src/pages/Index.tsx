
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { Scale, Search, BookOpen, Bookmark, ScrollText, History } from "lucide-react";
import { fetchAvailableLaws, searchAcrossAllLaws } from "@/services/lawService";
import debounce from 'lodash/debounce';
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [recentLaws, setRecentLaws] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPreviews, setSearchPreviews] = useState<any[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [recentArticles] = useState(() => {
    const saved = localStorage.getItem('recent-articles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadRecentLaws = async () => {
      try {
        const sheets = await fetchAvailableLaws();
        setRecentLaws(sheets.slice(0, 4));
      } catch (error) {
        console.error("Erro ao carregar leis recentes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentLaws();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowSearchBar(false);
      } else {
        setShowSearchBar(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = (term: string) => {
    if (term) {
      navigate(`/pesquisa?q=${encodeURIComponent(term)}`);
    }
  };
  
  const handleSearchClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowSearchBar(true);
  };

  const debouncedSearch = debounce(async (term: string) => {
    if (term.length < 2) {
      setSearchPreviews([]);
      setShowPreviews(false);
      return;
    }

    try {
      const results = await searchAcrossAllLaws(term);
      const previews = results.flatMap(lawResult => 
        lawResult.articles.map(article => ({
          article: article.numero,
          content: article.conteudo.substring(0, 100) + "...",
          lawName: lawResult.lawName,
          previewType: 'article',
          category: getLawCategory(lawResult.lawName)
        }))
      );
      setSearchPreviews(previews.slice(0, 10)); // Limit to 10 results total
      setShowPreviews(previews.length > 0);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchPreviews([]);
      setShowPreviews(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      debouncedSearch(term);
    } else {
      setSearchPreviews([]);
      setShowPreviews(false);
    }
  };

  const handlePreviewClick = (preview: any) => {
    navigate(`/lei/${encodeURIComponent(preview.lawName)}?artigo=${preview.article}`);
  };

  // Helper to get category from law name
  const getLawCategory = (lawName: string): 'codigo' | 'estatuto' | 'outros' => {
    if (lawName.toLowerCase().includes('código') || lawName === 'Constituição Federal' || lawName.includes('Consolidação')) {
      return 'codigo';
    } else if (lawName.toLowerCase().includes('estatuto')) {
      return 'estatuto'; 
    }
    return 'outros';
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">
            VADE MECUM <span className="text-primary-100">PRO</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Vade Mecum Profissional
          </p>
        </motion.div>
        
        <motion.div 
          className={`mb-10 relative transition-all duration-300 ${
            showSearchBar ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar artigo, lei ou assunto..." 
            onInputChange={handleInputChange}
            searchPreviews={searchPreviews}
            showPreviews={showPreviews}
            onPreviewClick={handlePreviewClick}
          />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button 
            onClick={() => navigate("/leis")}
            className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Scale size={28} className="text-primary-300 mb-3" />
            <span className="text-gray-300 font-medium">Ver Tudo</span>
            <span className="text-xs text-gray-400 mt-1">
              Códigos e Estatutos
            </span>
          </motion.button>
          
          <motion.button 
            onClick={() => navigate("/favoritos")}
            className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bookmark size={28} className="text-primary-300 mb-3" />
            <span className="text-gray-300 font-medium">Favoritos</span>
            <span className="text-xs text-gray-400 mt-1">
              Artigos salvos
            </span>
          </motion.button>

          <motion.button 
            onClick={() => navigate("/anotacoes")}
            className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <ScrollText size={28} className="text-primary-300 mb-3" />
            <span className="text-gray-300 font-medium">Anotações</span>
            <span className="text-xs text-gray-400 mt-1">
              Anotações de estudos
            </span>
          </motion.button>
          
          <motion.button 
            onClick={() => navigate("/pesquisa")}
            className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search size={28} className="text-primary-300 mb-3" />
            <span className="text-gray-300 font-medium">Pesquisar</span>
            <span className="text-xs text-gray-400 mt-1">
              Buscar artigos e termos
            </span>
          </motion.button>
        </motion.div>
        
        {recentArticles.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4 flex items-center gap-2">
              <History size={20} />
              Artigos Recentes
            </h2>
            
            <div className="space-y-3">
              {recentArticles.map((article: any, index: number) => (
                <motion.button
                  key={index}
                  onClick={() => navigate(`/lei/${encodeURIComponent(article.lawName)}?artigo=${article.number}`)}
                  className="neomorph-sm p-4 w-full flex items-center justify-between transition-all hover:shadow-neomorph-inset"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 * index }}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-primary-300">
                      Art. {article.number}
                    </Badge>
                    <span className="text-gray-300">{article.lawName}</span>
                  </div>
                  <Scale size={16} className="text-gray-500" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4 flex items-center gap-2">
            <Scale size={20} />
            Leis Recentes
          </h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="neomorph-sm p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentLaws.map((law, index) => (
                <motion.button
                  key={index}
                  onClick={() => navigate(`/lei/${encodeURIComponent(law)}`)}
                  className="neomorph-sm p-4 w-full flex items-center justify-between transition-all hover:shadow-neomorph-inset"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 * index }}
                >
                  <div className="flex items-center">
                    <Scale size={18} className="text-primary-300 mr-3" />
                    <span className="text-gray-300">{law}</span>
                  </div>
                  <Scale size={16} className="text-gray-500" />
                </motion.button>
              ))}
              
              {recentLaws.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  Nenhuma lei encontrada. Verifique a conexão com a planilha.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
      
      {!showSearchBar && (
        <FloatingSearchButton onOpenSearch={handleSearchClick} />
      )}
    </div>
  );
};

export default Index;
