import { filter, fromEvent, map, type Observable } from "rxjs";
import { Commands, type Command } from "./logic";

export const commandStream$: Observable<Command> = fromEvent<KeyboardEvent>(
  document,
  "keydown",
).pipe(
  map((e) => e.key as Command),
  filter((key) => Commands.includes(key)),
);
