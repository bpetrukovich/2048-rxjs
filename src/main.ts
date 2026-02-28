import { filter, fromEvent, map, Observable } from "rxjs";

const CELL_SIZE = 100;
const CELLS = 4;
const GAP = 10;
const BOARD_SIZE = CELL_SIZE * CELLS + GAP * (CELLS + 1);

const COLORS = {
  BG: "#9c8b7c",
  BG_EMPTY: "#bdac97",
  BG_FILLED: "#eee4da",
  TEXT: "#756452",
};

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

const ctx = canvas.getContext("2d")!;
ctx.fillStyle = COLORS.BG;
ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

type Board = Cell[][];

type Cell = CellWithValue | EmptyCell;

type EmptyCell = {};

type CellWithValue = {
  value: number;
};

type Coordinates = {
  x: number;
  y: number;
};

const board: Cell[][] = Array.from({ length: 4 }, () =>
  Array.from({ length: 4 }, () => ({})),
);

board[0][0] = { value: 2 };

renderBoard(board, ctx);

function renderBoard(board: Board, ctx: CanvasRenderingContext2D) {
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const coordinates = calculateCellCoordinates(x, y, CELL_SIZE, GAP);
      renderCell(cell, coordinates, ctx, CELL_SIZE);
    });
  });
}

function calculateCellCoordinates(
  x: number,
  y: number,
  cellSize: number,
  gap: number,
): Coordinates {
  return {
    x: x * (cellSize + gap) + gap,
    y: y * (cellSize + gap) + gap,
  };
}

function renderCell(
  cell: Cell,
  coordinates: Coordinates,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  if ("value" in cell) {
    renderCellWithValue(cell, coordinates, ctx, cellSize);
  } else {
    renderEmptyCell(coordinates, ctx, cellSize);
  }
}

function renderCellWithValue(
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

function renderEmptyCell(
  coordinates: Coordinates,
  ctx: CanvasRenderingContext2D,
  cellSize: number,
) {
  ctx.fillStyle = COLORS.BG_EMPTY;
  ctx.fillRect(coordinates.x, coordinates.y, cellSize, cellSize);
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
