
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchLawArticles, Article } from "@/services/lawService";
import { useToast } from "@/hooks/use-toast";

export const useLawArticles = (lawName: string | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pageSize = 20;
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const loadArticles = useCallback(async (pageNum: number, resetExisting: boolean = false) => {
    if (!lawName) {
      console.log("Nome da lei não fornecido");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const decodedLawName = decodeURIComponent(lawName);
      console.log(`Carregando artigos para: ${decodedLawName}, página ${pageNum}`);
      
      const { articles: data, totalCount: count } = await fetchLawArticles(decodedLawName, pageNum, pageSize);
      console.log(`Artigos carregados: ${data.length}, total: ${count}`);
      
      setTotalCount(count);
      
      if (resetExisting) {
        setArticles(data);
        setFilteredArticles(data);
      } else {
        setArticles(prev => [...prev, ...data]);
        setFilteredArticles(prev => searchTerm ? prev : [...prev, ...data]);
      }
      
      setHasMore(data.length === pageSize && (pageNum + 1) * pageSize < count);
      
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
  }, [lawName, searchTerm, toast, pageSize]);

  const handleSearch = useCallback((term: string) => {
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
  }, [articles]);

  // Handle initial load and law changes
  useEffect(() => {
    setPage(0);
    setArticles([]);
    setFilteredArticles([]);
    loadArticles(0, true);
  }, [lawName, loadArticles]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const currentObserver = observer.current;
    
    // Clean up old observer
    if (currentObserver) {
      currentObserver.disconnect();
    }
    
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          loadArticles(nextPage);
          return nextPage;
        });
      }
    }, options);
    
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    
    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [loadArticles, hasMore, isLoading]);

  return {
    articles,
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch,
    hasMore,
    loadingRef,
    totalCount
  };
};
