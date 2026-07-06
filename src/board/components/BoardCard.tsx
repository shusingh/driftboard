import type { CardType, Label } from "@/types/board";
import { priorityStyles } from "../tokens";
import { CardMeta, LabelChips } from "./CardMeta";

interface BoardCardProps {
  card: CardType;
  labels: Label[];
  onOpen?: (cardId: string) => void;
}

/**
 * A single task card: accent rail, optional priority badge, title, clamped
 * description, label chips, and a meta row. Mirrors the redesign mock.
 */
export function BoardCard({ card, labels, onOpen }: BoardCardProps) {
  const cardLabels = labels.filter(label => card.labelIds.includes(label.id));
  const priority = card.priority ? priorityStyles[card.priority] : null;

  return (
    <button
      className="group animate-card-rise relative w-full rounded-[13px] border border-line bg-surface p-[var(--card-pad)] text-left shadow-sm transition hover:-translate-y-0.5 hover:border-faint hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      type="button"
      onClick={() => onOpen?.(card.id)}
    >
      <span
        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-[3px]"
        style={{ background: card.accent ?? "var(--line)" }}
      />

      <div className="flex items-start gap-2">
        {priority && (
          <span
            className="mt-[2px] flex-none rounded-md px-[7px] py-[2px] text-[10.5px] font-bold uppercase tracking-[0.02em]"
            style={{ color: priority.color, background: priority.bg }}
          >
            {priority.label}
          </span>
        )}
        <div
          className="flex-1 text-[13.5px] font-[550] leading-[1.35]"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          {card.title}
        </div>
      </div>

      {card.description && (
        <div className="mt-[6px] line-clamp-2 text-[12px] leading-[1.5] text-muted">
          {card.description}
        </div>
      )}

      <LabelChips labels={cardLabels} />
      <CardMeta card={card} />
    </button>
  );
}
