import { useState } from "react";
import { Clock, FileText, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import type { Document } from "../../../types/document/types";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => Promise<void>;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(document.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleDelete() {
    if (confirm(`Удалить заметку «${document.title}»?`)) {
      try {
        setIsDeleting(true);
        await onDelete(document.id);
      } finally {
        setIsDeleting(false);
      }
    }
  }

  return (
    <Card className="flex flex-col justify-between border-border bg-card/60 backdrop-blur-xs transition-shadow hover:shadow-md">
      <CardHeader className="space-y-1.5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground normal-case tracking-normal truncate">
              {document.title}
            </CardTitle>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Удалить заметку"
            className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <p className="line-clamp-4 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {document.content}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 pt-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-primary text-[10px] font-medium">
          <Sparkles className="h-3 w-3" />
          <span>768d vector</span>
        </div>
      </CardFooter>
    </Card>
  );
}
