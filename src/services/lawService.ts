
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
  'constituicao_federal'
];

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    // Convert law name to table name format
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .select('numero, conteudo, exemplo')
      .order('numero');

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    return data || [];
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
      .select('numero, conteudo, exemplo')
      .eq('numero', articleNumber)
      .single();

    if (error) {
      console.error('Error searching article:', error);
      return null;
    }

    return data;
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
      .select('numero, conteudo, exemplo')
      .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    return data || [];
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
    'Código de Processo Penal'
  ];
};

// Helper function to convert law name to valid table name
function convertToTableName(lawName: string): string {
  const nameMap: Record<string, string> = {
    'constituição federal': 'constituicao_federal',
    'código civil': 'codigo_civil',
    'código penal': 'codigo_penal',
    'código de processo civil': 'codigo_processo_civil',
    'código de processo penal': 'codigo_processo_penal'
  };
  
  const normalized = lawName.toLowerCase().trim();
  return nameMap[normalized] || normalized.replace(/ /g, '_');
}

// Helper function to check if table name is valid
function isValidTable(tableName: string): boolean {
  return validTables.includes(tableName);
}
