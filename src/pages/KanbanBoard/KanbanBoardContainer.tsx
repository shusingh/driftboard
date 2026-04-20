import type { BoardType, CardType } from "@/types/board";
import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/use-disclosure";
import { Trash2 } from "lucide-react";
import Column from "./components/Column";
import LoadingOverlay from "./components/LoadingOverlay";
import { loadBoard, saveBoard } from "@/utils/storage";
import { defaultBoard } from "@/data/defaultBoard";
import ConfirmationModal from "@/components/ConfirmationModal";

/**
 * KanbanBoardContainer component that manages the state and interactions of the Kanban board
 *
 * @component
 * @returns {JSX.Element} The rendered Kanban board with columns, cards, and management features
 */
export default function KanbanBoardContainer() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const saved = loadBoard();
    setBoard(saved ?? defaultBoard);
  }, []);

  const makeId = () => crypto.randomUUID();

  const handleClearBoard = () => {
    if (!board) return;
    const updated = { ...board };

    updated.columns = updated.columns.map(col => ({
      ...col,
      cards: [],
    }));
    setBoard(updated);
    saveBoard(updated);
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
    }
    setBoard(updated);
    saveBoard(updated);
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    if (!board) return;
    const updated = { ...board };
    const col = updated.columns.find(c => c.id === columnId);

    if (col) {
      col.cards = col.cards.filter(c => c.id !== cardId).map((c, i) => ({ ...c, position: i }));
    }
    setBoard(updated);
    saveBoard(updated);
  };

  const handleEditCard = (columnId: string, cardId: string, title: string) => {
    if (!board) return;
    const updated = { ...board };
    const col = updated.columns.find(c => c.id === columnId);

    if (col) {
      const card = col.cards.find(c => c.id === cardId);

      if (card) {
        card.title = title;
      }
    }
    setBoard(updated);
    saveBoard(updated);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !board) return;
    const updated = { ...board };
    const { source, destination } = result;

    // Only card moves within/between columns
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

    setBoard(updated);
    saveBoard(updated);
  };

  if (!board) return <LoadingOverlay />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <Button
          color="danger"
          startContent={<Trash2 className="w-4 h-4" />}
          variant="light"
          onPress={onOpen}
        >
          Clear Board
        </Button>
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
