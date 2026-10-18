import { cn } from "cn";
import { Bot, MessageSquare, Send, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ChatWindowProps } from "../model/types";
import { useChatWindowViewModel } from "../view-model/useChatWindowViewModel";

export function ChatWindow({
  className,
  chatTitle = "Новый диалог",
  onSendMessage,
  isLoading = false,
}: ChatWindowProps) {
  const { inputValue, handleChange, handleSubmit, handleKeyDown } = useChatWindowViewModel({
    onSendMessage,
    isLoading,
  });

  return (
    <main className={cn("flex flex-1 flex-col h-full min-w-0 bg-background", className)}>
      {/* Шапка чата */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold tracking-tight">{chatTitle}</h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>RAG включен</span>
        </div>
      </header>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Чем я могу помочь?</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Задайте любой вопрос. Модель автоматически выполнит поиск по векторной базе знаний и ответит с опорой на ваши документы.
          </p>
        </div>
      </div>

      {/* Нижняя панель ввода сообщения */}
      <div className="border-t border-border p-4 bg-background/50 backdrop-blur-sm shrink-0">
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
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-hidden placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon-sm"
              className="mr-2 cursor-pointer"
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Gemini 2.0 Flash использует RAG (векторный поиск pgvector) для ответов по вашим источникам.
          </p>
        </div>
      </div>
    </main>
  );
}
