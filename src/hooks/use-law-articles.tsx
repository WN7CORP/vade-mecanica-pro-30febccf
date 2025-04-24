
import { useState, useEffect } from "react";
import { fetchLawArticles, Article } from "@/services/lawService";
import { useToast } from "@/hooks/use-toast";

export const useLawArticles = (lawName: string | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const loadArticles = async () => {
    if (!lawName) {
      console.log("Nome da lei não fornecido");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const decodedLawName = decodeURIComponent(lawName);
      console.log(`Carregando artigos para: ${decodedLawName}`);
      
      const { articles: data, totalCount: count } = await fetchLawArticles(decodedLawName);
      console.log(`Artigos carregados: ${data.length}, total: ${count}`);
      
      setTotalCount(count);
      setArticles(data);
      setFilteredArticles(searchTerm ? data.filter(article => 
        (article.numero && article.numero.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.conteudo && article.conteudo.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : data);
      
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os artigos. Verifique se a lei existe no banco de dados.",
        variant: "destructive"
      });
      setArticles([]);
      setFilteredArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term) {
      setFilteredArticles(articles);
      return;
    }
    
    const filtered = articles.filter(article => 
      (article.numero && article.numero.toLowerCase().includes(term.toLowerCase())) ||
      (article.conteudo && article.conteudo.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredArticles(filtered);
  };

  // Handle initial load and law changes
  useEffect(() => {
    loadArticles();
  }, [lawName]);

  return {
    articles,
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch,
    totalCount
  };
};
