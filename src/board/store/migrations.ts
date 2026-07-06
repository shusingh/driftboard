import type { BoardType, CardType, ColumnType } from "@/types/board";
import { defaultBoard } from "@/data/defaultBoard";

const CURRENT_SCHEMA_VERSION = 1;

type LegacyCard = {
  id?: unknown;
  columnId?: unknown;
  title?: unknown;
  position?: unknown;
  content?: unknown;
};

type LegacyColumn = {
  id?: unknown;
  title?: unknown;
  position?: unknown;
  cards?: unknown;
};

type LegacyBoard = {
  id?: unknown;
  title?: unknown;
  columns?: unknown;
};

function cloneDefaultBoard(): BoardType {
  return structuredClone(defaultBoard);
}

function normalizeCard(card: LegacyCard, columnId: string, position: number): CardType {
  const title = typeof card.title === "string" && card.title.trim() ? card.title : "Untitled task";

  return {
    id: typeof card.id === "string" ? card.id : crypto.randomUUID(),
    columnId,
    position,
    title,
    description: typeof card.content === "string" ? card.content : undefined,
    labelIds: Array.isArray((card as Partial<CardType>).labelIds)
      ? ((card as Partial<CardType>).labelIds ?? []).filter((label): label is string => typeof label === "string")
      : [],
    checklist: Array.isArray((card as Partial<CardType>).checklist)
      ? ((card as Partial<CardType>).checklist ?? [])
      : [],
    accent: typeof (card as Partial<CardType>).accent === "string" ? (card as Partial<CardType>).accent : undefined,
    priority: (card as Partial<CardType>).priority,
    due: (card as Partial<CardType>).due,
    notes: typeof (card as Partial<CardType>).notes === "string" ? (card as Partial<CardType>).notes : undefined,
    done: typeof (card as Partial<CardType>).done === "boolean" ? (card as Partial<CardType>).done : undefined,
    content: typeof card.content === "string" ? card.content : undefined,
  };
}

function normalizeColumn(column: LegacyColumn, position: number): ColumnType {
  const id = typeof column.id === "string" ? column.id : crypto.randomUUID();
  const cards = Array.isArray(column.cards) ? column.cards : [];

  return {
    id,
    title: typeof column.title === "string" && column.title.trim() ? column.title : "Untitled",
    position,
    dot: typeof (column as Partial<ColumnType>).dot === "string" ? (column as Partial<ColumnType>).dot : undefined,
    collapsed:
      typeof (column as Partial<ColumnType>).collapsed === "boolean"
        ? (column as Partial<ColumnType>).collapsed
        : undefined,
    cards: cards.map((card, index) => normalizeCard(card as LegacyCard, id, index)),
  };
}

export function migrateBoard(input: unknown): BoardType {
  if (!input || typeof input !== "object") return cloneDefaultBoard();

  const board = input as LegacyBoard & Partial<BoardType>;

  if (board.schemaVersion === CURRENT_SCHEMA_VERSION && Array.isArray(board.columns)) {
    return {
      ...cloneDefaultBoard(),
      ...board,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      labels: Array.isArray(board.labels) && board.labels.length > 0 ? board.labels : cloneDefaultBoard().labels,
      columns: board.columns.map((column, index) => normalizeColumn(column, index)),
    };
  }

  if (!Array.isArray(board.columns)) return cloneDefaultBoard();

  return {
    ...cloneDefaultBoard(),
    id: typeof board.id === "string" ? board.id : "driftboard-personal",
    title: typeof board.title === "string" ? board.title : "Personal",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    columns: board.columns.map((column, index) => normalizeColumn(column, index)),
  };
}

export function loadLegacyBoard(): BoardType | null {
  const json = window.localStorage.getItem("kanban-board");

  if (!json) return null;

  try {
    return migrateBoard(JSON.parse(json));
  } catch {
    return null;
  }
}
