import type { Chat, ChatMessage } from "../types/chat/types";

const JSON_HEADERS = new Headers({
  "Content-Type": "application/json",
});

export async function fetchChats(signal?: AbortSignal): Promise<Chat[]> {
  const res = await fetch("/api/chats", {
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch chats");
  }

  return res.json();
}

export async function createChat(title: string, signal?: AbortSignal): Promise<Chat> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    signal,
    body: JSON.stringify({ title }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create chat");
  }

  return data;
}

export async function updateChatTitle(
  chatId: string,
  title: string,
  signal?: AbortSignal
): Promise<Chat> {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: "include",
    signal,
    body: JSON.stringify({ title }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update chat title");
  }

  return data;
}

export async function deleteChat(
  chatId: string,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "DELETE",
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete chat");
  }
}

export async function fetchChatMessages(
  chatId: string,
  signal?: AbortSignal
): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chats/${chatId}/messages`, {
    credentials: "include",
    signal,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch messages");
  }

  return data.messages || [];
}

export async function sendChatMessageStream(
  chatId: string,
  message: string,
  callbacks: {
    onSources?: (sources: NonNullable<ChatMessage["sources"]>) => void;
    onChunk?: (chunk: string) => void;
    onDone?: () => void;
    onError?: (error: Error) => void;
  },
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`/api/chats/${chatId}/message`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    signal,
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to send message");
  }

  if (!res.body) {
    throw new Error("No response body received from server");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        const line = block.trim();
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.replace(/^data:\s*/, "");
        if (!jsonStr) continue;

        try {
          const payload = JSON.parse(jsonStr);
          if (payload.type === "sources") {
            callbacks.onSources?.(payload.sources);
          } else if (payload.type === "chunk") {
            callbacks.onChunk?.(payload.text);
          } else if (payload.type === "done") {
            callbacks.onDone?.();
          }
        } catch (e) {
          console.error("Failed to parse SSE payload", jsonStr, e);
        }
      }
    }
  } catch (err: any) {
    if (signal?.aborted) return;
    const error = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(error);
    throw error;
  }
}

