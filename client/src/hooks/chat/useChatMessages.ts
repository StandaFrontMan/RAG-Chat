import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchChatMessages, sendChatMessageStream } from "../../api/chats";
import type { ChatMessage, ChatMessageSource } from "../../types/chat/types";

interface UseChatMessagesParams {
  chatId: string | null;
}

export function useChatMessages({ chatId }: UseChatMessagesParams) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [streamingMessage, setStreamingMessage] = useState<{
    content: string;
    sources: ChatMessageSource[];
  } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isError,
    error,
    refetch,
  } = useQuery<ChatMessage[]>({
    queryKey: ["messages", chatId],
    queryFn: ({ signal }) => fetchChatMessages(chatId!, signal),
    enabled: !!chatId,
    staleTime: 1000 * 30,
  });

  async function sendMessage(text: string, targetChatId: string) {
    if (!text.trim() || isStreaming) return;
    setStreamError(null);
    setIsStreaming(true);
    setStreamingMessage({ content: "", sources: [] });

    // Оптимистично добавляем вопрос пользователя в ленту
    const optimisticUserMessage: ChatMessage = {
      id: "temp-user-" + Date.now(),
      chat_id: targetChatId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    queryClient.setQueryData<ChatMessage[]>(["messages", targetChatId], (old) => {
      return old ? [...old, optimisticUserMessage] : [optimisticUserMessage];
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendChatMessageStream(
        targetChatId,
        text,
        {
          onSources: (sources) => {
            setStreamingMessage((prev) => ({
              content: prev?.content || "",
              sources: sources || [],
            }));
          },
          onChunk: (chunk) => {
            setStreamingMessage((prev) => ({
              sources: prev?.sources || [],
              content: (prev?.content || "") + chunk,
            }));
          },
          onDone: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", targetChatId] });
            setIsStreaming(false);
            setStreamingMessage(null);
          },
          onError: (err) => {
            setStreamError(err.message);
            setIsStreaming(false);
            setStreamingMessage(null);
          },
        },
        controller.signal
      );
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setStreamError(err.message || "Failed to send message");
      }
      setIsStreaming(false);
      setStreamingMessage(null);
    }
  }

  function stopStreaming() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingMessage(null);
    }
  }

  return {
    messages,
    isLoadingMessages,
    isStreaming,
    streamingMessage,
    streamError,
    sendMessage,
    stopStreaming,
    refetch,
    isError,
    error: error?.message,
  };
}
