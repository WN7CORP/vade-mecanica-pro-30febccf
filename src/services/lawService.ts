
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: number;
  numero: string;
  conteudo: string;
  exemplo?: string;
  created_at: string;
}

const validTables = [
  'codigo_civil',
  'codigo_penal',
  'codigo_processo_civil',
  'codigo_processo_penal',
  'codigo_defesa_consumidor',
  'codigo_tributario',
  'Constituição Federal'
] as const;

type ValidTable = typeof validTables[number];

function convertToTableName(lawName: string): ValidTable {
  const nameMap: Record<string, ValidTable> = {
    'constituição federal': 'Constituição Federal',
    'código civil': 'codigo_civil',
    'código penal': 'codigo_penal',
    'código de processo civil': 'codigo_processo_civil',
    'código de processo penal': 'codigo_processo_penal',
    'código de defesa do consumidor': 'codigo_defesa_consumidor',
    'código tributário nacional': 'codigo_tributario'
  };
  
  const normalized = lawName.toLowerCase().trim();
  return nameMap[normalized] || 'codigo_civil'; // Default to codigo_civil if not found
}

function isValidTable(tableName: string): tableName is ValidTable {
  return validTables.includes(tableName as ValidTable);
}

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('numero');

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    return data as Article[];
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
      .select('*')
      .eq('numero', articleNumber)
      .single();

    if (error) {
      console.error('Error searching article:', error);
      return null;
    }

    return data as Article;
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
      .select('*')
      .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    return data as Article[];
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
    'Código Tributário Nacional'
  ];
};
