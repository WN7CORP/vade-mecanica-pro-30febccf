
import { useState, useEffect } from "react";
import { fetchSheetData } from "@/services/sheetsApi";

interface Article {
  article: string;
  content: string;
}

export const useLawArticles = (lawName: string | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      if (!lawName) return;
      
      try {
        setIsLoading(true);
        const decodedLawName = decodeURIComponent(lawName);
        const data = await fetchSheetData(decodedLawName);
        
        setArticles(data);
        setFilteredArticles(data);
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticles();
  }, [lawName]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term) {
      setFilteredArticles(articles);
      return;
    }
    
    const filtered = articles.filter(article => 
      (article.article && article.article.toLowerCase().includes(term.toLowerCase())) ||
      (article.content && article.content.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredArticles(filtered);
  };

  return {
    articles,
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch
  };
};
