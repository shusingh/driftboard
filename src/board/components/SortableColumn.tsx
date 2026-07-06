import type { ColumnType, Label } from "@/types/board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardColumn } from "./BoardColumn";

interface SortableColumnProps {
  column: ColumnType;
  labels: Label[];
  collapsed: boolean;
  cardDndEnabled: boolean;
  columnDndEnabled: boolean;
  onToggleCollapsed: (columnId: string) => void;
  onAddCard: (columnId: string, title: string) => void;
  onOpenCard: (cardId: string) => void;
}

/** Wraps a BoardColumn with column-level sortable behaviour (drag handle). */
export function SortableColumn({
  column,
  labels,
  collapsed,
  cardDndEnabled,
  columnDndEnabled,
  onToggleCollapsed,
  onAddCard,
  onOpenCard,
}: SortableColumnProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", columnId: column.id },
    disabled: !columnDndEnabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} className="h-full" style={style}>
      <BoardColumn
        cardDndEnabled={cardDndEnabled}
        collapsed={collapsed}
        column={column}
        dragHandle={
          columnDndEnabled && !collapsed
            ? { ref: setActivatorNodeRef, attributes, listeners }
            : undefined
        }
        labels={labels}
        onAddCard={onAddCard}
        onOpenCard={onOpenCard}
        onToggleCollapsed={onToggleCollapsed}
      />
    </div>
  );
}
