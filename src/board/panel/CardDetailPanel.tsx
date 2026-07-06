import type { Priority } from "@/types/board";
import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, Trash2, X } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { useUiStore } from "../store/uiStore";
import { labelStyle, priorityStyles } from "../tokens";
import { EditableText } from "./EditableText";
import { Checklist } from "./Checklist";
import { dueLongText, dueStateFor } from "@/lib/date";
import { cn } from "@/lib/utils";

const PRIORITIES: { value: Priority | null; label: string }[] = [
  { value: null, label: "None" },
  { value: "low", label: "Low" },
  { value: "med", label: "Medium" },
  { value: "high", label: "High" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-faint">{children}</h3>
  );
}

/** Right-hand sheet with the full editable detail of the selected card. */
export function CardDetailPanel() {
  const selectedCardId = useUiStore(state => state.selectedCardId);
  const selectCard = useUiStore(state => state.selectCard);

  const columns = useBoardStore(state => state.board.columns);
  const labels = useBoardStore(state => state.board.labels);
  const updateCard = useBoardStore(state => state.updateCard);
  const setCardPriority = useBoardStore(state => state.setCardPriority);
  const setCardDue = useBoardStore(state => state.setCardDue);
  const toggleCardLabel = useBoardStore(state => state.toggleCardLabel);
  const moveCard = useBoardStore(state => state.moveCard);
  const deleteCard = useBoardStore(state => state.deleteCard);

  const found = useMemo(() => {
    for (const column of columns) {
      const card = column.cards.find(item => item.id === selectedCardId);

      if (card) return { card, column };
    }

    return null;
  }, [columns, selectedCardId]);

  const open = found !== null;
  const card = found?.card;
  const column = found?.column;

  const close = () => selectCard(null);

  return (
    <Dialog.Root open={open} onOpenChange={next => (next ? undefined : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-line bg-surface shadow-lg outline-none data-[state=open]:animate-slide-in-right"
        >
          {card && column && (
            <>
              <div className="flex items-center gap-2 border-b border-line px-5 py-[14px]">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-muted">
                  <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: column.dot }} />
                  {column.title}
                </span>
                <div className="flex-1" />
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-faint transition hover:bg-secondary/10 hover:text-secondary"
                  title="Delete task"
                  type="button"
                  onClick={() => {
                    deleteCard(column.id, card.id);
                    close();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Dialog.Close asChild>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] text-faint transition hover:bg-surface-2 hover:text-ink"
                    title="Close"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <div className="space-y-3">
                  <Dialog.Title asChild>
                    <EditableText
                      className="text-[18px] font-semibold leading-tight"
                      placeholder="Task title"
                      value={card.title}
                      onCommit={title => updateCard(card.id, { title })}
                    />
                  </Dialog.Title>
                </div>

                <section className="space-y-2">
                  <SectionLabel>Priority</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map(option => {
                      const active = (card.priority ?? null) === option.value;
                      const style = option.value ? priorityStyles[option.value] : null;

                      return (
                        <button
                          key={option.label}
                          className={cn(
                            "rounded-[8px] border px-3 py-[6px] text-[12.5px] font-semibold transition",
                            active ? "border-transparent" : "border-line text-muted hover:text-ink"
                          )}
                          style={
                            active && style ? { color: style.color, background: style.bg } : undefined
                          }
                          type="button"
                          onClick={() => setCardPriority(card.id, option.value ?? undefined)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-2">
                  <SectionLabel>Due date</SectionLabel>
                  <div className="flex items-center gap-2">
                    <label className="flex h-9 flex-1 items-center gap-2 rounded-[9px] border border-line bg-surface-2 px-3">
                      <CalendarDays className="h-4 w-4 text-faint" />
                      <input
                        className="flex-1 bg-transparent text-[13px] text-ink outline-none"
                        type="date"
                        value={card.due?.date ?? ""}
                        onChange={event => {
                          const date = event.target.value;

                          setCardDue(
                            card.id,
                            date ? { date, state: dueStateFor(date, card.done) } : undefined
                          );
                        }}
                      />
                    </label>
                    {card.due && (
                      <button
                        className="text-[12.5px] font-semibold text-faint transition hover:text-secondary"
                        type="button"
                        onClick={() => setCardDue(card.id, undefined)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {card.due && (
                    <p className="text-[12px] text-muted">{dueLongText(card.due)}</p>
                  )}
                </section>

                <section className="space-y-2">
                  <SectionLabel>Labels</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => {
                      const active = card.labelIds.includes(label.id);
                      const style = labelStyle(label.color);

                      return (
                        <button
                          key={label.id}
                          className={cn(
                            "rounded-full border px-3 py-[4px] text-[12px] font-semibold transition",
                            active ? "border-transparent" : "border-line text-muted hover:text-ink"
                          )}
                          style={active ? { color: style.color, background: style.bg } : undefined}
                          type="button"
                          onClick={() => toggleCardLabel(card.id, label.id)}
                        >
                          {label.name}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-2">
                  <SectionLabel>Move to</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {columns.map(target => {
                      const active = target.id === column.id;

                      return (
                        <button
                          key={target.id}
                          className={cn(
                            "rounded-[8px] border px-3 py-[6px] text-[12.5px] font-semibold transition",
                            active
                              ? "border-primary bg-primary-soft text-primary-ink"
                              : "border-line text-muted hover:text-ink"
                          )}
                          disabled={active}
                          type="button"
                          onClick={() => moveCard(card.id, target.id, target.cards.length)}
                        >
                          {target.title}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-2">
                  <SectionLabel>Description</SectionLabel>
                  <EditableText
                    multiline
                    className="rounded-[10px] border border-line bg-surface-2 p-3 text-[13px] leading-[1.55]"
                    placeholder="Add a description…"
                    value={card.description ?? ""}
                    onCommit={description => updateCard(card.id, { description })}
                  />
                </section>

                <Checklist card={card} />

                <section className="space-y-2">
                  <SectionLabel>Notes</SectionLabel>
                  <EditableText
                    multiline
                    className="rounded-[10px] border border-line bg-surface-2 p-3 text-[13px] leading-[1.55]"
                    placeholder="Add notes…"
                    value={card.notes ?? ""}
                    onCommit={notes => updateCard(card.id, { notes })}
                  />
                </section>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
