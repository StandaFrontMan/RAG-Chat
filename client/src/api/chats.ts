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
