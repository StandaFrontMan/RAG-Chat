import { useAuth } from "../hooks/auth/useAuth";
import { Button } from "../components/ui/button";

export function ChatPage() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">RAG Chat</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Выход..." : "Выйти"}
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Страница Чата и Базы знаний</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Вы успешно авторизованы как <strong className="text-foreground">{user?.email}</strong>.
          </p>
        </div>
      </main>
    </div>
  );
}
