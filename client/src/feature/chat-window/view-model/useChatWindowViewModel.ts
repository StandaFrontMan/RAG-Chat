import { useState } from "react";
import { useChats } from "../../../hooks/chat/useChats";

interface UseChatWindowViewModelParams {
  onSendMessage?: (text: string) => void;
  isLoading?: boolean;
}

export function useChatWindowViewModel({
  onSendMessage,
  isLoading,
}: UseChatWindowViewModelParams = {}) {
  const [inputValue, setInputValue] = useState("");
  const { activeChat, renameChat } = useChats();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const chatTitle = activeChat?.title || "Новый диалог";

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

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    onSendMessage?.(trimmed);
    setInputValue("");
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
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    startEditingTitle,
    cancelEditingTitle,
    saveTitle,
    handleChange,
    handleSubmit,
    handleKeyDown,
  };
}
