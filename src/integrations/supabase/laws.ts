
import { supabase } from "./client";

// Existing types and interfaces
export interface Article {
  id: number;
  numero: string;
  conteudo: string;
  exemplo?: string;
  "explicacao tecnica"?: string; 
  "explicacao formal"?: string;
  // For backward compatibility
  explicacao_tecnica?: string;
  explicacao_formal?: string;
  artigo?: string; // Some tables use 'artigo' instead of 'conteudo'
}

export interface LawOption {
  table: string;
  display: string;
}

// Function to fetch articles for a given law
export const fetchLawArticles = async (lawName: string): Promise<{ articles: Article[] }> => {
  try {
    const tableOption = LAW_OPTIONS.find((law) => law.display === lawName);
    const tableName = tableOption?.table || 'lei_geral_protecao_dados';
    
    // Use type assertion to tell TypeScript this is a valid table name
    let { data: articles, error } = await supabase
      .from(tableName as any)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Erro ao buscar artigos:", error);
      return { articles: [] };
    }

    // Cast the result to Article[]
    return { articles: (articles as unknown as Article[]) || [] };
  } catch (error) {
    console.error("Erro na requisição:", error);
    return { articles: [] };
  }
};

export const searchArticle = async (lawName: string, searchTerm: string): Promise<Article | null> => {
  try {
    const tableOption = LAW_OPTIONS.find((law) => law.display === lawName);
    const tableName = tableOption?.table || 'lei_geral_protecao_dados';

    let { data: articles, error } = await supabase
      .from(tableName as any)
      .select('*')
      .ilike('numero', `%${searchTerm}%`);

    if (error) {
      console.error("Erro ao buscar artigo:", error);
      return null;
    }

    // Cast the result to Article
    return articles && articles.length > 0 ? (articles[0] as unknown as Article) : null;
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
};

export const searchByTerm = async (lawName: string, searchTerm: string): Promise<Article[]> => {
  try {
    const tableOption = LAW_OPTIONS.find((law) => law.display === lawName);
    const tableName = tableOption?.table || 'lei_geral_protecao_dados';

    let { data: articles, error } = await supabase
      .from(tableName as any)
      .select('*')
      .ilike('conteudo', `%${searchTerm}%`);

    if (error) {
      console.error("Erro ao buscar artigos por termo:", error);
      return [];
    }

    // Cast the result to Article[]
    return (articles as unknown as Article[]) || [];
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
};

export const fetchAvailableLaws = async (): Promise<string[]> => {
  return LAW_OPTIONS.map(law => law.display);
};

export const LAW_OPTIONS: LawOption[] = [
  { table: 'lei_geral_protecao_dados', display: 'Lei Geral de Proteção de Dados' },
  { table: 'codigo_civil', display: 'Código Civil' },
  { table: 'codigo_processo_civil', display: 'Código de Processo Civil' },
  { table: 'constituicao_federal', display: 'Constituição Federal' },
  { table: 'codigo_penal', display: 'Código Penal' },
  { table: 'codigo_processo_penal', display: 'Código de Processo Penal' },
  { table: 'consolidacao_das_leis_do_trabalho', display: 'Consolidação das Leis do Trabalho' },
  { table: 'codigo_tributario_nacional', display: 'Código Tributário Nacional' },
  { table: 'codigo_de_defesa_do_consumidor', display: 'Código de Defesa do Consumidor' },
  { table: 'estatuto_da_crianca_e_do_adolescente', display: 'Estatuto da Criança e do Adolescente' },
  { table: 'novo_codigo_florestal', display: 'Novo Código Florestal' },
  { table: 'lei_de_execucao_penal', display: 'Lei de Execução Penal' },
  { table: 'lei_do_inquilinato', display: 'Lei do Inquilinato' },
  { table: 'lei_de_falencias_e_recuperacao_judicial', display: 'Lei de Falências e Recuperação Judicial' },
  { table: 'estatuto_do_idoso', display: 'Estatuto do Idoso' },
  { table: 'codigo_brasileiro_de_aeronautica', display: 'Código Brasileiro de Aeronáutica' },
  { table: 'codigo_eleitoral', display: 'Código Eleitoral' },
  { table: 'codigo_militar_penal', display: 'Código Militar Penal' },
  { table: 'lei_organica_da_assistencia_social', display: 'Lei Orgânica da Assistência Social' },
  { table: 'marco_civil_da_internet', display: 'Marco Civil da Internet' },
];
