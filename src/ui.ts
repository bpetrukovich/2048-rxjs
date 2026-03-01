import { animationFrames, endWith, map, Observable, takeWhile } from "rxjs";
import { CELLS, type GameState } from "./logic";
import type { AddEvent, MoveEvent } from "./event";
import {
  boardGetCell,
  cellIsEmpty,
  type Board,
  type CellWithValue,
  type Indexes,
} from "./board";

const CELL_SIZE = 100;
const GAP = 10;
export const BOARD_SIZE = CELL_SIZE * CELLS + GAP * (CELLS + 1);

export const COLORS: {
  BG: string;
  BG_EMPTY: string;
  VALUES: { [key: number]: { BG: string; TEXT: string } };
} = {
  BG: "#9c8b7c",
  BG_EMPTY: "#bdac97",
  VALUES: {
    2: {
      BG: "#eee4da",
      TEXT: "#756452",
    },
    4: {
      BG: "#ede0c8",
      TEXT: "#756452",
    },
    8: {
      BG: "#f2b179",
      TEXT: "#ffffff",
    },
    16: {
      BG: "#f59563",
      TEXT: "#ffffff",
    },
    32: {
      BG: "#f67c5f",
      TEXT: "#ffffff",
    },
    64: {
      BG: "#f65e3b",
      TEXT: "#ffffff",
    },
    128: {
      BG: "#edcf72",
      TEXT: "#ffffff",
    },
    256: {
      BG: "#edcc61",
      TEXT: "#ffffff",
    },
    512: {
      BG: "#edc850",
      TEXT: "#ffffff",
    },
    1024: {
      BG: "#edc53f",
      TEXT: "#ffffff",
    },
    2048: {
      BG: "#edc22e",
      TEXT: "#ffffff",
    },
  },
};

type Coordinates = {
  x: number;
  y: number;
};

export function animationProgress(): Observable<number> {
  const easeFunction = (x: number) => {
    const c4 = (2 * Math.PI) / 7.5;
    return x === 0
      ? 0
      : x === 1
        ? 1
        : Math.pow(2, -12 * x) * Math.sin((x * 10 - 1.1) * c4) + 1;
  };

  const duration = 300;

  return animationFrames().pipe(
    map(({ elapsed }) => elapsed / duration),
    takeWhile((t) => t < 1),
    map((t) => easeFunction(t)),
    endWith(1),
  );
}

export function renderBoard(
  state: GameState,
  progress: number,
  ctx: CanvasRenderingContext2D,
) {
  const board = state.board;
  const events = state.events;
  cleanBoard(board.length, ctx);

  const moveEvents: MoveEvent[] = events.filter(
    (event) => event.type === "move",
  );
  const addEvents: AddEvent[] = events.filter((event) => event.type === "add");

  moveEvents.forEach((event) => {
    const { from, to, cell } = event;
    const coordinates = getCoordinates(from, to, progress, CELL_SIZE, GAP);
    if (!cellIsEmpty(cell)) {
      renderCell(cell, coordinates, ctx, CELL_SIZE);
    }
  });
  addEvents.forEach((event) => {
    const { indexes } = event;
    let newCell = boardGetCell(board, indexes);
    const coordinates = calculateCellCenterCoordinates(indexes, CELL_SIZE, GAP);
    if (!cellIsEmpty(newCell)) {
      appearCell(newCell, coordinates, progress, ctx, CELL_SIZE);
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
  const fromCoordinates = calculateCellCenterCoordinates(from, cellSize, gap);
  const toCoordinates = calculateCellCenterCoordinates(to, cellSize, gap);

  const x =
    fromCoordinates.x + (toCoordinates.x - fromCoordinates.x) * progress;
  const y =
    fromCoordinates.y + (toCoordinates.y - fromCoordinates.y) * progress;

  return { x, y };
}

function cleanBoard(size: number, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const coordinates = calculateCellCenterCoordinates(
        { x, y },
        CELL_SIZE,
        GAP,
      );
      renderEmptyCell(coordinates, ctx, CELL_SIZE);
    }
  }
}

function renderEmptyCell(
  coordinates: Coordinates,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = COLORS.BG_EMPTY;
  fillSquareFromCenter(ctx, coordinates, cellSize);
}

function appearCell(
  cell: CellWithValue,
  coordinates: Coordinates,
  progress: number,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = getBGColor(cell.value);
  fillSquareFromCenter(ctx, coordinates, cellSize * progress);

  renderTextForCell(cell, ctx, (cellSize / 2.5) * progress, {
    x: coordinates.x,
    y: coordinates.y + cellSize / 30,
  });
}

function getBGColor(value: number): string {
  return COLORS.VALUES[value].BG;
}

function getTextColor(value: number): string {
  return COLORS.VALUES[value].TEXT;
}

function renderCell(
  cell: CellWithValue,
  coordinates: Coordinates,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = getBGColor(cell.value);
  fillSquareFromCenter(ctx, coordinates, cellSize);

  renderTextForCell(cell, ctx, cellSize / 2.5, {
    x: coordinates.x,
    y: coordinates.y + cellSize / 30,
  });
}

function renderTextForCell(
  cell: CellWithValue,
  ctx: CanvasRenderingContext2D,
  textSize: number,
  centerCoordinates: Coordinates,
) {
  ctx.fillStyle = getTextColor(cell.value);
  ctx.font = `bold ${textSize}px Tahoma`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(cell.value.toString(), centerCoordinates.x, centerCoordinates.y);
}

function fillSquareFromCenter(
  ctx: CanvasRenderingContext2D,
  { x, y }: Coordinates,
  size: number,
) {
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function calculateCellCenterCoordinates(
  { x, y }: Indexes,
  cellSize: number,
  gap: number,
): Coordinates {
  return {
    x: x * (cellSize + gap) + gap + cellSize / 2,
    y: y * (cellSize + gap) + gap + cellSize / 2,
  };
}
