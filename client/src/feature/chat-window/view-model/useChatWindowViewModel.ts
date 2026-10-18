import { useEffect, useRef, useState } from "react";
import { useChats } from "../../../hooks/chat/useChats";
import { useChatMessages } from "../../../hooks/chat/useChatMessages";

export function useChatWindowViewModel() {
  const [inputValue, setInputValue] = useState("");
  const { activeChat, activeChatId, createChat, renameChat } = useChats();
  const {
    messages,
    isLoadingMessages,
    isStreaming,
    streamingMessage,
    streamError,
    sendMessage,
    stopStreaming,
  } = useChatMessages({ chatId: activeChatId });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatTitle = activeChat?.title || "Новый диалог";

  // Автоскролл к низу переписки при обновлении сообщений или стриминге
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage?.content]);

  function startEditingTitle() {
    if (!activeChat) return;
    setIsEditingTitle(true);
    setEditedTitle(activeChat.title);
  }

  function cancelEditingTitle() {
    setIsEditingTitle(false);
    setEditedTitle("");
  }

  async function saveTitle(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!activeChat) return;
    const trimmed = editedTitle.trim();
    if (!trimmed || trimmed === activeChat.title) {
      cancelEditingTitle();
      return;
    }
    try {
      await renameChat(activeChat.id, trimmed);
    } finally {
      setIsEditingTitle(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;

    setInputValue("");

    try {
      if (activeChatId) {
        await sendMessage(trimmed, activeChatId);
      } else {
        // Если чат ещё не выбран, создаём его на основе первых слов вопроса
        const chatSnippet = trimmed.length > 30 ? trimmed.slice(0, 30) + "..." : trimmed;
        const newChat = await createChat(chatSnippet);
        if (newChat?.id) {
          await sendMessage(trimmed, newChat.id);
        }
      }
    } catch {
      // Ошибки перехватываются внутри useChatMessages
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return {
    inputValue,
    chatTitle,
    activeChat,
    activeChatId,
    messages,
    isLoadingMessages,
    isStreaming,
    streamingMessage,
    streamError,
    messagesEndRef,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    startEditingTitle,
    cancelEditingTitle,
    saveTitle,
    handleChange,
    handleSubmit,
    handleKeyDown,
    stopStreaming,
  };
}
