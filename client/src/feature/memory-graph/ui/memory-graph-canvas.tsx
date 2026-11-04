import { useEffect, useRef } from "react";
import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { Viewport } from "pixi-viewport";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { GraphNode, GraphLink } from "@/api/types";

export interface SimNode extends SimulationNodeDatum, GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  similarity: number;
}

interface MemoryGraphCanvasProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onSelectNode?: (node: GraphNode) => void;
}

export function MemoryGraphCanvas({
  nodes: rawNodes,
  links: rawLinks,
  onSelectNode,
}: MemoryGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Ссылки на долгоживущие сущности холста
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const linksGraphicsRef = useRef<Graphics | null>(null);
  const nodesContainerRef = useRef<Container | null>(null);

  // Хранилище DisplayObject нод и кэш физических координат
  const nodeDisplayMapRef = useRef<Map<string, Container>>(new Map());
  const nodeSimMapRef = useRef<Map<string, SimNode>>(new Map());
  const onSelectNodeRef = useRef(onSelectNode);
  onSelectNodeRef.current = onSelectNode;

  // Флаг готовности Pixi приложения
  const isInitializedRef = useRef(false);

  // 1. Инициализация Pixi.js, Viewport и D3 Simulation (ЕДИНОЖДЫ при монтировании)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDestroyed = false;

    async function initCanvas() {
      if (!container) return;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      // 1. Инициализируем Pixi v8
      const pixiApp = new Application();
      await pixiApp.init({
        width,
        height,
        background: 0x09090b,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (isDestroyed) {
        pixiApp.destroy(true, { children: true });
        return;
      }

      appRef.current = pixiApp;
      container.appendChild(pixiApp.canvas);

      // 2. Настраиваем Viewport камеры (зум, панорамирование)
      const viewport = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldWidth: width * 3,
        worldHeight: height * 3,
        events: pixiApp.renderer.events,
      });

      pixiApp.stage.addChild(viewport);
      viewport
        .drag({ pressDrag: true })
        .pinch()
        .wheel({ smooth: 5 })
        .decelerate()
        .clampZoom({ minScale: 0.25, maxScale: 3 });

      viewport.moveCenter(width / 2, height / 2);
      viewportRef.current = viewport;

      // 3. Слои: связи внизу, ноды сверху
      const linksGraphics = new Graphics();
      const nodesContainer = new Container();

      viewport.addChild(linksGraphics);
      viewport.addChild(nodesContainer);

      linksGraphicsRef.current = linksGraphics;
      nodesContainerRef.current = nodesContainer;

      // 4. Физическая симуляция D3 с выверенным балансом сил
      const simulation = forceSimulation<SimNode>([])
        // Отталкивание: предотвращает слипание нод
        .force("charge", forceManyBody<SimNode>().strength(-350).distanceMax(700))
        // Мягкая гравитация к центру (предотвращает разлет изолированных нод)
        .force("x", forceX<SimNode>(width / 2).strength(0.04))
        .force("y", forceY<SimNode>(height / 2).strength(0.04))
        // Жесткая коллизия с несколькими итерациями: ноды никогда не пересекаются
        .force("collision", forceCollide<SimNode>().radius(48).strength(0.9).iterations(2))
        // Связи на основе семантического сходства pgvector
        .force(
          "link",
          forceLink<SimNode, SimLink>([])
            .id((d) => d.id)
            .distance((l) => 130 + (1 - l.similarity) * 90)
            .strength((l) => Math.min(0.4, Math.max(0.1, l.similarity * 0.35)))
        );

      simulationRef.current = simulation;

      // 5. Game Loop симуляции (отрисовка связей и позиций нод)
      simulation.on("tick", () => {
        // Отрисовка линий связей
        linksGraphics.clear();
        const linkForce = simulation.force("link") as any;
        const currentLinks: SimLink[] = linkForce?.links() || [];

        currentLinks.forEach((link) => {
          const s = link.source as SimNode;
          const t = link.target as SimNode;

          if (s && t && s.x != null && s.y != null && t.x != null && t.y != null) {
            const similarity = link.similarity ?? 0.5;
            const alpha = Math.min(0.85, Math.max(0.15, similarity));
            const lineWidth = Math.max(1, similarity * 2.2);

            linksGraphics
              .moveTo(s.x, s.y)
              .lineTo(t.x, t.y)
              .stroke({ width: lineWidth, color: 0x818cf8, alpha });
          }
        });

        // Позиционирование нод
        nodeSimMapRef.current.forEach((node) => {
          const display = nodeDisplayMapRef.current.get(node.id);
          if (display && node.x != null && node.y != null) {
            display.position.set(node.x, node.y);
          }
        });
      });

      // 6. Обработка ресайза контейнера
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: newW, height: newH } = entry.contentRect;
          if (newW > 0 && newH > 0 && appRef.current && viewportRef.current) {
            appRef.current.renderer.resize(newW, newH);
            viewportRef.current.resize(newW, newH, newW * 3, newH * 3);
            simulation.force("x", forceX<SimNode>(newW / 2).strength(0.04));
            simulation.force("y", forceY<SimNode>(newH / 2).strength(0.04));
          }
        }
      });
      resizeObserver.observe(container);

      isInitializedRef.current = true;

      // Первичная синхронизация переданных данных
      syncData(rawNodes, rawLinks);

      return () => {
        resizeObserver.disconnect();
      };
    }

    const cleanupInit = initCanvas();

    return () => {
      isDestroyed = true;
      isInitializedRef.current = false;

      // Останавливаем физическую симуляцию
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }

      // Уничтожаем Pixi приложение и холст
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }

      nodeDisplayMapRef.current.clear();
      nodeSimMapRef.current.clear();

      if (container) {
        container.innerHTML = "";
      }

      cleanupInit.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, []); // Только при монтировании компонента!

  // Синхронизация нод и связей при изменении props
  function syncData(nodesData: GraphNode[], linksData: GraphLink[]) {
    const simulation = simulationRef.current;
    const nodesContainer = nodesContainerRef.current;
    const viewport = viewportRef.current;
    const nodeDisplayMap = nodeDisplayMapRef.current;
    const nodeSimMap = nodeSimMapRef.current;

    if (!simulation || !nodesContainer || !viewport) return;

    const width = viewport.screenWidth || 800;
    const height = viewport.screenHeight || 600;

    const nextIds = new Set(nodesData.map((n) => n.id));

    // 1. Удаляем удаленные ноды
    for (const [id, display] of nodeDisplayMap.entries()) {
      if (!nextIds.has(id)) {
        nodesContainer.removeChild(display);
        display.destroy({ children: true });
        nodeDisplayMap.delete(id);
        nodeSimMap.delete(id);
      }
    }

    // 2. Создаем или обновляем ноды, сохраняя их координаты
    const currentSimNodes: SimNode[] = [];

    nodesData.forEach((rawNode) => {
      let simNode = nodeSimMap.get(rawNode.id);

      if (!simNode) {
        // Новая нода: спавним с мягким смещением от центра
        simNode = {
          ...rawNode,
          x: width / 2 + (Math.random() - 0.5) * 160,
          y: height / 2 + (Math.random() - 0.5) * 160,
        };
        nodeSimMap.set(rawNode.id, simNode);
      } else {
        // Существующая нода: обновляем текстовые данные
        simNode.title = rawNode.title;
        simNode.content = rawNode.content;
        simNode.created_at = rawNode.created_at;
      }

      currentSimNodes.push(simNode);

      // Если Pixi контейнер для ноды еще не создан
      if (!nodeDisplayMap.has(rawNode.id)) {
        const nodeDisplay = createNodeDisplay(simNode, viewport, simulation);
        nodesContainer.addChild(nodeDisplay);
        nodeDisplayMap.set(rawNode.id, nodeDisplay);
      }
    });

    // 3. Подготавливаем чистые связи (source и target должны быть id строк для d3)
    const cleanLinks: SimLink[] = linksData.map((l) => ({
      source: typeof l.source === "object" ? (l.source as any).id : l.source,
      target: typeof l.target === "object" ? (l.target as any).id : l.target,
      similarity: l.similarity,
    }));

    // 4. Обновляем D3 симуляцию
    simulation.nodes(currentSimNodes);

    const linkForce = simulation.force("link") as any;
    if (linkForce) {
      linkForce.links(cleanLinks);
    }

    // Мягкий импульс физики для адаптации к новым связям
    simulation.alpha(0.3).restart();
  }

  // Фабрика визуального представления ноды
  function createNodeDisplay(
    node: SimNode,
    viewport: Viewport,
    simulation: Simulation<SimNode, SimLink>
  ) {
    const nodeGroup = new Container();
    nodeGroup.eventMode = "static";
    nodeGroup.cursor = "pointer";

    // Аура
    const aura = new Graphics();
    aura.circle(0, 0, 18).fill({ color: 0x6366f1, alpha: 0.15 });

    // Ядро ноды
    const core = new Graphics();
    core.circle(0, 0, 10).fill({ color: 0x6366f1 }).stroke({ width: 2, color: 0xa5b4fc });

    // Подпись заголовка
    const textStyle = new TextStyle({
      fontSize: 11,
      fill: "#e4e4e7",
      fontFamily: "Inter, system-ui, sans-serif",
      align: "center",
    });

    const titleText = new Text({
      text: node.title.length > 20 ? node.title.slice(0, 20) + "…" : node.title,
      style: textStyle,
    });
    titleText.anchor.set(0.5, 0);
    titleText.position.set(0, 14);

    nodeGroup.addChild(aura, core, titleText);

    // Логика Drag & Drop и клика
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let hasDragged = false;

    nodeGroup.on("pointerdown", (e) => {
      isDragging = true;
      hasDragged = false;
      startX = e.global.x;
      startY = e.global.y;

      viewport.plugins.pause("drag");
      simulation.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
      e.stopPropagation();
    });

    nodeGroup.on("globalpointermove", (e) => {
      if (!isDragging) return;

      const dx = Math.abs(e.global.x - startX);
      const dy = Math.abs(e.global.y - startY);
      if (dx > 4 || dy > 4) {
        hasDragged = true;
      }

      const pos = viewport.toWorld(e.global);
      node.fx = pos.x;
      node.fy = pos.y;
    });

    const handlePointerUp = () => {
      if (!isDragging) return;
      isDragging = false;

      viewport.plugins.resume("drag");
      simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    };

    nodeGroup.on("pointerup", handlePointerUp);
    nodeGroup.on("pointerupoutside", handlePointerUp);

    // Клик срабатывает только если ноду не перетаскивали
    nodeGroup.on("click", (e) => {
      if (!hasDragged && onSelectNodeRef.current) {
        onSelectNodeRef.current(node);
      }
      e.stopPropagation();
    });

    // Ховер эффект
    nodeGroup.on("pointerenter", () => {
      nodeGroup.scale.set(1.15);
      core.fill({ color: 0x818cf8 });
      aura.fill({ color: 0x818cf8, alpha: 0.3 });
    });

    nodeGroup.on("pointerleave", () => {
      nodeGroup.scale.set(1);
      core.fill({ color: 0x6366f1 });
      aura.fill({ color: 0x6366f1, alpha: 0.15 });
    });

    return nodeGroup;
  }

  // 2. Реакция на изменение nodes или links без пересоздания холста
  useEffect(() => {
    if (!isInitializedRef.current) return;
    syncData(rawNodes, rawLinks);
  }, [rawNodes, rawLinks]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-zinc-950 select-none cursor-grab active:cursor-grabbing"
    />
  );
}
