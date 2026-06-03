export interface ScenarioRule {
  icon: string;
  title: string;
  desc: string;
}

export interface FullScenarioRules {
  overview: string;
  timer: string;
  communication: string;
  winCondition: string;
  sections: { title: string; rules: string[] }[];
}

// ── Quick preview rules (sidebar) ──────────────────────────────
export const SCENARIO_RULES: Record<string, ScenarioRule[]> = {
  Discovery: [
    { icon: "💬", title: "Open Communication",  desc: "Speak freely with your team throughout the game." },
    { icon: "🚪", title: "Single Purple Exit",   desc: "All 4 heroes must reach the one purple exit tile." },
    { icon: "⏳", title: "04:00 Timer",          desc: "Beat the clock — flip the sand timer to reset it." },
    { icon: "📖", title: "Tutorial Scenario",    desc: "Learn the basics of cooperative maze exploration." },
    { icon: "🃏", title: "Action Deck",          desc: "Each player uses only the action on their current card." },
    { icon: "🛡️", title: "Shared Heroes",       desc: "Any player may move any hero, if your action allows it." },
  ],
  "Several Exits": [
    { icon: "🚪", title: "4 Colour Exits",       desc: "Each hero must escape through their matching colour exit." },
    { icon: "🎯", title: "Correct Routing",       desc: "A hero entering the wrong colour exit is stopped." },
    { icon: "🔇", title: "Timed Silence",         desc: "Communication is locked except during sand timer windows." },
    { icon: "🗺️", title: "More Exploration",      desc: "The tile deck is larger — expect a bigger maze." },
  ],
  "Pass Action Tiles": [
    { icon: "🔄", title: "Pass Tiles",            desc: "Action tiles can be passed via special board spaces." },
    { icon: "🃏", title: "Shifting Actions",       desc: "Your available actions change as tiles are swapped." },
    { icon: "📍", title: "Pass Spaces",           desc: "Only heroes standing on a Pass space trigger a swap." },
    { icon: "🤔", title: "Plan Ahead",            desc: "Coordinate tile passing before actions become unavailable." },
  ],
  "Dwarf and Elf": [
    { icon: "⛏️", title: "Dwarf Tunnels",         desc: "Dwarf can use hidden tunnel shortcuts on the board." },
    { icon: "🧝", title: "Elf Discussion",        desc: "Elf reaching a Discussion space opens a free talk window." },
    { icon: "🔇", title: "Timed Silence",         desc: "Communication outside Discussion spaces remains locked." },
    { icon: "⚡", title: "Use Abilities Wisely",  desc: "Special abilities are powerful — time them carefully." },
  ],
  "Mage Crystal Ball": [
    { icon: "🔮", title: "Crystal Ball",          desc: "Mage can peek at the top 2 tiles of the deck." },
    { icon: "🤫", title: "Secret Knowledge",      desc: "Info seen cannot be directly shared — guide subtly." },
    { icon: "👁️", title: "Plan Around It",        desc: "Use the peek before sending heroes to explore." },
    { icon: "🔇", title: "Limited Speech",        desc: "Sand timer still controls when you may communicate." },
  ],
  "Security Cameras": [
    { icon: "📷", title: "Orange Walls",          desc: "Orange walls block heroes while cameras are active." },
    { icon: "🚫", title: "Disable Cameras",       desc: "Barbarian reaching a Camera space disables that tile." },
    { icon: "🗺️", title: "Route Planning",        desc: "Plan routes around active cameras before exploring." },
    { icon: "⏱️", title: "Don't Waste Moves",     desc: "Camera detours cost time — disable them efficiently." },
  ],
  "Maximum Surveillance": [
    { icon: "🔒", title: "All Camera Rules",      desc: "All Security Camera rules are in full effect." },
    { icon: "🔄", title: "Multiple Cameras",      desc: "Several cameras must be disabled in sequence." },
    { icon: "🤝", title: "Tight Coordination",    desc: "Every move counts — one mistake can cost the game." },
    { icon: "⏳", title: "Hard Timer",            desc: "The time limit is tighter. No room for hesitation." },
  ],
};

