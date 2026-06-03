import { createBrowserRouter } from "react-router-dom";
import { GamePage } from "@/pages/GamePage";
import { LandingPage } from "@/pages/LandingPage";
import { LobbyPage } from "@/pages/LobbyPage";
import { ResultPage } from "@/pages/ResultPage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/lobby/:roomCode", element: <LobbyPage /> },
  { path: "/game/:roomCode", element: <GamePage /> },
  { path: "/result/:roomCode", element: <ResultPage /> },
]);
