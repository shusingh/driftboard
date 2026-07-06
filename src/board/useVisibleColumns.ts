import type { CardType, ColumnType, Label } from "@/types/board";
import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { useBoardStore } from "./store/boardStore";
import { useUiStore, type QuickFilter, type SortMode } from "./store/uiStore";

/** Columns revealed in focus mode ("active work only"). */
const FOCUS_COLUMN_IDS = new Set(["week", "progress"]);

const PRIORITY_RANK: Record<string, number> = { high: 0, med: 1, low: 2 };

function sortCards(cards: CardType[], mode: SortMode): CardType[] {
  if (mode === "manual") return cards;

  const sorted = [...cards];

  sorted.sort((a, b) => {
    if (mode === "priority") {
      return (PRIORITY_RANK[a.priority ?? ""] ?? 3) - (PRIORITY_RANK[b.priority ?? ""] ?? 3);
    }
    if (mode === "due") {
      const av = a.due ? parseISO(a.due.date).getTime() : Infinity;
      const bv = b.due ? parseISO(b.due.date).getTime() : Infinity;

      return av - bv;
    }

    return a.title.localeCompare(b.title);
  });

  return sorted;
}

function cardMatchesSearch(card: CardType, labels: Label[], query: string): boolean {
  if (!query) return true;

  const q = query.toLowerCase();
  const labelNames = labels
    .filter(label => card.labelIds.includes(label.id))
    .map(label => label.name.toLowerCase());

  return (
    card.title.toLowerCase().includes(q) ||
    (card.description ?? "").toLowerCase().includes(q) ||
    (card.notes ?? "").toLowerCase().includes(q) ||
    labelNames.some(name => name.includes(q))
  );
}

function cardPassesQuick(card: CardType, filter: QuickFilter): boolean {
  if (filter === "all") return true;
  if (filter === "high") return card.priority === "high";

  if (!card.due) return false;

  const date = parseISO(card.due.date);

  if (!isValid(date)) return false;

  const diff = differenceInCalendarDays(date, new Date());

  if (filter === "today") return diff === 0;
  if (filter === "overdue") return diff <= 0;

  return true;
}

/**
 * Board columns with focus mode, search, and the active quick filter applied.
 * Card filtering is display-only; the store keeps the canonical order.
 */
export function useVisibleColumns(): ColumnType[] {
  const columns = useBoardStore(state => state.board.columns);
  const labels = useBoardStore(state => state.board.labels);
  const focus = useUiStore(state => state.focus);
  const search = useUiStore(state => state.search);
  const quickFilter = useUiStore(state => state.quickFilter);
  const sort = useUiStore(state => state.sort);
  const labelFilter = useUiStore(state => state.labelFilter);

  return columns
    .filter(column => !focus || FOCUS_COLUMN_IDS.has(column.id))
    .map(column => ({
      ...column,
      cards: sortCards(
        column.cards.filter(
          card =>
            cardMatchesSearch(card, labels, search) &&
            cardPassesQuick(card, quickFilter) &&
            (labelFilter.length === 0 || card.labelIds.some(id => labelFilter.includes(id)))
        ),
        sort
      ),
    }));
}
