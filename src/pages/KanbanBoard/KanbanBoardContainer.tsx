import type { BoardType, CardType } from "@/types/board";
import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/use-disclosure";
import { Trash2, Undo2, Redo2 } from "lucide-react";
import Column from "./components/Column";
import LoadingOverlay from "./components/LoadingOverlay";
import { loadBoard, saveBoard } from "@/utils/storage";
import { defaultBoard } from "@/data/defaultBoard";
import ConfirmationModal from "@/components/ConfirmationModal";

type ActionType = "add_card" | "edit_card" | "delete_card" | "drag_card";

interface BaseHistoryAction {
  type: ActionType;
}

interface AddCardAction extends BaseHistoryAction {
  type: "add_card";
  card: CardType;
}

interface EditCardAction extends BaseHistoryAction {
  type: "edit_card";
  columnId: string;
  cardId: string;
  oldTitle: string;
  newTitle: string;
}

interface DeleteCardAction extends BaseHistoryAction {
  type: "delete_card";
  card: CardType;
}

interface DragCardAction extends BaseHistoryAction {
  type: "drag_card";
  sourceColumnId: string;
  sourceIndex: number;
  destinationColumnId: string;
  destinationIndex: number;
}

type HistoryAction = AddCardAction | EditCardAction | DeleteCardAction | DragCardAction;

const MAX_HISTORY = 50;

/**
 * KanbanBoardContainer component that manages the state and interactions of the Kanban board
 *
 * @component
 * @returns {JSX.Element} The rendered Kanban board with columns, cards, and management features
 */
