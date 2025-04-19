
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

// Defining the allowed table names as a type to match Supabase's type system
export type LawTableName = 
  | "constituicao_federal"
  | "codigo_civil"
  | "codigo_penal"
  | "codigo_processo_civil"
  | "codigo_processo_penal"
  | "codigo_defesa_consumidor"
  | "codigo_tributario";

// Atualizando para incluir apenas as leis que existem no banco de dados
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
function getTableName(displayName: string): LawTableName | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table as LawTableName ?? null;
}

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  console.log(`Buscando artigos da tabela: ${tableName}`);
  
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("numero", { ascending: true });

  if (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }
  
  if (!data) {
    return [];
  }

  return data as Article[];
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
    .from(tableName)
    .select("*")
    .eq("numero", articleNumber)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }
  
  return data as Article | null;
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
    .from(tableName)
    .select("*")
    .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

  if (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }
  
  if (!data) {
    return [];
  }

  return data as Article[];
};

