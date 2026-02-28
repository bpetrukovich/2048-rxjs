const CELL_SIZE = 100;
const CELLS = 4;
const GAP = 10;
const BOARD_SIZE = CELL_SIZE * CELLS + GAP * (CELLS - 1);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "#9c8b7c";
ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
