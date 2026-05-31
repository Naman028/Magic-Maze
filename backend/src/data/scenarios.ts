import { HeroType, ScenarioDefinition } from "../game/gameTypes.js";

const baseFlags = {
  passActionTilesOnTimerFlip: false,
  dwarfCanPassOrangeWalls: false,
  elfExploreStartsDiscussion: false,
  mageCrystalBallEnabled: false,
  securityCamerasEnabled: false,
};

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  scenario1_discovery: {
    scenarioId: "scenario1_discovery",
    name: "Discovery",
    description: "Introductory scenario with open communication and a single purple exit.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9"],
    matchingExitsRequired: false,
    allowedExitHeroTypes: [HeroType.Mage],
    communicationAlwaysOpen: true,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags },
  },
  scenario2_several_exits: {
    scenarioId: "scenario2_several_exits",
    name: "Several Exits",
    description: "Adds matching coloured exits and silent play outside discussions.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12"],
    matchingExitsRequired: true,
    communicationAlwaysOpen: false,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags },
  },
  scenario3_pass_action_tiles: {
    scenarioId: "scenario3_pass_action_tiles",
    name: "Pass Action Tiles",
    description: "Timer flips also pass action tiles.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12"],
    matchingExitsRequired: true,
    communicationAlwaysOpen: false,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags, passActionTilesOnTimerFlip: true },
  },
  scenario4_dwarf_elf: {
    scenarioId: "scenario4_dwarf_elf",
    name: "Dwarf and Elf",
    description: "Enables Dwarf orange-wall passages and Elf exploration discussions.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12"],
    matchingExitsRequired: true,
    communicationAlwaysOpen: false,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags, passActionTilesOnTimerFlip: true, dwarfCanPassOrangeWalls: true, elfExploreStartsDiscussion: true },
  },
  scenario5_mage_crystal_ball: {
    scenarioId: "scenario5_mage_crystal_ball",
    name: "Mage Crystal Ball",
    description: "Enables Mage crystal-ball double exploration.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12", "tile13", "tile14"],
    matchingExitsRequired: true,
    communicationAlwaysOpen: false,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags, passActionTilesOnTimerFlip: true, dwarfCanPassOrangeWalls: true, elfExploreStartsDiscussion: true, mageCrystalBallEnabled: true },
  },
  scenario6_security_cameras: {
    scenarioId: "scenario6_security_cameras",
    name: "Security Cameras",
    description: "Adds active security cameras that can block timer usage.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12", "tile13", "tile14", "tile15", "tile16"],
    matchingExitsRequired: true,
    communicationAlwaysOpen: false,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags, passActionTilesOnTimerFlip: true, dwarfCanPassOrangeWalls: true, elfExploreStartsDiscussion: true, mageCrystalBallEnabled: true, securityCamerasEnabled: true, maxActiveCamerasBeforeTimerBlocked: 2 },
  },
  scenario7_maximum_surveillance: {
    scenarioId: "scenario7_maximum_surveillance",
    name: "Maximum Surveillance",
    description: "Adds more camera pressure than Scenario 6.",
    sandTimerSeconds: 180,
    timeLimitSeconds: 180,
    startingTileId: "tile1A",
    tileDeckIds: ["tile2", "tile3", "tile4", "tile5", "tile6", "tile7", "tile8", "tile9", "tile10", "tile11", "tile12", "tile13", "tile14", "tile15", "tile16", "tile17", "tile18", "tile19"],
    matchingExitsRequired: true,
    communicationAlwaysOpen: false,
    loudspeakerIgnored: true,
    ruleFlags: { ...baseFlags, passActionTilesOnTimerFlip: true, dwarfCanPassOrangeWalls: true, elfExploreStartsDiscussion: true, mageCrystalBallEnabled: true, securityCamerasEnabled: true, maxActiveCamerasBeforeTimerBlocked: 2 },
  },
};

export const STARTER_SCENARIO = { ...SCENARIOS.scenario1_discovery };

SCENARIOS.scenario1 = SCENARIOS.scenario1_discovery;
SCENARIOS.scenario2 = SCENARIOS.scenario2_several_exits;

export function getScenario(scenarioId: string): ScenarioDefinition {
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) throw new Error("Scenario does not exist.");
  return { ...scenario, tileDeckIds: [...scenario.tileDeckIds], ruleFlags: { ...scenario.ruleFlags } };
}

export function listScenarios(): ScenarioDefinition[] {
  return [...new Map(Object.values(SCENARIOS).map((scenario) => [scenario.scenarioId, getScenario(scenario.scenarioId)])).values()];
}
