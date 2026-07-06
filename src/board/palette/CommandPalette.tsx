import { useRef, useState } from "react";
import { Command } from "cmdk";
import {
  Download,
  Eraser,
  Eye,
  LayoutList,
  Moon,
  Plus,
  Redo2,
  Undo2,
  Upload,
} from "lucide-react";
import { redoBoard, undoBoard, useBoardStore } from "../store/boardStore";
import { useUiStore } from "../store/uiStore";
import { downloadBoard, parseBoard } from "@/lib/boardIo";

/** ⌘K command palette. Actions run then dismiss the palette. */
export function CommandPalette() {
  const open = useUiStore(state => state.paletteOpen);
  const setPaletteOpen = useUiStore(state => state.setPaletteOpen);
  const toggleTheme = useUiStore(state => state.toggleTheme);
  const toggleFocus = useUiStore(state => state.toggleFocus);
  const toggleDensity = useUiStore(state => state.toggleDensity);
  const selectCard = useUiStore(state => state.selectCard);
  const setConfirmClearOpen = useUiStore(state => state.setConfirmClearOpen);

  const board = useBoardStore(state => state.board);
  const addCard = useBoardStore(state => state.addCard);
  const replaceBoard = useBoardStore(state => state.replaceBoard);

  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => void) => {
    action();
    setPaletteOpen(false);
  };

  const newTask = () => {
    const target = board.columns[0];

    if (!target) return;

    addCard(target.id, "New task");
    // Select the freshly added card (last in the column after the state update).
    const latest = useBoardStore.getState().board.columns.find(column => column.id === target.id);
    const created = latest?.cards.at(-1);

    if (created) selectCard(created.id);
  };

  const onImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";
    if (!file) return;

    const result = parseBoard(await file.text());

    if (result.ok) {
      replaceBoard(result.board);
      setError(null);
      setPaletteOpen(false);
    } else {
      setError(result.error);
    }
  };

  const items = [
    { icon: Plus, label: "New task", hint: "N", onRun: newTask },
    { icon: Moon, label: "Toggle theme", hint: "T", onRun: toggleTheme },
    { icon: Eye, label: "Toggle focus mode", hint: "F", onRun: toggleFocus },
    { icon: LayoutList, label: "Toggle compact density", hint: "D", onRun: toggleDensity },
    { icon: Undo2, label: "Undo", hint: "⌘Z", onRun: undoBoard },
    { icon: Redo2, label: "Redo", hint: "⇧⌘Z", onRun: redoBoard },
    { icon: Download, label: "Export board as JSON", hint: "E", onRun: () => downloadBoard(board) },
    { icon: Upload, label: "Import board as JSON", onRun: () => fileRef.current?.click() },
    { icon: Eraser, label: "Clear board", onRun: () => setConfirmClearOpen(true) },
  ];

  return (
    <>
      <input ref={fileRef} hidden accept="application/json" type="file" onChange={onImportFile} />

      <Command.Dialog
        contentClassName="fixed left-1/2 top-[14vh] z-[60] w-full max-w-[520px] -translate-x-1/2 overflow-hidden rounded-[16px] border border-line bg-surface shadow-lg outline-none data-[state=open]:animate-scale-in"
        label="Command palette"
        open={open}
        overlayClassName="fixed inset-0 z-[59] bg-black/35 backdrop-blur-[1px]"
        onOpenChange={setPaletteOpen}
      >
        <Command.Input
          className="w-full border-b border-line bg-transparent px-4 py-[14px] text-[14px] text-ink outline-none placeholder:text-faint"
          placeholder="Type a command…"
        />
        {error && (
          <div className="border-b border-line bg-secondary/10 px-4 py-2 text-[12.5px] text-secondary">
            {error}
          </div>
        )}
        <Command.List className="max-h-[320px] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-faint">
            No matching commands.
          </Command.Empty>
          {items.map(item => (
            <Command.Item
              key={item.label}
              className="flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13.5px] text-ink data-[selected=true]:bg-surface-2"
              onSelect={() => run(item.onRun)}
            >
              <item.icon className="h-[16px] w-[16px] text-muted" />
              <span className="flex-1">{item.label}</span>
              {item.hint && (
                <kbd className="rounded-[5px] border border-line px-[6px] py-[1px] text-[11px] font-semibold text-faint">
                  {item.hint}
                </kbd>
              )}
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
