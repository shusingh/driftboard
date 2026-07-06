# Driftboard - Redesign Project Plan

> Rebuild of the current Kanban board into **Driftboard**: a local-first, Trello/Jira-class
> personal board with a bespoke warm-paper design, rich cards, a command palette, focus mode,
> and buttery drag-and-drop.

---

## 0. Progress Log

| Phase | Status | Notes |
|---|---|---|
| 0 - Foundation & cleanup | ✅ Done | HeroUI/rbd/hello-pangea removed; Tailwind v3.4 pinned; tokens + Bricolage font + dark theme in `globals.css`; dnd-kit/zustand/zundo/cmdk/zod/date-fns installed; `/board` route; shadcn config (`components.json`, `lib/utils`); Vercel `rewrites`. Build green. |
| 1 - Data model & state | ✅ Done | Rich types + zod schema (`lib/boardSchema.ts`); migrations + legacy import; seed `defaultBoard` from mock. Board store with full action set (cards, checklist, due, labels, priority, move/reorder, columns) + zundo undo/redo (`undoBoard`/`redoBoard`); separate persisted UI store (theme/density/focus/filters/selection/palette/collapsed); JSON I/O (`lib/boardIo.ts`). |
| 2 - Static board UI | ✅ Done | Topbar (brand, workspace, search, ⌘K, theme, New task), Toolbar (quick filters w/ counts, focus, density, sort/filter stubs, "Saved locally"), Board → Column → Card matching the mock (accent rail, priority, labels, due badge, checklist, notes); inline add-card + add-column; empty states; collapse; focus/search/density wired via `useVisibleColumns`. No DnD yet. |
| 3 - Drag & drop | ✅ Done | dnd-kit two-level sortable (cards vertical, columns horizontal); cross-column via `onDragOver` working copy; single `moveCard`/`moveColumn` commit on drop (one undo entry); `DragOverlay` lifted card (`rotate(-1.4deg) scale(1.02)` + shadow-lg); pointer + keyboard sensors; drag auto-disabled while search/filter narrows cards. Lint clean. |
| 4 - Card detail panel | ✅ Done | Radix Dialog right-sheet (focus trap, Esc, slide-in). Editable title/description/notes (commit-on-blur to keep undo clean), priority selector, due date picker + clear, label toggles, move-to column buttons, checklist with progress bar + add/toggle/remove subtasks, delete. Opens on card click. |
| 5 - Palette & toolbar | ✅ Done | cmdk ⌘K palette (new task, theme, focus, density, undo/redo, export, import, clear); global shortcuts (⌘K, /, N, T, F, D, ⌘Z/⇧⌘Z); Sort dropdown (manual/priority/due/title) + label Filter dropdown, both display-only and DnD-aware. |
| 6 - Modes & polish | ✅ Done | Focus-mode banner with Exit; quiet theme-aware scrollbars; card-rise mount animation; reduced-motion honored; responsive topbar (wraps, hides non-essentials on small screens); focus rings on cards. |
| 7 - Import/Export | ✅ Done | Export/import in palette **and** a toolbar JSON dropdown; zod-validated round-trip; inline error surface. |
| 8 - Landing page | ✅ Done | Rebuilt from mock: sticky nav + theme toggle, hero with badge/trust-chips + static board preview, 9-feature grid, "private by default" section, footer. Old HeroUI landing + shared components (navbar/footer/primitives/icons/theme-switch/layout/ConfirmationModal/site config) deleted. |
| 9 - Ship to Vercel | ✅ Done | **Deployed to production:** https://driftboard-app.vercel.app (`/` and `/board` both 200, GitHub repo connected, Vite auto-detected). Rebranded `index.html` + favicon + theme-color; README updated with live link; `vercel.json` SPA rewrite. **Optional follow-ups:** retire Render; rename repo folder `kanban-board` → `driftboard`. |

> **Note on authorship:** Phase 0 and the first cut of Phase 1 (types, migrations, seed, basic store) were completed in a separate Codex session; verified and extended here.

---

## 1. Goals & Non-Goals

**Goals**
- Faithfully implement the `Driftboard Kanban` and `Driftboard Landing` mocks.
- Local-first: no backend, no signup, works offline, instant to open. All state in the browser.
- Portfolio-grade quality: clean architecture, accessibility, polished motion.
- Migrate hosting from Render to Vercel.

