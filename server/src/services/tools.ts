import { FunctionDeclaration, Type } from "@google/genai";
import { query } from "../db/index.js";
import { getEmbedding } from "./ai.js";

export const createDocumentTool: FunctionDeclaration = {
  name: "createDocument",
  description:
    "Создает новую заметку или документ в персональной базе знаний пользователя. Вызывай этот инструмент ТОЛЬКО когда пользователь явно просит сохранить, записать, запомнить или создать заметку/документ.",
  parameters: {
    type: Type.OBJECT,
    description: "Параметры для создания заметки",
    properties: {
      title: {
        type: Type.STRING,
        description: "Краткий, информативный заголовок заметки (например: 'Рецепт шарлотки', 'Настройки Nginx')",
      },
      content: {
        type: Type.STRING,
        description: "Полный текст и полезное содержание заметки, которое нужно сохранить",
      },
    },
    required: ["title", "content"],
  },
};

export async function executeCreateDocument(
	userId: string,
	args: {title?: string, content?: string}
) {
	const { title, content } = args

	if (!title || !content) {
		throw new Error("Не указан заголовок (title) или содержание (content)")
	}

	const textToEmbed = `${title}\n${content}`;
	const embedding = await getEmbedding(textToEmbed)

	const result = await query(
		`INSERT INTO documents (user_id, title, content, embedding)
     VALUES ($1, $2, $3, $4::vector)
     RETURNING id, title, content, created_at;`,
    [userId, title, content, JSON.stringify(embedding)]
	)

	return result.rows[0]
}