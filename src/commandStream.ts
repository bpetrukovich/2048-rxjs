import { filter, fromEvent, map, type Observable } from "rxjs";
import { Commands, type Command } from "./logic";
import Hammer from "hammerjs";

const hammer = new Hammer(document.body);

hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

const swipe$ = fromEvent(hammer, "swipe").pipe(
  map((event: any) => event.direction),
);

swipe$.subscribe((direction) => {
  console.log("Swipe direction:", direction);
});

export const commandStream$: Observable<Command> = fromEvent<KeyboardEvent>(
  document,
  "keydown",
).pipe(
  map((e) => e.key as Command),
  filter((key) => Commands.includes(key)),
);