**Non-Goals (for this pass)**
- No multi-board / multi-workspace support (the "Personal" workspace is cosmetic for now).
- No real-time sync or accounts.
- No IndexedDB yet (localStorage is sufficient; revisit if we hit size limits - see Risks).

---

## 2. Locked Decisions

| Area | Decision | Rationale |
|---|---|---|
| Drag & drop | **dnd-kit** (`@dnd-kit/core`, `/sortable`, `/utilities`, `/modifiers`) | `DragOverlay` gives full control of the lifted-card preview and eliminates the cross-column flicker; sortable presets cover card **and** column reordering; strong keyboard a11y; actively maintained. |
| UI foundation | **Tailwind + shadcn/ui (Radix primitives)** | The mock is fully bespoke (warm-paper palette, Bricolage Grotesque). Radix primitives styled to our tokens match it exactly without fighting an opinionated component library. |
| State | **Zustand** + **zundo** (temporal middleware) | Ergonomic global store for a feature-rich board; `persist` middleware auto-syncs localStorage; `zundo` delivers undo/redo (already promised in the "Done" column) with minimal code. |
| Command palette | **cmdk** (shadcn wraps it) | Purpose-built ⌘K palette; keyboard-first, accessible. |
| Validation | **zod** | Safe JSON import/export round-trip with schema validation. |
| Dates | **date-fns** | Relative due badges ("in 2 days"), lightweight, tree-shakeable. |
| Motion | **framer-motion** (already present) | Card lift, panel/palette transitions, focus-mode dimming. |
| Hosting | **Vercel** (Vite preset, build `npm run build`, output `dist`) | Static SPA; simpler than Render, first-class Vite support. |
| Routing | Keep **react-router-dom** | Two routes: `/` (landing) and `/board`. |

---

## 3. Dependency Changes

**Remove**
- `react-beautiful-dnd` - deprecated & archived; already a dead dependency (unused).
- `@hello-pangea/dnd` - superseded by dnd-kit.
- All `@heroui/*` (`react`, `button`, `card`, `dropdown`, `input`, `navbar`, `snippet`, `switch`, `system`, `theme`, `use-theme`, `kbd`, `link`, `code`), `@react-aria/*`, `@react-types/shared`, `tailwind-variants` - replaced by shadcn/Radix + cva.

**Add**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`
- `zustand`, `zundo`
- `zod`
- `cmdk`
- `date-fns`
- `class-variance-authority`, `tailwind-merge`, `clsx` (shadcn utility trio)
- `@radix-ui/*` (pulled in per-component by the shadcn CLI)
- Bricolage Grotesque font via `@fontsource-variable/bricolage-grotesque` (self-hosted, offline-friendly)

**Keep**
- `react`, `react-dom` (standardize on React 18 - README currently overclaims React 19), `react-router-dom`, `lucide-react`, `framer-motion`, `vite`, `typescript`, ESLint/Prettier stack.

**Tailwind note:** the repo currently mixes `tailwindcss@3.4` with `@tailwindcss/postcss@4`. Standardize on **one** - recommend Tailwind v3.4 stable for the smoothest shadcn path (or commit fully to v4 with shadcn's v4 support). Resolve before Phase 0 ends.

---

## 4. Design System

Ported straight from the mock's tokens.

**Light**
```
--bg #F4F1EB   --surface #FFFFFF   --surface-2 #FAF8F3
--ink #1C1A17  --muted #726B60     --faint #9C9486
--line #E8E3DA --line-2 #F0ECE4
--primary #4B49E6  --primary-ink #3634C9  --primary-soft rgba(75,73,230,.10)
--secondary #E8663D
shadows: sm / md / lg (warm-tinted)
card padding 13px 14px, gap 10px, radius per tokens
```
- **Dark theme**: derive a matching dark token set (mock supports `theme: light|dark`). Define as a `[data-theme="dark"]` block.
- **Typography**: Bricolage Grotesque (display + UI).
- **Label palette** (7): Design `#6D5AE6`, Frontend `#2F73E0`, Feature `#2E9E6B`, Bug `#E0483D`, Ideas `#C98118`, A11y `#1595A0`, Infra `#8A7C6B`.
- **Priority**: High `#D8443A`, Medium `#C07615`, Low `#3F8A66`.
- **Due states**: today / soon / later / done, each with color + soft bg.
- **Density**: comfortable vs compact (affects card padding/gap).
- Expose all tokens as CSS variables consumed by Tailwind theme config, so light/dark and density switch with a single attribute.

---

## 5. Data Model (extend `src/types/board.ts`)

```ts
type Priority = 'high' | 'med' | 'low';
type DueState = 'today' | 'soon' | 'later' | 'done';

interface Label { id: string; name: string; color: string; }      // from the 7-label palette
interface ChecklistItem { id: string; text: string; done: boolean; }
interface Due { date: string /*ISO*/; state: DueState; }

