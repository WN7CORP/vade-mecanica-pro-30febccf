import { supabase } from "@/integrations/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";

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

  if (fetchError) {
    console.error('Error checking for existing flashcards:', fetchError);
    throw new Error('Failed to check for existing flashcards');
  }

  if (existingFlashcards && existingFlashcards.length > 0) {
    console.log('Using existing flashcards');
    return existingFlashcards as LawFlashcard[];
  }

  console.log('Generating new flashcards...');
  
  // Initialize Gemini AI with API key
  const apiKey = process.env.GOOGLE_API_KEY || 
    'AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0';
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use the correct model name "gemini-pro"
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    console.log('Received response from Gemini:', text.substring(0, 100) + '...');

    // Parse the generated flashcards
    const flashcardMatches = text.matchAll(/Question:(.*?)Answer:(.*?)Difficulty:(.*?)(?=Question:|$)/gs);
    const flashcards: LawFlashcard[] = [];

    for (const match of Array.from(flashcardMatches)) {
      const question = match[1]?.trim() || '';
      const answer = match[2]?.trim() || '';
      const difficulty = match[3]?.trim().toLowerCase() as LawFlashcard['difficulty'];
      
      if (!question || !answer) {
        console.warn('Invalid flashcard format from API response');
        continue;
      }

      const flashcard: LawFlashcard = {
        law_name: lawName,
        article_number: articleNumber,
        article_content: articleContent,
        question,
        answer,
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium'
      };

      console.log('Inserting flashcard:', flashcard.question.substring(0, 30) + '...');
      
      // Insert each flashcard into the database
      const { data, error } = await supabase
        .from('law_flashcards')
        .insert(flashcard)
        .select();

      if (error) {
        console.error('Error inserting flashcard:', error);
      } else if (data) {
        console.log('Flashcard inserted successfully');
        flashcards.push(data[0] as LawFlashcard);
      }
    }

    if (flashcards.length === 0) {
      console.warn('No flashcards were successfully generated and saved.');
      throw new Error('Failed to generate valid flashcards');
    }

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    toast({
      title: "Erro ao gerar flashcards",
      description: "Não foi possível criar flashcards para este artigo.",
      variant: "destructive"
    });
    throw error;
  }
};
