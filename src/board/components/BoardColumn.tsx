import type { ColumnType, Label } from "@/types/board";
import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  useDroppable,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { ChevronLeft, GripVertical, Plus } from "lucide-react";
import { BoardCard } from "./BoardCard";
import { SortableCard } from "./SortableCard";
import { AddCardForm } from "./AddCardForm";

export interface ColumnDragHandle {
  ref: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

interface BoardColumnProps {
  column: ColumnType;
  labels: Label[];
  collapsed: boolean;
  cardDndEnabled?: boolean;
  dragHandle?: ColumnDragHandle;
  onToggleCollapsed: (columnId: string) => void;
  onAddCard: (columnId: string, title: string) => void;
  onOpenCard: (cardId: string) => void;
}

const EMPTY_COPY: Record<string, { title: string; body: string }> = {
  review: {
    title: "Nothing to review",
    body: "Cards you move here will wait for a final pass before they're done.",
  },
};

function CollapsedColumn({
  column,
  onToggleCollapsed,
}: Pick<BoardColumnProps, "column" | "onToggleCollapsed">) {
  return (
    <button
      className="flex h-full w-12 flex-none flex-col items-center gap-3 rounded-[14px] border border-line bg-surface py-[14px]"
      type="button"
      onClick={() => onToggleCollapsed(column.id)}
    >
      <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: column.dot }} />
      <span
        className="text-[13px] font-semibold tracking-[0.01em]"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {column.title}
      </span>
      <span className="text-[11px] font-bold text-faint">{column.cards.length}</span>
    </button>
  );
}

/** A single expanded (or collapsed) board column with its cards. */
export function BoardColumn({
  column,
  labels,
  collapsed,
  cardDndEnabled = false,
  dragHandle,
  onToggleCollapsed,
  onAddCard,
  onOpenCard,
}: BoardColumnProps) {
  const [adding, setAdding] = useState(false);
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  if (collapsed) {
    return <CollapsedColumn column={column} onToggleCollapsed={onToggleCollapsed} />;
  }

  const isEmpty = column.cards.length === 0;
  const empty = EMPTY_COPY[column.id];
  const add = (title: string) => onAddCard(column.id, title);
  const cardIds = column.cards.map(card => card.id);

  const cardList = column.cards.map(card =>
    cardDndEnabled ? (
      <SortableCard key={card.id} card={card} labels={labels} onOpen={onOpenCard} />
    ) : (
      <BoardCard key={card.id} card={card} labels={labels} onOpen={onOpenCard} />
    )
  );

  return (
    <div className="flex h-full w-[302px] flex-none flex-col">
      <div className="flex items-center gap-[9px] px-1 pb-3 pt-[2px]">
        {dragHandle && (
          <button
            ref={dragHandle.ref}
            className="flex h-[22px] w-[16px] cursor-grab items-center justify-center text-faint transition hover:text-muted active:cursor-grabbing"
            title="Drag column"
            type="button"
            {...dragHandle.attributes}
            {...dragHandle.listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span className="h-[9px] w-[9px] flex-none rounded-[3px]" style={{ background: column.dot }} />
        <span className="text-[14px] font-semibold">{column.title}</span>
        <span className="rounded-full border border-line bg-surface-2 px-2 py-[1px] text-[12px] font-semibold text-faint">
          {column.cards.length}
        </span>
        <div className="flex-1" />
        <button
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-faint transition hover:bg-surface-2 hover:text-ink"
          title="Collapse"
          type="button"
          onClick={() => onToggleCollapsed(column.id)}
        >
          <ChevronLeft className="h-[15px] w-[15px]" />
        </button>
        <button
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-faint transition hover:bg-surface-2 hover:text-ink"
          title="Add task"
          type="button"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-[15px] w-[15px]" />
        </button>
      </div>

      <div
        ref={setDroppableRef}
        className="flex min-h-0 flex-1 flex-col gap-[var(--card-gap)] overflow-y-auto pr-1"
      >
        {isEmpty && empty && !adding ? (
          <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-line px-4 py-8 text-center">
            <div className="text-[13.5px] font-semibold">{empty.title}</div>
            <div className="max-w-[190px] text-[12px] leading-[1.5] text-muted">{empty.body}</div>
            <AddCardForm variant="empty" onAdd={add} />
          </div>
        ) : (
          <>
            {cardDndEnabled ? (
              <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                {cardList}
              </SortableContext>
            ) : (
              cardList
            )}
            <AddCardForm open={adding} onAdd={add} onOpenChange={setAdding} />
          </>
        )}
      </div>
    </div>
  );
}
