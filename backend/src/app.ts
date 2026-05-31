import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { listScenarios } from "./data/scenarios.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "magic-maze-backend" });
  });
  app.get("/scenarios", (_request, response) => {
    response.json({ scenarios: listScenarios() });
  });
  return app;
}
