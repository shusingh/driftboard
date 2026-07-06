import type { CardType, Label } from "@/types/board";
import { CalendarDays, CheckSquare, StickyNote } from "lucide-react";
import { dueStyles, labelStyle } from "../tokens";
import { dueBadgeText } from "@/lib/date";

export function LabelChips({ labels }: { labels: Label[] }) {
  if (labels.length === 0) return null;

  return (
    <div className="mt-[9px] flex flex-wrap gap-[5px]">
      {labels.map(label => {
        const style = labelStyle(label.color);

        return (
          <span
            key={label.id}
            className="rounded-full px-2 py-[2px] text-[11px] font-semibold"
            style={{ color: style.color, background: style.bg }}
          >
            {label.name}
          </span>
        );
      })}
    </div>
  );
}

/** Bottom meta row of a card: due badge, checklist progress, notes indicator. */
export function CardMeta({ card }: { card: CardType }) {
  const checklistTotal = card.checklist.length;
  const checklistDone = card.checklist.filter(item => item.done).length;
  const hasChecklist = checklistTotal > 0;
  const hasNotes = Boolean(card.notes && card.notes.trim());
  const hasMeta = Boolean(card.due) || hasChecklist || hasNotes;

  if (!hasMeta) return null;

  const due = card.due ? dueStyles[card.due.state] : null;

  return (
    <div className="mt-[10px] flex items-center gap-[11px] border-t border-line-2 pt-[10px]">
      {card.due && due && (
        <span
          className="flex items-center gap-1 rounded-md px-[7px] py-[2px] text-[11.5px] font-semibold"
          style={{ color: due.color, background: due.bg }}
        >
          <CalendarDays className="h-3 w-3" />
          {dueBadgeText(card.due)}
        </span>
      )}

      {hasChecklist && (
        <span className="flex items-center gap-[5px] text-[11.5px] font-semibold text-muted">
          <CheckSquare className="h-3 w-3" />
          {checklistDone}/{checklistTotal}
        </span>
      )}

      {hasNotes && (
        <span className="flex items-center gap-1 text-[11.5px] font-semibold text-muted">
          <StickyNote className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}
