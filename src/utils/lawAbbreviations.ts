
export const LAW_ABBREVIATIONS: Record<string, string> = {
  "Código Civil": "CC",
  "Código Penal": "CP",
  "Código de Processo Civil": "CPC",
  "Código de Processo Penal": "CPP",
  "Código de Defesa do Consumidor": "CDC",
  "Código Tributário Nacional": "CTN",
  "Código de Trânsito Brasileiro": "CTB",
  "Código Comercial": "CCom",
  "Código Eleitoral": "CE",
  "Constituição Federal": "CF",
  "Consolidação das Leis do Trabalho": "CLT"
};

export const getLawAbbreviation = (lawName: string): string => {
  return LAW_ABBREVIATIONS[lawName] || lawName;
};
