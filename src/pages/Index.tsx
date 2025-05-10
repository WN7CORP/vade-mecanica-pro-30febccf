
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingSearchButton } from "@/components/ui/FloatingSearchButton";
import SearchBar from "@/components/ui/SearchBar";
import { 
  Scale, 
  Search, 
  BookOpen, 
  Bookmark, 
  ScrollText, 
  History, 
  Sparkles,
  BarChart3,
  MessageCircle,
  Clock,
  Lightbulb
} from "lucide-react";
import { fetchAvailableLaws, searchAcrossAllLaws } from "@/services/lawService";
import debounce from 'lodash/debounce';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col space-y-8">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-heading font-bold gradient-text">
          VADE MECUM <span className="text-primary-500">PRO</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Seu assistente jurídico profissional
        </p>
      </motion.div>
      
      <motion.div 
        className={`relative transition-all duration-300 mb-6 ${
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
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={item}>
          <Card onClick={() => navigate("/leis")} className="cursor-pointer hover:shadow-md transition-all h-36">
            <CardHeader className="pb-2">
              <Scale className="h-8 w-8 text-primary-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Ver Tudo</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Códigos e Estatutos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card onClick={() => navigate("/favoritos")} className="cursor-pointer hover:shadow-md transition-all h-36">
            <CardHeader className="pb-2">
              <Bookmark className="h-8 w-8 text-primary-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Favoritos</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Artigos salvos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card onClick={() => navigate("/anotacoes")} className="cursor-pointer hover:shadow-md transition-all h-36">
            <CardHeader className="pb-2">
              <ScrollText className="h-8 w-8 text-primary-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Anotações</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Suas notas de estudo</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card onClick={() => navigate("/duvidas")} className="cursor-pointer hover:shadow-md transition-all h-36">
            <CardHeader className="pb-2">
              <Sparkles className="h-8 w-8 text-primary-500" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">IA Jurídica</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Assistente inteligente</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {recentArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
              <Clock size={18} className="text-primary-500" />
              Artigos Recentes
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/historico")}>
              Ver tudo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentArticles.slice(0, 4).map((article: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 * index }}
              >
                <Card 
                  onClick={() => navigate(`/lei/${encodeURIComponent(article.lawName)}?artigo=${article.number}`)}
                  className="cursor-pointer hover:shadow-md hover:border-primary-100 transition-all"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-primary-500 bg-primary-50 dark:bg-primary-900/20">
                        Art. {article.number}
                      </Badge>
                      <span className="text-sm truncate max-w-[150px]">{article.lawName}</span>
                    </div>
                    <Clock size={14} className="text-gray-400" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" />
            Leis Recentes
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/leis")}>
            Ver todas
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-12 flex items-center">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLaws.map((law, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 * index }}
              >
                <Card 
                  onClick={() => navigate(`/lei/${encodeURIComponent(law)}`)}
                  className="cursor-pointer hover:shadow-md hover:border-primary-100 transition-all"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scale size={16} className="text-primary-500" />
                      <span className="text-sm truncate max-w-[200px]">{law}</span>
                    </div>
                    <BookOpen size={14} className="text-gray-400" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {recentLaws.length === 0 && (
              <Card className="col-span-2">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">
                    Nenhuma lei encontrada. Verifique a conexão com a planilha.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4 mb-6"
      >
        <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
          <Lightbulb size={18} className="text-primary-500" />
          Recursos de Estudo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <MessageCircle className="h-8 w-8 text-primary-500 mb-2" />
              <h3 className="font-medium mb-1">Assistente IA</h3>
              <p className="text-sm text-gray-500">Tire suas dúvidas com nossa inteligência artificial especializada em Direito</p>
              <Button className="mt-4" onClick={() => navigate("/duvidas")}>
                Conversar
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BarChart3 className="h-8 w-8 text-primary-500 mb-2" />
              <h3 className="font-medium mb-1">Estatísticas de Estudo</h3>
              <p className="text-sm text-gray-500">Acompanhe seu progresso e métricas de estudo personalizadas</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate("/estatisticas")}>
                Visualizar
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Lightbulb className="h-8 w-8 text-primary-500 mb-2" />
              <h3 className="font-medium mb-1">Modo Estudo</h3>
              <p className="text-sm text-gray-500">Estude com flashcards, anotações e recursos especiais para memorização</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate("/estudos")}>
                Começar
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      {!showSearchBar && (
        <FloatingSearchButton onOpenSearch={handleSearchClick} />
      )}
    </div>
  );
};

export default Index;
