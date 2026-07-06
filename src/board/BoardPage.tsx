import { useEffect } from "react";
import { useUiStore } from "./store/uiStore";
import { Topbar } from "./components/Topbar";
import { Toolbar } from "./components/Toolbar";
import { Board } from "./components/Board";
import { FocusBanner } from "./components/FocusBanner";
import { ClearBoardDialog } from "./components/ClearBoardDialog";
import { CardDetailPanel } from "./panel/CardDetailPanel";
import { CommandPalette } from "./palette/CommandPalette";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

/**
 * The board screen: sticky topbar, filter toolbar, and the scrollable columns.
 * Density is reflected onto the root as a data attribute so card padding/gap
 * tokens switch without prop drilling.
 */
export default function BoardPage() {
  const density = useUiStore(state => state.density);
  const theme = useUiStore(state => state.theme);

  useKeyboardShortcuts();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex h-full flex-col bg-bg text-ink" data-density={density}>
      <Topbar />
      <FocusBanner />
      <Toolbar />
      <Board />
      <CardDetailPanel />
      <CommandPalette />
      <ClearBoardDialog />
    </div>
  );
}
