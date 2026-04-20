import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Plus } from "lucide-react";

interface AddCardFormProps {
  onAdd: (title: string) => void;
}

/**
 * AddCardForm component that provides a form to add new cards to a column
 *
 * @component
 * @param {AddCardFormProps} props - The props for the AddCardForm component
 * @returns {JSX.Element} The rendered form with input and submit button
 */
export default function AddCardForm({ onAdd }: AddCardFormProps) {
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <Input
        fullWidth
        placeholder="New task (press Enter to add)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button isIconOnly variant="light" size="sm" onClick={handleAdd} className="min-w-8 h-10">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
