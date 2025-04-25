
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import PDFExporter from "@/components/ui/PDFExporter";
import { Loader2, FileText, BookOpen, Codepen, History, ListFilter, Tag } from "lucide-react";
import { 
  searchArticle, 
  searchByTerm,
  fetchAvailableLaws,
  fetchCategorizedLaws,
  searchAcrossAllLaws,
  LAW_OPTIONS
} from "@/services/lawService";
import { 
  generateArticleExplanation, 
  AIExplanation as AIExplanationType 
} from "@/services/aiService";
import debounce from 'lodash/debounce';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchResult {
  article: string;
  content: string;
  lawName: string;
}

interface SearchPreview {
  article?: string;
  content: string;
  lawName: string;
  previewType: 'article' | 'term';
  category?: 'codigo' | 'estatuto';
}

const Search = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchPreviews, setSearchPreviews] = useState<SearchPreview[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const [selectedLaw, setSelectedLaw] = useState<string>("");
  const [availableLaws, setAvailableLaws] = useState<string[]>([]);
  const [categorizedLaws, setCategorizedLaws] = useState<Record<string, any[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanationType | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<SearchResult | null>(null);
  
  const [showChat, setShowChat] = useState(false);
  const [highlightTerm, setHighlightTerm] = useState("");

  // Get search history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Add current search to history
  useEffect(() => {
    if (query && query.length > 1) {
      const addToHistory = () => {
        setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      };
      addToHistory();
    }
    
    if (query) {
      setHighlightTerm(query);
    }
  }, [query]);

  useEffect(() => {
    const loadLaws = async () => {
      try {
        const laws = await fetchAvailableLaws();
        const categorized = await fetchCategorizedLaws();
        setAvailableLaws(laws);
        setCategorizedLaws(categorized);
        
        if (!selectedLaw && laws.length > 0) {
          setSelectedLaw(laws[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar leis:", error);
      }
    };
    
    loadLaws();
  }, [selectedLaw]);

  const performSearch = useCallback(async () => {
    if (!query) return;
    
    setIsLoading(true);
    setNoResults(false);
    
    try {
      if (selectedLaw) {
        const article = await searchArticle(selectedLaw, query);
        
        if (article && article.numero) {
          setSearchResults([{
            article: article.numero,
            content: article.conteudo,
            lawName: selectedLaw
          }]);
          setTotalFound(1);
        } else {
          const results = await searchByTerm(selectedLaw, query);
          
          if (results.length > 0) {
            setSearchResults(
              results.map(result => ({
                article: result.numero,
                content: result.conteudo,
                lawName: selectedLaw
              }))
            );
            setTotalFound(results.length);
          } else {
            setSearchResults([]);
            setNoResults(true);
            setTotalFound(0);
          }
        }
      } else {
        let lawsToSearch: string[] = [];
        
        if (selectedCategory === 'codigo' || selectedCategory === 'estatuto') {
          lawsToSearch = categorizedLaws[selectedCategory]?.map(law => law.display) || [];
        } else {
          lawsToSearch = availableLaws;
        }
        
        // Enhanced search across all tables with better ordering
        const searchResults = await searchAcrossAllLaws(query);
        
        // Flatten results
        const results: SearchResult[] = [];
        let totalCount = 0;
        
        searchResults.forEach(lawResult => {
          if (
            (selectedCategory === 'todos') ||
            (selectedCategory === 'codigo' && lawResult.lawCategory === 'codigo') ||
            (selectedCategory === 'estatuto' && lawResult.lawCategory === 'estatuto')
          ) {
            lawResult.articles.forEach(article => {
              results.push({
                article: article.numero,
                content: article.conteudo,
                lawName: lawResult.lawName
              });
            });
            totalCount += lawResult.total;
          }
        });
        
        setSearchResults(results);
        setNoResults(results.length === 0);
        setTotalFound(totalCount);
        
        // Show a toast with search statistics
        if (results.length > 0) {
          toast({
            title: `${results.length} resultados encontrados`,
            description: `Em ${searchResults.length} ${searchResults.length === 1 ? 'lei' : 'leis'} diferentes`,
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      setSearchResults([]);
      setNoResults(true);
      setTotalFound(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedLaw, selectedCategory, availableLaws, categorizedLaws, categorizedLaws, toast, searchResults.length]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, selectedLaw, selectedCategory, performSearch]);

  const debouncedSearchPreview = useRef(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchPreviews([]);
        setShowPreviews(false);
        return;
      }
      
      try {
        // Determine which laws to search based on selected category
        let lawsToSearch: string[] = [];
        
        if (selectedLaw) {
          lawsToSearch = [selectedLaw];
        } else if (selectedCategory === 'codigo' || selectedCategory === 'estatuto') {
          lawsToSearch = categorizedLaws[selectedCategory]?.map(law => law.display) || [];
        } else {
          lawsToSearch = availableLaws;
        }
        
        const previews: SearchPreview[] = [];
        
        // Search each law for previews
        for (const law of lawsToSearch) {
          try {
            // Try exact article match first
            const article = await searchArticle(law, term);
            
            if (article && article.numero) {
              const lawCategory = getLawCategory(law);
              previews.push({
                article: article.numero,
                content: article.conteudo.substring(0, 100) + "...",
                lawName: law,
                previewType: 'article',
                category: lawCategory
              });
            } 
            
            // Then try term search (limited to 3 results per law)
            const termResults = await searchByTerm(law, term);
            if (termResults.length > 0) {
              termResults.slice(0, 3).forEach(result => {
                if (!previews.some(p => p.article === result.numero && p.lawName === law)) {
                  const lawCategory = getLawCategory(law);
                  previews.push({
                    article: result.numero,
                    content: result.conteudo.substring(0, 100) + "...",
                    lawName: law,
                    previewType: 'term',
                    category: lawCategory
                  });
                }
              });
            }
          } catch (error) {
            console.error(`Erro na busca prévia para ${law}:`, error);
          }
        }
        
        // Limit total preview results to a reasonable number
        const limitedPreviews = previews.slice(0, 10);
        setSearchPreviews(limitedPreviews);
        setShowPreviews(limitedPreviews.length > 0);
      } catch (error) {
        console.error("Erro na busca prévia:", error);
        setSearchPreviews([]);
        setShowPreviews(false);
      }
    }, 300)
  ).current;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length >= 2) {
      debouncedSearchPreview(value);
    } else {
      setSearchPreviews([]);
      setShowPreviews(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchPreviews([]);
    setShowPreviews(false);
    setSearchParams({ q: term });
  };
  
  const handlePreviewClick = (preview: SearchPreview) => {
    setInputValue(preview.article || "");
    handleSearch(preview.article || "");
    setShowPreviews(false);
  };
  
  const handleSearchFocus = () => {
    setIsFocused(true);
    if (searchPreviews.length > 0) {
      setShowPreviews(true);
    } else if (searchHistory.length > 0 && !inputValue) {
      setShowHistory(true);
    }
  };
  
  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowPreviews(false);
      setShowHistory(false);
    }, 200);
  };
  
  const handleLawChange = (lawName: string) => {
    setSelectedLaw(lawName);
    if (inputValue) {
      debouncedSearchPreview(inputValue);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedLaw("");
  };
  
  const handleExplainArticle = async (result: SearchResult, type: 'technical' | 'formal' = 'technical') => {
    if (!result.article) return;
    
    setSelectedArticle(result);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    try {
      const aiExplanation = await generateArticleExplanation(
        result.article,
        result.content,
        result.lawName,
        type
      );
      
      setExplanation(aiExplanation);
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
    } finally {
      setLoadingExplanation(false);
    }
  };
  
  const handleAskQuestion = (result: SearchResult) => {
    setSelectedArticle(result);
    setShowChat(true);
  };
  
  const closeChat = () => {
    setShowChat(false);
  };

  const handleHistoryItemClick = (term: string) => {
    setInputValue(term);
    handleSearch(term);
    setShowHistory(false);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  const getLawCategory = (lawName: string): 'codigo' | 'estatuto' | undefined => {
    const law = LAW_OPTIONS.find(opt => opt.display === lawName);
    return law?.category;
  };

  // Animation variants for framer motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Function to highlight search terms in content
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-primary/20 text-primary-foreground">{part}</mark> : part
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 relative"
        >
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={inputValue}
            placeholder="Buscar artigo ou termo..." 
            onInputChange={handleInputChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            ref={searchInputRef}
            searchPreviews={searchPreviews}
            showPreviews={showPreviews}
            onPreviewClick={handlePreviewClick}
          />
          
          {showHistory && searchHistory.length > 0 && !showPreviews && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center text-sm text-muted-foreground">
                  <History className="mr-2 h-4 w-4" />
                  Pesquisas recentes
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSearchHistory}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Limpar
                </Button>
              </div>
              {searchHistory.map((term, index) => (
                <div
                  key={`history-${index}`}
                  onClick={() => handleHistoryItemClick(term)}
                  className="p-3 hover:bg-accent/20 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-primary-100">{term}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs 
            defaultValue="todos" 
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            className="w-full"
          >
            <TabsList className="mb-2 grid grid-cols-3 gap-1">
              <TabsTrigger value="todos" className="flex items-center">
                <Codepen className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="codigo" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Códigos
              </TabsTrigger>
              <TabsTrigger value="estatuto" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Estatutos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="mt-0">
              <div className="overflow-x-auto scrollbar-thin pb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedLaw("")}
                    className={`px-4 py-2 whitespace-nowrap text-sm transition-all ${
                      !selectedLaw
                        ? "neomorph text-primary-300 hover:scale-[1.02] transition-transform"
                        : "text-gray-400 hover:text-gray-300 hover:bg-primary/5 rounded-md"
                    }`}
                  >
                    Todas as leis
                  </button>
                  
                  {LAW_OPTIONS.map((law) => (
                    <button
                      key={law.table}
                      onClick={() => handleLawChange(law.display)}
                      className={`px-4 py-2 whitespace-nowrap text-sm flex items-center gap-1.5 ${
                        selectedLaw === law.display
                          ? "neomorph text-primary-300 hover:scale-[1.02] transition-transform"
                          : "text-gray-400 hover:text-gray-300 hover:bg-primary/5 rounded-md transition-colors"
                      }`}
                    >
                      {law.display}
                      <Badge variant="outline" className="text-[10px]">{law.abbreviation}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="codigo" className="mt-0">
              <div className="overflow-x-auto scrollbar-thin pb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedLaw("")}
                    className={`px-4 py-2 whitespace-nowrap text-sm ${
                      !selectedLaw
                        ? "neomorph text-primary-300 hover:scale-[1.02] transition-transform"
                        : "text-gray-400 hover:text-gray-300 hover:bg-primary/5 rounded-md transition-colors"
                    }`}
                  >
                    Todos os códigos
                  </button>
                  
                  {categorizedLaws.codigo?.map((law) => (
                    <button
                      key={law.table}
                      onClick={() => handleLawChange(law.display)}
                      className={`px-4 py-2 whitespace-nowrap text-sm flex items-center gap-1.5 ${
                        selectedLaw === law.display
                          ? "neomorph text-primary-300 hover:scale-[1.02] transition-transform"
                          : "text-gray-400 hover:text-gray-300 hover:bg-primary/5 rounded-md transition-colors"
                      }`}
                    >
                      {law.display}
                      <Badge variant="outline" className="text-[10px]">{law.abbreviation}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="estatuto" className="mt-0">
              <div className="overflow-x-auto scrollbar-thin pb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedLaw("")}
                    className={`px-4 py-2 whitespace-nowrap text-sm ${
                      !selectedLaw
                        ? "neomorph text-primary-300 hover:scale-[1.02] transition-transform"
                        : "text-gray-400 hover:text-gray-300 hover:bg-primary/5 rounded-md transition-colors"
                    }`}
                  >
                    Todos os estatutos
                  </button>
                  
                  {categorizedLaws.estatuto?.map((law) => (
                    <button
                      key={law.table}
                      onClick={() => handleLawChange(law.display)}
                      className={`px-4 py-2 whitespace-nowrap text-sm flex items-center gap-1.5 ${
                        selectedLaw === law.display
                          ? "neomorph text-primary-300 hover:scale-[1.02] transition-transform"
                          : "text-gray-400 hover:text-gray-300 hover:bg-primary/5 rounded-md transition-colors"
                      }`}
                    >
                      {law.display}
                      <Badge variant="outline" className="text-[10px]">{law.abbreviation}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        <div>
          {query && !isLoading && (
            <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>
                {totalFound === 0 ? 'Nenhum resultado' : 
                  `${totalFound} ${totalFound === 1 ? 'resultado' : 'resultados'} para `}
                <span className="font-medium text-primary">{query}</span>
              </span>
            </div>
          )}
          
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-400">Buscando resultados...</p>
            </motion.div>
          ) : noResults ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-center py-8 neomorph"
            >
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary-100 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-400">
                Tente usar outros termos ou verificar a ortografia.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence>
                {searchResults.map((result, index) => (
                  <motion.div 
                    key={`${result.lawName}-${result.article}-${index}`}
                    variants={itemVariants}
                    exit={{ opacity: 0, y: -10 }}
                    className="transition-all"
                  >
                    <ArticleCard
                      articleNumber={result.article}
                      content={highlightTerm ? 
                        highlightText(result.content, highlightTerm) : 
                        result.content}
                      lawName={result.lawName}
                      onExplainRequest={(type) => handleExplainArticle(result, type)}
                      onAskQuestion={() => handleAskQuestion(result)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {showExplanation && selectedArticle && (
                <AIExplanation
                  explanation={explanation}
                  isLoading={loadingExplanation}
                  articleNumber={selectedArticle.article}
                  lawName={selectedArticle.lawName}
                  onClose={() => setShowExplanation(false)}
                />
              )}
              
              {showChat && selectedArticle && (
                <AIChat
                  articleNumber={selectedArticle.article}
                  articleContent={selectedArticle.content}
                  lawName={selectedArticle.lawName}
                  onClose={closeChat}
                />
              )}
              
              {showExplanation && !loadingExplanation && selectedArticle && explanation && (
                <div className="mt-4 flex justify-end">
                  <PDFExporter
                    articleNumber={selectedArticle.article}
                    articleContent={selectedArticle.content}
                    lawName={selectedArticle.lawName}
                    explanation={explanation}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
