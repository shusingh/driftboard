import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Command,
  Eye,
  FileJson,
  Filter,
  Github,
  Globe,
  Linkedin,
  Moon,
  MousePointerClick,
  Plus,
  Sun,
  Tag,
  Wifi,
  Zap,
} from "lucide-react";
import { Logo } from "@/board/components/Logo";
import { useUiStore } from "@/board/store/uiStore";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Fluid drag & drop",
    body: "Grab any card and move it between columns with buttery, physics-aware motion. Reordering just feels right.",
  },
  {
    icon: Zap,
    title: "Local persistence",
    body: "Your board saves itself to this device as you type. Close the tab, come back tomorrow, it's exactly as you left it.",
  },
  {
    icon: Plus,
    title: "Quick add",
    body: "Capture a task the instant it lands. One keystroke opens an inline field at the top of any column.",
  },
  {
    icon: Filter,
    title: "Search & filters",
    body: "Narrow to today, overdue, or high-priority in a tap. Search spans every card, label, and note.",
  },
  {
    icon: Tag,
    title: "Labels & priority",
    body: "Color-coded tags and priority badges give every card instant context. Scan the whole board at a glance.",
  },
  {
    icon: CalendarCheck,
    title: "Due dates & checklists",
    body: "Break work into subtasks and watch progress fill in. Relative due badges nudge you before things slip.",
  },
  {
    icon: Command,
    title: "Keyboard shortcuts",
    body: "A full command palette at ⌘K: new task, theme, focus, export, all without the mouse.",
  },
  {
    icon: Eye,
    title: "Focus mode",
    body: "Dim everything but active work. One toggle strips the board down to what deserves your attention right now.",
  },
  {
    icon: FileJson,
    title: "Export / import JSON",
    body: "Own your data. Back up the whole board to a file, move it between devices, or version it however you like.",
  },
];

const WHY = [
  { icon: Wifi, label: "Works offline" },
  { icon: Zap, label: "Lightning fast" },
  { icon: FileJson, label: "Your data, exportable" },
];

function OpenBoardButton({ subtle = false }: { subtle?: boolean }) {
  return (
    <Link
      className={
        subtle
          ? "flex h-11 items-center gap-2 rounded-[12px] border border-line bg-surface px-5 text-[14px] font-semibold text-ink transition hover:bg-surface-2"
          : "flex h-11 items-center gap-2 rounded-[12px] bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-primary-ink"
      }
      to="/board"
    >
      {subtle ? "Try the demo" : "Open board"}
      {!subtle && <ArrowRight className="h-[18px] w-[18px]" />}
    </Link>
  );
}

