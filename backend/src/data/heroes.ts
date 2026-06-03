import { Hero, HeroType } from "../game/gameTypes.js";

export function createStarterHeroes(): Hero[] {
  return [
    { heroId: "hero-mage", heroType: HeroType.Mage, color: "Purple", symbol: "Vial", positionCellId: "tile1A-start-mage", isOnItemSpace: false, hasItem: false, hasEscaped: false, modelKey: "magic-knight" },
    { heroId: "hero-barbarian", heroType: HeroType.Barbarian, color: "Yellow", symbol: "Sword", positionCellId: "tile1A-start-barbarian", isOnItemSpace: false, hasItem: false, hasEscaped: false, modelKey: "magic-knight" },
    { heroId: "hero-elf", heroType: HeroType.Elf, color: "Green", symbol: "Bow", positionCellId: "tile1A-start-elf", isOnItemSpace: false, hasItem: false, hasEscaped: false, modelKey: "magic-knight" },
    { heroId: "hero-dwarf", heroType: HeroType.Dwarf, color: "Orange", symbol: "Axe", positionCellId: "tile1A-start-dwarf", isOnItemSpace: false, hasItem: false, hasEscaped: false, modelKey: "magic-knight" },
  ];
}
