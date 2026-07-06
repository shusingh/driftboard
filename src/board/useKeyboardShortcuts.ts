import { useEffect } from "react";
import { redoBoard, undoBoard, useBoardStore } from "./store/boardStore";
import { useUiStore } from "./store/uiStore";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;

  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/** Global keyboard shortcuts for the board (⌘K, /, N, T, F, D, undo/redo). */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const ui = useUiStore.getState();
      const mod = event.metaKey || event.ctrlKey;

      // ⌘K toggles the palette from anywhere.
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        ui.togglePalette();

        return;
      }

      // Undo / redo.
      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redoBoard();
        else undoBoard();

        return;
      }

      if (isTypingTarget(event.target) || ui.paletteOpen) return;

      // "/" focuses search.
      if (event.key === "/") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[data-board-search]")?.focus();

        return;
      }

      switch (event.key.toLowerCase()) {
        case "n": {
          event.preventDefault();
          const target = useBoardStore.getState().board.columns[0];

          if (target) useBoardStore.getState().addCard(target.id, "New task");
          break;
        }
        case "t":
          ui.toggleTheme();
          break;
        case "f":
          ui.toggleFocus();
          break;
        case "d":
          ui.toggleDensity();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);
}