/** Sample board card used in the hero preview. */
function PreviewCard({
  accent,
  priority,
  title,
  label,
  labelColor,
  meta,
}: {
  accent: string;
  priority?: { text: string; color: string; bg: string };
  title: string;
  label: string;
  labelColor: string;
  meta?: string;
}) {
  return (
    <div className="relative rounded-[11px] border border-line bg-surface p-3 shadow-sm">
      <span
        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-[3px]"
        style={{ background: accent }}
      />
      <div className="flex items-start gap-2">
        {priority && (
          <span
            className="mt-[2px] rounded-md px-[6px] py-[1px] text-[10px] font-bold uppercase"
            style={{ color: priority.color, background: priority.bg }}
          >
            {priority.text}
          </span>
        )}
        <span className="flex-1 text-[12.5px] font-semibold leading-tight">{title}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="rounded-full px-2 py-[1px] text-[10.5px] font-semibold"
          style={{ color: labelColor, background: `${labelColor}22` }}
        >
          {label}
        </span>
        {meta && <span className="text-[11px] text-muted">{meta}</span>}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const theme = useUiStore(state => state.theme);
  const toggleTheme = useUiStore(state => state.toggleTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="mesh-bg min-h-full bg-bg text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-bg/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-[10px]">
          <Logo />
          <span className="font-display text-[17px] font-bold tracking-[-0.02em]">Driftboard</span>
        </div>
        <nav className="ml-4 hidden items-center gap-6 text-[13.5px] font-medium text-muted md:flex">
          <a className="transition hover:text-ink" href="#features">
            Features
          </a>
          <a className="transition hover:text-ink" href="#why">
            Why Driftboard
          </a>
        </nav>
        <div className="flex-1" />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-muted transition hover:text-ink"
          title="Toggle theme"
          type="button"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          className="flex h-9 items-center rounded-[10px] bg-primary px-4 text-[13.5px] font-semibold text-white transition hover:bg-primary-ink"
          to="/board"
        >
          Open board
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] font-semibold text-muted">
            <span className="h-[7px] w-[7px] rounded-full bg-primary" />
            Local-first · No signup · Works offline
          </span>
          <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
            A Kanban board you&apos;ll actually enjoy using.
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.6] text-muted">
            Fast, local-first planning for real work, side projects, and everyday life. Your board
            lives on your device: instant to open, private by default, delightful to use.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OpenBoardButton />
            <OpenBoardButton subtle />
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Opens instantly
            </span>
            <span className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-primary" /> Nothing leaves your device
            </span>
            <span className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" /> Works fully offline
            </span>
          </div>
        </div>

        {/* Board preview */}
        <div className="rounded-[18px] border border-line bg-surface-2/60 p-4 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-muted">
            <span className="h-2 w-2 rounded-[3px] bg-primary" />
            Personal
            <span className="ml-auto text-faint">Saved locally</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-[12px] font-semibold text-muted">This Week · 3</div>
              <PreviewCard
                accent="#2F73E0"
                label="Frontend"
                labelColor="#2F73E0"
                meta="📅 Wed · 2/5"
                priority={{ text: "High", color: "#D8443A", bg: "rgba(216,68,58,.13)" }}
                title="Refactor landing hero"
              />
              <PreviewCard
                accent="#2E9E6B"
                label="Feature"
                labelColor="#2E9E6B"
                title="Add keyboard shortcuts"
              />
            </div>
            <div className="space-y-2">
              <div className="text-[12px] font-semibold text-muted">In Progress · 1</div>
              <PreviewCard
                accent="#E0483D"
                label="Bug"
                labelColor="#E0483D"
                meta="📅 Today · 3/4"
                priority={{ text: "High", color: "#D8443A", bg: "rgba(216,68,58,.13)" }}
                title="Fix drag preview flicker"
              />
              <div className="text-[12px] font-semibold text-muted">Done · 2</div>
              <PreviewCard
                accent="#2E9E6B"
                label="Feature"
                labelColor="#2E9E6B"
                title="Ship command palette v1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="features">
        <div className="max-w-2xl">
          <h2 className="font-display text-[30px] font-bold tracking-[-0.02em]">
            Powerful where it counts. Quiet everywhere else.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-muted">
            Every feature is designed to keep you in flow: no menus to hunt through, no clutter to
            fight.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className="rounded-[16px] border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-soft text-primary-ink">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold">{feature.title}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="why">
        <div className="rounded-[22px] border border-line bg-surface p-10 text-center shadow-sm">
          <h2 className="font-display text-[28px] font-bold tracking-[-0.02em]">
            Private by default. Yours forever.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-[1.6] text-muted">
            No account, no cloud, no tracking. Driftboard runs entirely in your browser and your
            board never leaves your device.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {WHY.map(item => (
              <span
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-2 text-[13.5px] font-semibold text-muted"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </span>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <OpenBoardButton />
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-[13px] text-faint">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="flex items-center gap-2">
            <Logo size={22} />
            Driftboard
          </span>
          <span className="flex items-center gap-1.5">
            Made by
            <a
              className="font-semibold text-muted underline-offset-2 transition hover:text-ink hover:underline"
              href="https://shusingh.github.io/"
              rel="noreferrer noopener"
              target="_blank"
            >
              Shubham Singh
            </a>
          </span>
          <div className="flex items-center gap-2">
            <a
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-muted transition hover:text-ink"
              href="https://shusingh.github.io/"
              rel="noreferrer noopener"
              target="_blank"
              title="Portfolio"
            >
              <Globe className="h-[16px] w-[16px]" />
            </a>
            <a
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-muted transition hover:text-ink"
              href="https://www.linkedin.com/in/shusingh/"
              rel="noreferrer noopener"
              target="_blank"
              title="LinkedIn"
            >
              <Linkedin className="h-[16px] w-[16px]" />
            </a>
            <a
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-muted transition hover:text-ink"
              href="https://github.com/shusingh"
              rel="noreferrer noopener"
              target="_blank"
              title="GitHub"
            >
              <Github className="h-[16px] w-[16px]" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
