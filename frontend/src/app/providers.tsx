import { PropsWithChildren, useEffect } from "react";
import { registerSocketListeners } from "@/services/socket/socketListeners";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => registerSocketListeners(), []);
  return <>{children}</>;
}
