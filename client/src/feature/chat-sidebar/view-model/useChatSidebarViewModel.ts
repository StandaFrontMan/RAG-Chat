import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/auth/useAuth";
import { useChats } from "../../../hooks/chat/useChats";
import type { Chat } from "../../../types/chat/types";

export function useChatSidebarViewModel() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();
  const {
    chats,
    activeChatId,
    selectChat,
    createChat,
    isCreatingChat,
    isLoading: isLoadingChats,
    renameChat,
    deleteChat,
  } = useChats();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  function handleLogout() {
    logout();
  }

  async function handleNewChat() {
    try {
      await createChat();
    } catch {
      // Handled by react-query error state
    }
  }

  function startRenaming(chat: Chat, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  }

  function cancelRenaming(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEditingChatId(null);
    setEditingTitle("");
  }

  async function saveRenaming(chatId: string, e?: React.FormEvent | React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      cancelRenaming();
      return;
    }

    try {
      await renameChat(chatId, trimmed);
    } finally {
      setEditingChatId(null);
      setEditingTitle("");
    }
  }

  async function handleDeleteChat(chatId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      await deleteChat(chatId);
    } catch {
      // Handled by react-query
    }
  }

  return {
    user,
    isLoggingOut,
    handleLogout,
    chats,
    activeChatId,
    selectChat,
    handleNewChat,
    isCreatingChat,
    isLoadingChats,
    editingChatId,
    editingTitle,
    setEditingTitle,
    startRenaming,
    cancelRenaming,
    saveRenaming,
    handleDeleteChat,
    navigateToDocuments: () => navigate("/documents"),
  };
}
