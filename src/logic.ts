import { commandStream$ } from "./commandStream";

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

export const Commands = [
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
] as const;
export type Command = (typeof Commands)[number];

commandStream$.subscribe((event) => console.log(event));
