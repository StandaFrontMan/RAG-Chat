import { cn } from "cn";
import {
  Bot,
  Check,
  Database,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ChatSidebarProps } from "../model/types";
import { useChatSidebarViewModel } from "../view-model/useChatSidebarViewModel";

export function ChatSidebar({ className, onOpenKnowledgeBase }: ChatSidebarProps) {
  const {
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
  } = useChatSidebarViewModel();

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
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="w-full justify-start gap-2 shadow-xs cursor-pointer"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {isCreatingChat ? "Создание..." : "Новый диалог"}
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
        {isLoadingChats ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded-lg bg-muted/60"
              />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
            <MessageSquare className="h-8 w-8 stroke-1 text-muted-foreground/50 mb-2" />
            <p className="font-medium">Диалогов пока нет</p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Нажмите «Новый диалог», чтобы начать
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = chat.id === editingChatId;

            if (isEditing) {
              return (
                <div
                  key={chat.id}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/50 bg-background px-2 py-1 shadow-2xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRenaming(chat.id, e);
                      if (e.key === "Escape") cancelRenaming();
                    }}
                    className="flex-1 bg-transparent text-xs outline-hidden text-foreground"
                    placeholder="Название диалога..."
                  />
                  <button
                    type="button"
                    onClick={(e) => saveRenaming(chat.id, e)}
                    className="rounded p-1 text-primary hover:bg-primary/10 cursor-pointer"
                    title="Сохранить"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelRenaming}
                    className="rounded p-1 text-muted-foreground hover:bg-muted cursor-pointer"
                    title="Отмена"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={cn(
                  "group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                  isActive
                    ? "bg-secondary font-medium text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{chat.title}</span>
                </div>

                {/* Кнопки действий при наведении */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => startRenaming(chat, e)}
                    className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
                    title="Переименовать"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Футер: База знаний и Профиль */}
      <div className="border-t border-border p-3 space-y-2 bg-card/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenKnowledgeBase}
          className="w-full justify-start gap-2 text-xs font-normal cursor-pointer"
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
