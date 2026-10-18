import { cn } from "cn";
import {
  AlertCircle,
  Bot,
  Check,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ChatWindowProps } from "../model/types";
import { useChatWindowViewModel } from "../view-model/useChatWindowViewModel";
import { MessageSources } from "./message-sources";

export function ChatWindow({ className }: ChatWindowProps) {
  const {
    inputValue,
    chatTitle,
    activeChat,
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
  } = useChatWindowViewModel();

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <main className={cn("flex flex-1 flex-col h-full min-w-0 bg-background", className)}>
      {/* Шапка чата */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0 bg-background/80 backdrop-blur-xs">
        <div className="flex items-center gap-2 max-w-md">
          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
          {isEditingTitle ? (
            <form onSubmit={saveTitle} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEditingTitle();
                }}
                className="rounded border border-primary/50 bg-background px-2 py-0.5 text-sm font-semibold outline-hidden text-foreground"
              />
              <button
                type="submit"
                className="rounded p-1 text-primary hover:bg-primary/10 cursor-pointer"
                title="Сохранить"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={cancelEditingTitle}
                className="rounded p-1 text-muted-foreground hover:bg-muted cursor-pointer"
                title="Отмена"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="group flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight truncate max-w-xs">
                {chatTitle}
              </h1>
              {activeChat && (
                <button
                  type="button"
                  onClick={startEditingTitle}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Изменить название"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {isStreaming && (
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Генерация...</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>RAG поиск включен</span>
          </div>
        </div>
      </header>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Загрузка сообщений...</span>
            </div>
          </div>
        ) : !hasMessages ? (
          /* Приветственный экран, если сообщений нет */
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Bot className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Чем я могу помочь?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Задайте любой вопрос. Модель автоматически выполнит векторный поиск по вашей базе знаний (pgvector) и сформирует точный ответ с указанием источников.
              </p>
            </div>
          </div>
        ) : (
          /* Список сообщений */
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-xs leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3 max-w-[85%]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1 shadow-2xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl rounded-tl-xs border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-xs leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <MessageSources sources={msg.sources} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Стримящееся сообщение ассистента */}
            {isStreaming && streamingMessage && (
              <div className="flex items-start gap-3 max-w-[85%] animate-fade-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1 shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="rounded-2xl rounded-tl-xs border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-xs leading-relaxed whitespace-pre-wrap">
                    {streamingMessage.content ? (
                      <>
                        {streamingMessage.content}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle rounded-full" />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Поиск по базе знаний и формирование ответа...</span>
                      </div>
                    )}
                  </div>
                  {streamingMessage.sources && streamingMessage.sources.length > 0 && (
                    <MessageSources sources={streamingMessage.sources} />
                  )}
                </div>
              </div>
            )}

            {/* Ошибка стриминга */}
            {streamError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Ошибка при ответе: {streamError}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Нижняя панель ввода сообщения */}
      <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm shrink-0">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center rounded-xl border border-border bg-card shadow-xs focus-within:ring-1 focus-within:ring-ring"
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Задайте вопрос по вашим документам..."
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-hidden placeholder:text-muted-foreground text-foreground"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                onClick={stopStreaming}
                className="mr-2 cursor-pointer"
                title="Остановить генерацию"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon-sm"
                className="mr-2 cursor-pointer"
                disabled={!inputValue.trim()}
                title="Отправить сообщение"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Gemini 2.0 Flash использует RAG (векторный поиск pgvector) для ответов по вашим источникам.
          </p>
        </div>
      </div>
    </main>
  );
}
