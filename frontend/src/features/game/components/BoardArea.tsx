import { PropsWithChildren } from "react";

export function BoardArea({ children }: PropsWithChildren) {
  return <section className="board-area">{children}</section>;
}
