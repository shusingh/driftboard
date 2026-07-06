import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";
export type Density = "comfortable" | "compact";
export type QuickFilter = "all" | "today" | "overdue" | "high";
export type SortMode = "manual" | "priority" | "due" | "title";

export type UiState = {
  theme: Theme;
  density: Density;
  focus: boolean;
  quickFilter: QuickFilter;
  sort: SortMode;
  labelFilter: string[];
  search: string;
  selectedCardId: string | null;
  paletteOpen: boolean;
  confirmClearOpen: boolean;
  collapsed: Record<string, boolean>;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleDensity: () => void;
  toggleFocus: () => void;
  setQuickFilter: (filter: QuickFilter) => void;
  setSort: (sort: SortMode) => void;
  toggleLabelFilter: (labelId: string) => void;
  clearLabelFilter: () => void;
  setSearch: (search: string) => void;
  selectCard: (cardId: string | null) => void;
  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;
  setConfirmClearOpen: (open: boolean) => void;
  toggleColumnCollapsed: (columnId: string) => void;
};

/** Reflect the theme onto <html data-theme> so CSS tokens flip. */
export function applyTheme(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export const useUiStore = create<UiState>()(
  persist(
    set => ({
      theme: "light",
      density: "comfortable",
      focus: false,
      quickFilter: "all",
      sort: "manual",
      labelFilter: [],
      search: "",
      selectedCardId: null,
      paletteOpen: false,
      confirmClearOpen: false,
      collapsed: {},

      toggleTheme: () =>
        set(state => {
          const theme: Theme = state.theme === "dark" ? "light" : "dark";

          applyTheme(theme);

          return { theme };
        }),

      setTheme: theme => {
        applyTheme(theme);
        set({ theme });
      },

      toggleDensity: () =>
        set(state => ({ density: state.density === "compact" ? "comfortable" : "compact" })),

      toggleFocus: () => set(state => ({ focus: !state.focus })),

      setQuickFilter: filter => set(state => ({ quickFilter: state.quickFilter === filter ? "all" : filter })),

      setSort: sort => set({ sort }),

      toggleLabelFilter: labelId =>
        set(state => ({
          labelFilter: state.labelFilter.includes(labelId)
            ? state.labelFilter.filter(id => id !== labelId)
            : [...state.labelFilter, labelId],
        })),

      clearLabelFilter: () => set({ labelFilter: [] }),

      setSearch: search => set({ search }),

      selectCard: selectedCardId => set({ selectedCardId }),

      setPaletteOpen: paletteOpen => set({ paletteOpen }),

      togglePalette: () => set(state => ({ paletteOpen: !state.paletteOpen })),

      setConfirmClearOpen: confirmClearOpen => set({ confirmClearOpen }),

      toggleColumnCollapsed: columnId =>
        set(state => ({
          collapsed: { ...state.collapsed, [columnId]: !state.collapsed[columnId] },
        })),
    }),
    {
      name: "driftboard-ui",
      // Don't persist transient interaction state.
      partialize: state => ({
        theme: state.theme,
        density: state.density,
        focus: state.focus,
        collapsed: state.collapsed,
      }),
      onRehydrateStorage: () => state => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
