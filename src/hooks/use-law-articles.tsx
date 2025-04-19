
import { useState, useEffect } from "react";
import { fetchLawArticles, searchArticles } from "@/services/lawService";
import { Article } from "@/types/law";

export const useLawArticles = (lawId: number | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      if (!lawId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await fetchLawArticles(lawId);
        
        // Garantir que todos os artigos têm conteudo definido
        const validatedData = data.map(article => ({
          ...article,
          conteudo: article.conteudo || ''
        }));
        
        setArticles(validatedData);
        setFilteredArticles(validatedData);
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
        setArticles([]);
        setFilteredArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticles();
  }, [lawId]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!lawId) return;
    
    if (!term) {
      setFilteredArticles(articles);
      return;
    }
    
    try {
      const searchResults = await searchArticles(lawId, term);
      
      // Garantir que todos os artigos têm conteudo definido
      const validatedResults = searchResults.map(article => ({
        ...article,
        conteudo: article.conteudo || ''
      }));
      
      setFilteredArticles(validatedResults);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      setFilteredArticles([]);
    }
  };

  return {
    articles,
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch
  };
};
