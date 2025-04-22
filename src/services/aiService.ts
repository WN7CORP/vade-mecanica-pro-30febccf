
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8";

// Inicializa a API do Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIExplanation {
  summary: string;
  detailed: string;
  examples: string[];
}

const generateGeminiExplanation = async (prompt: string) => {
  try {
    console.log("Enviando requisição para API do Gemini...");
    
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.status);
      const errorText = await response.text();
      console.error("Detalhes do erro:", errorText);
      return "Não foi possível processar a requisição na API Gemini.";
    }

    const data = await response.json();
    console.log("Resposta da API recebida:", JSON.stringify(data).substring(0, 200) + "...");
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error("Resposta da API do Gemini em formato inesperado:", data);
      return "Não foi possível processar a resposta da IA no momento.";
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Erro ao gerar explicação com Gemini:", error);
    return "Não foi possível gerar a explicação no momento.";
  }
}

export const generateArticleExplanation = async (
  articleNumber: string,
  articleContent: string,
  lawName: string,
  type: 'technical' | 'formal' = 'technical'
): Promise<AIExplanation> => {
  try {
    console.log(`Gerando explicação ${type} para artigo ${articleNumber} da lei ${lawName}`);
    
    const prompt = `
      ${type === 'technical' 
        ? 'Explique o seguinte artigo jurídico de forma técnica e detalhada, mantendo a linguagem formal e os termos técnicos apropriados. Estruture sua resposta em três partes: 1) Um resumo conciso, 2) Uma explicação detalhada, 3) Três exemplos práticos:'
        : 'Explique o seguinte artigo jurídico de forma clara e acessível, usando linguagem simples e exemplos práticos. Estruture sua resposta em três partes: 1) Um resumo conciso em linguagem simples, 2) Uma explicação detalhada usando termos cotidianos, 3) Três exemplos práticos do dia a dia:'}
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
    `;

    console.log("Enviando prompt para Gemini:", prompt.substring(0, 150) + "...");
    const response = await generateGeminiExplanation(prompt);
    console.log("Resposta bruta recebida do Gemini:", response.substring(0, 150) + "...");
    
    // Split the response into sections based on numerical markers or paragraphs
    const sections = response.split(/\n\n|\n(?=\d\.)|(?:Resumo:)|(?:Explicação detalhada:)|(?:Exemplos prático)/i);
    console.log(`Processando ${sections.length} seções da resposta`);
    
    // Filter out empty sections
    const filteredSections = sections.filter(section => section && section.trim().length > 0);
    console.log("Seções filtradas:", filteredSections.length);
    
    // Now we'll try to identify the summary, detailed explanation, and examples
    let summary = "";
    let detailed = "";
    let examples: string[] = [];
    
    // Try to extract the summary (should be the first meaningful section)
    if (filteredSections.length > 0) {
      summary = filteredSections[0].replace(/^.*?resumo:?\s*/i, "").trim();
      console.log("Resumo extraído:", summary.substring(0, 50) + "...");
    }
    
    // Try to extract the detailed explanation (should be the second meaningful section)
    if (filteredSections.length > 1) {
      detailed = filteredSections[1].replace(/^.*?explicação:?\s*/i, "").trim();
      console.log("Explicação detalhada extraída:", detailed.substring(0, 50) + "...");
    }
    
    // Try to extract examples (everything after that, or split by numbers)
    if (filteredSections.length > 2) {
      // Join all remaining sections and then split by numerical patterns
      const examplesText = filteredSections.slice(2).join("\n\n");
      const exampleMatches = examplesText.split(/\n(?=\d\.)|(?=\d\.)/);
      
      examples = exampleMatches
        .map(e => e.replace(/^\d\.\s*/, "").trim())
        .filter(e => e.length > 0);
      
      console.log(`${examples.length} exemplos extraídos`);
    }
    
    // Ensure we have at least something for each section
    if (!summary) summary = "Não foi possível extrair um resumo claro da explicação.";
    if (!detailed) detailed = "Não foi possível extrair uma explicação detalhada.";
    if (examples.length === 0) examples = ["Não foi possível extrair exemplos claros."];
    
    const result = {
      summary,
      detailed,
      examples
    };
    
    console.log("Explicação processada com sucesso");
    return result;
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