interface CardType {
  id: string;
  columnId: string;
  position: number;
  title: string;
  description?: string;
  accent?: string;
  priority?: Priority;
  labelIds: string[];
  due?: Due;
  checklist: ChecklistItem[];
  notes?: string;
  done?: boolean;
}

interface ColumnType {
  id: string; title: string; position: number;
  dot?: string;             // column color dot
  collapsed?: boolean;
  cards: CardType[];
}

interface BoardType {
  id: string; title: string;
  columns: ColumnType[];
  labels: Label[];          // board-level label registry
}
```
- Provide a **schema version** field + migration shim so old localStorage boards upgrade gracefully.
- `zod` schemas mirror these for import validation.

---

## 6. Architecture

```
src/
  app/                     # router, providers, theme bootstrap
  board/
    store/                 # zustand store (board slice, ui slice), zundo temporal, persist
    components/            # Board, Column, Card, CardMeta, AddCard, AddColumn, DragOverlayCard
    dnd/                   # dnd-kit sensors, collision, sortable wiring, drop indicators
    panel/                 # CardDetailPanel (description, checklist, labels, due, move-to)
    palette/               # CommandPalette (cmdk) + command registry
    toolbar/               # search, quick filters, sort, filter, focus, density, theme, export
  landing/                 # LandingPage sections
  ui/                      # shadcn primitives (button, dialog, dropdown, input, badge, ...)
  lib/                     # utils (cn), date, io (json import/export), migrations
  styles/                  # globals, tokens, fonts
  types/
