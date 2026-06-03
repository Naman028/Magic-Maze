export function getActionCardImage(imageKey?: string) {
  if (!imageKey) return "";
  const mapped: Record<string, string> = {
    "ActionCard1.png": "action_card_move_east.png",
    "ActionCard2.png": "action_card_vortex_move_west.png",
    "ActionCard3.png": "action_card_vortex_move_north_or_east.png",
    "ActionCard4.png": "action_card_move_north.png",
    "ActionCard5.png": "action_card_move_south.png",
    "ActionCard6.png": "action_card_move_north_alt.png",
    "ActionCard7.png": "action_card_search_move_south.png",
    "ActionCard8.png": "action_card_escalator_move_east.png",
    "ActionCard9.png": "action_card_move_west.png",
  };
  return getActionTileAsset(mapped[imageKey] ?? imageKey);
}

export function getActionAbilityImage(actionKey?: string) {
  const mapped: Record<string, string> = {
    MoveEast: "action_card_move_east.png",
    MoveWest: "action_card_move_west.png",
    MoveNorth: "action_card_move_north.png",
    MoveSouth: "action_card_move_south.png",
    ExploreTile: "Action teil - search.png",
    UseVortex: "vortex.png",
    TakeEscalator: "escalator.png",
  };
  const fileName = actionKey ? mapped[actionKey] : undefined;
  return fileName ? getActionTileAsset(fileName) : "";
}

function getActionTileAsset(fileName: string) {
  return `/assets/magic-maze/Action tile/${fileName}`;
}

export function getMazeTileImage(imageKey?: string) {
  return imageKey ? `/assets/magic-maze/Maze%20layout/${imageKey}` : "";
}

export function getTokenImage(imageKey?: string) {
  if (!imageKey) return "";
  if (imageKey.toLowerCase() === "dosomething.png") return getDoSomethingImage();
  return `/assets/magic-maze/${imageKey}`;
}

export function getHeroImage(heroTypeOrColor?: string) {
  const key = String(heroTypeOrColor ?? "").toLowerCase();
  if (key.includes("elf") || key.includes("green")) return "/assets/magic-maze/Heros/green_bow_and_arrow_icon-removebg-preview.png";
  if (key.includes("dwarf") || key.includes("orange")) return "/assets/magic-maze/Heros/orange_axe_icon_badge-removebg-preview.png";
  if (key.includes("mage") || key.includes("purple")) return "/assets/magic-maze/Heros/purple_flask_token-removebg.png";
  if (key.includes("barbarian") || key.includes("yellow")) return "/assets/magic-maze/Heros/yellow_sword_emblem_token-removebg-preview.png";
  return "/assets/magic-maze/Heros/purple_flask_token-removebg.png";
}

export function getDoSomethingImage() {
  return "/assets/magic-maze/Dosomething.png";
}

export function getDoSomethingFallbackImage() {
  return "/assets/magic-maze/Dosomething.png";
}

export function getUsedTokenImage() {
  return "/assets/magic-maze/used.png";
}

export function getUsedTokenFallbackImage() {
  return "/assets/magic-maze/used.png";
}

export function getHeroTokenImage(heroType?: string) {
  const key = String(heroType ?? "").toLowerCase();
  if (key.includes("mage") || key.includes("wizard")) return "/assets/magic-maze/Heros/purple_flask_token-removebg.png";
  if (key.includes("dwarf")) return "/assets/magic-maze/Heros/orange_axe_icon_badge-removebg-preview.png";
  if (key.includes("elf")) return "/assets/magic-maze/Heros/green_bow_and_arrow_icon-removebg-preview.png";
  if (key.includes("barbarian") || key.includes("knight")) return "/assets/magic-maze/Heros/yellow_sword_emblem_token-removebg-preview.png";
  return "/assets/magic-maze/Heros/purple_flask_token-removebg.png";
}

export function getHeroTokenFallbackImage(heroType?: string) {
  return getHeroImage(heroType);
}

export function getActionDeckImage() {
  return "/assets/magic-maze/actioncarddeck.png";
}

export function getMazeDeckImage() {
  return "/assets/magic-maze/mazedeck.png";
}

export function getTheftObjectiveImage(locked = false) {
  return locked ? "/assets/magic-maze/theft_objective_locked_card.png" : "/assets/magic-maze/theft_objective_card.png";
}
