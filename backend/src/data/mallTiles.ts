import { CellType, Direction, HeroType, MallTileDefinition, TileCellDefinition } from "../game/gameTypes.js";

export const TILE_SIZE = 4;

function createOpen4x4Cells(tileId: string, overrides: Record<string, Partial<TileCellDefinition>> = {}): TileCellDefinition[] {
  const cells: TileCellDefinition[] = [];

  function key(x: number, y: number) {
    return `${x},${y}`;
  }

  function idFor(x: number, y: number) {
    return overrides[key(x, y)]?.localCellId ?? `${tileId}-${x}-${y}`;
  }

  for (let y = 0; y < TILE_SIZE; y += 1) {
    for (let x = 0; x < TILE_SIZE; x += 1) {
      const neighborLocalCellIds: Partial<Record<Direction, string>> = {};

      if (y > 0) neighborLocalCellIds[Direction.North] = idFor(x, y - 1);
      if (y < TILE_SIZE - 1) neighborLocalCellIds[Direction.South] = idFor(x, y + 1);
      if (x > 0) neighborLocalCellIds[Direction.West] = idFor(x - 1, y);
      if (x < TILE_SIZE - 1) neighborLocalCellIds[Direction.East] = idFor(x + 1, y);

      const override = overrides[key(x, y)] ?? {};
      const entryDefaults = defaultEntryForCoordinate(x, y);

      cells.push({
        localCellId: idFor(x, y),
        localX: x,
        localY: y,
        type: CellType.Normal,
        walls: [],
        neighborLocalCellIds,
        ...entryDefaults,
        ...override,
        isEntryPoint: override.isEntryPoint ?? entryDefaults.isEntryPoint,
        entryDirection: override.entryDirection ?? entryDefaults.entryDirection,
      });
    }
  }

  return cells;
}

function defaultEntryForCoordinate(x: number, y: number): Pick<TileCellDefinition, "isEntryPoint" | "entryDirection"> {
  if (x === 0) return { isEntryPoint: true, entryDirection: Direction.West };
  if (x === TILE_SIZE - 1) return { isEntryPoint: true, entryDirection: Direction.East };
  if (y === 0) return { isEntryPoint: true, entryDirection: Direction.North };
  if (y === TILE_SIZE - 1) return { isEntryPoint: true, entryDirection: Direction.South };
  return {};
}

function commonEntryOverrides(): Record<string, Partial<TileCellDefinition>> {
  return {
    "0,0": { isEntryPoint: true, entryDirection: Direction.West },
    "0,1": { isEntryPoint: true, entryDirection: Direction.West },
    "0,2": { isEntryPoint: true, entryDirection: Direction.West },
    "0,3": { isEntryPoint: true, entryDirection: Direction.West },
    "3,0": { isEntryPoint: true, entryDirection: Direction.East },
    "3,1": { isEntryPoint: true, entryDirection: Direction.East },
    "3,2": { isEntryPoint: true, entryDirection: Direction.East },
    "3,3": { isEntryPoint: true, entryDirection: Direction.East },
    "1,0": { isEntryPoint: true, entryDirection: Direction.North },
    "2,0": { isEntryPoint: true, entryDirection: Direction.North },
    "1,3": { isEntryPoint: true, entryDirection: Direction.South },
    "2,3": { isEntryPoint: true, entryDirection: Direction.South },
  };
}

