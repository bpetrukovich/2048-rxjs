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

export type MergeEvent = {
  type: "merge";
  source: Indexes;
  target: Indexes;
};

export type MoveEvent = {
  type: "move";
  from: Indexes;
  to: Indexes;
};

export type AddEvent = {
  type: "add";
  indexes: Indexes;
};

export type Event = MergeEvent | MoveEvent | AddEvent;

export function cellIsEmpty(cell: Cell): cell is null {
  return cell === null;
}

export function createInitialState(cells: number): GameState {
  const prevBoard = createInitialBoard(cells);
  let events = createInitialEvents(prevBoard);

  let res = generateRandomCell({ board: prevBoard, events });
  res = generateRandomCell({ board: res.board, events: res.events });

  return { board: res.board, prevBoard, events: res.events };
}

function createInitialBoard(cells: number): Board {
  return Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => null as Cell),
  );
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

export type Events = (Event | null)[][];

function setEvent(
  events: Events,
  indexes: Indexes,
  event: Event | null,
): Events {
  return events.map((row, i) =>
    row.map((cell, j) => (i === indexes.y && j === indexes.x ? event : cell)),
  );
}

export type GameState = {
  prevBoard: Board;
  board: Board;
  events: Events;
};

export function handleCommand(command: Command, board: Board): GameState {
  const trajectory = commandToTrajectoryForCells(command);
  const ti = commandToTrajectoryForIteration(command);

  let newBoard = board;
  const prevBoard = board;

  let events = createInitialEvents(board);

  const size = board.length;

  for (let i = ti.initI(size); ti.predicateI(size, i); i += ti.y) {
    for (let j = ti.initJ(size); ti.predicateJ(size, j); j += ti.x) {
      const res = moveCell(newBoard, trajectory, { x: j, y: i });
      newBoard = res[0];
      events = setEvent(events, { x: j, y: i }, res[1]);
    }
  }

  if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
    const res = generateRandomCell({ board: newBoard, events });

    return { board: res.board, events: res.events, prevBoard };
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

function createInitialEvents(board: Board): Events {
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

export function getEvent(events: Events, indexes: Indexes): Event | null {
  return events[indexes.y][indexes.x];
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

export function generateRandomCell({
  board,
  events,
}: {
  board: Board;
  events: Events;
}): {
  board: Board;
  events: Events;
} {
  if (!board.flat().some((cell) => cell === null)) {
    return { board, events };
  }

  let randomIndexes: Indexes;
  do {
    const randomY = Math.floor(Math.random() * board.length);
    const randomX = Math.floor(Math.random() * board[0].length);
    randomIndexes = { x: randomX, y: randomY };
  } while (boardGetCell(board, randomIndexes) !== null);

  return {
    board: boardSetCell(board, randomIndexes, 2),
    events: setEvent(events, randomIndexes, {
      type: "add",
      indexes: randomIndexes,
    }),
  };
}

export function game(
  commandStream$: Observable<Command>,
): Observable<GameState> {
  const initialState = createInitialState(CELLS);
  return commandStream$.pipe(
    scan((prev, command) => handleCommand(command, prev.board), initialState),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev.board) === JSON.stringify(curr.board),
    ),
    startWith(initialState),
  );
}
