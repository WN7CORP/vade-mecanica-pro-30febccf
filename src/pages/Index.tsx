
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { Book, Search, Scale, BookOpen, Bookmark, ScrollText, Newspaper } from "lucide-react";
import { fetchAvailableLaws, LAW_OPTIONS } from "@/services/lawService";
import { Article } from "@/services/lawService";
import axios from "axios";

interface RecentLaw {
  name: string;
  lastVisited: string;
}

interface LegalUpdate {
  title: string;
  date: string;
  url: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [recentLaws, setRecentLaws] = useState<string[]>([]);
  const [recentArticles, setRecentArticles] = useState<RecentLaw[]>([]);
  const [legalUpdates, setLegalUpdates] = useState<LegalUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);

  useEffect(() => {
    const loadRecentLaws = async () => {
      try {
        // Carregar algumas leis para exibição rápida
        const sheets = await fetchAvailableLaws();
        setRecentLaws(sheets.slice(0, 4));
      } catch (error) {
        console.error("Erro ao carregar leis recentes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadRecentArticles = () => {
      const recentHistory = JSON.parse(localStorage.getItem('recentArticles') || '[]');
      setRecentArticles(recentHistory.slice(0, 5));
    };

    const fetchLegalUpdates = async () => {
      setIsLoadingUpdates(true);
      try {
        // Aqui precisaríamos de uma API específica para buscar as leis recentes
        // Como exemplo, vamos fazer um scraping básico do site do Congresso Nacional
        const response = await axios.get('https://api.npoint.io/43da8c80a42ee5e5cbad');
        // Este é um endpoint de teste que simula dados do Congresso Nacional
        // Em um ambiente de produção, você precisaria de uma API real ou um proxy para fazer o scraping
        
        // Parsear a resposta
        setLegalUpdates(response.data.slice(0, 5));
      } catch (error) {
        console.error("Erro ao carregar atualizações jurídicas:", error);
        // Dados fallback
        setLegalUpdates([
          { 
            title: "LEI Nº 14.790, DE 17 DE ABRIL DE 2024", 
            date: "17/04/2024",
            url: "https://www.in.gov.br/web/dou/-/lei-n-14.790-de-17-de-abril-de-2024-545405177"
          },
          { 
            title: "LEI Nº 14.789, DE 15 DE ABRIL DE 2024", 
            date: "15/04/2024",
            url: "https://www.in.gov.br/web/dou/-/lei-n-14.789-de-15-de-abril-de-2024-545182073"
          },
          { 
            title: "LEI Nº 14.788, DE 10 DE ABRIL DE 2024", 
            date: "10/04/2024",
            url: "https://www.in.gov.br/web/dou/-/lei-n-14.788-de-10-de-abril-de-2024-544644349"
          }
        ]);
      } finally {
        setIsLoadingUpdates(false);
      }
    };

    loadRecentLaws();
    loadRecentArticles();
    fetchLegalUpdates();
  }, []);

  const handleSearch = (term: string) => {
    if (term) {
      navigate(`/pesquisa?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-300">
            VADE MECUM <span className="text-primary-100">PRO</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Seu assistente jurídico inteligente
          </p>
        </div>
        
        <div className="mb-10">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar artigo, lei ou assunto..." 
          />
        </div>
        
        {/* Acesso rápido */}
        <div className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4">
            Acesso rápido
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate("/pesquisa")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <Search size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Pesquisar</span>
              <span className="text-xs text-gray-400 mt-1">
                Buscar artigos e termos
              </span>
            </button>
            
            <button 
              onClick={() => navigate("/favoritos")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <Bookmark size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Favoritos</span>
              <span className="text-xs text-gray-400 mt-1">
                Artigos salvos
              </span>
            </button>

            <button 
              onClick={() => navigate("/anotacoes")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <ScrollText size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Anotações</span>
              <span className="text-xs text-gray-400 mt-1">
                Suas anotações e estudos
              </span>
            </button>
            
            <button 
              onClick={() => navigate("/leis")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <BookOpen size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Ver Tudo</span>
              <span className="text-xs text-gray-400 mt-1">
                Navegar entre leis
              </span>
            </button>
          </div>
        </div>

        {/* Artigos recentes */}
        {recentArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4">
              Artigos recentes
            </h2>
            
            <div className="space-y-3">
              {recentArticles.map((article, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/lei/${encodeURIComponent(article.name)}`)}
                  className="neomorph-sm p-4 w-full flex items-center justify-between transition-all hover:shadow-neomorph-inset"
                >
                  <div className="flex items-center">
                    <ScrollText size={18} className="text-primary-300 mr-3" />
                    <span className="text-gray-300">{article.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(article.lastVisited).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Atualizações jurídicas */}
        <div className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4 flex items-center">
            <Newspaper size={20} className="mr-2" />
            Atualizações jurídicas
          </h2>
          
          {isLoadingUpdates ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="neomorph-sm p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {legalUpdates.map((update, index) => (
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                  className="neomorph-sm p-4 w-full flex flex-col items-start text-left transition-all hover:shadow-neomorph-inset"
                >
                  <span className="text-primary-300 font-medium">{update.title}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Publicada em: {update.date}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Leis recentes */}
        <div>
          <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4">
            Leis populares
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
                <button
                  key={index}
                  onClick={() => navigate(`/lei/${encodeURIComponent(law)}`)}
                  className="neomorph-sm p-4 w-full flex items-center justify-between transition-all hover:shadow-neomorph-inset"
                >
                  <div className="flex items-center">
                    <Book size={18} className="text-primary-300 mr-3" />
                    <span className="text-gray-300">{law}</span>
                  </div>
                  <Scale size={16} className="text-gray-500" />
                </button>
              ))}
              
              {recentLaws.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  Nenhuma lei encontrada. Verifique a conexão com a planilha.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
