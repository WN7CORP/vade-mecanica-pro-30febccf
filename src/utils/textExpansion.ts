
/**
 * Normalizes text by removing accents and converting to lowercase
 * @param text The text to normalize
 * @returns Normalized text without accents and in lowercase
 */
export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents/diacritics
    .toLowerCase()
    .trim();
};

/**
 * Formats text with markdown for better display
 * @param text Text that might contain markdown-like syntax (e.g., **bold**)
 * @returns Text with markdown formatting applied
 */
export const formatTextWithMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Format article references (e.g., "Art. 5" -> "**Art. 5**")
  const artRefFormatted = text.replace(/\b(Art\.?\s*\d+[.\-,;:]?)/gi, '**$1**');
  
  // Format paragraph references (e.g., "§ 1" -> "**§ 1**")
  const paragraphFormatted = artRefFormatted.replace(/\b(§\s*\d+[.\-,;:]?)/gi, '**$1**');
  
  // Format roman numerals often used in legal texts (e.g., "I -" -> "**I -**")
  const romanNumeralFormatted = paragraphFormatted.replace(/\b([IVX]+\s*[-–—])/g, '**$1**');
  
  return romanNumeralFormatted;
};

/**
 * Truncates text to a specified length and adds an ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export interface HighlightedPart {
  text: string;
  highlight: boolean;
}

/**
 * Highlights search terms in text
 * @param text Text to highlight terms in
 * @param searchTerm Term to highlight
 * @returns Array of text parts with highlight information
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string | HighlightedPart[] => {
  if (!searchTerm || !text) return text;
  
  try {
    const normalizedText = normalizeText(text);
    const normalizedTerm = normalizeText(searchTerm);
    
    if (!normalizedText.includes(normalizedTerm)) return text;
    
    // Use a properly escaped regular expression
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    // Return an array of parts with highlight information
    return parts.map((part, i) => ({
      text: part,
      highlight: regex.test(part)
    }));
  } catch (e) {
    console.error('Error highlighting text:', e);
    return text;
  }
};

/**
 * Expands abbreviated or shortened text for better text-to-speech narration
 * @param text Original text to expand
 * @returns Expanded text with abbreviations and references fully written out
 */
export const expandText = (text: string): string => {
  if (!text) return '';
  
  // Expand common legal abbreviations - versão minimalista
  const abbreviations: Record<string, string> = {
    'Art\\.': 'Artigo',
    '§': 'Parágrafo',
    'n\\.': 'número',
    'inc\\.': 'inciso',
    'al\\.': 'alínea',
    'c/c': 'combinado com',
    'p\\.': 'página',
    'p\\. ún\\.': 'parágrafo único',
    'CF': 'Constituição Federal',
    'CC': 'Código Civil',
    'CP': 'Código Penal',
    'CPC': 'Código de Processo Civil',
    'CPP': 'Código de Processo Penal',
    'CTN': 'Código Tributário Nacional',
    'CLT': 'Consolidação das Leis do Trabalho',
    'CDC': 'Código de Defesa do Consumidor',
    'STF': 'Supremo Tribunal Federal',
    'STJ': 'Superior Tribunal de Justiça',
    'TST': 'Tribunal Superior do Trabalho',
    'TJ': 'Tribunal de Justiça',
    'TRT': 'Tribunal Regional do Trabalho',
    'MP': 'Ministério Público',
    'OAB': 'Ordem dos Advogados do Brasil',
    'INSS': 'Instituto Nacional do Seguro Social',
    'HC': 'Habeas Corpus',
    'ADI': 'Ação Direta de Inconstitucionalidade',
    'ADPF': 'Arguição de Descumprimento de Preceito Fundamental',
    'RE': 'Recurso Extraordinário',
    'REsp': 'Recurso Especial',
    'AgRg': 'Agravo Regimental',
    'ED': 'Embargos de Declaração',
    'Min\\.': 'Ministro',
    'Rel\\.': 'Relator',
    'v\\.g\\.': 'verbi gratia (por exemplo)',
    'cf\\.': 'conforme',
    'op\\. cit\\.': 'obra citada'
  };

  let expandedText = text;
  
  // Substitui todas as abreviações encontradas
  Object.entries(abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    expandedText = expandedText.replace(regex, full);
  });
  
  return expandedText;
};

/**
 * Normaliza e padroniza termos jurídicos para melhorar a pesquisa
 * @param text Texto com termos jurídicos
 * @returns Texto com termos jurídicos padronizados
 */
export const normalizeLegalTerms = (text: string): string => {
  if (!text) return '';
  
  // Padronização de termos equivalentes
  const normalizedText = text
    // Artigos
    .replace(/\bartigo\s+(\d+)/gi, 'art. $1')
    .replace(/\bart\.\s*(\d+)/gi, 'art. $1')
    // Parágrafos
    .replace(/\bparágrafo\s+(\d+)/gi, '§ $1')
    .replace(/\bparagrafo\s+(\d+)/gi, '§ $1')
    .replace(/\bpar[áa]grafo\s+[úu]nico/gi, 'parágrafo único')
    // Incisos
    .replace(/\binciso\s+([ivxlcdm]+)/gi, 'inc. $1')
    // Alíneas
    .replace(/\bal[íi]nea\s+([a-z])/gi, 'alínea $1')
    // Leis
    .replace(/\blei\s+n[°º\.]?\s*([0-9\.]+)/gi, 'lei $1');
    
  return normalizedText;
};
