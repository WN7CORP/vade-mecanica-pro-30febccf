
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

/**
 * Highlights search terms in text
 * @param text Text to highlight terms in
 * @param searchTerm Term to highlight
 * @returns JSX with highlighted terms
 */
export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  try {
    const normalizedText = normalizeText(text);
    const normalizedTerm = normalizeText(searchTerm);
    
    if (!normalizedText.includes(normalizedTerm)) return text;
    
    // Use a properly escaped regular expression
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-primary/20">{part}</mark> : part
    );
  } catch (e) {
    console.error('Error highlighting text:', e);
    return text;
  }
};
