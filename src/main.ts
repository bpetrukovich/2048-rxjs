import { commandStream$ } from "./commandStream";
import { CELLS, createBoard, generateRandomCell, handleCommand } from "./logic";
import { BOARD_SIZE, COLORS, renderBoard } from "./ui";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

const ctx = canvas.getContext("2d")!;
ctx.fillStyle = COLORS.BG;
ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

let board = createBoard(CELLS);

renderBoard(board, ctx);

commandStream$.subscribe((command) => {
  board = handleCommand(command, board);
  console.log(board);
  board = generateRandomCell(board);
  renderBoard(board, ctx);
});
