import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  createChat as createChatApi,
  deleteChat as deleteChatApi,
  fetchChats,
  updateChatTitle as updateChatTitleApi,
} from "../../api/chats";
import type { Chat } from "../../types/chat/types";

export function useChats() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeChatId = searchParams.get("id");

  const {
    data: chats = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: ({ signal }) => fetchChats(signal),
    staleTime: 1000 * 60, // 1 минута кэша
  });

  function selectChat(id: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) {
        next.set("id", id);
      } else {
        next.delete("id");
      }
      return next;
    });
  }

  const createChatMutation = useMutation({
    mutationFn: (title?: string) => createChatApi(title || "Новый диалог"),
    onSuccess: (newChat) => {
      queryClient.setQueryData<Chat[]>(["chats"], (old) => {
        return old ? [newChat, ...old] : [newChat];
      });
      selectChat(newChat.id);
    },
  });

  const renameChatMutation = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      updateChatTitleApi(chatId, title),
    onSuccess: (updatedChat) => {
      queryClient.setQueryData<Chat[]>(["chats"], (old) => {
        return old?.map((c) => (c.id === updatedChat.id ? { ...c, ...updatedChat } : c)) || [];
      });
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId: string) => deleteChatApi(chatId),
    onSuccess: (_, deletedChatId) => {
      queryClient.setQueryData<Chat[]>(["chats"], (old) => {
        return old?.filter((c) => c.id !== deletedChatId) || [];
      });
      if (activeChatId === deletedChatId) {
        selectChat(null);
      }
    },
  });

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  return {
    chats,
    activeChatId,
    activeChat,
    selectChat,
    isLoading,
    isError,
    error: error?.message,
    createChat: (title?: string) => createChatMutation.mutateAsync(title),
    isCreatingChat: createChatMutation.isPending,
    createChatError: createChatMutation.error?.message,
    renameChat: (chatId: string, title: string) =>
      renameChatMutation.mutateAsync({ chatId, title }),
    isRenamingChat: renameChatMutation.isPending,
    deleteChat: (chatId: string) => deleteChatMutation.mutateAsync(chatId),
    isDeletingChat: deleteChatMutation.isPending,
    refetch,
  };
}
