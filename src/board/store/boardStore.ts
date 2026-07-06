import type {
  BoardType,
  CardType,
  ChecklistItem,
  ColumnType,
  Due,
  Priority,
} from "@/types/board";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import { loadLegacyBoard, migrateBoard } from "./migrations";
import { defaultBoard } from "@/data/defaultBoard";

const STORAGE_KEY = "driftboard";

export type BoardState = {
  board: BoardType;

  // --- cards ---
  addCard: (columnId: string, title: string) => void;
  editCard: (columnId: string, cardId: string, title: string) => void;
  updateCard: (cardId: string, patch: Partial<Omit<CardType, "id" | "columnId" | "position">>) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  toggleCardDone: (cardId: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;

  // --- checklist ---
  addChecklistItem: (cardId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  editChecklistItem: (cardId: string, itemId: string, text: string) => void;
  removeChecklistItem: (cardId: string, itemId: string) => void;

  // --- card meta ---
  setCardDue: (cardId: string, due: Due | undefined) => void;
  setCardPriority: (cardId: string, priority: Priority | undefined) => void;
  toggleCardLabel: (cardId: string, labelId: string) => void;

  // --- columns ---
  addColumn: (title: string) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (columnId: string, toIndex: number) => void;

  // --- board ---
  clearBoard: () => void;
  replaceBoard: (board: BoardType) => void;
};

function cloneDefaultBoard(): BoardType {
  return structuredClone(defaultBoard);
}

function makeId() {
  return crypto.randomUUID();
}

function reindexCards(cards: CardType[], columnId: string): CardType[] {
  return cards.map((card, index) => ({ ...card, columnId, position: index }));
}

function reindexColumns(columns: ColumnType[]): ColumnType[] {
  return columns.map((column, index) => ({ ...column, position: index }));
}

/** Map over columns, replacing the one matching `columnId`. */
function mapColumn(
  columns: ColumnType[],
  columnId: string,
  fn: (column: ColumnType) => ColumnType
): ColumnType[] {
  return columns.map(column => (column.id === columnId ? fn(column) : column));
}

/** Apply `fn` to the card matching `cardId` wherever it lives. */
function mapCard(
  columns: ColumnType[],
  cardId: string,
  fn: (card: CardType) => CardType
): ColumnType[] {
  return columns.map(column => {
    if (!column.cards.some(card => card.id === cardId)) return column;

    return {
      ...column,
      cards: column.cards.map(card => (card.id === cardId ? fn(card) : card)),
    };
  });
}

function initialBoard(): BoardType {
  if (typeof window === "undefined") return cloneDefaultBoard();

  return loadLegacyBoard() ?? cloneDefaultBoard();
}

export const useBoardStore = create<BoardState>()(
  persist(
    temporal(
      set => {
        const setBoard = (recipe: (board: BoardType) => BoardType) =>
          set(state => ({ board: recipe(state.board) }));

        const setColumns = (recipe: (columns: ColumnType[]) => ColumnType[]) =>
          setBoard(board => ({ ...board, columns: recipe(board.columns) }));

        return {
          board: initialBoard(),

          addCard: (columnId, title) => {
            const trimmed = title.trim();

            if (!trimmed) return;

            setColumns(columns =>
              mapColumn(columns, columnId, column => {
                const newCard: CardType = {
                  id: makeId(),
                  columnId,
                  position: column.cards.length,
                  title: trimmed,
                  labelIds: [],
                  checklist: [],
                };

                return { ...column, cards: [...column.cards, newCard] };
              })
            );
          },

          editCard: (columnId, cardId, title) => {
            const trimmed = title.trim();

            if (!trimmed) return;

            setColumns(columns =>
              mapColumn(columns, columnId, column => ({
                ...column,
                cards: column.cards.map(card =>
                  card.id === cardId ? { ...card, title: trimmed } : card
                ),
              }))
            );
          },

          updateCard: (cardId, patch) => {
            setColumns(columns => mapCard(columns, cardId, card => ({ ...card, ...patch })));
          },

          deleteCard: (columnId, cardId) => {
            setColumns(columns =>
              mapColumn(columns, columnId, column => ({
                ...column,
                cards: reindexCards(
                  column.cards.filter(card => card.id !== cardId),
                  column.id
                ),
              }))
            );
          },

          toggleCardDone: cardId => {
            setColumns(columns => mapCard(columns, cardId, card => ({ ...card, done: !card.done })));
          },

          moveCard: (cardId, toColumnId, toIndex) => {
            setColumns(columns => {
              const from = columns.find(column => column.cards.some(card => card.id === cardId));

              if (!from) return columns;

              const moving = from.cards.find(card => card.id === cardId)!;

              // Remove from source.
              let next = mapColumn(columns, from.id, column => ({
                ...column,
                cards: column.cards.filter(card => card.id !== cardId),
              }));

              // Insert into destination at the clamped index.
              next = mapColumn(next, toColumnId, column => {
                const cards = [...column.cards];
                const index = Math.max(0, Math.min(toIndex, cards.length));

                cards.splice(index, 0, { ...moving, columnId: toColumnId });

                return { ...column, cards };
              });

              // Reindex both affected columns.
              return next.map(column =>
                column.id === from.id || column.id === toColumnId
                  ? { ...column, cards: reindexCards(column.cards, column.id) }
                  : column
              );
            });
          },

          addChecklistItem: (cardId, text) => {
            const trimmed = text.trim();

            if (!trimmed) return;

            setColumns(columns =>
              mapCard(columns, cardId, card => ({
                ...card,
                checklist: [...card.checklist, { id: makeId(), text: trimmed, done: false }],
              }))
            );
          },

          toggleChecklistItem: (cardId, itemId) => {
            setColumns(columns =>
              mapCard(columns, cardId, card => ({
                ...card,
                checklist: card.checklist.map(item =>
                  item.id === itemId ? { ...item, done: !item.done } : item
                ),
              }))
            );
          },

          editChecklistItem: (cardId, itemId, text) => {
            const trimmed = text.trim();

            setColumns(columns =>
              mapCard(columns, cardId, card => ({
                ...card,
                checklist: card.checklist.map(item =>
                  item.id === itemId ? { ...item, text: trimmed } : item
                ),
              }))
            );
          },

          removeChecklistItem: (cardId, itemId) => {
            setColumns(columns =>
              mapCard(columns, cardId, card => ({
                ...card,
                checklist: card.checklist.filter(item => item.id !== itemId),
              }))
            );
          },

          setCardDue: (cardId, due) => {
            setColumns(columns => mapCard(columns, cardId, card => ({ ...card, due })));
          },

          setCardPriority: (cardId, priority) => {
            setColumns(columns => mapCard(columns, cardId, card => ({ ...card, priority })));
          },

          toggleCardLabel: (cardId, labelId) => {
            setColumns(columns =>
              mapCard(columns, cardId, card => ({
                ...card,
                labelIds: card.labelIds.includes(labelId)
                  ? card.labelIds.filter(id => id !== labelId)
                  : [...card.labelIds, labelId],
              }))
            );
          },

          addColumn: title => {
            const trimmed = title.trim();

            if (!trimmed) return;

            setColumns(columns => [
              ...columns,
              { id: makeId(), title: trimmed, position: columns.length, cards: [] },
            ]);
          },

          renameColumn: (columnId, title) => {
            const trimmed = title.trim();

            if (!trimmed) return;

            setColumns(columns => mapColumn(columns, columnId, column => ({ ...column, title: trimmed })));
          },

          deleteColumn: columnId => {
            setColumns(columns => reindexColumns(columns.filter(column => column.id !== columnId)));
          },

          moveColumn: (columnId, toIndex) => {
            setColumns(columns => {
              const fromIndex = columns.findIndex(column => column.id === columnId);

              if (fromIndex === -1) return columns;

              const next = [...columns];
              const [moving] = next.splice(fromIndex, 1);
              const index = Math.max(0, Math.min(toIndex, next.length));

              next.splice(index, 0, moving);

              return reindexColumns(next);
            });
          },

          clearBoard: () => {
            setColumns(columns => columns.map(column => ({ ...column, cards: [] })));
          },

          replaceBoard: board => set({ board: migrateBoard(board) }),
        };
      },
      {
        // Only board data is time-travelled; keep undo/redo history lean.
        limit: 100,
        partialize: state => ({ board: state.board }),
      }
    ),
    {
      name: STORAGE_KEY,
      partialize: state => ({ board: state.board }),
      merge: (persisted, current) => {
        const persistedBoard =
          persisted && typeof persisted === "object" && "board" in persisted
            ? (persisted as Partial<BoardState>).board
            : null;

        return {
          ...current,
          board: migrateBoard(persistedBoard ?? current.board),
        };
      },
    }
  )
);

/** Convenience: undo/redo bound to the board store's temporal history. */
export const boardTemporal = useBoardStore.temporal;

export function undoBoard() {
  boardTemporal.getState().undo();
}

export function redoBoard() {
  boardTemporal.getState().redo();
}

// Re-export for consumers that need the checklist type inline.
export type { ChecklistItem };
