
import { Article } from "@/services/lawService";

// Interface para resultado de pesquisa com pontuação de relevância
export interface SearchResult {
  article: Article;
  relevance: number;
  matches: string[];
}

// Interface para o índice de pesquisa
interface SearchIndex {
  [term: string]: {
    articleIds: string[];
    positions: {[articleId: string]: number[]};
  };
}

/**
 * Classe para indexação e pesquisa de texto completo
 */
export class FullTextSearcher {
  private index: SearchIndex = {};
  private articles: Map<string, Article> = new Map();
  private stopWords: Set<string> = new Set([
    'a', 'o', 'e', 'é', 'de', 'do', 'da', 'em', 'no', 'na', 'para', 'por', 'com', 'sem',
    'que', 'se', 'ao', 'aos', 'as', 'à', 'às', 'um', 'uma', 'uns', 'umas'
  ]);
  
  /**
   * Adiciona artigos ao índice de pesquisa
   */
  indexArticles(articles: Article[]): void {
    articles.forEach(article => {
      if (!article.id) return;
      
      this.articles.set(article.id, article);
      
      const content = typeof article.conteudo === 'string' 
        ? article.conteudo 
        : JSON.stringify(article.conteudo);
      
      // Tokenizar e indexar o conteúdo
      const tokens = this.tokenize(content);
      tokens.forEach((token, position) => {
        if (!this.index[token]) {
          this.index[token] = { articleIds: [], positions: {} };
        }
        
        if (!this.index[token].articleIds.includes(article.id)) {
          this.index[token].articleIds.push(article.id);
        }
        
        if (!this.index[token].positions[article.id]) {
          this.index[token].positions[article.id] = [];
        }
        
        this.index[token].positions[article.id].push(position);
      });
    });
    
    console.log(`Indexados ${articles.length} artigos com ${Object.keys(this.index).length} termos`);
  }
  
  /**
   * Realiza pesquisa no índice
   */
  search(query: string, limit: number = 20): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const scoreMap: { [articleId: string]: number } = {};
    const matchesMap: { [articleId: string]: Set<string> } = {};
    
    // Calcular pontuação para cada artigo baseado nos tokens da consulta
    queryTokens.forEach(token => {
      if (this.index[token]) {
        this.index[token].articleIds.forEach(articleId => {
          // Pontuação base pela presença do termo
          scoreMap[articleId] = (scoreMap[articleId] || 0) + 1;
          
          // Pontuação adicional pela frequência do termo no artigo
          const frequency = this.index[token].positions[articleId].length;
          scoreMap[articleId] += Math.min(frequency / 5, 2);  // Limitar o bônus
          
          // Registrar matches para destacar posteriormente
          if (!matchesMap[articleId]) {
            matchesMap[articleId] = new Set<string>();
          }
          matchesMap[articleId].add(token);
        });
      }
    });
    
    // Converter o mapa de pontuações em um array de resultados
    const results: SearchResult[] = Object.entries(scoreMap)
      .map(([articleId, score]) => {
        const article = this.articles.get(articleId);
        if (!article) return null;
        
        return {
          article,
          relevance: score,
          matches: Array.from(matchesMap[articleId] || [])
        };
      })
      .filter((result): result is SearchResult => result !== null)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
      
    return results;
  }
  
  /**
   * Divide o texto em tokens para indexação
   */
  private tokenize(text: string): string[] {
    if (!text) return [];
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Remover acentos
      .replace(/[^\w\s]/g, ' ')          // Remover pontuação
      .split(/\s+/)                      // Dividir por espaços
      .filter(token => 
        token.length > 2 &&             // Ignorar tokens muito curtos
        !this.stopWords.has(token)      // Ignorar stop words
      );
  }
  
  /**
   * Destaca os termos encontrados no texto
   */
  highlightMatches(text: string, matches: string[]): { text: string, isHighlight: boolean }[] {
    if (!matches.length || !text) {
      return [{ text, isHighlight: false }];
    }
    
    // Criar regex para todos os termos
    const pattern = matches.map(term => 
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map(part => ({
      text: part,
      isHighlight: matches.some(match => 
        part.toLowerCase() === match.toLowerCase()
      )
    }));
  }
  
  /**
   * Limpa o índice para economizar memória
   */
  clearIndex(): void {
    this.index = {};
    this.articles.clear();
    console.log("Índice de pesquisa limpo");
  }

  /**
   * Retorna estatísticas sobre o índice
   */
  getStatistics(): { totalArticles: number, totalTerms: number } {
    return {
      totalArticles: this.articles.size,
      totalTerms: Object.keys(this.index).length
    };
  }
}

// Instância singleton do indexador
export const globalSearchIndexer = new FullTextSearcher();
