
import { supabase } from "@/integrations/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LawFlashcard {
  id?: string;
  law_name: string;
  article_number: string;
  article_content: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const generateFlashcardsForArticle = async (
  lawName: string, 
  articleNumber: string, 
  articleContent: string
): Promise<LawFlashcard[]> => {
  // Check if flashcards already exist
  const { data: existingFlashcards, error: fetchError } = await supabase
    .from('law_flashcards')
    .select('*')
    .eq('law_name', lawName)
    .eq('article_number', articleNumber);

  if (existingFlashcards && existingFlashcards.length > 0) {
    return existingFlashcards as LawFlashcard[];
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(
    Deno.env.get('GOOGLE_API_KEY') ?? 
    'AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0'
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Prompt for generating flashcards
  const prompt = `
    Generate 3 unique flashcards for the following legal article. 
    Each flashcard should have a clear question and a comprehensive answer.
    Format: 
    Question: [Concise, thought-provoking question about the article]
    Answer: [Detailed, clear explanation of the answer]
    Difficulty: [easy/medium/hard]

    Law: ${lawName}
    Article ${articleNumber}: ${articleContent}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the generated flashcards
    const flashcardMatches = text.matchAll(/Question:(.*?)Answer:(.*?)Difficulty:(.*?)(?=Question:|$)/gs);
    const flashcards: LawFlashcard[] = [];

    for (const match of flashcardMatches) {
      const question = match[1].trim();
      const answer = match[2].trim();
      const difficulty = match[3].trim().toLowerCase() as LawFlashcard['difficulty'];

      const flashcard: LawFlashcard = {
        law_name: lawName,
        article_number: articleNumber,
        article_content: articleContent,
        question,
        answer,
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium'
      };

      // Insert each flashcard into the database
      const { data, error } = await supabase
        .from('law_flashcards')
        .insert(flashcard)
        .select();

      if (data) flashcards.push(data[0] as LawFlashcard);
    }

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [];
  }
};
