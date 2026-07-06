import type { CardType, ColumnType } from "@/types/board";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useBoardStore } from "../store/boardStore";
import { useUiStore } from "../store/uiStore";
import { useVisibleColumns } from "../useVisibleColumns";
import { SortableColumn } from "./SortableColumn";
import { BoardCard } from "./BoardCard";
import { BoardColumn } from "./BoardColumn";
import { AddColumn } from "./AddColumn";

type DragType = "card" | "column";

function columnOfCard(columns: ColumnType[], cardId: string): ColumnType | undefined {
  return columns.find(column => column.cards.some(card => card.id === cardId));
}

/** The scrollable row of columns, with dnd-kit drag & drop across the board. */
export function Board() {
  const labels = useBoardStore(state => state.board.labels);
  const addCard = useBoardStore(state => state.addCard);
  const addColumn = useBoardStore(state => state.addColumn);
  const moveCard = useBoardStore(state => state.moveCard);
  const moveColumn = useBoardStore(state => state.moveColumn);

  const collapsed = useUiStore(state => state.collapsed);
  const toggleColumnCollapsed = useUiStore(state => state.toggleColumnCollapsed);
  const selectCard = useUiStore(state => state.selectCard);
  const search = useUiStore(state => state.search);
  const quickFilter = useUiStore(state => state.quickFilter);
  const focus = useUiStore(state => state.focus);
  const sort = useUiStore(state => state.sort);
  const labelFilter = useUiStore(state => state.labelFilter);

  const visibleColumns = useVisibleColumns();

  // Dragging is disabled whenever cards are narrowed or reordered for display
  // (search, quick filter, label filter, or a non-manual sort), since rendered
  // indices would no longer match the store. Focus mode (which only hides whole
  // columns) keeps card dragging but disables column reordering.
  const cardDndEnabled =
    search.trim() === "" && quickFilter === "all" && sort === "manual" && labelFilter.length === 0;
  const columnDndEnabled = cardDndEnabled && !focus;

  // Working copy used only while a card drag is in flight (for cross-column
  // placeholders). Null the rest of the time so the store stays the source.
  const [dragColumns, setDragColumns] = useState<ColumnType[] | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);

  const columns = dragColumns ?? visibleColumns;
  const columnIds = useMemo(() => columns.map(column => column.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dragType = (event: { active: { data: { current?: { type?: DragType } } } }): DragType =>
    event.active.data.current?.type === "column" ? "column" : "card";

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);

    if (dragType(event) === "column") {
      setActiveColumn(visibleColumns.find(column => column.id === id) ?? null);

      return;
    }

    const column = columnOfCard(visibleColumns, id);

    setActiveCard(column?.cards.find(card => card.id === id) ?? null);
    setDragColumns(visibleColumns.map(col => ({ ...col, cards: [...col.cards] })));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (dragType(event) === "column") return;

    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overType = over.data.current?.type as DragType | undefined;

    setDragColumns(prev => {
      const cols = prev ?? visibleColumns.map(col => ({ ...col, cards: [...col.cards] }));
      const from = columnOfCard(cols, activeId);
      const to =
        overType === "column"
          ? cols.find(column => column.id === overId)
          : columnOfCard(cols, overId);

      if (!from || !to || from.id === to.id) return cols;

      const fromCards = [...from.cards];
      const toCards = [...to.cards];
      const activeIndex = fromCards.findIndex(card => card.id === activeId);

      if (activeIndex === -1) return cols;

      const [moved] = fromCards.splice(activeIndex, 1);
      const overIndex =
        overType === "column" ? toCards.length : toCards.findIndex(card => card.id === overId);
      const insertAt = overIndex === -1 ? toCards.length : overIndex;

      toCards.splice(insertAt, 0, { ...moved, columnId: to.id });

      return cols.map(column => {
        if (column.id === from.id) return { ...column, cards: fromCards };
        if (column.id === to.id) return { ...column, cards: toCards };

        return column;
      });
    });
  };

  const resetDrag = () => {
    setDragColumns(null);
    setActiveCard(null);
    setActiveColumn(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (dragType(event) === "column") {
      if (over && active.id !== over.id) {
        const newIndex = visibleColumns.findIndex(column => column.id === String(over.id));

        if (newIndex !== -1) moveColumn(String(active.id), newIndex);
      }
      resetDrag();

      return;
    }

    const cols = dragColumns ?? visibleColumns;
    const activeId = String(active.id);
    const destColumn = columnOfCard(cols, activeId);

    if (destColumn) {
      let finalCards = destColumn.cards;
      const overId = over ? String(over.id) : null;
      const overType = over?.data.current?.type as DragType | undefined;

      if (overId && overType === "card" && destColumn.cards.some(card => card.id === overId)) {
        const fromIndex = destColumn.cards.findIndex(card => card.id === activeId);
        const toIndex = destColumn.cards.findIndex(card => card.id === overId);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          finalCards = arrayMove(destColumn.cards, fromIndex, toIndex);
        }
      }

      const finalIndex = finalCards.findIndex(card => card.id === activeId);

      moveCard(activeId, destColumn.id, Math.max(0, finalIndex));
    }

    resetDrag();
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragCancel={resetDrag}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-[18px] pb-[6px] pt-5">
        <div className="flex h-full items-start gap-4">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns.map(column => (
              <SortableColumn
                key={column.id}
                cardDndEnabled={cardDndEnabled}
                collapsed={Boolean(collapsed[column.id])}
                column={column}
                columnDndEnabled={columnDndEnabled}
                labels={labels}
                onAddCard={addCard}
                onOpenCard={selectCard}
                onToggleCollapsed={toggleColumnCollapsed}
              />
            ))}
          </SortableContext>
          <AddColumn onAdd={addColumn} />
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeCard && (
          <div className="w-[286px] shadow-lg" style={{ transform: "rotate(-1.4deg) scale(1.02)" }}>
            <BoardCard card={activeCard} labels={labels} />
          </div>
        )}
        {activeColumn && (
          <div className="opacity-90">
            <BoardColumn
              collapsed={false}
              column={activeColumn}
              labels={labels}
              onAddCard={() => {}}
              onOpenCard={() => {}}
              onToggleCollapsed={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
