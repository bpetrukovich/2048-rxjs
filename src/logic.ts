import { distinctUntilChanged, scan, startWith, type Observable } from "rxjs";

export const CELLS = 4;

export type Board = Cell[][];

export type Cell = CellWithValue | null;

export type CellWithValue = {
  value: number;
};

export function cellIsEmpty(cell: Cell): cell is null {
  return cell === null;
}

export function createBoard(cells: number): Board {
  let board = Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => null as Cell),
  );

  board = generateRandomCell(board);
  board = generateRandomCell(board);
  return board;
}

export const Commands = [
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
] as const;
export type Command = (typeof Commands)[number];

type Trajectory = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

type TrajectoryForIteration = {
  x: -1 | 1;
  y: -1 | 1;
  initI: (size: number) => number;
  initJ: (size: number) => number;
  predicateI: (size: number, i: number) => boolean;
  predicateJ: (size: number, j: number) => boolean;
};

export function handleCommand(command: Command, board: Board): Board {
  const trajectory = commandToTrajectoryForCells(command);
  const ti = commandToTrajectoryForIteration(command);

  let newBoard = board;

  const size = board.length;

  for (let i = ti.initI(size); ti.predicateI(size, i); i += ti.y) {
    for (let j = ti.initJ(size); ti.predicateJ(size, j); j += ti.x) {
      newBoard = moveCell(newBoard, trajectory, j, i);
    }
  }

  if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
    return generateRandomCell(newBoard);
  }

  return newBoard;
}

function commandToTrajectoryForIteration(
  command: Command,
): TrajectoryForIteration {
  switch (command) {
    case "ArrowLeft":
      return {
        x: 1,
        y: 1,
        initI: (_size) => 0,
        initJ: (_size) => 0,
        predicateI: (size, i) => i < size,
        predicateJ: (size, j) => j < size,
      };
    case "ArrowUp":
      return {
        x: 1,
        y: 1,
        initI: (_size) => 0,
        initJ: (_size) => 0,
        predicateI: (size, i) => i < size,
        predicateJ: (size, j) => j < size,
      };
    case "ArrowRight":
      return {
        x: -1,
        y: 1,
        initI: (_size) => 0,
        initJ: (size) => size - 1,
        predicateI: (size, i) => i < size,
        predicateJ: (_size, j) => j >= 0,
      };
    case "ArrowDown":
      return {
        x: 1,
        y: -1,
        initI: (size) => size - 1,
        initJ: (_size) => 0,
        predicateI: (_size, i) => i >= 0,
        predicateJ: (size, j) => j < size,
      };
  }
}

function boardSetCell(
  board: Board,
  x: number,
  y: number,
  value: number,
): Board {
  return board.map((row, i) =>
    row.map((cell, j) => (i === y && j === x ? { value } : cell)),
  );
}

function boardClearCell(board: Board, x: number, y: number): Board {
  return board.map((row, i) =>
    row.map((cell, j) => (i === y && j === x ? null : cell)),
  );
}

function moveCell(
  board: Board,
  trajectory: Trajectory,
  x: number,
  y: number,
): Board {
  const cell = board[y][x];
  if (cellIsEmpty(cell)) {
    return board;
  }

  while (true) {
    const nextX = x + trajectory.x;
    const nextY = y + trajectory.y;
    if (!checkBoundaries(board, nextX, nextY)) {
      return board;
    }

    const nextCell = board[nextY][nextX];

    if (cellIsEmpty(nextCell)) {
      board = boardSetCell(board, nextX, nextY, cell.value);
      board = boardClearCell(board, x, y);

      x = nextX;
      y = nextY;

      continue;
    }

    if (cell.value === nextCell.value) {
      board = boardSetCell(board, nextX, nextY, nextCell.value + cell.value);
      board = boardClearCell(board, x, y);

      return board;
    }

    return board;
  }
}

function checkBoundaries(board: Board, x: number, y: number) {
  if (x < 0 || x >= board[0].length || y < 0 || y >= board.length) {
    return false;
  }
  return true;
}

function commandToTrajectoryForCells(command: Command): Trajectory {
  switch (command) {
    case "ArrowLeft":
      return {
        x: -1,
        y: 0,
      };
    case "ArrowUp":
      return {
        x: 0,
        y: -1,
      };
    case "ArrowRight":
      return {
        x: 1,
        y: 0,
      };
    case "ArrowDown":
      return {
        x: 0,
        y: 1,
      };
  }
}

export function generateRandomCell(board: Board): Board {
  if (!board.flat().some((cell) => cell === null)) {
    return board;
  }

  let randomY: number;
  let randomX: number;
  do {
    randomY = Math.floor(Math.random() * board.length);
    randomX = Math.floor(Math.random() * board[0].length);
  } while (board[randomY][randomX] !== null);

  return boardSetCell(board, randomX, randomY, 2);
}

export function game(commandStream$: Observable<Command>): Observable<Board> {
  const initialBoard = createBoard(CELLS);
  return commandStream$.pipe(
    scan((board, command) => handleCommand(command, board), initialBoard),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    startWith(initialBoard),
  );
}
