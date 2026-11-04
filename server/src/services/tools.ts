import { FunctionDeclaration, Type } from "@google/genai";
import { query } from "../db/index.js";
import { getEmbedding } from "./ai.js";

// 1. Создание заметки (Tool Declaration)
export const createDocumentTool: FunctionDeclaration = {
  name: "createDocument",
  description:
    "Создает новую заметку или документ в персональной базе знаний пользователя. Вызывай этот инструмент ТОЛЬКО когда пользователь явно просит сохранить, записать, запомнить или создать новую заметку/документ.",
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

// 2. Обновление заметки (Tool Declaration)
export const updateDocumentTool: FunctionDeclaration = {
  name: "updateDocument",
  description:
    "Обновляет, дополняет или изменяет существующую заметку или документ в персональной базе знаний пользователя. Вызывай этот инструмент, когда пользователь просит изменить, дополнить, переписать или обновить информацию в уже существующей заметке.",
  parameters: {
    type: Type.OBJECT,
    description: "Параметры для обновления существующей заметки",
    properties: {
      id: {
        type: Type.STRING,
        description: "ID документа (UUID), если он известен из контекста найденных заметок",
      },
      title: {
        type: Type.STRING,
        description: "Название заметки для поиска или новый заголовок, если его нужно поменять",
      },
      content: {
        type: Type.STRING,
        description: "Полное обновленное содержание заметки с учетом всех изменений и дополнений",
      },
    },
    required: ["content"],
  },
};

// 3. Удаление заметки (Tool Declaration)
export const deleteDocumentTool: FunctionDeclaration = {
  name: "deleteDocument",
  description:
    "Удаляет заметку или документ из персональной базы знаний пользователя. Вызывай этот инструмент ТОЛЬКО когда пользователь явно просит удалить, стереть или убрать заметку/документ.",
  parameters: {
    type: Type.OBJECT,
    description: "Параметры для удаления заметки",
    properties: {
      id: {
        type: Type.STRING,
        description: "ID документа (UUID), если он известен из контекста найденных заметок",
      },
      title: {
        type: Type.STRING,
        description: "Название заметки, которую требуется удалить",
      },
    },
  },
};

// 4. Исполнитель создания заметки
export async function executeCreateDocument(
  userId: string,
  args: { title?: string; content?: string }
) {
  const { title, content } = args;

  if (!title || !content) {
    throw new Error("Не указан заголовок (title) или содержание (content)");
  }

  const textToEmbed = `${title}\n${content}`;
  const embedding = await getEmbedding(textToEmbed);

  const result = await query(
    `INSERT INTO documents (user_id, title, content, embedding)
     VALUES ($1, $2, $3, $4::vector)
     RETURNING id, title, content, created_at, updated_at;`,
    [userId, title, content, JSON.stringify(embedding)]
  );

  return result.rows[0];
}

// 5. Исполнитель обновления заметки
export async function executeUpdateDocument(
  userId: string,
  args: { id?: string; title?: string; content?: string }
) {
  let { id, title, content } = args;

  if (!content) {
    throw new Error("Не указано обновленное содержание заметки");
  }

  // Если id не передан напрямую, пробуем найти заметку по совпадению в названии
  if (!id && title) {
    const findRes = await query(
      `SELECT id, title FROM documents 
       WHERE user_id = $1 AND title ILIKE $2 
       ORDER BY updated_at DESC LIMIT 1`,
      [userId, `%${title.trim()}%`]
    );
    if (findRes.rows.length > 0) {
      id = findRes.rows[0].id;
    }
  }

  // Если id всё ещё нет, берем самую недавно обновленную заметку пользователя
  if (!id) {
    const recentRes = await query(
      `SELECT id, title FROM documents WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );
    if (recentRes.rows.length > 0) {
      id = recentRes.rows[0].id;
    } else {
      throw new Error("В базе знаний пока нет заметок для обновления");
    }
  }

  // Получаем текущие данные заметки
  const currentDocRes = await query(
    `SELECT id, title FROM documents WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (currentDocRes.rows.length === 0) {
    throw new Error(`Документ с id ${id} не найден`);
  }

  const finalTitle = title || currentDocRes.rows[0].title;

  // Пересчитываем векторный эмбеддинг для обновленного контента
  const textToEmbed = `${finalTitle}\n${content}`;
  const embedding = await getEmbedding(textToEmbed);

  // Обновляем запись в PostgreSQL
  const updateRes = await query(
    `UPDATE documents 
     SET title = $1, content = $2, embedding = $3::vector, updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING id, title, content, created_at, updated_at;`,
    [finalTitle, content, JSON.stringify(embedding), id, userId]
  );

  return updateRes.rows[0];
}

// 6. Исполнитель удаления заметки
export async function executeDeleteDocument(
  userId: string,
  args: { id?: string; title?: string }
) {
  let { id, title } = args;

  // Если передан только title, находим id
  if (!id && title) {
    const findRes = await query(
      `SELECT id, title FROM documents 
       WHERE user_id = $1 AND title ILIKE $2 
       ORDER BY updated_at DESC LIMIT 1`,
      [userId, `%${title.trim()}%`]
    );
    if (findRes.rows.length > 0) {
      id = findRes.rows[0].id;
      title = findRes.rows[0].title;
    }
  }

  if (!id) {
    throw new Error("Не удалось определить заметку для удаления. Укажите название точнее.");
  }

  const deleteRes = await query(
    `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id, title;`,
    [id, userId]
  );

  if (deleteRes.rows.length === 0) {
    throw new Error("Заметка не найдена или уже была удалена ранее");
  }

  return {
    id: deleteRes.rows[0].id,
    title: deleteRes.rows[0].title,
    deleted: true,
  };
}
