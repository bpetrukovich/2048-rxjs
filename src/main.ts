import { last, tap } from "rxjs";
import { commandStream$ } from "./commandStream";
import { game } from "./logic";
import { animationProgress, BOARD_SIZE, renderBoard } from "./ui";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

const ctx = canvas.getContext("2d")!;

game(commandStream$).subscribe((state) => {
  console.log(state);
  animationProgress()
    .pipe(
      tap((progress) => {
        renderBoard(state, progress, ctx);
      }),
      last(),
    )
    .subscribe();
});
