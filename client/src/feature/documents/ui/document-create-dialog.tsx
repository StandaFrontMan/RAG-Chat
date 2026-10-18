import { useState } from "react";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { CreateDocumentDto } from "../../../types/document/types";

interface DocumentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateDocumentDto) => Promise<unknown> | unknown;
}

export function DocumentCreateDialog({
  isOpen,
  onClose,
  onSubmit,
}: DocumentCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("Пожалуйста, заполните заголовок и текст документа");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ title: trimmedTitle, content: trimmedContent });
      setTitle("");
      setContent("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Не удалось сохранить документ");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Новый документ</h2>
            <p className="text-xs text-muted-foreground">
              Добавьте текст в базу знаний для RAG-поиска
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title" className="text-xs font-semibold">
              Заголовок документа
            </Label>
            <Input
              id="doc-title"
              type="text"
              placeholder="Например: Правила возврата товаров или Инструкция по деплою"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-content" className="text-xs font-semibold">
              Текст документа / Содержимое
            </Label>
            <textarea
              id="doc-content"
              rows={6}
              placeholder="Вставьте текст, правила, выдержки из документации..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              required
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-2xs outline-hidden focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>
              После сохранения документ будет векторизован моделью <strong>Gemini</strong> (вектор 768 измерений) и сохранён в pgvector.
            </span>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="cursor-pointer gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Векторизация...</span>
                </>
              ) : (
                <span>Сохранить в базу</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
