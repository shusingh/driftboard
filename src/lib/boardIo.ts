import type { BoardType } from "@/types/board";
import { boardSchema } from "./boardSchema";
import { migrateBoard } from "@/board/store/migrations";

/** Serialize a board to a pretty JSON string for download. */
export function serializeBoard(board: BoardType): string {
  return JSON.stringify(board, null, 2);
}

export type ImportResult =
  | { ok: true; board: BoardType }
  | { ok: false; error: string };

/**
 * Parse and validate an imported board. Runs the raw JSON through migrateBoard
 * (to coerce legacy shapes) and then validates the result with zod so a
 * malformed file can never corrupt the store.
 */
export function parseBoard(json: string): ImportResult {
  let raw: unknown;

  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  const migrated = migrateBoard(raw);
  const result = boardSchema.safeParse(migrated);

  if (!result.success) {
    const first = result.error.issues[0];

    return {
      ok: false,
      error: first ? `${first.path.join(".") || "board"}: ${first.message}` : "Board failed validation.",
    };
  }

  return { ok: true, board: result.data as BoardType };
}

/** Trigger a browser download of the board as a .json file. */
export function downloadBoard(board: BoardType, filename = "driftboard.json"): void {
  const blob = new Blob([serializeBoard(board)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
