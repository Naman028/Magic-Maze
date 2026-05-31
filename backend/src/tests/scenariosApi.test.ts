import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";

let server: ReturnType<typeof createServer> | undefined;

afterEach(() => {
  server?.close();
  server = undefined;
});

describe("scenarios API", () => {
  it("GET /scenarios returns scenario data with rule flags", async () => {
    const app = createApp();
    server = createServer(app);
    await new Promise<void>((resolve) => server?.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${port}/scenarios`);
    const body = await response.json() as { scenarios: Array<{ scenarioId: string; ruleFlags: object }> };

    expect(response.status).toBe(200);
    expect(body.scenarios.length).toBeGreaterThanOrEqual(7);
    expect(body.scenarios.map((scenario) => scenario.scenarioId)).toEqual(expect.arrayContaining([
      "scenario1_discovery",
      "scenario2_several_exits",
      "scenario7_maximum_surveillance",
    ]));
    expect(body.scenarios[0].ruleFlags).toBeDefined();
  });
});



