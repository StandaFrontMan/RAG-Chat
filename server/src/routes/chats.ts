import { FastifyRequest } from "fastify";
import { FastifyReply } from "fastify";
import { FastifyInstance } from "fastify";
import { query } from "../db/index.js";
import { generateRAGStream, getEmbedding } from "../services/ai.js";

export async function chatsRoutes(app: FastifyInstance) {
	app.addHook('onRequest', app.authenticate);

	app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const resultUser = await query('SELECT id, email, created_at FROM users WHERE id = $1', [request.user.id]);
		const user = resultUser.rows[0];

		if (!user) {
			return reply.status(401).send({error: 'Unauthorized'})
		}

		const resultChats = await query('SELECT id, title, created_at FROM chats WHERE user_id = $1 ORDER BY created_at DESC', [user.id])
		const chats = resultChats.rows;

		return chats;
	})

	app.post('/',  async (request: FastifyRequest, reply: FastifyReply) => {
		const { title } = request.body as { title?: string }

		if (!title) {
			return reply.status(400).send({error: 'No title'})
		}

		const resultUser = await query('SELECT id, email, created_at FROM users WHERE id = $1', [request.user.id]);
		const user = resultUser.rows[0];

		if (!user) {
			return reply.status(401).send({error: 'Unauthorized'})
		}

		const result = await query('INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at, updated_at', [user.id, title]);
		const chat = result.rows[0];
		return chat;
	})

	app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
		const { id } = request.params as { id: string };
		const { title } = request.body as { title?: string };

		if (!title || !title.trim()) {
			return reply.status(400).send({ error: 'Title is required' });
		}

		const result = await query(
			'UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id, title, created_at, updated_at',
			[title.trim(), id, request.user.id]
		);

		if (result.rows.length === 0) {
			return reply.status(404).send({ error: 'Chat not found' });
		}

		return result.rows[0];
	})

	app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
		const { id } = request.params as { id: string };

		const result = await query(
			'DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING id',
			[id, request.user.id]
		);

		if (result.rows.length === 0) {
			return reply.status(404).send({ error: 'Chat not found' });
		}

		return { success: true, id };
	})

	app.get('/:id/messages', async (request: FastifyRequest, reply: FastifyReply) => {
		const {id} = request.params as {id?: string}

		if (!id) {
			return reply.status(400).send({error: 'No id'})
		}
		
		const resultUser = await query('SELECT id, email, created_at FROM users WHERE id = $1', [request.user.id]);
		const user = resultUser.rows[0];

		if (!user) {
			return reply.status(401).send({error: 'Unauthorized'})
		}

		const messagesResult = await query('SELECT id, role, content, sources, created_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [id])
		const messages = messagesResult.rows;

		return {messages}
	})

	app.post('/:id/message', async (request: FastifyRequest, reply: FastifyReply) => {
		const { id: chatId } = request.params as { id: string };
		const { message } = request.body as { message?: string };

		if (!message) {
			return reply.status(400).send({error: 'Message is required'})
		}

  	// 1. Сохраняем сообщение пользователя в SQL
		await query('INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)', [chatId, 'user', message])

		// 2. RAG: получаем эмбеддинг вопроса и ищем топ-3 релевантных документа
		const queryVector = await getEmbedding(message);
		const ragResult = await query('SELECT id, title, content, 1 - (embedding <=> $1::vector) AS similarity FROM documents WHERE user_id = $2 ORDER BY embedding <=> $1::vector LIMIT 3', [JSON.stringify(queryVector), request.user.id])

		// Фильтруем только достаточно похожие заметки (например, similarity > 0.5)
		const relevantDocs = ragResult.rows.filter(doc => doc.similarity > 0.5)

		// 3. Вызываем Gemini со стримингом
		const stream = await generateRAGStream(message, relevantDocs)

		// 4. Открываем SSE (Server-Sent Events) соединение
		reply.raw.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		})

		// Отправляем клиенту информацию об использованных источниках первым событием!
		reply.raw.write(`data: ${JSON.stringify({type: 'sources', sources: relevantDocs})}\n\n`)

		let fullAiResponse = '';

		// 5. Транслируем чанки в реальном времени
		for await (const chunk of stream) {
			const textChunk = chunk.text || '';
			fullAiResponse += textChunk;
			reply.raw.write(`data: ${JSON.stringify({type: 'chunk', text: textChunk})}\n\n`)
		}

		// 6. Сохраняем финальный ответ модели в SQL
		await query('INSERT INTO messages (chat_id, role, content, sources) VALUES ($1, $2, $3, $4)', [chatId, 'assistant', fullAiResponse, JSON.stringify(relevantDocs)])

		// Завершаем SSE стрим
		reply.raw.write(`data: ${JSON.stringify({type: 'done'})}\n\n`)
		reply.raw.end()
	})
}