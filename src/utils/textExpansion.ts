// Dictionary types
type ExpansionDictionary = {
  [key: string]: string;
};

// Legal abbreviations dictionary
export const legalAbbreviations: ExpansionDictionary = {
  "Art.": "Artigo",
  "art.": "artigo",
  "§": "parágrafo",
  "§§": "parágrafos",
  "inc.": "inciso",
  "al.": "alínea",
  "c/c": "combinado com",
  "cf.": "conforme",
  "v.": "veja",
  "v.g.": "por exemplo",
  "e.g.": "por exemplo",
  "i.e.": "isto é",
  "nº": "número",
  "n.º": "número",
  "p.": "página",
  "et al.": "e outros",
  "obs.": "observação",
  "ex vi": "por força de",
  "idem": "o mesmo",
  "ibidem": "no mesmo lugar",
  "loc. cit.": "no lugar citado",
  "op. cit.": "na obra citada"
};

// Roman numerals dictionary
export const romanNumerals: ExpansionDictionary = {
  "I": "primeiro",
  "II": "segundo",
  "III": "terceiro",
  "IV": "quarto",
  "V": "quinto",
  "VI": "sexto",
  "VII": "sétimo",
  "VIII": "oitavo",
  "IX": "nono",
  "X": "décimo",
  "XI": "décimo primeiro",
  "XII": "décimo segundo",
  "XIII": "décimo terceiro",
  "XIV": "décimo quarto",
  "XV": "décimo quinto",
  "XVI": "décimo sexto",
  "XVII": "décimo sétimo",
  "XVIII": "décimo oitavo",
  "XIX": "décimo nono",
  "XX": "vigésimo",
  "XXI": "vigésimo primeiro",
  "XXII": "vigésimo segundo",
  "XXIII": "vigésimo terceiro",
  "XXIV": "vigésimo quarto",
  "XXV": "vigésimo quinto",
  "XXVI": "vigésimo sexto",
  "XXVII": "vigésimo sétimo",
  "XXVIII": "vigésimo oitavo",
  "XXIX": "vigésimo nono",
  "XXX": "trigésimo"
};

// Law codes dictionary
export const lawCodes: ExpansionDictionary = {
  "CF": "Constituição Federal",
  "CC": "Código Civil",
  "CPC": "Código de Processo Civil",
  "CP": "Código Penal",
  "CPP": "Código de Processo Penal",
  "CLT": "Consolidação das Leis do Trabalho",
  "CDC": "Código de Defesa do Consumidor",
  "CTN": "Código Tributário Nacional",
  "ECA": "Estatuto da Criança e do Adolescente",
  "LDB": "Lei de Diretrizes e Bases da Educação Nacional",
  "LRF": "Lei de Responsabilidade Fiscal",
  "STJ": "Superior Tribunal de Justiça",
  "STF": "Supremo Tribunal Federal",
  "TST": "Tribunal Superior do Trabalho",
  "TRT": "Tribunal Regional do Trabalho",
  "TJ": "Tribunal de Justiça"
};

export const expandText = (text: string): string => {
  let expandedText = text;
  
  // Helper function to escape special characters in regex
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Function to create a regex that matches whole words
  const createWordBoundaryRegex = (term: string) => {
    const escaped = escapeRegExp(term);
    return new RegExp(`\\b${escaped}\\b`, 'g');
  };
  
  // Helper function to capitalize first letter if needed
  const matchCase = (original: string, replacement: string) => {
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  };
  
  // Expand legal abbreviations
  Object.entries(legalAbbreviations).forEach(([abbr, full]) => {
    const regex = createWordBoundaryRegex(abbr);
    expandedText = expandedText.replace(regex, (match) => matchCase(match, full));
  });
  
  // Expand roman numerals (only when they appear as references)
  Object.entries(romanNumerals).forEach(([roman, full]) => {
    const regex = new RegExp(`\\b${roman}\\b(?!\\w)`, 'g');
    expandedText = expandedText.replace(regex, full);
  });
  
  // Expand law codes
  Object.entries(lawCodes).forEach(([code, full]) => {
    const regex = createWordBoundaryRegex(code);
    expandedText = expandedText.replace(regex, (match) => matchCase(match, full));
  });
  
  return expandedText;
};

export const formatTextWithMarkdown = (text: string): string => {
  let formattedText = text;
  
  // Format "Art. X" or "Art. X-Y." patterns with bold
  formattedText = formattedText.replace(
    /(Art\. \d+(?:-[A-Z])?\.)/g,
    '**$1**'
  );
  
  // Format "Parágrafo único" with bold
  formattedText = formattedText.replace(
    /(Parágrafo único)/g,
    '**$1**'
  );
  
  return formattedText;
};
