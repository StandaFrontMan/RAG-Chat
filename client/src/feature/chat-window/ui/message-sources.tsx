import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import type { ChatMessageSource } from "../../../types/chat/types";

interface MessageSourcesProps {
  sources?: ChatMessageSource[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-border/70 bg-muted/30 p-2.5 text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>Использованные источники ({sources.length})</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 pt-2 border-t border-border/50">
          {sources.map((source, index) => {
            const similarityPercent = source.similarity
              ? Math.round(source.similarity * 100)
              : null;

            return (
              <div
                key={source.id || index}
                className="rounded border border-border/50 bg-background/80 p-2 space-y-1"
              >
                <div className="flex items-center justify-between font-medium gap-2">
                  <span className="truncate text-foreground font-semibold">
                    {source.title}
                  </span>
                  {similarityPercent !== null && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary shrink-0">
                      {similarityPercent}% сходство
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-[11px] text-muted-foreground leading-relaxed">
                  {source.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
