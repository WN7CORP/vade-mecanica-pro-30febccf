
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: number;
  numero: string;
  artigo: string;
  titulo?: string;
  explicacao_tecnica?: string;
  explicacao_formal?: string;
  exemplo1?: string;
  exemplo2?: string;
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
  { display: "Consolidação das Leis do Trabalho", table: "consolidacao_leis_trabalho" },
  { display: "Código de Trânsito Brasileiro", table: "codigo_transito"          }
];

function getTableName(displayName: string): string | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table ?? null;
}

async function logUserAction(
  actionType: 'search' | 'explain' | 'favorite' | 'note',
  lawName?: string,
  articleNumber?: string
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (userId) {
      const { error } = await supabase.from('user_statistics').insert({
        user_id: userId,
        action_type: actionType,
        law_name: lawName,
        article_number: articleNumber
      });

      if (error) {
        console.error('Error logging user action:', error);
      }
    } else {
      console.log('User not authenticated, skipping action logging');
    }
  } catch (err) {
    console.error('Failed to log user action:', err);
  }
}

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  await logUserAction('search', lawDisplayName);

  try {
    // We need to handle each table case explicitly since TypeScript requires literal string table names
    switch (tableName) {
      case "constituicao_federal": {
        const { data, error } = await supabase
          .from("constituicao_federal")
          .select("id, numero, artigo, \"explicacao tecnica\", \"explicacao formal\", exemplo1, exemplo2, created_at")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos da constituição:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        if (!data) return [];
        
        return data.map((row) => ({
          id: row.id,
          numero: row.numero,
          artigo: row.artigo,
          titulo: undefined,
          explicacao_tecnica: row["explicacao tecnica"],
          explicacao_formal: row["explicacao formal"],
          exemplo1: row.exemplo1,
          exemplo2: row.exemplo2,
          created_at: row.created_at,
        }));
      }
      case "codigo_civil": {
        const { data, error } = await supabase
          .from("codigo_civil")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      case "codigo_penal": {
        const { data, error } = await supabase
          .from("codigo_penal")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      case "codigo_processo_civil": {
        // This is where the error was occurring. Since TypeScript doesn't recognize this table,
        // we need to handle it in a type-safe way using 'as any' to safely interact with it
        const result = await supabase
          .from(tableName as any)
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (result.error) {
          console.error("Erro ao buscar artigos:", result.error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(result.data || []);
      }
      case "codigo_processo_penal": {
        const { data, error } = await supabase
          .from("codigo_processo_penal")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      case "codigo_defesa_consumidor": {
        const { data, error } = await supabase
          .from("codigo_defesa_consumidor")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      case "codigo_tributario": {
        const { data, error } = await supabase
          .from("codigo_tributario")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      case "consolidacao_leis_trabalho": {
        const { data, error } = await supabase
          .from("consolidacao_leis_trabalho")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      case "codigo_transito": {
        const { data, error } = await supabase
          .from("codigo_transito")
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
  
        if (error) {
          console.error("Erro ao buscar artigos:", error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(data || []);
      }
      default:
        // For any other tables that might not be explicitly typed in Supabase
        const result = await supabase
          .from(tableName as any)
          .select("id, numero, conteudo, created_at, exemplo")
          .order("numero", { ascending: true });
        
        if (result.error) {
          console.error("Erro ao buscar artigos:", result.error);
          throw new Error("Falha ao carregar artigos");
        }
        
        return mapStandardLawData(result.data || []);
    }
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }
};

// Helper function to map standard law data to our Article interface
function mapStandardLawData(data: any[]): Article[] {
  return data.map(row => ({
    id: row.id,
    numero: row.numero || "",
    artigo: row.conteudo || "",
    titulo: undefined,
    explicacao_tecnica: undefined,
    explicacao_formal: undefined,
    exemplo1: row.exemplo || undefined,
    exemplo2: undefined,
    created_at: row.created_at
  }));
}

export const searchArticle = async (
  lawDisplayName: string,
  articleNumber: string
): Promise<Article | null> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    return null;
  }

  await logUserAction('search', lawDisplayName, articleNumber);

  try {
    switch (tableName) {
      case "constituicao_federal": {
        const { data, error } = await supabase
          .from("constituicao_federal")
          .select("id, numero, artigo, \"explicacao tecnica\", \"explicacao formal\", exemplo1, exemplo2, created_at")
          .eq("numero", articleNumber)
          .maybeSingle();
        
        if (error) {
          console.error("Erro ao buscar artigo:", error);
          return null;
        }
        
        if (!data) return null;
  
        return {
          id: data.id,
          numero: data.numero,
          artigo: data.artigo,
          titulo: undefined,
          explicacao_tecnica: data["explicacao tecnica"],
          explicacao_formal: data["explicacao formal"],
          exemplo1: data.exemplo1,
          exemplo2: data.exemplo2,
          created_at: data.created_at
        };
      }
      case "codigo_civil": {
        const { data, error } = await supabase
          .from("codigo_civil")
          .select("id, numero, conteudo, created_at, exemplo")
          .eq("numero", articleNumber)
          .maybeSingle();
        
        if (error || !data) {
          console.error("Erro ao buscar artigo:", error);
          return null;
        }
        
        return mapStandardLawData([data])[0];
      }
      // Handle other cases similarly for each table
      default: {
        // Generic case for all other tables
        // Using type assertion to tell TypeScript we know what we're doing
        const result = await supabase
          .from(tableName as any)
          .select("id, numero, conteudo, created_at, exemplo")
          .eq("numero", articleNumber)
          .maybeSingle();
        
        if (result.error || !result.data) {
          console.error("Erro ao buscar artigo:", result.error);
          return null;
        }
        
        return mapStandardLawData([result.data])[0];
      }
    }
  } catch (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }
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

  await logUserAction('search', lawDisplayName);

  try {
    const term = searchTerm.toLowerCase();
    
    switch (tableName) {
      case "constituicao_federal": {
        const { data, error } = await supabase
          .from("constituicao_federal")
          .select("id, numero, artigo, \"explicacao tecnica\", \"explicacao formal\", exemplo1, exemplo2, created_at")
          .or(`numero.ilike.%${term}%,artigo.ilike.%${term}%`);
        
        if (error) {
          console.error("Erro na busca por termo:", error);
          return [];
        }
        
        return (data || []).map(item => ({
          id: item.id,
          numero: item.numero,
          artigo: item.artigo,
          titulo: undefined,
          explicacao_tecnica: item["explicacao tecnica"],
          explicacao_formal: item["explicacao formal"],
          exemplo1: item.exemplo1,
          exemplo2: item.exemplo2,
          created_at: item.created_at
        }));
      }
      default: {
        // Generic case for all other tables
        // Using type assertion to tell TypeScript we know what we're doing
        const result = await supabase
          .from(tableName as any)
          .select("id, numero, conteudo, created_at, exemplo")
          .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);
        
        if (result.error) {
          console.error("Erro na busca por termo:", result.error);
          return [];
        }
        
        return mapStandardLawData(result.data || []);
      }
    }
  } catch (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }
};

export const fetchAvailableLaws = (): string[] =>
  LAW_OPTIONS.map((opt) => opt.display);
