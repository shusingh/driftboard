import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

interface AddCardFormProps {
  onAdd: (title: string) => void;
  variant?: "footer" | "empty";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Inline "add task" affordance that expands into a text field. Open state can
 * be controlled (so a column header button can trigger it) or self-managed.
 */
export function AddCardForm({ onAdd, variant = "footer", open, onOpenChange }: AddCardFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const submit = () => {
    const trimmed = title.trim();

    if (trimmed) onAdd(trimmed);
    setTitle("");
    inputRef.current?.focus();
  };

  const close = () => {
    setTitle("");
    setOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        className="mt-1 flex h-8 items-center gap-[6px] rounded-[9px] border border-line bg-surface px-[13px] text-[12.5px] font-semibold text-primary-ink transition hover:bg-primary-soft"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-[14px] w-[14px]" strokeWidth={2.2} />
        {variant === "empty" ? "Add your first task" : "Add task"}
      </button>
    );
  }

  return (
    <div className="mt-1 rounded-[11px] border border-line bg-surface p-2 shadow-sm">
      <textarea
        ref={inputRef}
        className="w-full resize-none bg-transparent text-[13px] leading-[1.4] text-ink outline-none placeholder:text-faint"
        placeholder="What needs doing?"
        rows={2}
        value={title}
        onBlur={() => {
          if (!title.trim()) setOpen(false);
        }}
        onChange={event => setTitle(event.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
          if (event.key === "Escape") close();
        }}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          className="flex h-8 items-center rounded-[8px] bg-primary px-3 text-[12.5px] font-semibold text-white transition hover:bg-primary-ink"
          type="button"
          onClick={submit}
          onMouseDown={event => event.preventDefault()}
        >
          Add
        </button>
        <button
          className="flex h-8 items-center rounded-[8px] px-2 text-[12.5px] font-semibold text-muted transition hover:text-ink"
          type="button"
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
