import { useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, FileJson, Upload } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { downloadBoard, parseBoard } from "@/lib/boardIo";

/** Toolbar control to export the board to JSON or import one back in. */
export function JsonMenu() {
  const board = useBoardStore(state => state.board);
  const replaceBoard = useBoardStore(state => state.replaceBoard);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";
    if (!file) return;

    const result = parseBoard(await file.text());

    if (result.ok) {
      replaceBoard(result.board);
      setError(null);
    } else {
      setError(result.error);
      window.setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <>
      <input ref={fileRef} hidden accept="application/json" type="file" onChange={onImportFile} />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex h-8 items-center gap-[6px] rounded-[9px] border border-line bg-surface px-3 text-[12.5px] font-semibold text-muted transition hover:text-ink"
            title="Import / export JSON"
            type="button"
          >
            <FileJson className="h-[14px] w-[14px]" />
            JSON
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 min-w-[200px] rounded-[12px] border border-line bg-surface p-1 shadow-lg data-[state=open]:animate-scale-in"
            sideOffset={6}
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-[7px] text-[13px] text-ink outline-none data-[highlighted]:bg-surface-2"
              onSelect={() => downloadBoard(board)}
            >
              <Download className="h-[15px] w-[15px] text-muted" />
              Export board
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-[7px] text-[13px] text-ink outline-none data-[highlighted]:bg-surface-2"
              onSelect={() => fileRef.current?.click()}
            >
              <Upload className="h-[15px] w-[15px] text-muted" />
              Import board
            </DropdownMenu.Item>
            {error && (
              <p className="px-2 pb-1 pt-2 text-[12px] text-secondary">{error}</p>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
}