const ENCODED_REFERENCE_TILES: Record<string, string> = {
  "0": "31i02700002039703030000000003980316000000900311c31500040120f4000",
  "1": "37i02800031036000930010036001000010003001200044c04002720390f4000",
  "2": "10f0400040004000130840004000377040004000280003h04000282203003950",
  "3": "4000280012h0400030400300270039i031502700090028304000106004001200",
  "4": "400037604000400030h0000039i0400040000100300027304000101040001380",
  "5": "400037700440360036h00100300012000400000039i028204000011030001200",
  "6": "4000400037c04000301027000900400040001000040027h04000102040001370",
  "7": "4000400037504000280030000308360013a0400040000130400037ha40001380",
  "8": "280030002700360012204000138010004000400040000130319027h030001200",
  "9": "400028003000360030h0120040001000400040003760100031b0274003001200",
  "10": "400040001040400037604000040736000100360a400001h003d0093040001350",
  "11": "10g0400010204000010030001200378010002800360001h00400091004001200",
  "12": "2800390a40004000094040003705376010084000010000h012e0310312001370",
  "13": "280036000410360012h001004800110040001000317009004000014030001200",
  "14": "3770400010104000100b40000100360010004000160204h00400272057003980",
  "15": "370a400037804000092040000101360022002900120001h040001010400013j0",
  "16": "400028000930400037k010000400360001000300480005h00400272030003950",
  "17": "400028003600400030h012000100395031k027000900400040001020040039j0",
  "18": "400040001010400030002700120040004000010030003970400013k040004000",
  "19": "28003600043036000940040030000900010027004800022013k010h040001350",
  "20": "400028003600400027101200040736000400360a40000140400010h0400013j0",
  "21": "280030003000360003303000360010002800300012000120040027h048001400",
  "22": "378040000420360009h028002700120004001200040036004000281030001200",
  "23": "280027003000398009201000400040001350040036002830400028h003001200",
  "24": "400031702700360030402700120010004000100040000110316000h048001400",
};

function directionForEdgeCell(x: number, y: number): Direction | undefined {
  if (x === 0) return Direction.West;
  if (x === TILE_SIZE - 1) return Direction.East;
  if (y === 0) return Direction.North;
  if (y === TILE_SIZE - 1) return Direction.South;
  return undefined;
}

function heroTypeFromReferenceColor(color: string): HeroType {
  switch (color) {
    case "green":
      return HeroType.Elf;
    case "orange":
      return HeroType.Dwarf;
    case "purple":
      return HeroType.Mage;
    case "yellow":
      return HeroType.Barbarian;
    default:
      return HeroType.Mage;
  }
}

