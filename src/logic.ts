import { distinctUntilChanged, scan, startWith, type Observable } from "rxjs";
import {
  boardClearCell,
  boardGetCell,
  boardSetCell,
  cellIsEmpty,
  checkBoundaries,
  createInitialBoard,
  type Board,
  type Indexes,
} from "./board";
import { addEvents, type GameEvent } from "./event";

export const CELLS = 4;

export function createInitialState(cells: number): GameState {
  const board = createInitialBoard(cells);
  let events: GameEvent[] = [];

  let res = generateRandomCell({ board, events });
  res = generateRandomCell({ board: res.board, events: res.events });

  return { board: res.board, events: res.events };
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

export type GameState = {
  board: Board;
  events: GameEvent[];
};

export function handleCommand(command: Command, board: Board): GameState {
  const trajectory = commandToTrajectoryForCells(command);
  const ti = commandToTrajectoryForIteration(command);

  let newBoard = board;

  let events: GameEvent[] = [];

  const size = board.length;

  for (let i = ti.initI(size); ti.predicateI(size, i); i += ti.y) {
    for (let j = ti.initJ(size); ti.predicateJ(size, j); j += ti.x) {
      const res = moveCell(newBoard, trajectory, { x: j, y: i });
      newBoard = res[0];
      if (res[1]) {
        events = addEvents(events, res[1]);
      }
    }
  }

  if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
    const res = generateRandomCell({ board: newBoard, events });

    return { board: res.board, events: res.events };
  }

  return { board: newBoard, events };
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

function moveCell(
  board: Board,
  trajectory: Trajectory,
  indexes: Indexes,
): [Board, GameEvent[]] {
  const initialIndexes = indexes;

  const cell = boardGetCell(board, indexes);
  if (cellIsEmpty(cell)) {
    return [board, []];
  }

  while (true) {
    const nextIndexes = {
      x: indexes.x + trajectory.x,
      y: indexes.y + trajectory.y,
    };
    if (!checkBoundaries(board, nextIndexes)) {
      return [
        board,
        [
          {
            type: "move",
            from: initialIndexes,
            to: indexes,
            cell,
          },
        ],
      ];
    }

    const nextCell = boardGetCell(board, nextIndexes);

    if (cellIsEmpty(nextCell)) {
      board = boardClearCell(board, indexes);
      board = boardSetCell(board, nextIndexes, cell.value).board;

      indexes = nextIndexes;

      continue;
    }

    if (cell.value === nextCell.value) {
      const res = boardSetCell(board, nextIndexes, nextCell.value + cell.value);
      board = boardClearCell(res.board, indexes);

      return [
        board,
        [
          { type: "move", from: initialIndexes, to: nextIndexes, cell },
          {
            type: "add",
            cell: res.newCell,
            indexes: nextIndexes,
          },
        ],
      ];
    }

    return [board, [{ type: "move", from: initialIndexes, to: indexes, cell }]];
  }
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
  events: GameEvent[];
}): {
  board: Board;
  events: GameEvent[];
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

  const res = boardSetCell(board, randomIndexes, 2);

  return {
    board: res.board,
    events: addEvents(events, [
      {
        type: "add",
        indexes: randomIndexes,
        cell: res.newCell,
      },
    ]),
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
