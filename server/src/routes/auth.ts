import bcrypt from "bcryptjs";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { query } from "../db/index.js";

export async function authRoutes(app: FastifyInstance) {
	app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
		const {email, password} = request.body as {email?: string, password?: string}

		if (!email || !password || password.length < 6) {
			return reply.status(400).send({error: 'No email or password too short'})
		}

		const passwordHash = await bcrypt.hash(password, 10)

		try {
			const result = await query(
				'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
				[email.toLowerCase(), passwordHash]
			);
			const user = result.rows[0];

			const token = app.jwt.sign({ id: user.id, email: user.email });

			reply.setCookie('token', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax'
			});

			return {user, token}
		} catch (error: any) {
			if (error.code === '23505') {
				return reply.status(409).send({ error: 'User with such email already exists' });
			}
			throw error;
		}
	})

	app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
		const {email, password} = request.body as {email?: string, password: string}
		
		if (!email || !password) {
			return reply.status(400).send({error: 'No email or password'})
		}

		const result = await query(
			'SELECT id, email, password_hash FROM users WHERE email = $1',
			[email.toLowerCase()]
		);
		const user = result.rows[0];

		if (!user || !(await bcrypt.compare(password, user.password_hash))) {
			return reply.status(401).send({error: 'Invalid credentials'})
		}

		const token = app.jwt.sign({ id: user.id, email: user.email })

		reply.setCookie('token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax'
		})
		return {user: {id: user.id, email: user.email}, token}
	})

	app.get('/me', {onRequest: [app.authenticate]}, async (request: FastifyRequest, reply: FastifyReply) => {
		const result = await query('SELECT id, email, created_at FROM users WHERE id = $1', [request.user.id]);
		const user = result.rows[0];

		if (result.rows.length === 0) {
			return reply.status(404).send({ error: 'User not found' });
		}

		return user;
	})

	app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
		reply.clearCookie('token', { path: '/' });
		return { success: true };
	});
}