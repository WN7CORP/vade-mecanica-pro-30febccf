
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface AIExplanation {
  summary: string;
  detailed: string;
  examples: string[];
}

export const generateArticleExplanation = async (
  articleNumber: string,
  articleContent: string,
  lawName: string,
  type: 'technical' | 'formal' = 'technical'
): Promise<AIExplanation> => {
  try {
    const prompt = `
      ${type === 'technical' 
        ? 'Explique o seguinte artigo jurídico de forma técnica e detalhada, mantendo a linguagem formal e os termos técnicos apropriados:'
        : 'Explique o seguinte artigo jurídico de forma clara e acessível, usando linguagem simples e exemplos práticos:'}
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
      
      Forneça:
      1. Um resumo conciso do artigo
      2. Uma explicação detalhada do significado e aplicação
      3. Três exemplos práticos da aplicação deste artigo
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Processamento simples da resposta (pode ser melhorado com regex mais precisas)
    const sections = response.split(/\n\n|\n(?=\d\.)/);
    
    const summary = sections.find(s => 
      s.toLowerCase().includes("resumo") || 
      sections.indexOf(s) === 0
    ) || "Resumo não disponível";
    
    const detailed = sections.find(s => 
      s.toLowerCase().includes("explicação") || 
      s.toLowerCase().includes("significado") || 
      sections.indexOf(s) === 1
    ) || "Explicação detalhada não disponível";
    
    const examplesSection = sections.find(s => 
      s.toLowerCase().includes("exemplo") || 
      sections.indexOf(s) === 2
    );
    
    const examples = examplesSection 
      ? examplesSection.split(/\n(?=\d\.)/).filter(e => e.trim())
      : ["Exemplos não disponíveis"];

    return {
      summary: summary.replace(/^.*?resumo:?\s*/i, "").trim(),
      detailed: detailed.replace(/^.*?explicação:?\s*/i, "").trim(),
      examples: examples.map(e => e.replace(/^\d\.\s*/, "").trim())
    };
  } catch (error) {
    console.error("Erro ao gerar explicação:", error);
    return {
      summary: "Não foi possível gerar um resumo no momento.",
      detailed: "Ocorreu um erro ao processar a explicação detalhada.",
      examples: ["Exemplos não disponíveis no momento."]
    };
  }
};

export const askAIQuestion = async (
  question: string,
  articleNumber: string,
  articleContent: string,
  lawName: string
): Promise<string> => {
  try {
    const prompt = `
      Como especialista jurídico, responda à seguinte dúvida sobre este artigo:
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
      
      Dúvida: ${question}
      
      Responda de forma clara, precisa e com base na legislação citada.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro ao processar pergunta:", error);
    return "Desculpe, não foi possível processar sua pergunta no momento. Por favor, tente novamente mais tarde.";
  }
};

export const generateArticleNotes = async (
  articleContent: string,
  lawName: string
): Promise<{title: string, summary: string}> => {
  try {
    const prompt = `
      Com base no seguinte artigo jurídico, gere um título descritivo conciso e um breve resumo:
      
      Lei: ${lawName}
      Artigo: ${articleContent}
      
      Retorne apenas:
      Título: [título descritivo]
      Resumo: [resumo conciso]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const titleMatch = response.match(/Título:\s*(.*?)(?:\n|$)/);
    const summaryMatch = response.match(/Resumo:\s*(.*?)(?:\n|$)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : "Título não disponível",
      summary: summaryMatch ? summaryMatch[1].trim() : "Resumo não disponível"
    };
  } catch (error) {
    console.error("Erro ao gerar notas:", error);
    return {
      title: "Título não disponível",
      summary: "Resumo não disponível"
    };
  }
};