export default function KanbanBoardContainer() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const saved = loadBoard();
    setBoard(saved ?? defaultBoard);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const makeId = () => crypto.randomUUID();

  const addToHistory = useCallback((action: HistoryAction) => {
    setUndoStack(prev => {
      const newStack = [...prev, action];
      if (newStack.length > MAX_HISTORY) {
        return newStack.slice(newStack.length - MAX_HISTORY);
      }
      return newStack;
    });
    setRedoStack([]);
  }, []);

  const handleClearBoard = () => {
    if (!board) return;
    const updated = { ...board };

    updated.columns = updated.columns.map(col => ({
      ...col,
      cards: [],
    }));
    setBoard(updated);
    saveBoard(updated);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleAddCard = (columnId: string, title: string) => {
    if (!board) return;
    const updated = { ...board };
    const col = updated.columns.find(c => c.id === columnId);

    if (col) {
      const newCard: CardType = {
        id: makeId(),
        columnId,
        title,
        position: col.cards.length,
      };

      col.cards = [...col.cards, newCard];
      addToHistory({
        type: "add_card",
        card: { ...newCard },
      });
    }
    setBoard(updated);
    saveBoard(updated);
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    if (!board) return;
    const updated = { ...board };
    const col = updated.columns.find(c => c.id === columnId);

    if (col) {
      const deletedCard = col.cards.find(c => c.id === cardId);
      if (deletedCard) {
        addToHistory({
          type: "delete_card",
          card: { ...deletedCard },
        });
      }
      col.cards = col.cards.filter(c => c.id !== cardId).map((c, i) => ({ ...c, position: i }));
    }
    setBoard(updated);
    saveBoard(updated);
  };

  const handleEditCard = (columnId: string, cardId: string, newTitle: string) => {
    if (!board) return;
    const updated = { ...board };
    const col = updated.columns.find(c => c.id === columnId);

    if (col) {
      const card = col.cards.find(c => c.id === cardId);

      if (card) {
        const oldTitle = card.title;
        if (oldTitle !== newTitle) {
          addToHistory({
            type: "edit_card",
            columnId,
            cardId,
            oldTitle,
            newTitle,
          });
          card.title = newTitle;
        }
      }
    }
    setBoard(updated);
    saveBoard(updated);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !board) return;
    const updated = { ...board };
    const { source, destination } = result;

    const srcCol = updated.columns.find(c => c.id === source.droppableId)!;
    const dstCol = updated.columns.find(c => c.id === destination.droppableId)!;
    const [moved] = srcCol.cards.splice(source.index, 1);

    dstCol.cards.splice(destination.index, 0, moved);
    srcCol.cards = srcCol.cards.map((c, i) => ({ ...c, position: i }));
    dstCol.cards = dstCol.cards.map((c, i) => ({
      ...c,
      position: i,
      columnId: dstCol.id,
    }));

    addToHistory({
      type: "drag_card",
      sourceColumnId: source.droppableId,
      sourceIndex: source.index,
      destinationColumnId: destination.droppableId,
      destinationIndex: destination.index,
    });

    setBoard(updated);
    saveBoard(updated);
  };

  const undo = useCallback(() => {
    if (undoStack.length === 0 || !board) return;

    const action = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    const updated = JSON.parse(JSON.stringify(board)) as BoardType;

    switch (action.type) {
      case "add_card": {
        const col = updated.columns.find(c => c.id === action.card.columnId);
        if (col) {
          col.cards = col.cards.filter(c => c.id !== action.card.id).map((c, i) => ({ ...c, position: i }));
        }
        break;
      }
      case "edit_card": {
        const col = updated.columns.find(c => c.id === action.columnId);
        if (col) {
          const card = col.cards.find(c => c.id === action.cardId);
          if (card) {
            card.title = action.oldTitle;
          }
        }
        break;
      }
      case "delete_card": {
        const col = updated.columns.find(c => c.id === action.card.columnId);
        if (col) {
          col.cards.splice(action.card.position, 0, { ...action.card });
          col.cards = col.cards.map((c, i) => ({ ...c, position: i }));
        }
        break;
      }
      case "drag_card": {
        const srcCol = updated.columns.find(c => c.id === action.destinationColumnId);
        const dstCol = updated.columns.find(c => c.id === action.sourceColumnId);
        if (srcCol && dstCol) {
          const [moved] = srcCol.cards.splice(action.destinationIndex, 1);
          moved.columnId = action.sourceColumnId;
          dstCol.cards.splice(action.sourceIndex, 0, moved);
          srcCol.cards = srcCol.cards.map((c, i) => ({ ...c, position: i, columnId: srcCol.id }));
          dstCol.cards = dstCol.cards.map((c, i) => ({ ...c, position: i, columnId: dstCol.id }));
        }
        break;
      }
    }

    setUndoStack(newUndoStack);
    setRedoStack(prev => [...prev, action]);
    setBoard(updated);
    saveBoard(updated);
  }, [undoStack, board]);

  const redo = useCallback(() => {
    if (redoStack.length === 0 || !board) return;

    const action = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    const updated = JSON.parse(JSON.stringify(board)) as BoardType;

    switch (action.type) {
      case "add_card": {
        const col = updated.columns.find(c => c.id === action.card.columnId);
        if (col) {
          col.cards.push({ ...action.card });
          col.cards = col.cards.map((c, i) => ({ ...c, position: i }));
        }
        break;
      }
      case "edit_card": {
        const col = updated.columns.find(c => c.id === action.columnId);
        if (col) {
          const card = col.cards.find(c => c.id === action.cardId);
          if (card) {
            card.title = action.newTitle;
          }
        }
        break;
      }
      case "delete_card": {
        const col = updated.columns.find(c => c.id === action.card.columnId);
        if (col) {
          col.cards = col.cards.filter(c => c.id !== action.card.id).map((c, i) => ({ ...c, position: i }));
        }
        break;
      }
      case "drag_card": {
        const srcCol = updated.columns.find(c => c.id === action.sourceColumnId);
        const dstCol = updated.columns.find(c => c.id === action.destinationColumnId);
        if (srcCol && dstCol) {
          const [moved] = srcCol.cards.splice(action.sourceIndex, 1);
          moved.columnId = action.destinationColumnId;
          dstCol.cards.splice(action.destinationIndex, 0, moved);
          srcCol.cards = srcCol.cards.map((c, i) => ({ ...c, position: i, columnId: srcCol.id }));
          dstCol.cards = dstCol.cards.map((c, i) => ({ ...c, position: i, columnId: dstCol.id }));
        }
        break;
      }
    }

    setRedoStack(newRedoStack);
    setUndoStack(prev => [...prev, action]);
    setBoard(updated);
    saveBoard(updated);
  }, [redoStack, board]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  if (!board) return <LoadingOverlay />;

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            color="default"
            startContent={<Undo2 className="w-4 h-4" />}
            variant="light"
            isDisabled={!canUndo}
            onPress={undo}
          >
            Undo
          </Button>
          <Button
            color="default"
            startContent={<Redo2 className="w-4 h-4" />}
            variant="light"
            isDisabled={!canRedo}
            onPress={redo}
          >
            Redo
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            color="danger"
            startContent={<Trash2 className="w-4 h-4" />}
            variant="light"
            onPress={onOpen}
          >
            Clear Board
          </Button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full space-x-4 overflow-x-auto px-2 py-2">
          {board.columns.map(col => (
            <Column
              key={col.id}
              column={col}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onEditCard={handleEditCard}
            />
          ))}
        </div>
      </DragDropContext>

      <ConfirmationModal
        confirmText="Clear"
        isOpen={isOpen}
        message="Are you sure you want to clear all cards from the board? This action cannot be undone."
        title="Clear Board"
        onConfirm={handleClearBoard}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}
