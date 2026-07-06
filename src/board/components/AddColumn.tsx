import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

/** Trailing "add column" affordance at the end of the board. */
export function AddColumn({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const submit = () => {
    const trimmed = title.trim();

    if (trimmed) onAdd(trimmed);
    setTitle("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        className="flex h-[42px] w-[264px] flex-none items-center gap-2 rounded-[14px] border border-dashed border-line px-4 text-[13px] font-semibold text-muted transition hover:border-faint hover:text-ink"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add column
      </button>
    );
  }

  return (
    <div className="w-[264px] flex-none rounded-[14px] border border-line bg-surface p-2 shadow-sm">
      <input
        ref={inputRef}
        className="w-full bg-transparent px-2 py-1 text-[13px] text-ink outline-none placeholder:text-faint"
        placeholder="Column name"
        value={title}
        onBlur={submit}
        onChange={event => setTitle(event.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter") submit();
          if (event.key === "Escape") {
            setTitle("");
            setOpen(false);
          }
        }}
      />
    </div>
  );
}
