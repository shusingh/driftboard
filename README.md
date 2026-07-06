# Driftboard

A fast, **local-first** personal Kanban board. No signup, private by default, works offline. Your board lives entirely in your browser and never leaves your device.

🌐 **Live:** [kanban-board-fawn-phi.vercel.app](https://kanban-board-fawn-phi.vercel.app)

Built with React, TypeScript, Vite, Tailwind, dnd-kit, and Zustand.

## Features

- **Fluid drag & drop** - reorder cards within a column and move them across columns, plus drag to reorder columns (dnd-kit, with a lifted drag preview)
- **Rich cards** - priority, colour-coded labels, due-date badges, checklist progress, notes, and an accent rail
- **Card detail panel** - edit title, description, priority, due date, labels, checklist/subtasks, and move-to column
- **Command palette (⌘K)** - new task, theme, focus, density, undo/redo, export/import, clear
- **Keyboard shortcuts** - `⌘K`, `/` (search), `N`, `T`, `F`, `D`, `⌘Z` / `⇧⌘Z`
- **Search, quick filters & sort** - filter by today / overdue / high priority / label; sort by priority, due, or title
- **Focus mode** - dim everything but active work
- **Light / dark themes** and **comfortable / compact** density
- **Undo / redo** history and **import / export** to JSON (zod-validated)
- **Local persistence** - auto-saved to `localStorage`

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS with a token-driven design system (warm-paper palette, Bricolage Grotesque)
- [dnd-kit](https://dndkit.com/) for drag and drop
- [Zustand](https://github.com/pmndrs/zustand) + [zundo](https://github.com/charkour/zundo) for state and undo/redo
- Radix UI primitives + [cmdk](https://cmdk.paco.me/) for the palette
- [zod](https://zod.dev/) for import validation
- React Router

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` for the landing page, or `http://localhost:5173/board` for the board.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - type-check and build for production (`dist/`)
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint (zero-warning policy)

## Project Structure

```
src/
├── board/         # Board screen
│   ├── components/ # Topbar, Toolbar, Board, Column, Card, dnd wrappers
│   ├── panel/      # Card detail side-panel
│   ├── palette/    # ⌘K command palette
│   └── store/      # Zustand board + ui stores, migrations
├── landing/       # Marketing landing page
├── lib/           # utils, date helpers, JSON I/O, zod schema
├── data/          # Seed board
├── types/         # Type definitions
└── styles/        # Global styles + design tokens
```

## Deployment

Deploys as a static Vite build on **Vercel** (`npm run build` → `dist`). `vercel.json` rewrites all routes to `index.html` for client-side routing.

## License

MIT - see [LICENSE](LICENSE).
