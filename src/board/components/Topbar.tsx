import { Link } from "react-router-dom";
import { ChevronDown, Command, Moon, Plus, Search, Sun } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { useUiStore } from "../store/uiStore";
import { Logo } from "./Logo";

/** Sticky application top bar: brand, workspace, search, and global actions. */
export function Topbar() {
  const columns = useBoardStore(state => state.board.columns);
  const addCard = useBoardStore(state => state.addCard);

  const theme = useUiStore(state => state.theme);
  const toggleTheme = useUiStore(state => state.toggleTheme);
  const search = useUiStore(state => state.search);
  const setSearch = useUiStore(state => state.setSearch);
  const togglePalette = useUiStore(state => state.togglePalette);

  const handleNewTask = () => {
    const target = columns[0];

    if (target) addCard(target.id, "New task");
  };

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-bg/85 px-4 py-[10px] backdrop-blur">
      <Link
        className="flex items-center gap-[10px] rounded-[10px] outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/60"
        title="Back to home"
        to="/"
      >
        <Logo />
        <span className="font-display text-[16px] font-bold tracking-[-0.02em]">Driftboard</span>
      </Link>

      <div className="mx-[2px] hidden h-[22px] w-px bg-line sm:block" />

      <button
        className="hidden h-[34px] items-center gap-2 rounded-[9px] border border-line bg-surface px-[11px] text-[13.5px] font-medium transition hover:bg-surface-2 sm:flex"
        type="button"
      >
        <span className="h-2 w-2 rounded-[3px] bg-primary" />
        Personal
        <ChevronDown className="h-[14px] w-[14px] text-faint" />
      </button>

      <div className="flex-1" />

      <label className="flex h-9 w-[160px] items-center gap-2 rounded-[10px] border border-line bg-surface-2 px-3 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-soft)] sm:w-[230px]">
        <Search className="h-4 w-4 text-faint" />
        <input
          data-board-search
          className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-faint"
          placeholder="Search tasks…"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <kbd className="rounded-[5px] border border-line px-[5px] py-[1px] text-[10.5px] font-semibold text-faint">
          /
        </kbd>
      </label>

      <button
        className="hidden h-9 items-center gap-[7px] rounded-[10px] border border-line bg-surface px-[11px] text-[13px] font-medium text-muted transition hover:bg-surface-2 hover:text-ink md:flex"
        title="Command palette"
        type="button"
        onClick={togglePalette}
      >
        <Command className="h-4 w-4" />
        <kbd className="text-[11px] font-semibold">⌘K</kbd>
      </button>

      <button
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink"
        title="Toggle theme"
        type="button"
        onClick={toggleTheme}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button
        className="flex h-9 items-center gap-2 rounded-[10px] bg-primary px-[14px] text-[13px] font-semibold text-white transition hover:bg-primary-ink"
        type="button"
        onClick={handleNewTask}
      >
        <Plus className="h-4 w-4" strokeWidth={2.2} />
        New task
      </button>
    </header>
  );
}
