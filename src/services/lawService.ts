
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  numero: string;
  conteudo: string;
  exemplo?: string;
}

const validTables = [
  'codigo_civil',
  'codigo_penal',
  'codigo_processo_civil',
  'codigo_processo_penal',
  'constituicao_federal',
  'codigo_defesa_consumidor',
  'codigo_tributario',
  'codigo_comercial',
  'codigo_eleitoral',
  'codigo_transito',
  'codigo_florestal',
  'codigo_penal_militar',
  'codigo_processo_penal_militar'
];

function convertToTableName(lawName: string): string {
  const nameMap: Record<string, string> = {
    'constituição federal': 'constituicao_federal',
    'código civil': 'codigo_civil',
    'código penal': 'codigo_penal',
    'código de processo civil': 'codigo_processo_civil',
    'código de processo penal': 'codigo_processo_penal',
    'código de defesa do consumidor': 'codigo_defesa_consumidor',
    'código tributário nacional': 'codigo_tributario',
    'código comercial': 'codigo_comercial',
    'código eleitoral': 'codigo_eleitoral',
    'código de trânsito brasileiro': 'codigo_transito',
    'código florestal': 'codigo_florestal',
    'código penal militar': 'codigo_penal_militar',
    'código de processo penal militar': 'codigo_processo_penal_militar'
  };
  
  const normalized = lawName.toLowerCase().trim();
  return nameMap[normalized] || normalized;
}

function isValidTable(tableName: string): boolean {
  return validTables.includes(tableName);
}

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    // Using a type assertion to tell TypeScript this is a valid table name
    const { data, error } = await supabase
      .from(tableName as any)
      .select('numero, conteudo, exemplo')
      .order('numero');

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    if (!data) return [];
    
    // Explicitly cast the data to ensure type safety
    return data.map(item => ({
      numero: String(item.numero || ''),
      conteudo: String(item.conteudo || ''),
      exemplo: item.exemplo ? String(item.exemplo) : undefined
    }));
  } catch (error) {
    console.error('Error in fetchLawArticles:', error);
    throw new Error('Falha ao carregar artigos');
  }
};

export const searchArticle = async (
  lawName: string,
  articleNumber: string
): Promise<Article | null> => {
  try {
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return null;
    }
    
    const { data, error } = await supabase
      .from(tableName as any)
      .select('numero, conteudo, exemplo')
      .eq('numero', articleNumber)
      .maybeSingle();

    if (error) {
      console.error('Error searching article:', error);
      return null;
    }

    if (!data) return null;

    return {
      numero: String(data.numero || ''),
      conteudo: String(data.conteudo || ''),
      exemplo: data.exemplo ? String(data.exemplo) : undefined
    };
  } catch (error) {
    console.error('Error in searchArticle:', error);
    return null;
  }
};

export const searchByTerm = async (
  lawName: string,
  searchTerm: string
): Promise<Article[]> => {
  try {
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    const term = searchTerm.toLowerCase();

    const { data, error } = await supabase
      .from(tableName as any)
      .select('numero, conteudo, exemplo')
      .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    if (!data) return [];

    return data.map(item => ({
      numero: String(item.numero || ''),
      conteudo: String(item.conteudo || ''),
      exemplo: item.exemplo ? String(item.exemplo) : undefined
    }));
  } catch (error) {
    console.error('Error in searchByTerm:', error);
    return [];
  }
};

export const fetchAvailableLaws = async (): Promise<string[]> => {
  return [
    'Constituição Federal',
    'Código Civil',
    'Código Penal',
    'Código de Processo Civil',
    'Código de Processo Penal',
    'Código de Defesa do Consumidor',
    'Código Tributário Nacional',
    'Código Comercial',
    'Código Eleitoral',
    'Código de Trânsito Brasileiro',
    'Código Florestal',
    'Código Penal Militar',
    'Código de Processo Penal Militar'
  ];
};
