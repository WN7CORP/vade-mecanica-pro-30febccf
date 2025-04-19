
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
  'Constituição Federal',
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
    'constituição federal': 'Constituição Federal',
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
    
    // Handle the new table structure - using numero_artigo and texto_artigo as columns
    const { data, error } = await supabase
      .from(tableName)
      .select('numero_artigo, texto_artigo, exemplo_pratico')
      .order('numero_artigo');

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    return (data || []).map(item => ({
      numero: item.numero_artigo,
      conteudo: item.texto_artigo || '',
      exemplo: item.exemplo_pratico
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
      .from(tableName)
      .select('numero_artigo, texto_artigo, exemplo_pratico')
      .eq('numero_artigo', articleNumber)
      .single();

    if (error) {
      console.error('Error searching article:', error);
      return null;
    }

    return {
      numero: data.numero_artigo,
      conteudo: data.texto_artigo || '',
      exemplo: data.exemplo_pratico
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
      .from(tableName)
      .select('numero_artigo, texto_artigo, exemplo_pratico')
      .or(`numero_artigo.ilike.%${term}%,texto_artigo.ilike.%${term}%`);

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    return (data || []).map(item => ({
      numero: item.numero_artigo,
      conteudo: item.texto_artigo || '',
      exemplo: item.exemplo_pratico
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
