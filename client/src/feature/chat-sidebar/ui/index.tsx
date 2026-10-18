import { cn } from "cn";
import { Bot, Database, LogOut, MessageSquare, Plus, User as UserIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ChatSidebarProps } from "../model/types";
import { useChatSidebarViewModel } from "../view-model/useChatSidebarViewModel";

export function ChatSidebar({ className, onNewChat, onOpenKnowledgeBase }: ChatSidebarProps) {
  const { user, isLoggingOut, handleLogout } = useChatSidebarViewModel();

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-border bg-card/40 backdrop-blur-sm sm:w-80 shrink-0 select-none",
        className
      )}
    >
      {/* Шапка сайдбара */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">RAG Assistant</span>
            <span className="block text-[10px] text-muted-foreground">Gemini 2.0 + Vector DB</span>
          </div>
        </div>
      </div>

      {/* Кнопка создания нового чата */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 shadow-xs cursor-pointer"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Новый диалог
        </Button>
      </div>

      {/* Заголовок секции списка чатов */}
      <div className="px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          История диалогов
        </span>
      </div>

      {/* Контейнер списка чатов */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
          <MessageSquare className="h-8 w-8 stroke-1 text-muted-foreground/50 mb-2" />
          <p className="font-medium">Диалогов пока нет</p>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Нажмите «Новый диалог», чтобы начать
          </p>
        </div>
      </div>

      {/* Футер: База знаний и Профиль */}
      <div className="border-t border-border p-3 space-y-2 bg-card/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenKnowledgeBase}
          className="w-full justify-start gap-2 text-xs font-normal"
        >
          <Database className="h-4 w-4 text-muted-foreground" />
          База знаний (Документы)
        </Button>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <span className="truncate text-xs font-medium text-foreground">
              {user?.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Выйти из аккаунта"
            className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
