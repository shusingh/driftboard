export type Priority = "high" | "med" | "low";
export type DueState = "today" | "soon" | "later" | "done";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Due {
  date: string;
  state: DueState;
}

export interface CardType {
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
  content?: string;
}

export interface ColumnType {
  id: string;
  title: string;
  position: number;
  dot?: string;
  collapsed?: boolean;
  cards: CardType[];
}

export interface BoardType {
  schemaVersion: 1;
  id: string;
  title: string;
  columns: ColumnType[];
  labels: Label[];
}
