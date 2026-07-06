import { Eye } from "lucide-react";
import { useUiStore } from "../store/uiStore";

/** Slim banner shown while focus mode is dimming the board to active work. */
export function FocusBanner() {
  const focus = useUiStore(state => state.focus);
  const toggleFocus = useUiStore(state => state.toggleFocus);

  if (!focus) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b border-line bg-ink px-4 py-[7px] text-[12.5px] font-medium text-bg animate-fade-in">
      <Eye className="h-[14px] w-[14px]" />
      Focus mode · showing active work only
      <button
        className="ml-2 rounded-[6px] bg-bg/15 px-2 py-[2px] text-[12px] font-semibold transition hover:bg-bg/25"
        type="button"
        onClick={toggleFocus}
      >
        Exit
      </button>
    </div>
  );
}
