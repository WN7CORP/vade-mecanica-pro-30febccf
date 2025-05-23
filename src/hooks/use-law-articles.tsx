
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  fetchLawArticles, 
  searchByTerm, 
  searchArticle,
  Article, 
  normalizeText,
  normalizeArticleNumber,
  isNumberSearch
} from "@/services/lawService";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

const articlesCache: Record<string, Article[]> = {};

export const useLawArticles = (lawName: string | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<'number' | 'exact'>('number');
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const ITEMS_PER_PAGE = 20;

  // Use debounced search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

      if (!articlesCache[decodedLawName]) {
        const { articles: data } = await fetchLawArticles(decodedLawName);
        articlesCache[decodedLawName] = data;
      }

      const allArticles = articlesCache[decodedLawName];
      const startIndex = 0;
      const endIndex = page * ITEMS_PER_PAGE;
      const currentArticles = allArticles.slice(startIndex, endIndex);

      setArticles(currentArticles);
      
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

  useEffect(() => {
    setPage(1);
    setSearchTerm("");
    setSearchResults([]);
    loadArticles();
  }, [lawName]);

  useEffect(() => {
    if (page > 1) {
      loadArticles();
    }
  }, [page, loadArticles]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm === "") {
      setFilteredArticles(articles);
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (term: string) => {
    if (!term) return;
    
    setIsSearching(true);
    
    try {
      if (!lawName) return;
      
      const decodedLawName = decodeURIComponent(lawName);
      
      // Different search strategies based on search mode
      if (searchMode === 'number') {
        // For number mode, try to find exact article number match first
        const article = await searchArticle(decodedLawName, term);
        
        if (article) {
          setSearchResults([article]);
          setFilteredArticles([article]);
          return;
        }
      }
      
      // If not found or in exact mode, search by content
      console.log(`Searching for "${term}" in ${decodedLawName} using mode: ${searchMode}`);
      
      // Try client-side search first for faster results
      const normalizedTerm = normalizeText(term);
      const localResults = articles.filter(article => {
        const contentText = typeof article.conteudo === 'string'
          ? normalizeText(article.conteudo)
          : normalizeText(JSON.stringify(article.conteudo));
            
        return contentText.includes(normalizedTerm);
      });
      
      if (localResults.length > 0) {
        setSearchResults(localResults);
        setFilteredArticles(localResults);
      }
      
      // Always perform server search for more comprehensive results
      const serverResults = await searchByTerm(decodedLawName, term);
      
      if (serverResults.length > 0) {
        setSearchResults(serverResults);
        setFilteredArticles(serverResults);
      } else if (localResults.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: `Nenhum artigo encontrado para "${term}"`,
          variant: "default",
        });
        setFilteredArticles([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível completar a busca. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (term: string, mode: 'number' | 'exact' = searchMode) => {
    setSearchTerm(term);
    setSearchMode(mode);
    
    if (!term) {
      setSearchResults([]);
      setFilteredArticles(articles);
    }
  };

  return {
    articles,
    filteredArticles,
    isLoading,
    isSearching,
    searchTerm,
    searchMode,
    handleSearch,
    setSearchMode,
    hasMore,
    loadingRef,
  };
};
