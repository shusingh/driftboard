import type { DueState, Priority } from "@/types/board";

/** Convert a #rrggbb hex to an rgba() string at the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map(ch => ch + ch)
          .join("")
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const priorityStyles: Record<Priority, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "#D8443A", bg: "rgba(216,68,58,.13)" },
  med: { label: "Medium", color: "#C07615", bg: "rgba(192,118,21,.15)" },
  low: { label: "Low", color: "#3F8A66", bg: "rgba(63,138,102,.14)" },
};

export const dueStyles: Record<DueState, { color: string; bg: string }> = {
  today: { color: "#D8443A", bg: "rgba(216,68,58,.13)" },
  soon: { color: "#C07615", bg: "rgba(192,118,21,.14)" },
  later: { color: "var(--muted)", bg: "var(--surface-2)" },
  done: { color: "#3F8A66", bg: "rgba(63,138,102,.14)" },
};

/** Label chip color + soft background tint derived from its base color. */
export function labelStyle(color: string): { color: string; bg: string } {
  return { color, bg: hexToRgba(color, 0.13) };
}
