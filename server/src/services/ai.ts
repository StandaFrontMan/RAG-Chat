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

export async function generateRAGStream(userQuery: string, contextDocuments: {title: string, content: string}[]) {
	// 1. Формируем контекст из найденных заметок
	const contextText = contextDocuments.length > 0
    ? contextDocuments.map((doc, i) => `[Документ ${i + 1}] "${doc.title}":\n${doc.content}`).join('\n\n')
    : 'В базе знаний нет релевантных заметок.';

  // 2. Системный промпт с правилами
  const systemInstruction = `Ты персональный AI-ассистент базы знаний пользователя.
		Твоя задача — ответить на вопрос пользователя, опираясь в первую очередь на предоставленный контекст из его заметок.
		Если в контексте есть нужный ответ, обязательно упомяни название документа или процитируй его.
		Если в контексте нет информации, ответь на основе своих общих знаний, но вежливо предупреди, что в базе знаний этого не найдено.
		КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ:
		${contextText}`;

	// 3. Запускаем стриминг
	const responseStream = await ai.models.generateContentStream({
		model: 'gemini-3.1-flash-lite',
    contents: [
      { role: 'user', parts: [{ text: `${systemInstruction}\n\nВОПРОС ПОЛЬЗОВАТЕЛЯ:\n${userQuery}` }] }
    ]
	})

	return responseStream;
}
