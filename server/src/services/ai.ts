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


/**
 * Context Awareness Gate (CAG)
 * Определяет, требуется ли обращение к базе знаний для данного вопроса.
 */
export async function shouldRetrieveContext(query: string): Promise<boolean> {
	const trimmed = query.trim().toLowerCase();

	// 1. Быстрый фильтр на базовую вежливость и короткие фразы (0ms latency)
	const smallTalkRegex = /^(привет|здравствуй|добрый (день|вечер|утро)|хай|ку|пока|до свидания|спасибо|благодарю|отлично|понятно|ок|ладно|ясно|hi|hello|hey|thanks|thank you)[\s!.,?]*$/i;
	if (smallTalkRegex.test(trimmed)) {
		return false
	}

	// 2. AI-классификатор через Gemini Flash
	try {
		const prompt = `Ты классификатор запросов в RAG-системе.
			Определи, требуется ли поиск по персональным документам и базе знаний для ответа на вопрос пользователя, или это простое общение, благодарность, вопрос о твоей роли или общий вопрос, не связанный с документами.
			Правила:
			- Ответь "YES", если вопрос касается фактов, инструкций, правил, данных, документов или чего-то конкретного, что может храниться в заметках.
			- Ответь "NO", если это приветствие, благодарность, шутка, поддержание диалога ("как дела", "кто ты", "расскажи анекдот") или отвлечённая фраза.
			Ответь ТОЛЬКО одним словом: YES или NO.
			Вопрос: "${query}"`;

		const response = await ai.models.generateContent({
			model: 'gemini-2.0-flash-lite',
			contents: prompt
		})

		const answer = response.text?.trim().toUpperCase();

		return answer?.includes('YES') ?? true
	} catch (error) {
		console.warn('CAG classifier error, falling back to true:', error)
		return true;
	}
}