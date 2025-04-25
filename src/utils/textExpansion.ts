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
  
  // Expand common legal abbreviations
  let expandedText = text
    .replace(/\bArt\./gi, 'Artigo')
    .replace(/\b§/g, 'Parágrafo')
    .replace(/\bn\./gi, 'número')
    .replace(/\binciso\./gi, 'inciso')
    .replace(/\balín\./gi, 'alínea')
    .replace(/\bc\/c\b/gi, 'combinado com')
    .replace(/\bc\./gi, 'com')
    .replace(/\bparágrafo único\b/gi, 'Parágrafo único')
    .replace(/\bCF\b/gi, 'Constituição Federal')
    .replace(/\bCLT\b/gi, 'Consolidação das Leis do Trabalho');
  
  return expandedText;
};
