import { animationFrames, endWith, map, Observable, takeWhile } from "rxjs";
import {
  boardGetCell,
  cellIsEmpty,
  CELLS,
  getEvent,
  type AddEvent,
  type Board,
  type CellWithValue,
  type GameState,
  type Indexes,
  type MergeEvent,
  type MoveEvent,
} from "./logic";

const CELL_SIZE = 100;
const GAP = 10;
export const BOARD_SIZE = CELL_SIZE * CELLS + GAP * (CELLS + 1);

export const COLORS = {
  BG: "#9c8b7c",
  BG_EMPTY: "#bdac97",
  BG_FILLED: "#eee4da",
  TEXT: "#756452",
};

type Coordinates = {
  x: number;
  y: number;
};

export function animationProgress(): Observable<number> {
  const easeInOutQuad = (t: number) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const duration = 200;

  return animationFrames().pipe(
    map(({ elapsed }) => elapsed / duration),
    takeWhile((t) => t < 1),
    map((t) => easeInOutQuad(t)),
    endWith(1),
  );
}

export function renderBoard(
  state: GameState,
  progress: number,
  ctx: CanvasRenderingContext2D,
) {
  const board = state.prevBoard;
  const newBoard = state.board;
  const events = state.events;
  cleanBoard(board, ctx);

  const moveEvents: { event: MoveEvent; indexes: Indexes }[] = [];
  const addEvents: { event: AddEvent; indexes: Indexes }[] = [];
  const mergeEvents: { event: MergeEvent; indexes: Indexes }[] = [];

  for (let y = 0; y < CELLS; y++) {
    for (let x = 0; x < CELLS; x++) {
      const event = getEvent(events, { x, y });
      if (event) {
        switch (event.type) {
          case "merge":
            mergeEvents.push({ event, indexes: { x, y } });
            break;
          case "move":
            moveEvents.push({ event, indexes: { x, y } });
            break;
          case "add":
            addEvents.push({ event, indexes: { x, y } });
            break;
        }
      }
    }
  }

  moveEvents.forEach(({ event }) => {
    const { from, to } = event;
    const cell = boardGetCell(board, from);
    const coordinates = getCoordinates(from, to, progress, CELL_SIZE, GAP);
    if (!cellIsEmpty(cell)) {
      renderCell(cell, coordinates, ctx, CELL_SIZE);
    }
  });
  addEvents.forEach(({ event }) => {
    const { indexes } = event;
    let newCell = boardGetCell(newBoard, indexes);
    const coordinates = calculateCellCoordinates(indexes, CELL_SIZE, GAP);
    if (!cellIsEmpty(newCell)) {
      appearCell(newCell, coordinates, progress, ctx, CELL_SIZE);
    }
  });
  mergeEvents.forEach(({ event }) => {
    const { target, source } = event;

    const cell = boardGetCell(board, source);
    let newCell = boardGetCell(newBoard, target);

    newCell = newBoard[target.y][target.x];
    const coordinates = getCoordinates(
      source,
      target,
      progress,
      CELL_SIZE,
      GAP,
    );

    const newCoordinates = calculateCellCoordinates(target, CELL_SIZE, GAP);
    if (!cellIsEmpty(cell)) {
      renderCell(cell, coordinates, ctx, CELL_SIZE);
    }

    if (!cellIsEmpty(newCell)) {
      appearCell(newCell, newCoordinates, progress, ctx, CELL_SIZE);
    }
  });
}

function getCoordinates(
  from: Indexes,
  to: Indexes,
  progress: number,
  cellSize: number,
  gap: number,
) {
  const fromCoordinates = calculateCellCoordinates(from, cellSize, gap);
  const toCoordinates = calculateCellCoordinates(to, cellSize, gap);

  const x =
    fromCoordinates.x + (toCoordinates.x - fromCoordinates.x) * progress;
  const y =
    fromCoordinates.y + (toCoordinates.y - fromCoordinates.y) * progress;

  return { x, y };
}

export function renderBoardDepr(board: Board, ctx: CanvasRenderingContext2D) {
  cleanBoard(board, ctx);

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const coordinates = calculateCellCoordinates({ x, y }, CELL_SIZE, GAP);
      if (!cellIsEmpty(cell)) {
        renderCell(cell, coordinates, ctx, CELL_SIZE);
      }
    });
  });
}

export function cleanBoard(board: Board, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  board.forEach((row, y) => {
    row.forEach((_, x) => {
      const coordinates = calculateCellCoordinates({ x, y }, CELL_SIZE, GAP);
      renderEmptyCell(coordinates, ctx, CELL_SIZE);
    });
  });
}

function calculateCellCoordinates(
  { x, y }: Indexes,
  cellSize: number,
  gap: number,
): Coordinates {
  return {
    x: x * (cellSize + gap) + gap,
    y: y * (cellSize + gap) + gap,
  };
}

function appearCell(
  cell: CellWithValue,
  coordinates: Coordinates,
  progress: number,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = COLORS.BG_FILLED;
  fillRectFromCenter(
    ctx,
    coordinates.x + cellSize / 2,
    coordinates.y + cellSize / 2,
    cellSize * progress,
    cellSize * progress,
  );

  ctx.fillStyle = COLORS.TEXT;
  ctx.font = `bold ${(cellSize / 2.5) * progress}px Tahoma`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    cell.value.toString(),
    coordinates.x + cellSize / 2,
    coordinates.y + cellSize / 2 + cellSize / 30,
  );
}

function renderCell(
  cell: CellWithValue,
  coordinates: Coordinates,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = COLORS.BG_FILLED;
  ctx.fillRect(coordinates.x, coordinates.y, cellSize, cellSize);

  ctx.fillStyle = COLORS.TEXT;
  ctx.font = `bold ${cellSize / 2.5}px Tahoma`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    cell.value.toString(),
    coordinates.x + cellSize / 2,
    coordinates.y + cellSize / 2 + cellSize / 30,
  );
}
function fillRectFromCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
) {
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
}

function renderEmptyCell(
  coordinates: Coordinates,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = COLORS.BG_EMPTY;
  ctx.fillRect(coordinates.x, coordinates.y, cellSize, cellSize);
}
