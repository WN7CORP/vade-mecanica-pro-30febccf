
interface CachedQuery {
  results: any;
  timestamp: number;
  expiresAt: number;
}

/**
 * Gerenciador de cache para consultas frequentes
 */
export class QueryCache {
  private cache: Map<string, CachedQuery> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos em ms
  private readonly MAX_CACHE_SIZE = 100;
  
  /**
   * Obtém um resultado do cache se disponível
   * @param key Chave de cache (normalmente a consulta)
   * @returns O resultado em cache ou undefined se não encontrado/expirado
   */
  get<T>(key: string): T | undefined {
    const cached = this.cache.get(key);
    
    if (!cached) return undefined;
    
    // Verificar se o cache expirou
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return cached.results as T;
  }
  
  /**
   * Armazena um resultado no cache
   * @param key Chave do cache
   * @param value Valor a ser armazenado
   * @param ttl Tempo de vida em milissegundos (padrão: 5 minutos)
   */
  set(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    // Limitar o tamanho do cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    
    const now = Date.now();
    this.cache.set(key, {
      results: value,
      timestamp: now,
      expiresAt: now + ttl
    });
  }
  
  /**
   * Remove entradas expiradas do cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Remove a entrada mais antiga do cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Retorna estatísticas sobre o cache
   */
  getStats(): { size: number, hitRate?: number } {
    return { 
      size: this.cache.size,
      // Adicionar outras métricas conforme necessário
    };
  }
}

// Instância global para uso em toda a aplicação
export const queryCache = new QueryCache();
