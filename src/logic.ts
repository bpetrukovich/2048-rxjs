import { distinctUntilChanged, scan, startWith, type Observable } from "rxjs";

export const CELLS = 4;

export type Board = Cell[][];

export type Cell = CellWithValue | null;

export type CellWithValue = {
  value: number;
};

export type Indexes = {
  x: number;
  y: number;
};

type Event =
  | {
      type: "merge";
      source: Indexes;
      target: Indexes;
    }
  | {
      type: "move";
      from: Indexes;
      to: Indexes;
    }
  | {
      type: "add";
      indexes: Indexes;
    }
  | null;

export function cellIsEmpty(cell: Cell): cell is null {
  return cell === null;
}

export function createBoard(cells: number): Board {
  let board = Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => null as Cell),
  );

  board = generateRandomCell(board).board;
  board = generateRandomCell(board).board;
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

export type CommandResult = {
  prevBoard: Board;
  board: Board;
  events: Event[][];
};

export function handleCommand(command: Command, board: Board): CommandResult {
  const trajectory = commandToTrajectoryForCells(command);
  const ti = commandToTrajectoryForIteration(command);

  let newBoard = board;
  const prevBoard = board;

  let events = initEvents(board);

  const size = board.length;

  for (let i = ti.initI(size); ti.predicateI(size, i); i += ti.y) {
    for (let j = ti.initJ(size); ti.predicateJ(size, j); j += ti.x) {
      const res = moveCell(newBoard, trajectory, { x: j, y: i });
      newBoard = res[0];
      events[i][j] = res[1];
    }
  }

  console.log(events);

  if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
    const res = generateRandomCell(newBoard);
    newBoard = res.board;
    const newIndexes = res.newIndexes;
    if (newIndexes) {
      events[newIndexes.y][newIndexes.x] = {
        type: "add",
        indexes: newIndexes,
      };
    }

    return { board: newBoard, events, prevBoard };
  }

  return { board: newBoard, events, prevBoard };
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

function boardSetCell(board: Board, { x, y }: Indexes, value: number): Board {
  return board.map((row, i) =>
    row.map((cell, j) => (i === y && j === x ? { value } : cell)),
  );
}

function boardClearCell(board: Board, { x, y }: Indexes): Board {
  return board.map((row, i) =>
    row.map((cell, j) => (i === y && j === x ? null : cell)),
  );
}

function isIndexesEqual(a: Indexes, b: Indexes) {
  return a.x === b.x && a.y === b.y;
}

function moveCell(
  board: Board,
  trajectory: Trajectory,
  indexes: Indexes,
): [Board, Event | null] {
  const initialIndexes = indexes;

  const cell = boardGetCell(board, indexes);
  if (cellIsEmpty(cell)) {
    return [board, null];
  }

  while (true) {
    const nextIndexes = {
      x: indexes.x + trajectory.x,
      y: indexes.y + trajectory.y,
    };
    if (!checkBoundaries(board, nextIndexes)) {
      return [board, { type: "move", from: initialIndexes, to: indexes }];
    }

    const nextCell = boardGetCell(board, nextIndexes);

    if (cellIsEmpty(nextCell)) {
      board = boardSetCell(board, nextIndexes, cell.value);
      board = boardClearCell(board, indexes);

      indexes = nextIndexes;

      continue;
    }

    if (cell.value === nextCell.value) {
      board = boardSetCell(board, nextIndexes, nextCell.value + cell.value);
      board = boardClearCell(board, indexes);

      return [
        board,
        { type: "merge", source: initialIndexes, target: nextIndexes },
      ];
    }

    return [board, { type: "move", from: initialIndexes, to: indexes }];
  }
}

function initEvents(board: Board): Event[][] {
  return Array.from({ length: board.length }, () =>
    Array.from({ length: board[0].length }, () => null),
  );
}

export function boardGetCell(board: Board, { x, y }: Indexes): Cell {
  if (!checkBoundaries(board, { x, y })) {
    throw new Error("Out of bounds");
  }
  return board[y][x];
}

function checkBoundaries(board: Board, { x, y }: Indexes) {
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

export function generateRandomCell(board: Board): {
  board: Board;
  newIndexes: Indexes | null;
} {
  if (!board.flat().some((cell) => cell === null)) {
    return { board, newIndexes: null };
  }

  let randomIndexes: Indexes;
  do {
    const randomY = Math.floor(Math.random() * board.length);
    const randomX = Math.floor(Math.random() * board[0].length);
    randomIndexes = { x: randomX, y: randomY };
  } while (boardGetCell(board, randomIndexes) !== null);

  return {
    board: boardSetCell(board, randomIndexes, 2),
    newIndexes: randomIndexes,
  };
}

export function game(
  commandStream$: Observable<Command>,
): Observable<CommandResult> {
  const initialBoard = createBoard(CELLS);
  return commandStream$.pipe(
    scan((prev, command) => handleCommand(command, prev.board), {
      board: initialBoard,
      prevBoard: initialBoard,
      events: initEvents(initialBoard),
    }),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev.board) === JSON.stringify(curr.board),
    ),
    startWith({
      board: initialBoard,
      prevBoard: initialBoard,
      events: initEvents(initialBoard),
    }),
  );
}
