
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: number;
  numero: string;
  conteudo: string;
  exemplo?: string;
  created_at: string;
}

export interface LawOption {
  display: string;
  table: string;
}

export const LAW_OPTIONS: LawOption[] = [
  { display: "Constituição Federal",         table: "constituicao_federal"      },
  { display: "Código Civil",                 table: "codigo_civil"              },
  { display: "Código Penal",                 table: "codigo_penal"              },
  { display: "Código de Processo Civil",     table: "codigo_processo_civil"     },
  { display: "Código de Processo Penal",     table: "codigo_processo_penal"     },
  { display: "Código de Defesa do Consumidor", table: "codigo_defesa_consumidor" },
  { display: "Código Tributário Nacional",   table: "codigo_tributario"         },
];

/** Retorna apenas os nomes para popular um dropdown/menu */
export const fetchAvailableLaws = (): string[] =>
  LAW_OPTIONS.map((opt) => opt.display);

/** Busca o nome da tabela a partir do texto exibido */
function getTableName(displayName: string): string | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table ?? null;
}

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  // Proper TypeScript typing for dynamic table querying
  const { data, error } = await supabase
    .from(tableName as any)
    .select("*")
    .order("numero", { ascending: true });

  if (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }
  
  // First convert to unknown, then to Article[] to fix TypeScript error
  return (data ? (data as unknown as Article[]) : []);
};

export const searchArticle = async (
  lawDisplayName: string,
  articleNumber: string
): Promise<Article | null> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    return null;
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select("*")
    .eq("numero", articleNumber)
    .single();

  if (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }
  
  // First convert to unknown, then to Article to fix TypeScript error
  return data as unknown as Article;
};

export const searchByTerm = async (
  lawDisplayName: string,
  searchTerm: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    return [];
  }

  const term = searchTerm.toLowerCase();
  const { data, error } = await supabase
    .from(tableName as any)
    .select("*")
    .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

  if (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }
  
  // First convert to unknown, then to Article[] to fix TypeScript error
  return (data ? (data as unknown as Article[]) : []);
};
