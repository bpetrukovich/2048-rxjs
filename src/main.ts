import { commandStream$ } from "./commandStream";
import { game } from "./logic";
import { BOARD_SIZE, COLORS, renderBoard } from "./ui";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

const ctx = canvas.getContext("2d")!;
ctx.fillStyle = COLORS.BG;
ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

game(commandStream$).subscribe((board) => renderBoard(board, ctx));
