import { BookOpen, Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { Document } from "../../../types/document/types";
import { DocumentCard } from "./document-card";

interface DocumentsListProps {
  documents: Document[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onOpenCreate: () => void;
}

export function DocumentsList({
  documents,
  totalCount,
  searchQuery,
  onSearchChange,
  isLoading,
  onDelete,
  onOpenCreate,
}: DocumentsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs">Загрузка базы знаний...</span>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">База знаний пуста</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
          Добавьте текстовые заметки, инструкции или регламенты. Модель Gemini сможет использовать их для ответов в чате.
        </p>
        <Button onClick={onOpenCreate} size="sm" className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          Добавить первый документ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Поисковая панель */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по заголовку или содержимому..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground self-center">
          Показано: {documents.length} из {totalCount}
        </span>
      </div>

      {/* Список карточек */}
      {documents.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 py-12 text-center text-xs text-muted-foreground">
          По запросу «<strong>{searchQuery}</strong>» документов не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
