export type GameStatus = "Waiting" | "RoleAssignment" | "InProgress" | "Discussion" | "Escape" | "Victory" | "Defeat" | "PostGame";
export type HeroType = "Mage" | "Barbarian" | "Elf" | "Dwarf";
export type ActionType = "MoveNorth" | "MoveSouth" | "MoveEast" | "MoveWest" | "ExploreTile" | "UseVortex" | "TakeEscalator" | "SendSignal";
export type Direction = "North" | "South" | "East" | "West";
export type CellType = "Normal" | "Exploration" | "SandTimer" | "Item" | "Exit" | "Vortex" | "Escalator" | "CrystalBall" | "SecurityCamera" | "Loudspeaker" | "GuardArea" | "TimedDoor" | "MovingPlatform";
export type CommunicationMode = "Open" | "SilentOnly" | "DiscussionOpen";
export type CommunicationReason = "Lobby" | "ScenarioFreeCommunication" | "SilentGameplay" | "SandTimer" | "Loudspeaker" | "ElfAbility" | "PostGame";
export type DifficultyLevel = "Easy" | "Normal" | "Hard";

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

export interface PlacedTile {
  tileId: string;
  imageKey: string;
  boardX: number;
  boardY: number;
  rotation: 0 | 90 | 180 | 270;
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

export interface NonVerbalSignal {
  signalId: string;
  fromPlayerId: string;
  targetPlayerId?: string;
  heroId?: string;
  signalType: "Attention" | "Approve" | "Reject" | "Hurry";
  createdAt: number;
}

export interface ScenarioDefinition {
  scenarioId: string;
  name: string;
  description: string;
  timeLimitSeconds: number;
  startingTileId: string;
  tileDeckIds: string[];
  matchingExitsRequired: boolean;
  communicationAlwaysOpen: boolean;
  loudspeakerIgnored: boolean;
  ruleFlags: Record<string, boolean | number | undefined>;
}

export interface Objective {
  objectiveId: string;
  type: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  unlockedAt?: string;
}

export interface GameEffectPayload {
  effectType: string;
  roomCode: string;
  heroId?: string;
  cellId?: string;
  tileId?: string;
  soundKey?: string;
  animationKey?: string;
}

export interface GameResult {
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

export interface GameSession {
  roomCode: string;
  status: GameStatus;
  players: Player[];
  heroes: Hero[];
  board: { cells: Record<string, MazeCell> };
  placedTiles: PlacedTile[];
  tileDeck: { remainingTileIds: string[]; usedTileIds: string[] };
  scenario: ScenarioDefinition;
  difficultySettings: { difficulty: DifficultyLevel; timeLimitSeconds: number };
  objectives: Objective[];
  achievements: Achievement[];
  challengeState: ChallengeState;
  effectLog: GameEffectPayload[];
  sandTimer: SandTimer;
  communicationState: CommunicationState;
  actionsLocked: boolean;
  result?: GameResult;
}

export interface RoomPayload {
  roomCode: string;
  playerId: string;
  reconnectToken: string;
  session: GameSession;
}

export interface LegalMoveTarget {
  cellId: string;
  direction: Direction;
  distance: number;
  reason?: string;
}

export interface LegalMovesPayload {
  heroId: string;
  currentCellId: string;
  targets: LegalMoveTarget[];
}
