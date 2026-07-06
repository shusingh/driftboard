import { z } from "zod";

/**
 * Zod schemas mirroring src/types/board.ts. Used to validate boards coming in
 * from JSON import (the one untrusted boundary in a local-first app).
 */
export const prioritySchema = z.enum(["high", "med", "low"]);
export const dueStateSchema = z.enum(["today", "soon", "later", "done"]);

export const labelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
});

export const dueSchema = z.object({
  date: z.string(),
  state: dueStateSchema,
});

export const cardSchema = z.object({
  id: z.string(),
  columnId: z.string(),
  position: z.number(),
  title: z.string(),
  description: z.string().optional(),
  accent: z.string().optional(),
  priority: prioritySchema.optional(),
  labelIds: z.array(z.string()).default([]),
  due: dueSchema.optional(),
  checklist: z.array(checklistItemSchema).default([]),
  notes: z.string().optional(),
  done: z.boolean().optional(),
  content: z.string().optional(),
});

export const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  dot: z.string().optional(),
  collapsed: z.boolean().optional(),
  cards: z.array(cardSchema),
});

export const boardSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  title: z.string(),
  columns: z.array(columnSchema),
  labels: z.array(labelSchema),
});

export type BoardInput = z.infer<typeof boardSchema>;
