import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, FileText, Network, SlidersHorizontal, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { useGraphData } from "../hooks/document/useGraphData";
import type { GraphNode } from "@/api/types";
import { MemoryGraphCanvas } from "@/feature/memory-graph/ui/memory-graph-canvas";

export function GraphPage() {
  const navigate = useNavigate();
  const { nodes, links, threshold, setThreshold, isLoading, isFetching } = useGraphData(0.5);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <div className="relative flex h-screen w-full flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* 1. Верхняя панель навигации */}
      <header className="absolute top-0 left-0 right-0 z-20 flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="gap-2 text-xs font-medium cursor-pointer text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            В чат
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/documents")}
            className="gap-2 text-xs font-medium cursor-pointer text-zinc-400 hover:text-zinc-100"
          >
            <Database className="h-4 w-4" />
            Документы
          </Button>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Граф памяти (Knowledge Graph)</h1>
            </div>
          </div>
        </div>

        {/* Индикаторы */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1">
            Нод: <strong className="text-indigo-400">{nodes.length}</strong>
          </span>
          <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1">
            Связей: <strong className="text-indigo-400">{links.length}</strong>
          </span>
        </div>
      </header>

      {/* 2. Плавающая панель настройки порога сходства (Threshold Control) */}
      <div className="absolute top-18 left-4 z-20 flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3 backdrop-blur-md shadow-xl text-xs w-64">
        <div className="flex items-center justify-between font-medium text-zinc-300">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
            Порог сходства (pgvector)
          </span>
          <div className="flex items-center gap-1.5 font-mono text-indigo-400">
            {isFetching && (
              <span
                className="inline-block h-2 w-2 animate-ping rounded-full bg-indigo-400"
                title="Обновление связей..."
              />
            )}
            <span>{threshold.toFixed(2)}</span>
          </div>
        </div>

        <input
          type="range"
          min="0.3"
          max="0.8"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>0.30 (Все связи)</span>
          <span>0.80 (Точные)</span>
        </div>
      </div>

      {/* 3. Основной Canvas Pixi.js */}
      <main className="relative flex-1 w-full h-full pt-14">
        {isLoading && nodes.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <p className="text-xs text-zinc-400">Загрузка векторного графа...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-400">
            <Network className="h-10 w-10 text-zinc-600" />
            <p className="text-sm">В базе знаний пока нет заметок для построения графа.</p>
            <Button size="sm" onClick={() => navigate("/documents")}>
              Добавить заметки
            </Button>
          </div>
        ) : (
          <MemoryGraphCanvas
            nodes={nodes}
            links={links}
            onSelectNode={setSelectedNode}
          />
        )}
      </main>

      {/* 4. Инспектор заметки (Сайдбар при клике на ноду) */}
      {selectedNode && (
        <aside className="absolute right-4 top-18 bottom-4 z-20 flex w-80 flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Инспектор ноды</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-3">
            <h3 className="text-base font-bold text-zinc-100 leading-snug">{selectedNode.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {selectedNode.content}
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
            Создано: {new Date(selectedNode.created_at).toLocaleDateString()}
          </div>
        </aside>
      )}
    </div>
  );
}
