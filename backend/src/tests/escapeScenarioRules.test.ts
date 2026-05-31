import { describe, expect, it } from "vitest";
import { SCENARIOS } from "../data/scenarios.js";
import { CellType, GameStatus, HeroType } from "../game/gameTypes.js";
import { applyEscapeIfOnExit } from "../rules/escapeRules.js";
import { createStartedRoom, placeHero } from "./testHelpers.js";

describe("scenario escape rules", () => {
  it("Scenario 1 allows a hero with an item to escape through the purple Mage exit", () => {
    const { room } = createStartedRoom();
    const barbarian = room.session.heroes.find((hero) => hero.heroId === "hero-barbarian");
    if (!barbarian) throw new Error("missing barbarian");
    barbarian.hasItem = true;
    placeHero(room, "hero-barbarian", "tile1A-2-3");

    expect(applyEscapeIfOnExit(room.session, "hero-barbarian")).toBe(true);
    expect(barbarian.hasEscaped).toBe(true);
  });

  it("Scenario 2 requires matching exit colour", () => {
    const { room } = createStartedRoom();
    room.session.scenario = SCENARIOS.scenario2;
    room.session.status = GameStatus.Escape;
    const barbarian = room.session.heroes.find((hero) => hero.heroId === "hero-barbarian");
    if (!barbarian) throw new Error("missing barbarian");
    barbarian.hasItem = true;
    placeHero(room, "hero-barbarian", "tile1A-2-3");

    expect(applyEscapeIfOnExit(room.session, "hero-barbarian")).toBe(false);
    expect(barbarian.hasEscaped).toBe(false);
  });

  it("Scenario 2 accepts a matching coloured exit", () => {
    const { room } = createStartedRoom();
    room.session.scenario = SCENARIOS.scenario2;
    room.session.board.cells["exit-barbarian-real"] = {
      cellId: "exit-barbarian-real",
      tileId: "test",
      x: 50,
      y: 50,
      type: CellType.Exit,
      walls: [],
      neighborCellIds: {},
      exitForHeroType: HeroType.Barbarian,
    };
    const barbarian = room.session.heroes.find((hero) => hero.heroId === "hero-barbarian");
    if (!barbarian) throw new Error("missing barbarian");
    barbarian.hasItem = true;
    placeHero(room, "hero-barbarian", "exit-barbarian-real");

    expect(applyEscapeIfOnExit(room.session, "hero-barbarian")).toBe(true);
  });
});


