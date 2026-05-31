export function getHeroDisplayName(heroType?: string) {
  const key = String(heroType ?? "").toLowerCase();
  if (key.includes("mage") || key.includes("wizard")) return "Wizard";
  if (key.includes("dwarf")) return "Dwarf";
  if (key.includes("elf")) return "Elf";
  if (key.includes("barbarian") || key.includes("knight")) return "Knight";
  return "Hero";
}

export function getHeroPawnImage(heroType?: string) {
  const key = String(heroType ?? "").toLowerCase();
  if (key.includes("mage") || key.includes("wizard")) return "/assets/magic-maze/Heros/purple_flask_token-removebg.png";
  if (key.includes("dwarf")) return "/assets/magic-maze/Heros/orange_axe_icon_badge-removebg-preview.png";
  if (key.includes("elf")) return "/assets/magic-maze/Heros/green_bow_and_arrow_icon-removebg-preview.png";
  if (key.includes("barbarian") || key.includes("knight")) return "/assets/magic-maze/Heros/yellow_sword_emblem_token-removebg-preview.png";
  return "/assets/magic-maze/Heros/purple_flask_token-removebg.png";
}

export function getHeroPawnFallbackImage(heroType?: string) {
  return getHeroCharacterImage(heroType);
}

export function getHeroCharacterImage(heroType?: string) {
  const key = String(heroType ?? "").toLowerCase();
  if (key.includes("mage") || key.includes("wizard")) return "/assets/magic-maze/Heros/mage_statue-removebg-preview.png";
  if (key.includes("dwarf")) return "/assets/magic-maze/Heros/dwarf_statue-removebg-preview.png";
  if (key.includes("elf")) return "/assets/magic-maze/Heros/elf_statue-removebg-preview.png";
  if (key.includes("barbarian") || key.includes("knight")) return "/assets/magic-maze/Heros/knight_statue-removebg-preview.png";
  return "/assets/magic-maze/Heros/mage_statue-removebg-preview.png";
}

export function getHeroCharacterFallbackImage(heroType?: string) {
  const key = String(heroType ?? "").toLowerCase();
  if (key.includes("mage") || key.includes("wizard")) return "/assets/magic-maze/Heros/mage_player_card.png";
  if (key.includes("dwarf")) return "/assets/magic-maze/Heros/dwarf_player_card.png";
  if (key.includes("elf")) return "/assets/magic-maze/Heros/elf_player_card.png";
  if (key.includes("barbarian") || key.includes("knight")) return "/assets/magic-maze/Heros/knight_player_card.png";
  return "/assets/magic-maze/Heros/mage_player_card.png";
}

export function getHeroPlayerCardImage(heroType?: string) {
  const key = String(heroType ?? "").toLowerCase();
  if (key.includes("mage") || key.includes("wizard")) return "/assets/magic-maze/Heros/mage_player_card.png";
  if (key.includes("dwarf")) return "/assets/magic-maze/Heros/dwarf_player_card.png";
  if (key.includes("elf")) return "/assets/magic-maze/Heros/elf_player_card.png";
  if (key.includes("barbarian") || key.includes("knight")) return "/assets/magic-maze/Heros/knight_player_card.png";
  return "/assets/magic-maze/Heros/mage_player_card.png";
}
