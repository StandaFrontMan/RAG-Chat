import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001', 
    contents: text,
    config: {
      outputDimensionality: 768,  
    },
  });

  const values = response.embeddings?.[0]?.values || response.embedding?.values;

  if (!values) {
    throw new Error('Failed to generate embedding from Gemini');
  }
  return values;
}
