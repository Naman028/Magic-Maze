import { PropsWithChildren } from "react";

export function GameLayout({ children }: PropsWithChildren) {
  return <div className="game-page">{children}</div>;
}
