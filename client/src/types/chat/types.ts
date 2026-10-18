export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessageSource {
  id: string;
  title: string;
  content: string;
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: ChatMessageSource[];
  created_at: string;
}