function createReferenceCells(tileId: string, encoded: string, localCellIdOverrides: Record<string, string> = {}): TileCellDefinition[] {
  const blocks = Array.from({ length: 16 }, (_, index) => encoded.substring(index * 4, index * 4 + 4));
  const cells: TileCellDefinition[] = [];
  const escalatorLinks: Array<[string, string]> = [];

  function localCellId(x: number, y: number) {
    return localCellIdOverrides[`${x},${y}`] ?? `${tileId}-${x}-${y}`;
  }

  for (let y = 0; y < TILE_SIZE; y += 1) {
    for (let x = 0; x < TILE_SIZE; x += 1) {
      const block = blocks[y * TILE_SIZE + x];
      const wallSchema = Number.parseInt(block.substring(0, 2), 10).toString(3).padStart(4, "0");
      const walls: Direction[] = [];
      const orangeWallDirections: Direction[] = [];
      const schemaDirections = [Direction.North, Direction.East, Direction.South, Direction.West];

      for (let index = 0; index < schemaDirections.length; index += 1) {
        if (wallSchema[index] === "1") walls.push(schemaDirections[index]);
        if (wallSchema[index] === "2") orangeWallDirections.push(schemaDirections[index]);
      }

      const neighborLocalCellIds: Partial<Record<Direction, string>> = {};
      if (y > 0) neighborLocalCellIds[Direction.North] = localCellId(x, y - 1);
      if (y < TILE_SIZE - 1) neighborLocalCellIds[Direction.South] = localCellId(x, y + 1);
      if (x > 0) neighborLocalCellIds[Direction.West] = localCellId(x - 1, y);
      if (x < TILE_SIZE - 1) neighborLocalCellIds[Direction.East] = localCellId(x + 1, y);

      const cellId = localCellId(x, y);
      const cell: TileCellDefinition = {
        localCellId: cellId,
        localX: x,
        localY: y,
        type: CellType.Normal,
        walls,
        orangeWallDirections: orangeWallDirections.length > 0 ? orangeWallDirections : undefined,
        neighborLocalCellIds,
      };

      const itemBit = block[2];
      if (itemBit !== "0") {
        const itemIndex = Number.parseInt(itemBit, 36) - 1;
        if (itemIndex < 16) {
          const itemType = ["gate", "vortex", "article", "exit"][Math.floor(itemIndex / 4)];
          const heroType = heroTypeFromReferenceColor(["green", "orange", "purple", "yellow"][itemIndex % 4]);

          if (itemType === "gate") {
            cell.type = CellType.Exploration;
            cell.explorationForHeroType = heroType;
            cell.explorationDirection = directionForEdgeCell(x, y);
          } else if (itemType === "vortex") {
            cell.type = CellType.Vortex;
            cell.vortexForHeroType = heroType;
          } else if (itemType === "article") {
            cell.type = CellType.Item;
            cell.itemForHeroType = heroType;
          } else if (itemType === "exit") {
            cell.type = CellType.Exit;
            cell.exitForHeroType = heroType;
          }
        } else {
          const simpleItemType = ({ h: "enter", i: "time", j: "crystal", k: "camera" } as Record<string, string | undefined>)[itemBit];
          if (simpleItemType === "enter") {
            cell.isEntryPoint = true;
            cell.entryDirection = directionForEdgeCell(x, y);
          } else if (simpleItemType === "time") {
            cell.type = CellType.SandTimer;
          } else if (simpleItemType === "crystal") {
            cell.type = CellType.CrystalBall;
          } else if (simpleItemType === "camera") {
            cell.type = CellType.SecurityCamera;
          }
        }
      }

      const escalatorBit = block[3];
      if (escalatorBit !== "0") {
        const targetIndex = Number.parseInt(escalatorBit, 36) - 1;
        const targetX = targetIndex % TILE_SIZE;
        const targetY = Math.floor(targetIndex / TILE_SIZE);
        const targetCellId = localCellId(targetX, targetY);
        if (targetCellId !== cellId) {
          escalatorLinks.push([cellId, targetCellId]);
        }
      }

      cells.push(cell);
    }
  }

  const groupByCellId = connectedEscalatorGroups(tileId, escalatorLinks);
  for (const cell of cells) {
    const groupId = groupByCellId.get(cell.localCellId);
    if (!groupId) continue;
    cell.type = cell.type === CellType.Normal ? CellType.Escalator : cell.type;
    cell.escalatorGroupId = groupId;
  }

  return cells;
}

function connectedEscalatorGroups(tileId: string, links: Array<[string, string]>): Map<string, string> {
  const neighbors = new Map<string, Set<string>>();
  for (const [from, to] of links) {
    if (!neighbors.has(from)) neighbors.set(from, new Set());
    if (!neighbors.has(to)) neighbors.set(to, new Set());
    neighbors.get(from)!.add(to);
    neighbors.get(to)!.add(from);
  }

  const groupByCellId = new Map<string, string>();
  const visited = new Set<string>();
  let groupIndex = 1;

  for (const start of neighbors.keys()) {
    if (visited.has(start)) continue;
    const stack = [start];
    const component: string[] = [];
    visited.add(start);

    while (stack.length > 0) {
      const current = stack.pop()!;
      component.push(current);
      for (const next of neighbors.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        stack.push(next);
      }
    }

    if (component.length < 2) continue;
    const groupId = `${tileId}-escalator-${groupIndex}`;
    groupIndex += 1;
    for (const cellId of component) {
      groupByCellId.set(cellId, groupId);
    }
  }

  return groupByCellId;
}

