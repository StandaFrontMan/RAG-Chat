import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import dotenv from "dotenv";
import path from "path";
import { FastifyRequest } from "fastify";
import { FastifyReply } from "fastify";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });
dotenv.config(); // также подхватит локальный .env, если появится

const app = fastify({ logger: true });
await app.register(fastifyCookie)
await app.register(fastifyCors, {
	origin: 'http://localhost:5173',
	credentials: true
})

await app.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || 'secret-key-123',
	cookie: {
		cookieName: 'token',
		signed: false
	}
});

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		await request.jwtVerify();
	} catch (error) {
		reply.statusCode(401).send({ error: 'Unauthorized' })
	}
})

app.get('/health', async () => {
	return {satus: 'ok'}
})

const port = Number(process.env.PORT) || 3001;
await app.listen({ port, host: '0.0.0.0' });