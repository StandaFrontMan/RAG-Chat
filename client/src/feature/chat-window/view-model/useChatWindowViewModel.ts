import { useState } from "react";

interface UseChatWindowViewModelParams {
  onSendMessage?: (text: string) => void;
  isLoading?: boolean;
}

export function useChatWindowViewModel({
  onSendMessage,
  isLoading,
}: UseChatWindowViewModelParams = {}) {
  const [inputValue, setInputValue] = useState("");

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
    handleChange,
    handleSubmit,
    handleKeyDown,
  };
}