// ── Full modal rules (per rulebook) ───────────────────────────
export const FULL_SCENARIO_RULES: Record<string, FullScenarioRules> = {
  Discovery: {
    overview:
      "The tutorial scenario. Four heroes have been separated inside a magic maze and must find the exit before the sand timer runs out. Communication opens during sand timer windows and closes again after the next valid action.",
    timer: "4 minutes (04:00). Flip the sand timer whenever a hero lands on a Sand Timer space to reset it.",
    communication: "Locked by default. Players may speak during a sand timer window until the next valid game action.",
    winCondition: "All 4 heroes (Mage, Elf, Barbarian, Dwarf) must reach or pass through the single purple Exit tile.",
    sections: [
      {
        title: "Movement",
        rules: [
          "On your turn, choose any hero and move them using the action shown on your current action card.",
          "A hero slides in a straight line until stopped by a wall, another hero, or the board edge.",
          "You may perform as many moves as you like on your turn, but only in the direction shown on your card.",
          "You may move different heroes on the same turn as long as they all use the same action.",
        ],
      },
      {
        title: "Exploring New Tiles",
        rules: [
          "When a hero reaches an Exploration space facing a certain direction, you must explore.",
          "Draw the top tile from the deck and place it adjacent to that space in the indicated direction.",
          "The new tile is placed face-up. Rotate it so the connecting corridor aligns with the Exploration space.",
          "If no tile can be legally placed, shuffle the used tiles to form a new deck and draw again.",
        ],
      },
      {
        title: "The Sand Timer",
        rules: [
          "The sand timer begins immediately when the game starts.",
          "When it runs out, flip it to restart — but move the 'Do Something!' pawn one space around the board.",
          "If the 'Do Something!' pawn reaches its final space and the timer runs out again, the team loses.",
          "Heroes standing on Sand Timer spaces allow you to flip the timer immediately as a free action.",
        ],
      },
      {
        title: "The 'Do Something!' Pawn",
        rules: [
          "Any player can place the red 'Do Something!' pawn in front of another player at any time.",
          "This is a non-verbal signal meaning: 'I need you to do something with my action right now!'",
          "The pawn must be removed before it can be placed again.",
          "Using the pawn is NOT a communication violation — it's your only tool when speaking is banned.",
        ],
      },
    ],
  },

  "Several Exits": {
    overview:
      "Each hero now has a dedicated colour-coded exit tile. Heroes must find and reach their own exit — entering the wrong exit does nothing. Communication is now restricted by the sand timer.",
    timer: "Determined by difficulty setting (Easy: 4:00 / Normal: 3:00 / Hard: 2:00).",
    communication: "Locked by default. Players may only speak during a Sand Timer flip window or Loudspeaker event.",
    winCondition: "All 4 heroes must escape through their own colour exit: Mage → Purple, Elf → Green, Barbarian → Yellow, Dwarf → Orange.",
    sections: [
      {
        title: "Colour Exits",
        rules: [
          "Each exit tile has a hero colour symbol on it — only the matching hero can escape through it.",
          "Moving a hero onto the wrong-colour exit does not trigger escape; the hero simply stops.",
          "All four colour exits are somewhere in the tile deck — they must all be found and reached.",
          "A hero that has escaped is removed from the board and cannot be moved again.",
        ],
      },
      {
        title: "Communication Rules",
        rules: [
          "Players may NOT speak, gesture, or point during silent gameplay.",
          "Use the 'Do Something!' pawn as your only signal when silence is required.",
          "When the sand timer is flipped, there is a brief open discussion window before play resumes.",
          "Breaking the silence rule is a game violation — the team should agree on an honour penalty.",
        ],
      },
      {
        title: "Routing Strategy",
        rules: [
          "Heroes may cross each other on tiles but must ultimately reach their own colour exit.",
          "Plan routes so heroes don't block each other at exits.",
          "It's efficient to route heroes that share a direction together early, then split them toward their exits.",
          "Keep track of which exits have been found so you can prioritise exploration for missing exits.",
        ],
      },
    ],
  },

  "Pass Action Tiles": {
    overview:
      "A new action tile mechanic is introduced: Pass Action Tile spaces. When a hero stands on one, the active player may swap one of their action tiles with an adjacent player, changing what both players can do.",
    timer: "Determined by difficulty setting.",
    communication: "Locked except during sand timer flip windows.",
    winCondition: "All 4 heroes must escape through their matching colour exits.",
    sections: [
      {
        title: "Pass Action Tile Spaces",
        rules: [
          "Some tiles have a special Pass Action Tile icon — a hand passing a card.",
          "When any hero stands on that space, the owner of the action card for that hero's colour MAY pass one action tile to an adjacent player.",
          "Passing is voluntary — you do not have to pass if you don't want to.",
          "A pass counts as your entire action for that turn.",
        ],
      },
      {
        title: "Receiving and Using Passed Tiles",
        rules: [
          "The player who receives a tile immediately gains that action for the rest of the game (or until they pass it on).",
          "You may now move heroes using your new action on the very next turn.",
          "Passing creates new movement possibilities — plan to pass actions that are currently blocked.",
          "There is no limit to how many times an action tile can be passed throughout the game.",
        ],
      },
      {
        title: "Strategy Tips",
        rules: [
          "Before the game, identify which actions will be hardest to route and plan pass sequences early.",
          "Passing MoveNorth to a player who needs to get a hero south of the exit is wasteful — think ahead.",
          "Temporary passing to unblock a key hero and passing back is a valid strategy.",
          "The 'Do Something!' pawn becomes crucial when you want another player to pass an action to you.",
        ],
      },
    ],
  },

  "Dwarf and Elf": {
    overview:
      "Two heroes gain unique abilities. The Dwarf can use hidden tunnel shortcuts. The Elf, when reaching a Discussion space, opens a free communication window for the whole team.",
    timer: "Determined by difficulty setting.",
    communication: "Locked except during sand timer windows OR when the Elf triggers a Discussion space.",
    winCondition: "All 4 heroes must escape through their matching colour exits.",
    sections: [
      {
        title: "Dwarf Tunnels",
        rules: [
          "Some tiles have Dwarf Tunnel entrances — marked with the Dwarf symbol and a passage icon.",
          "Only the Dwarf hero may enter and travel through Dwarf Tunnels.",
          "Using a tunnel counts as an Escalator action — the player with the Escalator card triggers it.",
          "Tunnels connect two fixed points on the board, allowing the Dwarf to cross large distances instantly.",
          "The Dwarf exits the tunnel on the paired space and may continue moving normally that turn.",
        ],
      },
      {
        title: "Elf Discussion Spaces",
        rules: [
          "Some tiles have an Elf Discussion space — marked with the Elf symbol and a speech bubble.",
          "When the Elf hero reaches (or passes through) a Discussion space, a free communication window opens.",
          "All players may speak freely during this window. The window closes when the sand timer is next flipped or when all players agree to continue.",
          "The Elf Discussion is a bonus — it does NOT count against any penalty.",
          "Each Discussion space can only trigger one window per game visit.",
        ],
      },
      {
        title: "Coordination Tips",
        rules: [
          "Route the Elf through Discussion spaces before critical decision points in the maze.",
          "Save Discussion windows for when the team is confused about routing, not just for comfort.",
          "Use Dwarf Tunnels to position the Dwarf near his exit when other heroes are still in progress.",
          "The 'Do Something!' pawn is still your primary tool between Discussion windows.",
        ],
      },
    ],
  },

  "Mage Crystal Ball": {
    overview:
      "The Mage hero can use Crystal Ball spaces to secretly look at upcoming maze tiles. This hidden knowledge must be used subtly — it cannot be directly communicated during silence phases.",
    timer: "Determined by difficulty setting.",
    communication: "Locked except during sand timer windows. Crystal Ball info cannot be shared during silence.",
    winCondition: "All 4 heroes must escape through their matching colour exits.",
    sections: [
      {
        title: "Using the Crystal Ball",
        rules: [
          "Some tiles contain a Crystal Ball space — marked with a crystal orb icon and the Mage symbol.",
          "When the Mage hero reaches a Crystal Ball space, the Mage player secretly looks at the top 2 tiles of the tile deck.",
          "After looking, the tiles are returned to the top of the deck in the same order.",
          "The Crystal Ball can only be used once per space — revisiting it does not grant another look.",
          "Using the Crystal Ball does NOT use up a turn or action — it is triggered automatically by the Mage's position.",
        ],
      },
      {
        title: "Using the Information",
        rules: [
          "During silent play, you cannot tell others what you saw — but you can act on it.",
          "Move heroes proactively toward positions that will benefit from the upcoming tiles.",
          "During a communication window (sand timer flip), you may share what you saw with the team.",
          "Use the 'Do Something!' pawn to guide players toward specific heroes when you know a key tile is about to be placed.",
        ],
      },
      {
        title: "Strategic Use",
        rules: [
          "Plan the Mage's route to pass through Crystal Ball spaces early, before the tile deck is exhausted.",
          "If you peek and see an Exit tile on top, prioritise getting that hero to an Exploration space fast.",
          "Combine Crystal Ball knowledge with Elf Discussion spaces when possible — peek, then trigger a Discussion to share.",
          "Knowing what tile is NOT coming helps you deprioritise certain routes.",
        ],
      },
    ],
  },

  "Security Cameras": {
    overview:
      "Some tile spaces contain Security Cameras. These project orange walls that block hero movement. The Barbarian must reach Camera spaces to disable them and open new pathways.",
    timer: "Determined by difficulty setting.",
    communication: "Locked except during sand timer windows.",
    winCondition: "All 4 heroes must escape through their matching colour exits. Cameras may need to be disabled first.",
    sections: [
      {
        title: "Orange Walls and Cameras",
        rules: [
          "Orange walls appear on tiles adjacent to Security Camera spaces.",
          "Heroes CANNOT cross an orange wall while the corresponding camera is active.",
          "Orange walls are drawn on the tile itself — check all exits from a tile before routing through it.",
          "A single camera can project orange walls across multiple adjacent tiles.",
        ],
      },
      {
        title: "Disabling Cameras",
        rules: [
          "Only the Barbarian hero can disable Security Cameras.",
          "The Barbarian must move onto the Camera space (using the Exploration or movement action).",
          "When the Barbarian reaches a Camera space, that camera is immediately disabled for the rest of the game.",
          "Once disabled, all orange walls from that camera are removed — heroes can now pass freely.",
          "Disabling a camera does NOT use up a turn — it is triggered automatically by the Barbarian's position.",
        ],
      },
      {
        title: "Route Planning",
        rules: [
          "Identify early which exits are blocked behind orange walls and plan to disable those cameras first.",
          "Don't route other heroes into a dead end caused by an active camera — wait for the Barbarian.",
          "Use the 'Do Something!' pawn to signal that the Barbarian needs to be redirected to a Camera space.",
          "Remember: the Barbarian can still use their normal movement action, but camera disabling takes priority.",
        ],
      },
    ],
  },

  "Maximum Surveillance": {
    overview:
      "The hardest scenario in the Initiation Campaign. Multiple active security cameras block large sections of the board, communication is strictly limited, and the time pressure is intense. Perfect coordination is required.",
    timer: "Determined by difficulty setting — Hard recommended. No room for wasted moves.",
    communication: "Strictly sand-timer-based. No exceptions. Loudspeaker events still apply.",
    winCondition: "All 4 heroes must escape through their matching colour exits. All blocking cameras must be disabled.",
    sections: [
      {
        title: "All Camera Rules Active",
        rules: [
          "All rules from the Security Cameras scenario apply in full.",
          "Multiple Camera spaces are present on the board — each must be reached by the Barbarian to disable.",
          "Orange walls from multiple cameras may overlap, creating heavily guarded zones.",
          "Plan the Barbarian's entire route through the maze as a camera-clearing mission from the start.",
        ],
      },
      {
        title: "Coordination Under Pressure",
        rules: [
          "With no free communication, every 'Do Something!' pawn placement must be deliberate.",
          "Establish pre-game conventions: agree on a priority order (e.g. which camera to disable first).",
          "When two heroes need the same action simultaneously, use the pawn to signal priority.",
          "Don't waste exploration — only reveal new tiles when you have a clear plan for the hero entering.",
        ],
      },
      {
        title: "Advanced Tips",
        rules: [
          "The Mage's Crystal Ball (if tiles containing it are in the deck) is especially valuable here.",
          "Route Elf through any Discussion spaces early to synchronise plans with the team.",
          "Keep the Dwarf near tunnel entrances for rapid repositioning when cameras are cleared.",
          "Accept that some heroes will have to wait — don't rush everyone toward blocked exits.",
          "The team that wins Maximum Surveillance has truly mastered Magic Maze.",
        ],
      },
    ],
  },
};

export function getRulesForScenario(name: string): ScenarioRule[] | null {
  return SCENARIO_RULES[name] ?? null;
}

export function getFullRulesForScenario(name: string): FullScenarioRules | null {
  return FULL_SCENARIO_RULES[name] ?? null;
}
