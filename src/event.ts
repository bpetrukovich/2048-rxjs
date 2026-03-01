import type { CellWithValue, Indexes } from "./board";

export type MoveEvent = {
  type: "move";
  from: Indexes;
  to: Indexes;
  cell: CellWithValue;
};

export type AddEvent = {
  type: "add";
  indexes: Indexes;
  cell: CellWithValue;
};

export type GameEvent = MoveEvent | AddEvent;

export function addEvents(
  events: GameEvent[],
  newEvents: GameEvent[],
): GameEvent[] {
  return [...events, ...newEvents];
}