function createReferenceTile(tileNumber: number): MallTileDefinition {
  const tileId = `tile${tileNumber}`;
  return applyVisualTileOverrides({
    tileId,
    imageKey: `${tileId}.jpg`,
    metadataStatus: "verified",
    notes: ["Movement metadata imported from magic-maze-master tile encoding."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createReferenceCells(tileId, ENCODED_REFERENCE_TILES[String(tileNumber)]),
  });
}

const VISUAL_ESCALATOR_ENDPOINTS: Record<string, string[][]> = {
  tile1A: [["tile1A-3-2", "tile1A-2-3"]],
  tile2: [["tile2-0-1", "tile2-1-2"]],
  tile7: [["tile7-2-1", "tile7-1-3"]],
  tile10: [["tile10-1-2", "tile10-2-1"]],
  tile12: [
    ["tile12-1-0", "tile12-2-1"],
    ["tile12-0-2", "tile12-1-3"],
  ],
  tile14: [["tile14-0-1", "tile14-2-2"]],
  tile15: [["tile15-0-1", "tile15-2-1"]],
  tile20: [["tile20-1-2", "tile20-2-1"]],
};

const VISUAL_CELL_OVERRIDES: Record<string, Record<string, Partial<TileCellDefinition>>> = {
  tile20: {
    "tile20-3-3": { type: CellType.Exit, exitForHeroType: HeroType.Mage },
  },
};

export function visualEscalatorGroupId(tileId: string, cellId: string): string | undefined {
  const cellIdParts = cellId.split(":");
  const localCellId = cellIdParts[cellIdParts.length - 1] ?? cellId;
  const pairs = VISUAL_ESCALATOR_ENDPOINTS[tileId] ?? [];
  const pairIndex = pairs.findIndex((pair) => pair.includes(localCellId));
  return pairIndex >= 0 ? `${tileId}-visual-escalator-${pairIndex + 1}` : undefined;
}

export function hasVisualEscalatorEndpoints(tileId: string): boolean {
  return tileId in VISUAL_ESCALATOR_ENDPOINTS;
}

function applyVisualTileOverrides(tile: MallTileDefinition): MallTileDefinition {
  const pairs = VISUAL_ESCALATOR_ENDPOINTS[tile.tileId];
  const cellOverrides = VISUAL_CELL_OVERRIDES[tile.tileId] ?? {};
  if (!pairs && Object.keys(cellOverrides).length === 0) return tile;

  const endpointIds = new Set((pairs ?? []).flat());
  return {
    ...tile,
    cells: tile.cells.map((cell) => {
      const visualOverride = cellOverrides[cell.localCellId] ?? {};
      const groupId = visualEscalatorGroupId(tile.tileId, cell.localCellId);
      if (groupId) {
        return {
          ...cell,
          type: cell.type === CellType.Normal ? CellType.Escalator : cell.type,
          escalatorGroupId: groupId,
          ...visualOverride,
        };
      }
      const { escalatorGroupId, ...rest } = cell;
      return {
        ...rest,
        type: cell.type === CellType.Escalator && !endpointIds.has(cell.localCellId) ? CellType.Normal : cell.type,
        ...visualOverride,
      };
    }),
  };
}

export const MALL_TILES: Record<string, MallTileDefinition> = {
  tile1A: {
    tileId: "tile1A",
    imageKey: "tile0.jpg",
    metadataStatus: "verified",
    notes: ["Starter tile generated from the original reference tiles.json metadata."],
    entryPoints: [],
    cells: createReferenceCells("tile1A", ENCODED_REFERENCE_TILES["0"], {
      "1,1": "tile1A-start-mage",
      "2,1": "tile1A-start-dwarf",
      "1,2": "tile1A-start-barbarian",
      "2,2": "tile1A-start-elf",
    }),
  },
  tile1B: {
    tileId: "tile1B",
    imageKey: "tile1.jpg",
    metadataStatus: "verified",
    notes: ["Generated from the original reference tiles.json metadata."],
    entryPoints: [],
    cells: createReferenceCells("tile1B", ENCODED_REFERENCE_TILES["1"]),
  },
  tile2: {
    tileId: "tile2",
    imageKey: "tile2.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile2", {
      ...commonEntryOverrides(),
      "1,0": { escalatorGroupId: "tile2-escalator-a" },
      "1,3": { type: CellType.Vortex, vortexForHeroType: HeroType.Mage, escalatorGroupId: "tile2-escalator-a" },
      "0,1": { escalatorGroupId: "tile2-escalator-b" },
      "3,1": { type: CellType.Exploration, explorationForHeroType: HeroType.Dwarf, explorationDirection: Direction.East, escalatorGroupId: "tile2-escalator-b" },
      "1,2": { type: CellType.SandTimer },
    }),
  },
  tile3: {
    tileId: "tile3",
    imageKey: "tile3.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile3", {
      ...commonEntryOverrides(),
      "1,1": { type: CellType.SandTimer },
      "3,2": { type: CellType.Exploration, explorationForHeroType: HeroType.Mage, explorationDirection: Direction.East },
    }),
  },
  tile4: {
    tileId: "tile4",
    imageKey: "tile4.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile4", {
      ...commonEntryOverrides(),
      "1,1": { type: CellType.Vortex, vortexForHeroType: HeroType.Mage },
      "2,2": { type: CellType.Item, itemForHeroType: HeroType.Mage },
    }),
  },
  tile5: {
    tileId: "tile5",
    imageKey: "tile5.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile5", {
      ...commonEntryOverrides(),
      "1,3": { type: CellType.Exploration, explorationForHeroType: HeroType.Mage, explorationDirection: Direction.South },
      "2,1": { type: CellType.Item, itemForHeroType: HeroType.Elf },
    }),
  },
  tile6: {
    tileId: "tile6",
    imageKey: "tile6.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile6", {
      ...commonEntryOverrides(),
      "2,1": { type: CellType.SandTimer },
      "1,2": { type: CellType.Item, itemForHeroType: HeroType.Dwarf },
    }),
  },
  tile7: {
    tileId: "tile7",
    imageKey: "tile7.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile7", {
      ...commonEntryOverrides(),
      "0,0": { type: CellType.Escalator, escalatorGroupId: "tile7-escalator" },
      "1,0": { type: CellType.Escalator, escalatorGroupId: "tile7-escalator" },
      "2,2": { type: CellType.Loudspeaker },
    }),
  },
  tile8: {
    tileId: "tile8",
    imageKey: "tile8.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile8", {
      ...commonEntryOverrides(),
      "1,1": { type: CellType.Vortex, vortexForHeroType: HeroType.Elf },
      "2,2": { type: CellType.Exit, exitForHeroType: HeroType.Elf },
    }),
  },
  tile9: {
    tileId: "tile9",
    imageKey: "tile9.jpg",
    metadataStatus: "placeholder",
    notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
    entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
    cells: createOpen4x4Cells("tile9", {
      ...commonEntryOverrides(),
      "1,1": { type: CellType.SecurityCamera },
      "2,2": { type: CellType.Item, itemForHeroType: HeroType.Barbarian },
    }),
  },
  ...Object.fromEntries(
    Array.from({ length: 23 }, (_, index) => {
      const tileNumber = index + 2;
      const tile = createReferenceTile(tileNumber);
      return [tile.tileId, tile];
    }),
  ),
  ...Object.fromEntries(
    Array.from({ length: 0 }, (_, index) => {
      const tileNumber = index + 10;
      const tileId = `tile${tileNumber}`;
      return [
        tileId,
        {
          tileId,
          imageKey: `${tileId}.jpg`,
          metadataStatus: "placeholder",
          notes: ["4x4 playable placeholder. Exact image-fidelity mapping is pending."],
          entryPoints: [Direction.West, Direction.East, Direction.North, Direction.South],
          cells: createOpen4x4Cells(tileId, {
            ...commonEntryOverrides(),
            "1,1": { type: tileNumber % 3 === 0 ? CellType.SecurityCamera : CellType.Normal },
            "2,2": { type: tileNumber % 2 === 0 ? CellType.SandTimer : CellType.Loudspeaker },
          }),
        } satisfies MallTileDefinition,
      ];
    }),
  ),
};

export function getMallTile(tileId: string): MallTileDefinition {
  const tile = MALL_TILES[tileId];
  if (!tile) {
    throw new Error(`Unknown mall tile: ${tileId}`);
  }
  return tile;
}

export function globalCellId(tileId: string, localCellId: string): string {
  return tileId === "tile1A" || tileId === "tile1B" ? localCellId : `${tileId}:${localCellId}`;
}
