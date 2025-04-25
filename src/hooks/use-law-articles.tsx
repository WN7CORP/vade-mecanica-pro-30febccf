import { useState, useEffect, useRef, useCallback } from "react";
import { 
  fetchLawArticles, 
  searchByTerm, 
  Article, 
  normalizeArticleNumber,
  isNumberSearch
} from "@/services/lawService";
import { useToast } from "@/hooks/use-toast";

// Cache object to store articles by law name
const articlesCache: Record<string, Article[]> = {};

export const useLawArticles = (lawName: string | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const ITEMS_PER_PAGE = 20;

  // Function to load articles from cache or fetch them
  const loadArticles = useCallback(async () => {
    if (!lawName) {
      console.log("Nome da lei não fornecido");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const decodedLawName = decodeURIComponent(lawName);
      console.log(`Carregando artigos para: ${decodedLawName}`);

      // Check if we have cached data
      if (!articlesCache[decodedLawName]) {
        const { articles: data } = await fetchLawArticles(decodedLawName);
        articlesCache[decodedLawName] = data;
      }

      const allArticles = articlesCache[decodedLawName];
      const startIndex = 0;
      const endIndex = page * ITEMS_PER_PAGE;
      const currentArticles = allArticles.slice(startIndex, endIndex);

      setArticles(currentArticles);
      
      // Only apply search filter if there's an active search term
      if (searchTerm) {
        console.log("Aplicando filtro de busca:", searchTerm);
        setFilteredArticles(searchResults);
      } else {
        setFilteredArticles(currentArticles);
      }

      setHasMore(endIndex < allArticles.length);
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível carregar os artigos. Verifique se a lei existe no banco de dados.",
        variant: "destructive",
      });
      setArticles([]);
      setFilteredArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [lawName, page, searchTerm, toast, searchResults]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isSearching && !searchTerm) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isSearching, searchTerm]);

  // Handle initial load and law changes
  useEffect(() => {
    setPage(1);
    setSearchTerm("");
    setSearchResults([]);
    loadArticles();
  }, [lawName]);

  // Handle page changes
  useEffect(() => {
    if (page > 1) {
      loadArticles();
    }
  }, [page, loadArticles]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term) {
      setSearchResults([]);
      setFilteredArticles(articles);
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log("Executando busca por:", term, "em:", lawName);
      
      // First, try local search in already loaded articles
      const normalizedTerm = normalizeArticleNumber(term);
      const localResults = articles.filter(article => {
        const articleNumberMatch = article.numero && 
          normalizeArticleNumber(article.numero) === normalizedTerm;
            
        const contentMatch = article.conteudo && 
          article.conteudo.toLowerCase().includes(term.toLowerCase());
          
        return articleNumberMatch || contentMatch;
      });
      
      // Update UI immediately with local results
      setSearchResults(localResults);
      setFilteredArticles(localResults);
      
      if (!lawName) return;
      
      // Then fetch more comprehensive results from the database
      const serverResults = await searchByTerm(decodeURIComponent(lawName), term);
      console.log("Resultados da busca no servidor:", serverResults);
      
      if (serverResults.length > 0) {
        // Sort results - prioritize exact matches on article number
        const sortedResults = serverResults.sort((a, b) => {
          // If exactly matches article.numero, put it first
          const normalizedSearch = normalizeArticleNumber(term);
          if (normalizeArticleNumber(a.numero) === normalizedSearch) return -1;
          if (normalizeArticleNumber(b.numero) === normalizedSearch) return 1;
          return 0;
        });
        
        setSearchResults(sortedResults);
        setFilteredArticles(sortedResults);
      } else if (localResults.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: `Nenhum artigo encontrado para "${term}"`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível completar a busca. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return {
    articles,
    filteredArticles,
    isLoading,
    isSearching,
    searchTerm,
    handleSearch,
    hasMore,
    loadingRef,
  };
};
