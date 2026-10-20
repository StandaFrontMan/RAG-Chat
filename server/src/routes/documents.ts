import { FastifyReply } from "fastify";
import { FastifyRequest } from "fastify";
import { FastifyInstance } from "fastify";
import { query } from "../db/index.js";
import { getEmbedding } from "../services/ai.js";

export async function documentsRoutes(app: FastifyInstance) {
	app.addHook('onRequest', app.authenticate);

	app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const result = await query('SELECT id, title, content, created_at, updated_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [request.user.id]);

		return result.rows;
	})

	app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const {title, content} = request.body as {title?: string, content?: string}
		
		if (!title || !content) {
			return reply.status(400).send({error: 'No title or content'})
		}

		const textToEmbed = `${title}\n${content}`;
		const embedding = await getEmbedding(textToEmbed);

		const result = await query('INSERT INTO documents (user_id, title, content, embedding) VALUES ($1, $2, $3, $4::vector) RETURNING id, title, content, created_at;', [request.user.id, title, content, JSON.stringify(embedding)]);
		const document = result.rows[0];

		return reply.status(201).send(document);
	})

	app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
		const {id} = request.params as {id?: string}

		if (!id) {
			return reply.status(400).send({error: 'No id'})
		}

		const result = await query('DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id', [id, request.user.id])
		if (result.rows.length === 0) {
			return reply.status(404).send({error: 'Document not found'})
		}

		return {success: true}
	})

	app.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
 	const { query: searchQuery } = request.query as { query?: string };

		if (!searchQuery) {
			return reply.status(400).send({error: 'No query'})
		}

		const queryVector = await getEmbedding(searchQuery)
		const limit = 5

		const result = await query('SELECT id, title, content, created_at, updated_at, 1 - (embedding <=> $1::vector) AS similarity FROM documents WHERE user_id = $2 ORDER BY embedding <=> $1::vector LIMIT $3',[JSON.stringify(queryVector), request.user.id, limit])

		return result.rows
	})

	app.get('/graph', async (request: FastifyRequest, reply: FastifyReply) => {
		const { threshold = '0.5' } = request.query as {threshold?: string}
		const simThreshold = parseFloat(threshold) || 0.5

		// 1. Получаем все документы пользователя (ноды графа)
		const nodesResult = await query('SELECT id, title, content, created_at, updated_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [request.user.id]);

		// 2. Ищем семантические связи между парами документов через pgvector
		const linksResult = await query(
			`SELECT 
				d1.id AS source,
				d2.id AS target,
				(ROUND((1 - (d1.embedding <=> d2.embedding))::numeric, 4))::float AS similarity
			FROM documents d1
			JOIN documents d2 
				ON d1.user_id = d2.user_id 
			   AND d1.id < d2.id
			WHERE d1.user_id = $1
			  AND (1 - (d1.embedding <=> d2.embedding)) >= $2
			ORDER BY similarity DESC`,
			[request.user.id, simThreshold]
		);

		return {
			nodes: nodesResult.rows,
			links: linksResult.rows
		}
	})
}