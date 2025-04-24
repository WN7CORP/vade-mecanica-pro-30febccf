
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchLawArticles, Article } from "@/services/lawService";
import { useToast } from "@/hooks/use-toast";

// Cache object to store articles by law name
const articlesCache: Record<string, Article[]> = {};

export const useLawArticles = (lawName: string | undefined) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
      setFilteredArticles(
        searchTerm
          ? currentArticles.filter(
              (article) =>
                (article.numero &&
                  article.numero
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
                (article.conteudo &&
                  article.conteudo
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
            )
          : currentArticles
      );

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
  }, [lawName, page, searchTerm, toast]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  // Handle initial load and law changes
  useEffect(() => {
    setPage(1);
    loadArticles();
  }, [lawName]);

  // Handle page changes
  useEffect(() => {
    if (page > 1) {
      loadArticles();
    }
  }, [page, loadArticles]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);

    if (!term) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(
      (article) =>
        (article.numero &&
          article.numero.toLowerCase().includes(term.toLowerCase())) ||
        (article.conteudo &&
          article.conteudo.toLowerCase().includes(term.toLowerCase()))
    );

    setFilteredArticles(filtered);
  };

  return {
    articles,
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch,
    hasMore,
    loadingRef,
  };
};
