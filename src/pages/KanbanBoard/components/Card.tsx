import type { CardType } from "@/types/board";
import { Draggable } from "@hello-pangea/dnd";
import { useDisclosure } from "@heroui/use-disclosure";
import { Card as HUICard, CardBody } from "@heroui/card";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { MoreVertical, Trash2, Pencil, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface CardProps {
  card: CardType;
  index: number;
  colorClass?: string;
  onDelete: (columnId: string, cardId: string) => void;
  onEdit: (columnId: string, cardId: string, title: string) => void;
}

/**
 * Card component that represents a single task card in a Kanban board column
 *
 * @component
 * @param {CardProps} props - The props for the Card component
 * @returns {JSX.Element} The rendered card with drag handle and action menu
 */
export default function Card({ card, index, colorClass = "", onDelete, onEdit }: CardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onEdit(card.columnId, card.id, editedTitle.trim());
      setIsEditing(false);
    }
  };

  const handleDiscard = () => {
    setEditedTitle(card.title);
    setIsEditing(false);
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="w-full cursor-grab"
          >
            <HUICard className={`w-full ${colorClass}`} radius="sm" shadow="none">
              <CardBody className="grid grid-cols-[1fr,auto] gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      className="flex-1"
                      value={editedTitle}
                      onChange={e => setEditedTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleDiscard();
                      }}
                    />
                    <Button
                      isIconOnly
                      color="success"
                      size="sm"
                      variant="light"
                      onPress={handleSave}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={handleDiscard}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center text-default-500">{card.title}</div>
                    <div className="flex items-center">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            size="sm"
                            variant="light"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Card actions">
                          <DropdownItem
                            key="edit"
                            startContent={<Pencil className="w-4 h-4" />}
                            onPress={() => setIsEditing(true)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={onOpen}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </>
                )}
              </CardBody>
            </HUICard>
          </div>
        )}
      </Draggable>

      <ConfirmationModal
        confirmText="Delete"
        isOpen={isOpen}
        message="Are you sure you want to delete this task? This action cannot be undone."
        title="Delete Card"
        onConfirm={() => onDelete(card.columnId, card.id)}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
