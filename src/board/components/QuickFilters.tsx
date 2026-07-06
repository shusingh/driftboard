import type { CardType } from "@/types/board";
import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { useMemo } from "react";
import { useBoardStore } from "../store/boardStore";
import { useUiStore, type QuickFilter } from "../store/uiStore";
import { cn } from "@/lib/utils";

const FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "high", label: "High priority" },
];

function count(cards: CardType[], filter: QuickFilter): number {
  return cards.filter(card => {
    if (filter === "all") return true;
    if (filter === "high") return card.priority === "high";
    if (!card.due) return false;

    const date = parseISO(card.due.date);

    if (!isValid(date)) return false;

    const diff = differenceInCalendarDays(date, new Date());

    if (filter === "today") return diff === 0;
    if (filter === "overdue") return diff <= 0;

    return true;
  }).length;
}

/** Row of quick-filter chips with live counts drawn from the whole board. */
export function QuickFilters() {
  const columns = useBoardStore(state => state.board.columns);
  const active = useUiStore(state => state.quickFilter);
  const setQuickFilter = useUiStore(state => state.setQuickFilter);

  const allCards = useMemo(() => columns.flatMap(column => column.cards), [columns]);

  return (
    <div className="flex items-center gap-2">
      {FILTERS.map(filter => {
        const on = active === filter.id;

        return (
          <button
            key={filter.id}
            className={cn(
              "flex items-center gap-[6px] rounded-full border px-[11px] py-[5px] text-[12.5px] font-semibold transition",
              on
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-muted hover:text-ink"
            )}
            type="button"
            onClick={() => setQuickFilter(filter.id)}
          >
            {filter.label}
            <span className={cn("text-[11px] font-bold", on ? "text-white/80" : "text-faint")}>
              {count(allCards, filter.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
