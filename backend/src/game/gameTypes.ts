export enum GameStatus {
  Waiting = "Waiting",
  RoleAssignment = "RoleAssignment",
  InProgress = "InProgress",
  Discussion = "Discussion",
  Escape = "Escape",
  Victory = "Victory",
  Defeat = "Defeat",
}

export enum HeroType {
  Mage = "Mage",
  Barbarian = "Barbarian",
  Elf = "Elf",
  Dwarf = "Dwarf",
}

export enum ActionType {
  MoveNorth = "MoveNorth",
  MoveSouth = "MoveSouth",
  MoveEast = "MoveEast",
  MoveWest = "MoveWest",
  ExploreTile = "ExploreTile",
  UseVortex = "UseVortex",
  TakeEscalator = "TakeEscalator",
  // TODO: SendSignal is a communication event, not an action-card ability. Keep temporarily for compatibility.
  SendSignal = "SendSignal",
}

export enum Direction {
  North = "North",
  South = "South",
  East = "East",
  West = "West",
}

export enum CommunicationMode {
  Open = "Open",
  SilentOnly = "SilentOnly",
  DiscussionOpen = "DiscussionOpen",
}

export enum CellType {
  Normal = "Normal",
  Exploration = "Exploration",
  SandTimer = "SandTimer",
  Item = "Item",
  Exit = "Exit",
  Vortex = "Vortex",
  Escalator = "Escalator",
  CrystalBall = "CrystalBall",
  SecurityCamera = "SecurityCamera",
  Loudspeaker = "Loudspeaker",
  GuardArea = "GuardArea",
  TimedDoor = "TimedDoor",
  MovingPlatform = "MovingPlatform",
}

export interface ActionCard {
  actionCardId: string;
  imageKey: string;
  actions: ActionType[];
  label: string;
  icons: string[];
}

export interface Player {
  playerId: string;
  socketId?: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isSpectator: boolean;
  assignedActionCard?: ActionCard;
}

export interface Hero {
  heroId: string;
  heroType: HeroType;
  color: "Purple" | "Yellow" | "Green" | "Orange";
  symbol: "Vial" | "Sword" | "Bow" | "Axe";
  positionCellId: string | null;
  isOnItemSpace: boolean;
  hasItem: boolean;
  hasEscaped: boolean;
  modelKey?: "magic-knight";
}

export interface SandTimer {
  remainingSeconds: number;
  isRunning: boolean;
  isFinalCountdown: boolean;
  canBeFlipped: boolean;
  usedSandTimerCellIds: string[];
}

export interface CommunicationState {
  mode: CommunicationMode;
  chatAllowed: boolean;
  voiceAllowed: boolean;
  signalsAllowed: boolean;
  actionsLocked: boolean;
  reason: CommunicationReason;
  openedAt?: string;
  autoCloseOnNextGameAction: boolean;
  signals: NonVerbalSignal[];
}

export type CommunicationReason = "Lobby" | "ScenarioFreeCommunication" | "SilentGameplay" | "SandTimer" | "Loudspeaker" | "ElfAbility" | "PostGame";

export interface NonVerbalSignal {
  signalId: string;
  fromPlayerId: string;
  targetPlayerId?: string;
  heroId?: string;
  signalType: "Attention" | "Approve" | "Reject" | "Hurry";
  createdAt: number;
}

export interface MazeCell {
  cellId: string;
  tileId: string;
  x: number;
  y: number;
  type: CellType;
  walls: Direction[];
  neighborCellIds: Partial<Record<Direction, string>>;
  itemForHeroType?: HeroType;
  exitForHeroType?: HeroType;
  vortexForHeroType?: HeroType;
  explorationForHeroType?: HeroType;
  explorationDirection?: Direction;
  explorationUsed?: boolean;
  escalatorGroupId?: string;
  orangeWallDirections?: Direction[];
  crystalBallUsed?: boolean;
  cameraDisabled?: boolean;
  occupiedByHeroId?: string;
}

export interface MazeBoard {
  cells: Record<string, MazeCell>;
}

export interface GameResult {
  status: GameStatus.Victory | GameStatus.Defeat;
  outcome: "Won" | "Lost";
  reason: string;
  timeRemaining: number;
  heroesEscaped: number;
  itemsCollected: number;
  tilesPlaced: number;
  timerSpacesUsed: number;
  guardsAvoided: number;
  achievementsUnlocked: Achievement[];
  scenarioId: string;
  difficulty: DifficultyLevel;
  completedAt: number;
}

