export type Indexes = {
  x: number;
  y: number;
};

export type Board = Cell[][];

export type Cell = CellWithValue | null;

export type CellWithValue = {
  value: number;
};

export function cellIsEmpty(cell: Cell): cell is null {
  return cell === null;
}

export function createInitialBoard(cells: number): Board {
  return Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => null as Cell),
  );
}

export function boardSetCell(
  board: Board,
  { x, y }: Indexes,
  value: number,
): { board: Board; newCell: CellWithValue } {
  return {
    board: board.map((row, i) =>
      row.map((cell, j) => (i === y && j === x ? { value } : cell)),
    ),
    newCell: { value },
  };
}

export function boardClearCell(board: Board, { x, y }: Indexes): Board {
  return board.map((row, i) =>
    row.map((cell, j) => (i === y && j === x ? null : cell)),
  );
}

export function checkBoundaries(board: Board, { x, y }: Indexes) {
  if (x < 0 || x >= board[0].length || y < 0 || y >= board.length) {
    return false;
  }
  return true;
}

export function boardGetCell(board: Board, { x, y }: Indexes): Cell {
  if (!checkBoundaries(board, { x, y })) {
    throw new Error("Out of bounds");
  }
  return board[y][x];
}
