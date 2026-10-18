import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Database, LogOut, Plus, User as UserIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/auth/useAuth";

export function DocumentsPage() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Шапка страницы */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6 shrink-0 bg-background/80 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="gap-2 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            В чат
          </Button>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">База знаний (RAG)</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{user?.email}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="text-xs cursor-pointer gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Выйти</span>
          </Button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Ваши заметки и документы</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Все добавленные материалы автоматически векторизуются моделью Gemini и служат источниками для ответов в чате.
            </p>
          </div>

          <Button size="sm" className="gap-2 cursor-pointer shrink-0">
            <Plus className="h-4 w-4" />
            Добавить документ
          </Button>
        </div>

        {/* Заглушка списка заметок */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <BookOpen className="h-6 w-6 stroke-1" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Документов пока нет</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            Добавьте текстовые заметки, инструкции или регламенты, чтобы нейросеть могла отвечать на ваши вопросы на их основе.
          </p>
        </div>
      </main>
    </div>
  );
}
