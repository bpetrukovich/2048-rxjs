import { filter, fromEvent, map, type Observable } from "rxjs";

export const CELLS = 4;

export type Board = Cell[][];

export type Cell = CellWithValue | EmptyCell;

export type EmptyCell = {};

export type CellWithValue = {
  value: number;
};

export function createBoard(): Board {
  const board = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ({})),
  );

  board[0][0] = { value: 2 };
  return board;
}

const Commands = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"] as const;
type Command = (typeof Commands)[number];

const clicks$: Observable<Command> = fromEvent<KeyboardEvent>(
  document,
  "keydown",
).pipe(
  map((e) => e.key as Command),
  filter((key) => Commands.includes(key)),
);

clicks$.subscribe((event) => console.log(event));
