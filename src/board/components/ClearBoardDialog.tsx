import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { useUiStore } from "../store/uiStore";

/** Destructive-action confirmation before wiping every card off the board. */
export function ClearBoardDialog() {
  const open = useUiStore(state => state.confirmClearOpen);
  const setOpen = useUiStore(state => state.setConfirmClearOpen);
  const clearBoard = useBoardStore(state => state.clearBoard);

  const confirm = () => {
    clearBoard();
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[1px] data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-line bg-surface p-6 shadow-lg outline-none data-[state=open]:animate-scale-in">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-secondary/12 text-secondary">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="text-[16px] font-semibold">Clear board?</Dialog.Title>
              <Dialog.Description className="mt-1 text-[13.5px] leading-[1.55] text-muted">
                This removes every card from all columns. Your columns and labels stay. You can undo
                this right after with the palette or ⌘Z.
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                className="flex h-9 items-center rounded-[10px] border border-line bg-surface px-4 text-[13px] font-semibold text-muted transition hover:text-ink"
                type="button"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              className="flex h-9 items-center rounded-[10px] bg-secondary px-4 text-[13px] font-semibold text-white transition hover:brightness-95"
              type="button"
              onClick={confirm}
            >
              Clear board
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
