import type { Due, DueState } from "@/types/board";
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

/** Derive a due-state bucket from a date relative to today. */
export function dueStateFor(dateISO: string, done = false): DueState {
  if (done) return "done";

  const date = parseISO(dateISO);

  if (!isValid(date)) return "later";

  const diff = differenceInCalendarDays(date, new Date());

  if (diff <= 0) return "today";
  if (diff <= 3) return "soon";

  return "later";
}

/** Short badge text, e.g. "Today", "Wed", "Jul 20". */
export function dueBadgeText(due: Due): string {
  const date = parseISO(due.date);

  if (!isValid(date)) return "No date";

  const diff = differenceInCalendarDays(date, new Date());

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 6) return format(date, "EEE");

  return format(date, "MMM d");
}

/** Long label used in the detail panel, e.g. "Wed, Jul 8". */
export function dueLongText(due: Due): string {
  const date = parseISO(due.date);

  if (!isValid(date)) return "No date set";

  return format(date, "EEE, MMM d");
}