```

**State ownership**
- **Board slice** (persisted, undoable): columns, cards, labels.
- **UI slice** (persisted where it makes sense, NOT undoable): theme, density, focus, quick filter, search, selectedCardId, palette open, collapsed columns.
- Persistence via zustand `persist` (key `driftboard`); undo/redo via `zundo` wrapping only the board slice.
- All mutations are store actions (addCard, editCard, moveCard, reorderColumn, toggleChecklistItem, setDue, addColumn, clearBoard, importBoard, …) - components stay declarative.

---

## 7. Drag & Drop Approach (dnd-kit)

- **Two levels of sortable**: columns are a horizontal `SortableContext`; each column's cards are a vertical `SortableContext`. A single `DndContext` wraps the board.
- **`DragOverlay`** renders the lifted card (`rotate(-1.4deg) scale(1.02)` + `--shadow-lg`) - this is what kills the flicker, because the moving element is decoupled from list re-renders.
- **Drop indicators**: render a placeholder gap using sortable's transform data; empty columns show the "Add your first task" prompt as a drop target.
- **Sensors**: pointer + keyboard (Space to lift, arrows to move, Space to drop, Esc to cancel) + touch, with an activation constraint so clicks/taps still open cards.
- **Auto-scroll** across the 5-column board via dnd-kit's built-in auto-scroll.
- On drop: compute source/destination column + index, call `moveCard` action, reindex `position`, persist. Cross-column moves update `columnId`.

---

## 8. Feature Inventory (from the mocks)

Board: 5 seeded columns · add/collapse columns · rich cards (priority, title, desc, labels, due badge, checklist progress, notes count, accent, done state) · drag card within/between columns · drag to reorder columns · empty-column states.

Card detail panel: column name, priority, due date, labels, **move-to** column selector, description, editable checklist/subtasks with progress bar, notes.

Toolbar / global: ⌘K **command palette** (new task, toggle theme, toggle focus, export JSON, toggle density) · keyboard shortcuts · **search** (title/desc/labels/notes) · **quick filters** (All / Today / Overdue / High) with live counts · sort · filter · **focus mode** (dims to active columns) · **density** toggle · **theme** toggle · **import/export JSON** · **undo/redo** · "Saved locally" indicator.

Landing: sticky nav, hero with live board preview, trust chips (no signup / offline / local), 9-feature grid, "why", "how it works", CTA.

---

## 9. Phased Delivery

Each phase is independently reviewable; the board stays runnable throughout.

- **Phase 0 - Foundation & cleanup.** Remove HeroUI/rbd/hello-pangea; resolve Tailwind version; init shadcn; port tokens + fonts + dark theme; add Vercel config; update README (React 18, new live URL later).
- **Phase 1 - Data & state.** New types + migrations; Zustand store (board + ui slices); persist; zundo undo/redo; seed `defaultBoard` from the mock's data.
- **Phase 2 - Static board.** Columns + rich cards rendered to pixel-match the mock (no DnD yet); add-card / add-column; empty states; density + theme wired.
- **Phase 3 - Drag & drop.** dnd-kit two-level sortable, DragOverlay, drop indicators, keyboard + auto-scroll; move/reorder actions.
- **Phase 4 - Card detail panel.** Description, checklist/subtasks, labels, due, move-to; open on card click.
- **Phase 5 - Command palette & toolbar.** cmdk palette + shortcuts; search; quick filters w/ counts; sort/filter.
- **Phase 6 - Modes & polish.** Focus mode, motion polish, responsive, a11y sweep.
- **Phase 7 - Import/Export.** JSON round-trip with zod validation; "Saved locally" indicator.
- **Phase 8 - Landing page.** Rebuild all sections incl. live board preview.
- **Phase 9 - Ship.** Lint clean, test pass, deploy to Vercel, update README + live demo link.

---

## 10. Hosting Migration (Render → Vercel)

- Framework preset: **Vite** (auto-detected). Build `npm run build`; output `dist`.
- Adapt existing `vercel.json` (SPA rewrite to `/index.html` so client routes resolve).
- Add SPA fallback + caching headers for hashed assets.
- Point the repo's Vercel project at `main`; retire Render once the Vercel URL is verified.
- Update README live-demo link and any hardcoded URLs.

---

## 11. Quality & Testing

- **Lint/format**: keep ESLint + Prettier at `--max-warnings 0`.
- **Type safety**: strict TS; zod at the JSON boundary.
- **Unit** (add Vitest): store actions (move/reorder reindexing, undo/redo, import validation), date/due helpers.
- **Component** (React Testing Library): card render, add/edit flows, palette.
- **Manual DnD matrix**: pointer/touch/keyboard × within-column / cross-column / column-reorder / empty-column drop.
- **A11y**: keyboard-only board operation, focus management in panel/palette/dialogs, reduced-motion honoring.
- **Responsive**: horizontal scroll on narrow viewports; verify board + landing.

---

## 12. Risks & Mitigations

- **localStorage size ceiling** - the mock itself flags this. Mitigate: keep payload lean; add an export nudge; plan IndexedDB migration path if boards grow large.
- **Migration churn** - removing HeroUI touches every component. Mitigate: Phase 0 isolates the swap; rebuild screens fresh against the mock rather than retrofitting.
- **DnD polish** - the flicker is the known trap. Mitigate: DragOverlay from day one; test the cross-column boundary early in Phase 3.
- **Tailwind v3/v4 mismatch** - resolve deliberately in Phase 0 before building UI.
- **Undo/redo scope** - only board data is temporal; UI state is excluded to avoid surprising undo of theme/filters.

---

## 13. Open Questions (confirm before/along the way)

1. Route path for the board - **resolved: `/board`**.
2. Tailwind - **resolved: pinned to v3.4 stable**.
3. add-column, undo/redo, import/export in v1 - **resolved: all included in v1** (done).
4. Rename `kanban-board` → `driftboard` - **resolved: package renamed to `driftboard`, favicon + `index.html` rebranded**. (The repo *folder* is still `kanban-board`; rename that + the git remote whenever convenient.)
5. Landing "live board preview" - **resolved: static styled snapshot for v1** (a real mini-instance can be a fast-follow).
