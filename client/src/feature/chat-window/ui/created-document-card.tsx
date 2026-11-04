import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Network, Pencil, Sparkles, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CreatedDocumentCardProps {
  document: {
    id?: string;
    title: string;
    content?: string;
  };
  variant?: "created" | "updated" | "deleted";
}

export function CreatedDocumentCard({ document, variant = "created" }: CreatedDocumentCardProps) {
  const navigate = useNavigate();
  const isUpdated = variant === "updated";
  const isDeleted = variant === "deleted";

  const borderBg = isDeleted
    ? "border-rose-500/30 bg-rose-950/20"
    : isUpdated
    ? "border-amber-500/30 bg-amber-950/20"
    : "border-indigo-500/30 bg-indigo-950/20";

  const iconWrap = isDeleted
    ? "bg-rose-500/20 text-rose-400"
    : isUpdated
    ? "bg-amber-500/20 text-amber-400"
    : "bg-indigo-500/20 text-indigo-400";

  const labelColor = isDeleted ? "text-rose-300" : isUpdated ? "text-amber-300" : "text-indigo-300";

  const label = isDeleted ? "Заметка удалена" : isUpdated ? "Заметка обновлена" : "Создана новая заметка";

  const Icon = isDeleted ? Trash2 : isUpdated ? Pencil : Sparkles;

  return (
    <div
      className={`mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 shadow-xs backdrop-blur-xs transition-colors ${borderBg}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${labelColor}`}>
            <span>{label}</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="truncate text-xs font-medium text-zinc-200 mt-0.5">
            {document.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {!isDeleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/graph")}
            className={`gap-1.5 text-xs cursor-pointer h-7 px-2.5 ${
              isUpdated
                ? "text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
                : "text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            В граф
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/documents")}
          className="gap-1 text-xs text-zinc-300 hover:text-zinc-100 border-zinc-800 bg-zinc-900/50 cursor-pointer h-7 px-2.5"
        >
          <FileText className="h-3.5 w-3.5 text-zinc-400" />
          К заметкам
          <ArrowRight className="h-3 w-3 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
