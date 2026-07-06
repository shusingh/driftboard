import type { CardType } from "@/types/board";
import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { cn } from "@/lib/utils";

/** Editable checklist with a progress bar, matching the mock's detail panel. */
export function Checklist({ card }: { card: CardType }) {
  const addItem = useBoardStore(state => state.addChecklistItem);
  const toggleItem = useBoardStore(state => state.toggleChecklistItem);
  const removeItem = useBoardStore(state => state.removeChecklistItem);
  const [text, setText] = useState("");

  const total = card.checklist.length;
  const done = card.checklist.filter(item => item.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const submit = () => {
    const trimmed = text.trim();

    if (trimmed) addItem(card.id, trimmed);
    setText("");
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-faint">Checklist</h3>
        <span className="text-[12px] font-semibold text-muted">
          {done} of {total}
        </span>
      </div>

      {total > 0 && (
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="space-y-1">
        {card.checklist.map(item => (
          <li key={item.id} className="group flex items-center gap-[10px]">
            <button
              className={cn(
                "flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[6px] border transition",
                item.done ? "border-primary bg-primary text-white" : "border-line text-transparent"
              )}
              type="button"
              onClick={() => toggleItem(card.id, item.id)}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </button>
            <span
              className={cn(
                "flex-1 text-[13px]",
                item.done ? "text-faint line-through" : "text-ink"
              )}
            >
              {item.text}
            </span>
            <button
              className="flex-none rounded-[6px] p-1 text-faint opacity-0 transition hover:text-secondary group-hover:opacity-100"
              type="button"
              onClick={() => removeItem(card.id, item.id)}
            >
              <X className="h-[14px] w-[14px]" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <Plus className="h-[14px] w-[14px] text-faint" />
        <input
          className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
          placeholder="Add subtask"
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") submit();
          }}
        />
      </div>
    </section>
  );
}
