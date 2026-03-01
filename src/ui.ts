import { cellIsEmpty, CELLS, type Board, type CellWithValue } from "./logic";

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

export function renderBoard(board: Board, ctx: CanvasRenderingContext2D) {
  board.forEach((row, y) => {
    row.forEach((_, x) => {
      const coordinates = calculateCellCoordinates(x, y, CELL_SIZE, GAP);
      renderEmptyCell(coordinates, ctx, CELL_SIZE);
    });
  });

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const coordinates = calculateCellCoordinates(x, y, CELL_SIZE, GAP);
      if (!cellIsEmpty(cell)) {
        renderCell(cell, coordinates, ctx, CELL_SIZE);
      }
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
