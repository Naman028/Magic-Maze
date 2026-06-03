import { describe, expect, it } from "vitest";
import { HeroType } from "../game/gameTypes.js";
import { createRoomService } from "./testHelpers.js";

describe("starter hero positions", () => {
  it("places all heroes on the central tile1A starting cells", () => {
    const service = createRoomService();
    const room = service.createRoom({ nickname: "Host" });
    const expected = {
      [HeroType.Mage]: "tile1A-start-mage",
      [HeroType.Dwarf]: "tile1A-start-dwarf",
      [HeroType.Barbarian]: "tile1A-start-barbarian",
      [HeroType.Elf]: "tile1A-start-elf",
    };

    for (const hero of room.session.heroes) {
      expect(hero.positionCellId).toBe(expected[hero.heroType]);
      const cell = room.session.board.cells[hero.positionCellId ?? ""];
      expect(cell.tileId).toBe("tile1A");
      expect(cell.occupiedByHeroId).toBe(hero.heroId);
    }

    expect(new Set(room.session.heroes.map((hero) => hero.positionCellId)).size).toBe(4);
  });
});

