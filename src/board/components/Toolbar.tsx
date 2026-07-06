import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpDown, Check, Eye, LayoutList, SlidersHorizontal, Trash2 } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { useUiStore, type SortMode } from "../store/uiStore";
import { labelStyle } from "../tokens";
import { QuickFilters } from "./QuickFilters";
import { JsonMenu } from "./JsonMenu";
import { cn } from "@/lib/utils";

const SORTS: { value: SortMode; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "priority", label: "Priority" },
  { value: "due", label: "Due date" },
  { value: "title", label: "Title" },
];

const menuClass =
  "z-50 min-w-[180px] rounded-[12px] border border-line bg-surface p-1 shadow-lg data-[state=open]:animate-scale-in";
const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-[7px] text-[13px] text-ink outline-none data-[highlighted]:bg-surface-2";

/** Secondary toolbar: quick filters plus focus/density/sort/filter controls. */
export function Toolbar() {
  const labels = useBoardStore(state => state.board.labels);

  const focus = useUiStore(state => state.focus);
  const toggleFocus = useUiStore(state => state.toggleFocus);
  const density = useUiStore(state => state.density);
  const toggleDensity = useUiStore(state => state.toggleDensity);
  const sort = useUiStore(state => state.sort);
  const setSort = useUiStore(state => state.setSort);
  const labelFilter = useUiStore(state => state.labelFilter);
  const toggleLabelFilter = useUiStore(state => state.toggleLabelFilter);
  const clearLabelFilter = useUiStore(state => state.clearLabelFilter);
  const setConfirmClearOpen = useUiStore(state => state.setConfirmClearOpen);

  const controlClass =
    "flex h-8 items-center gap-[6px] rounded-[9px] border border-line bg-surface px-3 text-[12.5px] font-semibold text-muted transition hover:text-ink";

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line px-[18px] py-[10px]">
      <QuickFilters />

      <div className="flex-1" />

      <span className="flex items-center gap-[6px] text-[12px] font-medium text-faint">
        <Check className="h-[14px] w-[14px] text-primary" />
        Saved locally
      </span>

      <button
        className={cn(
          "flex h-8 items-center gap-[6px] rounded-[9px] border px-3 text-[12.5px] font-semibold transition",
          focus ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"
        )}
        type="button"
        onClick={toggleFocus}
      >
        <Eye className="h-[14px] w-[14px]" />
        Focus mode
      </button>

      <button className={controlClass} title="Toggle density" type="button" onClick={toggleDensity}>
        <LayoutList className="h-[14px] w-[14px]" />
        {density === "compact" ? "Compact" : "Comfortable"}
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className={cn(controlClass, sort !== "manual" && "border-primary text-primary-ink")}
            type="button"
          >
            <ArrowUpDown className="h-[14px] w-[14px]" />
            Sort
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" className={menuClass} sideOffset={6}>
            {SORTS.map(option => (
              <DropdownMenu.Item
                key={option.value}
                className={itemClass}
                onSelect={() => setSort(option.value)}
              >
                <Check
                  className={cn("h-[14px] w-[14px]", sort === option.value ? "opacity-100" : "opacity-0")}
                />
                {option.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className={cn(controlClass, labelFilter.length > 0 && "border-primary text-primary-ink")}
            type="button"
          >
            <SlidersHorizontal className="h-[14px] w-[14px]" />
            Filter
            {labelFilter.length > 0 && (
              <span className="rounded-full bg-primary px-[6px] text-[10px] font-bold text-white">
                {labelFilter.length}
              </span>
            )}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" className={menuClass} sideOffset={6}>
            {labels.map(label => {
              const active = labelFilter.includes(label.id);
              const style = labelStyle(label.color);

              return (
                <DropdownMenu.CheckboxItem
                  key={label.id}
                  checked={active}
                  className={itemClass}
                  onSelect={event => {
                    event.preventDefault();
                    toggleLabelFilter(label.id);
                  }}
                >
                  <span className="h-[10px] w-[10px] rounded-[3px]" style={{ background: style.color }} />
                  {label.name}
                  <Check className={cn("ml-auto h-[14px] w-[14px]", active ? "opacity-100" : "opacity-0")} />
                </DropdownMenu.CheckboxItem>
              );
            })}
            {labelFilter.length > 0 && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-line" />
                <DropdownMenu.Item className={itemClass} onSelect={clearLabelFilter}>
                  Clear filters
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <JsonMenu />

      <button
        className="flex h-8 items-center gap-[6px] rounded-[9px] border border-line bg-surface px-3 text-[12.5px] font-semibold text-muted transition hover:border-secondary/40 hover:text-secondary"
        title="Clear board"
        type="button"
        onClick={() => setConfirmClearOpen(true)}
      >
        <Trash2 className="h-[14px] w-[14px]" />
        Clear
      </button>
    </div>
  );
}
