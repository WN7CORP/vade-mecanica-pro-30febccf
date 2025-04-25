
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  fetchLawArticles, 
  searchByTerm, 
  searchArticle,
  Article,
  normalizeText, 
  normalizeArticleNumber
} from "@/services/lawService";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { queryCache } from "@/utils/queryCache";
import { globalSearchIndexer } from "@/utils/searchIndexer";

interface UseLawSearchProps {
  lawName?: string;
  batchSize?: number;
  cacheTime?: number; // em milissegundos
  useFullTextSearch?: boolean;
}

export const useEnhancedLawSearch = ({
  lawName,
  batchSize = 20,
  cacheTime = 5 * 60 * 1000, // 5 minutos
  useFullTextSearch = true
}: UseLawSearchProps) => {
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
  const allArticlesRef = useRef<Article[]>([]);
  
  // Use debounced search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Chave de cache baseada no nome da lei
  const getCacheKey = useCallback((term: string = '') => {
    return `law_articles_${lawName}_${term}`;
  }, [lawName]);

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

      // Verificar se existe no cache primeiro
      const cachedArticles = queryCache.get<Article[]>(getCacheKey());
      
      if (cachedArticles) {
        console.log("Usando artigos em cache");
        allArticlesRef.current = cachedArticles;
      } else {
        console.log("Buscando artigos da API");
        const { articles: data } = await fetchLawArticles(decodedLawName);
        allArticlesRef.current = data;
        
        // Salvar no cache
        queryCache.set(getCacheKey(), data, cacheTime);
        
        // Indexar artigos para pesquisa de texto completo se a opção estiver ativada
        if (useFullTextSearch) {
          globalSearchIndexer.indexArticles(data);
        }
      }

      // Carregar apenas o lote atual de artigos
      const startIndex = 0;
      const endIndex = page * batchSize;
      const currentBatch = allArticlesRef.current.slice(startIndex, endIndex);

      setArticles(currentBatch);
      setHasMore(endIndex < allArticlesRef.current.length);
      
      if (searchTerm) {
        console.log("Aplicando filtro de busca:", searchTerm);
        setFilteredArticles(searchResults);
      } else {
        setFilteredArticles(currentBatch);
      }
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
  }, [lawName, page, searchTerm, toast, searchResults, batchSize, cacheTime, useFullTextSearch, getCacheKey]);

  // Configurar o observador de interseção para carregar mais artigos quando chegar ao final
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

  // Reiniciar quando o nome da lei mudar
  useEffect(() => {
    setPage(1);
    setSearchTerm("");
    setSearchResults([]);
    loadArticles();
    
    // Limpar cache de buscas antigas não relacionadas à lei atual
    queryCache.cleanup();
    
    return () => {
      // Limpar índice de pesquisa ao desmontar para economizar memória
      if (useFullTextSearch) {
        globalSearchIndexer.clearIndex();
      }
    };
  }, [lawName, loadArticles, useFullTextSearch]);

  // Carregar mais artigos quando a página mudar
  useEffect(() => {
    if (page > 1) {
      loadArticles();
    }
  }, [page, loadArticles]);

  // Realizar pesquisa quando o termo de busca debounced mudar
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm === "") {
      setFilteredArticles(articles);
    }
  }, [debouncedSearchTerm, articles]);

  const performSearch = async (term: string) => {
    if (!term) return;
    
    setIsSearching(true);
    
    try {
      if (!lawName) return;
      
      const decodedLawName = decodeURIComponent(lawName);
      const cacheKey = getCacheKey(term);
      
      // Verificar se há resultados em cache primeiro
      const cachedResults = queryCache.get<Article[]>(`search_${searchMode}_${cacheKey}`);
      
      if (cachedResults) {
        console.log("Usando resultados de busca em cache");
        setSearchResults(cachedResults);
        setFilteredArticles(cachedResults);
        return;
      }
      
      // Different search strategies based on search mode
      if (searchMode === 'number') {
        // For number mode, try to find exact article number match first
        const article = await searchArticle(decodedLawName, term);
        
        if (article) {
          setSearchResults([article]);
          setFilteredArticles([article]);
          
          // Salvar no cache
          queryCache.set(`search_number_${cacheKey}`, [article], cacheTime);
          return;
        }
      }
      
      // Se a pesquisa de texto completo estiver ativada e houver termos indexados
      if (useFullTextSearch && searchMode === 'exact') {
        console.log("Usando pesquisa de texto completo para:", term);
        const indexResults = globalSearchIndexer.search(term);
        
        if (indexResults.length > 0) {
          const resultArticles = indexResults.map(result => result.article);
          setSearchResults(resultArticles);
          setFilteredArticles(resultArticles);
          
          // Salvar no cache
          queryCache.set(`search_exact_${cacheKey}`, resultArticles, cacheTime);
          return;
        }
      }
      
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
        
        // Salvar no cache
        queryCache.set(`search_${searchMode}_${cacheKey}`, localResults, cacheTime);
      }
      
      // Always perform server search for more comprehensive results
      const serverResults = await searchByTerm(decodedLawName, term);
      
      if (serverResults.length > 0) {
        setSearchResults(serverResults);
        setFilteredArticles(serverResults);
        
        // Salvar no cache
        queryCache.set(`search_${searchMode}_${cacheKey}`, serverResults, cacheTime);
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
  
  const clearCache = () => {
    queryCache.clear();
    toast({
      title: "Cache limpo",
      description: "O cache de busca foi limpo com sucesso.",
    });
  };
  
  // Estatísticas sobre o cache e índice de busca
  const getSearchStats = () => {
    return {
      cacheStats: queryCache.getStats(),
      indexStats: useFullTextSearch ? globalSearchIndexer.getStatistics() : null
    };
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
    clearCache,
    getSearchStats,
    // Métodos para o lazy loading
    page,
    setPage,
    loadMore: () => setPage(prev => prev + 1),
    // Batch size
    batchSize
  };
};