export interface MallTileDefinition {
  tileId: string;
  imageKey: string;
  metadataStatus: "verified" | "placeholder";
  notes?: string[];
  entryPoints: Direction[];
  cells: TileCellDefinition[];
}

export interface TileCellDefinition {
  localCellId: string;
  localX: number;
  localY: number;
  type: CellType;
  walls: Direction[];
  orangeWallDirections?: Direction[];
  neighborLocalCellIds?: Partial<Record<Direction, string>>;
  isEntryPoint?: boolean;
  entryDirection?: Direction;
  itemForHeroType?: HeroType;
  exitForHeroType?: HeroType;
  vortexForHeroType?: HeroType;
  explorationForHeroType?: HeroType;
  explorationDirection?: Direction;
  escalatorGroupId?: string;
}

export interface PlacedTile {
  tileId: string;
  imageKey: string;
  boardX: number;
  boardY: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface TileDeck {
  remainingTileIds: string[];
  usedTileIds: string[];
}

export interface ScenarioDefinition {
  scenarioId: string;
  name: string;
  description: string;
  sandTimerSeconds: number;
  timeLimitSeconds: number;
  startingTileId: string;
  tileDeckIds: string[];
  matchingExitsRequired: boolean;
  allowedExitHeroTypes?: HeroType[];
  communicationAlwaysOpen: boolean;
  loudspeakerIgnored: boolean;
  ruleFlags: ScenarioRuleFlags;
}

export interface ScenarioRuleFlags {
  passActionTilesOnTimerFlip: boolean;
  dwarfCanPassOrangeWalls: boolean;
  elfExploreStartsDiscussion: boolean;
  mageCrystalBallEnabled: boolean;
  securityCamerasEnabled: boolean;
  maxActiveCamerasBeforeTimerBlocked?: number;
}

export type DifficultyLevel = "Easy" | "Normal" | "Hard";

export interface DifficultySettings {
  difficulty: DifficultyLevel;
  timeLimitSeconds: number;
  guardSpeedMultiplier: number;
  extraGuardCount: number;
  tileDeckModifier: "Short" | "Normal" | "Long";
}

export type ObjectiveType = "ExploreMall" | "CollectItems" | "ReachExit" | "UseTimer" | "AvoidGuards" | "DisableCameras";

export interface Objective {
  objectiveId: string;
  type: ObjectiveType;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

export type AchievementId = "first_escape" | "speed_escape" | "silent_team" | "no_timer_used" | "camera_control" | "explorer";

export interface Achievement {
  achievementId: AchievementId;
  title: string;
  description: string;
  unlockedAt?: string;
}

export interface Guard {
  guardId: string;
  currentCellId: string;
  patrolCellIds: string[];
  patrolIndex: number;
  isActive: boolean;
}

export interface ChallengeState {
  guards: Guard[];
  caughtHeroIds: string[];
}

export interface GameEffectPayload {
  effectType: "TilePlaced" | "HeroMoved" | "TimerFlipped" | "TheftTriggered" | "VortexUsed" | "EscalatorUsed" | "GuardAlert" | "HeroCaught" | "ObjectiveCompleted" | "AchievementUnlocked" | "Victory" | "Defeat" | "CommunicationOpened" | "CommunicationClosed" | "LoudspeakerActivated" | "ActionCardsPassed" | "RoomReset" | "GameEnded";
  roomCode: string;
  heroId?: string;
  cellId?: string;
  tileId?: string;
  soundKey?: string;
  animationKey?: string;
}

export interface GameSession {
  roomCode: string;
  status: GameStatus;
  players: Player[];
  heroes: Hero[];
  board: MazeBoard;
  placedTiles: PlacedTile[];
  tileDeck: TileDeck;
  scenario: ScenarioDefinition;
  difficultySettings: DifficultySettings;
  objectives: Objective[];
  achievements: Achievement[];
  unlockedScenarioIds: string[];
  challengeState: ChallengeState;
  effectLog: GameEffectPayload[];
  sandTimer: SandTimer;
  communicationState: CommunicationState;
  actionsLocked: boolean;
  result?: GameResult;
  createdAt: number;
  updatedAt: number;
}

export interface Room {
  roomCode: string;
  session: GameSession;
}

export interface LegalMoveTarget {
  cellId: string;
  direction: Direction;
  distance: number;
  reason?: string;
}
