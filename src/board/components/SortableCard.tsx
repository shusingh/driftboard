import type { CardType, Label } from "@/types/board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardCard } from "./BoardCard";

interface SortableCardProps {
  card: CardType;
  labels: Label[];
  disabled?: boolean;
  onOpen: (cardId: string) => void;
}

/** A BoardCard made draggable/sortable within its column. */
export function SortableCard({ card, labels, disabled, onOpen }: SortableCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.columnId },
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    // The real card fades; the DragOverlay carries the lifted preview.
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <BoardCard card={card} labels={labels} onOpen={onOpen} />
    </div>
  );
}
